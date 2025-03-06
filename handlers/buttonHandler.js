// handlers/buttonHandler.js
module.exports = async function handleButton(interaction) {
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
  };
  