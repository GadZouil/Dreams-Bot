// handlers/buttonHandler.js
module.exports = async function handleButton(interaction) {
    // Vérifiez si le bouton est pour le choix d'une musique
    if (interaction.customId.startsWith('music_choice_')) {
      const choice = parseInt(interaction.customId.split('_')[2]);
      // Récupérez les résultats stockés via l'ID de l'interaction d'origine
      // Vous pouvez stocker les résultats dans une Map sur le client, par exemple : client.searchCache
      const cache = interaction.client.searchCache;
      // Ici, vous devez identifier l'interaction d'origine (par exemple, via l'utilisateur ou un identifiant que vous avez stocké dans l'ID du message)
      // Pour cet exemple, supposons que vous utilisez l'ID du message auquel l'embed a été envoyé :
      const results = cache.get(interaction.message.interaction.id);
      if (!results || isNaN(choice) || choice < 0 || choice >= results.length) {
        return interaction.reply({ content: '❌ Choix invalide.', ephemeral: true });
      }
      const track = results[choice];
      // Forcer FFmpeg sur le track
      if (!track.dispatcherConfig) track.dispatcherConfig = {};
      track.dispatcherConfig.skipFFmpeg = false;
  
      // Récupérer le player et la queue
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
      if (!queue.node.isPlaying()) {
        await queue.node.play();
      }
      // Supprimez la cache pour ce choix si vous le souhaitez
      cache.delete(interaction.message.interaction.id);
      return interaction.reply({ content: `▶️ **${track.title}** ajouté à la file d'attente !`, ephemeral: false });
    }
    
    // Autres cas pour d'autres boutons
    if (interaction.customId === 'poll_yes') {
      await interaction.reply({ content: '👍 Vous avez voté **Oui**.', ephemeral: true });
    } else if (interaction.customId === 'poll_no') {
      await interaction.reply({ content: '👎 Vous avez voté **Non**.', ephemeral: true });
    }
  };
  