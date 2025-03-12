// utils/musicManager.js
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');

module.exports = async (client) => {
  // Crée le Player en passant le client Discord avec skipFFmpeg false
  const player = new Player(client, {
    skipFFmpeg: false
  });

  // Charge les extracteurs par défaut
  await player.extractors.loadMulti(DefaultExtractors);

  console.log("✅ Extracteurs chargés :", DefaultExtractors.map(e => e.identifier));
  console.log(player.scanDeps());

  // Lorsqu'une musique démarre, récupère le channel par son ID (stocké dans metadata)
  player.events.on('playerStart', (queue, track) => {
    if (queue.metadata && queue.metadata.channelId) {
      const channel = client.channels.cache.get(queue.metadata.channelId);
      if (channel) channel.send(`▶️ Lecture en cours : **${track.title}**`);
    }
  });

  player.events.on('debug', (queue, message) => {
    console.log(`[DEBUG ${queue.guild.id}] ${message}`);
  });

  return player;
};
