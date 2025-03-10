// handlers/buttonHandler.js
module.exports = async function handleButton(interaction) {
  // Bouton de choix musical et sondages existants...
  if (interaction.customId.startsWith('music_choice_')) {
    const choice = parseInt(interaction.customId.split('_')[2]);
    const cache = interaction.client.searchCache;
    const tracks = cache.get(interaction.message.interaction.id);
    if (!tracks || isNaN(choice) || choice < 0 || choice >= tracks.length) {
      return interaction.reply({ content: '❌ Choix invalide.', ephemeral: true });
    }
    const track = tracks[choice];
    if (!track.dispatcherConfig) track.dispatcherConfig = {};
    track.dispatcherConfig.skipFFmpeg = false;

    const player = interaction.client.player;
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({ content: '❌ Tu dois être dans un salon vocal.', ephemeral: true });
    }
    const queue = await player.nodes.create(interaction.guild, {
      metadata: { channelId: interaction.channel.id },
      leaveOnEnd: false,
      leaveOnEmpty: false,
      leaveOnStop: false,
      skipFFmpeg: false,
    });
    try {
      if (!queue.connection) await queue.connect(voiceChannel);
    } catch (error) {
      player.nodes.delete(interaction.guild.id);
      return interaction.reply({ content: `❌ Impossible de rejoindre le salon vocal : ${error}`, ephemeral: true });
    }
    queue.addTrack(track);
    if (!queue.node.isPlaying()) await queue.node.play();
    cache.delete(interaction.message.interaction.id);
    return interaction.reply({ content: `▶️ **${track.title}** ajouté à la file d'attente !`, ephemeral: false });
  }

  if (interaction.customId === 'poll_yes') {
    await interaction.reply({ content: '👍 Vous avez voté **Oui**.', ephemeral: true });
  } else if (interaction.customId === 'poll_no') {
    await interaction.reply({ content: '👎 Vous avez voté **Non**.', ephemeral: true });
  }

  // Nouveau : Bouton Description
  if (interaction.customId.startsWith('rc_desc_')) {
    const malId = interaction.customId.split('_')[2];
    const { default: fetch } = await import('node-fetch');
    try {
      const res = await fetch(`https://api.jikan.moe/v4/characters/${malId}/full`);
      const json = await res.json();
      if (!json.data) throw new Error("Données non reçues");
      const charData = json.data;
      const embed = {
        title: charData.name,
        description: charData.about ? charData.about.substring(0, 2048) : "Aucune description.",
        image: { url: charData.images.jpg.image_url },
        color: 0xFF4500,
        fields: [
          { name: "Alias", value: (charData.nicknames && charData.nicknames.length > 0) ? charData.nicknames.join(', ') : "Aucun alias", inline: true },
          { name: "Favoris", value: charData.favorites ? charData.favorites.toString() : "N/A", inline: true },
          { name: "Lien MAL", value: charData.url ? `[Voir sur MAL](${charData.url})` : "N/A", inline: false },
        ]
      };
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "Erreur lors de la récupération des informations du personnage.", ephemeral: true });
    }
  }

  // Nouveau : Bouton Anime
  if (interaction.customId.startsWith('rc_anime_')) {
    const malId = interaction.customId.split('_')[2];
    const { default: fetch } = await import('node-fetch');
    try {
      const res = await fetch(`https://api.jikan.moe/v4/characters/${malId}/full`);
      const json = await res.json();
      if (!json.data) throw new Error("Données non reçues");
      const charData = json.data;
      let animeInfo = null;
      if (charData.anime && charData.anime.length > 0) {
        animeInfo = charData.anime[0].anime;
      }
      if (!animeInfo) {
        return interaction.reply({ content: "Aucun animé trouvé pour ce personnage.", ephemeral: true });
      }
      const embed = {
        title: animeInfo.title,
        description: animeInfo.synopsis ? animeInfo.synopsis.substring(0, 2048) : "Aucun synopsis.",
        image: { url: animeInfo.images.jpg.image_url },
        color: 0xFF4500,
        fields: [
          { name: "Type", value: animeInfo.type || "N/A", inline: true },
          { name: "Episodes", value: animeInfo.episodes ? animeInfo.episodes.toString() : "N/A", inline: true },
          { name: "Score", value: animeInfo.score ? animeInfo.score.toString() : "N/A", inline: true },
        ]
      };
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "Erreur lors de la récupération des informations de l'animé.", ephemeral: true });
    }
  }

  // Nouveau : Bouton Favoris
  if (interaction.customId.startsWith('rc_fav_')) {
    const malId = interaction.customId.split('_')[2];
    const FavoriteCharacter = require('../models/FavoriteCharacter'); // modèle à créer ci-dessous
    try {
      // Vérifier si l'utilisateur a déjà favorisé ce personnage
      const existing = await FavoriteCharacter.findOne({ where: { userId: interaction.user.id, characterMalId: malId } });
      if (existing) {
        return interaction.reply({ content: "Vous avez déjà ajouté ce personnage en favori.", ephemeral: true });
      }
      await FavoriteCharacter.create({
        userId: interaction.user.id,
        characterMalId: malId
      });
      await interaction.reply({ content: "Personnage ajouté aux favoris.", ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "Erreur lors de l'ajout aux favoris.", ephemeral: true });
    }
  }
};
