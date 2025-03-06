// utils/musicManager.js
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');

module.exports = async (client) => {
  // Crée le Player en passant le client Discord
  const player = new Player(client, {
    skipFFmpeg: false
  });

  // Charge les extracteurs par défaut en utilisant loadMulti
  await player.extractors.loadMulti(DefaultExtractors);

  console.log(player.scanDeps());

  player.events.on('playerStart', (queue, track) => {
    if (queue.metadata && queue.metadata.channel) {
      queue.metadata.channel.send(`▶️ Lecture en cours : **${track.title}**`);
    }
  });

  player.events.on('debug', (queue, message) => {
    console.log(`[DEBUG ${queue.guild.id}] ${message}`);
  });

  return player;
};
