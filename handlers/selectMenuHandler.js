// handlers/selectMenuHandler.js
const { Favorite } = require('../models');
const player = require('../utils/musicManager');

module.exports = async function handleSelectMenu(interaction) {
    if (interaction.customId === 'choose_role') {
        const selected = interaction.values[0];
        await interaction.reply({ content: `Vous avez choisi : **${selected}**`, ephemeral: true });
    }
    if (interaction.customId === 'choose_favorite') {
        // Récupère l'id du favori
        const favoriteId = interaction.values[0];
        const fav = await Favorite.findByPk(favoriteId);
        if (!fav) {
          return interaction.reply({ content: '❌ Favori introuvable.', ephemeral: true });
        }
    
        // On récupère le salon vocal
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
          return interaction.reply({ content: '❌ Tu dois être dans un salon vocal pour jouer un favori.', ephemeral: true });
        }
    
        await interaction.deferReply(); // on prépare la réponse
    
        const queue = await player.nodes.create(interaction.guild, {
          metadata: {
            channel: interaction.channel
          }
        });
    
        try {
          if (!queue.connection) await queue.connect(voiceChannel);
        } catch (error) {
          player.nodes.delete(interaction.guild.id);
          return interaction.followUp(`❌ Impossible de rejoindre le salon vocal : ${error}`);
        }
    
        // On lance la musique via l'URL stockée
        const searchResult = await player.search(fav.url, {
          requestedBy: interaction.user
        });
    
        if (!searchResult || !searchResult.tracks.length) {
          return interaction.followUp('❌ Aucune musique trouvée pour ce favori.');
        }
    
        queue.addTrack(searchResult.tracks[0]);
    
        if (!queue.node.isPlaying()) {
          await queue.node.play();
        }
    
        return interaction.followUp(`▶️ Lecture de ton favori : **${fav.title}**`);
      }
};
