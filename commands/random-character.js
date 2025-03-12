const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

// Fonction utilitaire pour générer un entier aléatoire inclusif
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomcharacter')
    .setDescription('Affiche un personnage aléatoire de Jikan avec des infos clés.'), // < 100 caractères
  async execute(interaction) {
    // Import dynamique de node‑fetch (compatible ESM)
    const { default: fetch } = await import('node-fetch');
    
    await interaction.deferReply();
    try {
      // Récupérer la pagination à partir de la page 1
      const initialResponse = await fetch('https://api.jikan.moe/v4/characters?page=1');
      const initialJson = await initialResponse.json();
      if (!initialJson || !initialJson.pagination) {
        console.error("Erreur lors de la récupération de la pagination:", initialJson);
        return interaction.editReply("❌ Erreur lors de la récupération des informations.");
      }
      const lastPage = initialJson.pagination.last_visible_page;
      
      // 80 % de chances de choisir la page 1 (personnages connus), sinon page aléatoire
      let randomPage = (Math.random() < 0.8) ? 1 : getRandomInt(1, lastPage);
      
      // Récupérer les personnages de la page choisie
      const pageResponse = await fetch(`https://api.jikan.moe/v4/characters?page=${randomPage}`);
      const pageJson = await pageResponse.json();
      if (!pageJson || !pageJson.data || pageJson.data.length === 0) {
        console.error("Aucun personnage trouvé sur la page", randomPage, pageJson);
        return interaction.editReply("❌ Aucune donnée reçue pour les personnages.");
      }
      
      // Sélectionner un personnage aléatoire parmi ceux de la page
      const characters = pageJson.data;
      const randomCharacter = characters[getRandomInt(0, characters.length - 1)];
      
      // Vérification des données essentielles du personnage
      if (!randomCharacter.name || !randomCharacter.images || !randomCharacter.images.jpg || !randomCharacter.images.jpg.image_url) {
        console.error("Données incomplètes pour le personnage sélectionné:", randomCharacter);
        return interaction.editReply("❌ Les données du personnage sélectionné sont incomplètes.");
      }
      
      // Récupérer les détails complets du personnage pour obtenir des infos supplémentaires (alias, etc.)
      const fullResponse = await fetch(`https://api.jikan.moe/v4/characters/${randomCharacter.mal_id}/full`);
      const fullJson = await fullResponse.json();
      const characterDetails = fullJson && fullJson.data ? fullJson.data : {};
      const aliases = characterDetails.nicknames && characterDetails.nicknames.length > 0
        ? characterDetails.nicknames.join(', ')
        : "Aucun alias";
      
      // Récupérer le premier anime dans lequel le personnage apparaît
      let animeInfo = null;
      if (characterDetails.anime && characterDetails.anime.length > 0) {
        animeInfo = characterDetails.anime[0].anime;
      }
      
      // Création de l'embed principal
      const embed = new EmbedBuilder()
        .setTitle(randomCharacter.name)
        .setColor('#FF4500')
        // Affichage en grande image pour mettre en avant le personnage
        .setImage(randomCharacter.images.jpg.image_url);
      
      // Ajout des infos clés sous forme de champs
      embed.addFields(
        { name: "Alias", value: aliases, inline: true },
        { name: "Favoris", value: randomCharacter.favorites ? randomCharacter.favorites.toString() : "N/A", inline: true },
        { name: "Anime", value: animeInfo ? `[${animeInfo.title}](${animeInfo.url})` : "Aucun anime", inline: true },
        { name: "Lien MAL", value: randomCharacter.url ? `[Voir sur MAL](${randomCharacter.url})` : "N/A", inline: false }
      );
      
      // Utiliser l'image de l'anime en thumbnail si disponible
      if (animeInfo && animeInfo.images && animeInfo.images.jpg && animeInfo.images.jpg.image_url) {
        embed.setThumbnail(animeInfo.images.jpg.image_url);
      }
      
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`vote_character_${randomCharacter.mal_id}`)
        .setPlaceholder('Votez pour ce personnage (choisissez une lettre)')
        .addOptions([
          { label: 'S - <3', value: 'S' },
          { label: 'A - J\'adore', value: 'A' },
          { label: 'B - J\'aime beaucoup', value: 'B' },
          { label: 'C - J\'aime bien', value: 'C' },
          { label: 'D - Pas fan', value: 'D' },
          { label: 'E - Je déteste', value: 'E' },
        ]);
      const selectRow = new ActionRowBuilder().addComponents(selectMenu);

      // Création des boutons interactifs
      const descButton = new ButtonBuilder()
        .setCustomId(`rc_desc_${randomCharacter.mal_id}`)
        .setLabel("Description")
        .setStyle(ButtonStyle.Primary);
      
      const animeButton = new ButtonBuilder()
        .setCustomId(`rc_anime_${randomCharacter.mal_id}`)
        .setLabel("Anime")
        .setStyle(ButtonStyle.Primary);
      
      const favButton = new ButtonBuilder()
        .setCustomId(`rc_fav_${randomCharacter.mal_id}`)
        .setLabel("Favoris")
        .setEmoji("🤍")
        .setStyle(ButtonStyle.Secondary);
      
      const buttonRow = new ActionRowBuilder().addComponents(descButton, animeButton, favButton);
      
        // Insertion en DB avec Sequelize (pour test)
        if (process.env.INSERT_TEST === 'true') {
            const Anime = require('../models/Anime');
            const Character = require('../models/Character');
        
            try {
            if (animeInfo) {
                // Insertion ou mise à jour de l'animé dans la table "anime"
                await Anime.upsert({
                mal_id: animeInfo.mal_id,
                title: animeInfo.title,
                url: animeInfo.url,
                image_url: animeInfo.images && animeInfo.images.jpg ? animeInfo.images.jpg.image_url : null,
                synopsis: animeInfo.synopsis || null,
                type: animeInfo.type || null,
                episodes: animeInfo.episodes || null,
                score: animeInfo.score || null,
                rank: animeInfo.rank || null,
                popularity: animeInfo.popularity || null,
                members: animeInfo.members || null,
                favorites: animeInfo.favorites || null,
                });
            }
            
            // Insertion ou mise à jour du personnage dans la table "character"
            await Character.upsert({
                mal_id: randomCharacter.mal_id,
                name: randomCharacter.name,
                image_url: randomCharacter.images.jpg.image_url,
                favorites: randomCharacter.favorites || 0,
                url: randomCharacter.url,
                aliases: aliases, // issu de votre code précédent pour les alias
                anime_mal_id: animeInfo ? animeInfo.mal_id : null,
            });
            console.log(`Personnage ${randomCharacter.name} inséré avec Sequelize.`);
            } catch (sequelizeError) {
            console.error("Erreur lors de l'insertion avec Sequelize :", sequelizeError);
            }
        }

      await interaction.editReply({ embeds: [embed], components: [selectRow, buttonRow] });
    } catch (error) {
      console.error("Erreur lors de la récupération du personnage :", error);
      await interaction.editReply("❌ Une erreur s'est produite lors de la récupération du personnage.");
    }
  },
};
