const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

// Fonction utilitaire pour générer un entier aléatoire inclusif
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomcharacter')
    .setDescription('Affiche un personnage aléatoire de Jikan avec des infos clés.'),
  async execute(interaction) {
    // Import dynamique de node-fetch
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
      
      // Limiter la description
      let fullDescription = randomCharacter.about ? randomCharacter.about.trim() : 'Aucune description.';
      let truncatedDescription;
      if (fullDescription.includes('\n')) {
        const lines = fullDescription.split('\n');
        truncatedDescription = lines.length > 10 ? lines.slice(0, 10).join('\n') + "\n..." : lines.join('\n');
      } else {
        truncatedDescription = fullDescription.length > 500 ? fullDescription.substring(0, 500) + "..." : fullDescription;
      }
      
      // Récupérer les détails complets du personnage pour obtenir les informations sur l'anime
      const fullResponse = await fetch(`https://api.jikan.moe/v4/characters/${randomCharacter.mal_id}/full`);
      const fullJson = await fullResponse.json();
      let animeInfo = null;
      if (fullJson && fullJson.data && fullJson.data.anime && fullJson.data.anime.length > 0) {
        // On prend le premier anime dans lequel le personnage apparaît
        animeInfo = fullJson.data.anime[0].anime;
      }
      
      // Création de l'embed principal
      const embed = new EmbedBuilder()
        .setTitle(randomCharacter.name)
        .setDescription(truncatedDescription)
        // Mettre en avant le personnage avec une grande image
        .setImage(randomCharacter.images.jpg.image_url)
        .setColor('#FF4500');
      
      // Si un anime est trouvé, l'ajouter dans l'embed et utiliser son image en thumbnail
      if (animeInfo) {
        embed.addFields({ name: "Anime", value: `[${animeInfo.title}](${animeInfo.url})`, inline: true });
        if (animeInfo.images && animeInfo.images.jpg && animeInfo.images.jpg.image_url) {
          embed.setThumbnail(animeInfo.images.jpg.image_url);
        } else {
          embed.setThumbnail(randomCharacter.images.jpg.image_url);
        }
      } else {
        // Sinon, utiliser l'image du personnage en thumbnail (optionnel)
        embed.setThumbnail(randomCharacter.images.jpg.image_url);
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
      
      await interaction.editReply({ embeds: [embed], components: [selectRow, buttonRow] });
    } catch (error) {
      console.error("Erreur lors de la récupération du personnage :", error);
      await interaction.editReply("❌ Une erreur s'est produite lors de la récupération du personnage.");
    }
  },
};
