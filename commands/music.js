// commands/music.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('music')
    .setDescription('Contrôler la musique.')
    .addSubcommand(subcmd =>
      subcmd
        .setName('play')
        .setDescription('Jouer une musique via URL ou recherche.')
        .addStringOption(option =>
          option
            .setName('query')
            .setDescription('Lien YouTube ou mot-clé à rechercher')
            .setRequired(true)
        )
    )
    .addSubcommand(subcmd =>
      subcmd
        .setName('skip')
        .setDescription('Passer à la musique suivante.')
    )
    .addSubcommand(subcmd =>
      subcmd
        .setName('stop')
        .setDescription('Arrêter la musique et vider la queue.')
    )
    .addSubcommand(subcmd =>
      subcmd
        .setName('queue')
        .setDescription('Afficher la liste des musiques en attente.')
    )
    .addSubcommand(subcmd =>
      subcmd
        .setName('pause')
        .setDescription('Mettre la musique en pause.')
    )
    .addSubcommand(subcmd =>
      subcmd
        .setName('resume')
        .setDescription('Reprendre la musique.')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const query = interaction.options.getString('query');
    const voiceChannel = interaction.member.voice.channel;
  
    if (!voiceChannel) {
      return interaction.reply('❌ Tu dois être dans un salon vocal pour utiliser cette commande.');
    }
  
    // Récupère le player qui a été initialisé dans index.js et attaché au client
    const player = interaction.client.player;
  
    switch (subcommand) {
      case 'play': {
        await interaction.deferReply();
      
        const searchResult = await player.search(query, {
          requestedBy: interaction.user,
        });
      
        if (!searchResult || !searchResult.tracks.length) {
          return interaction.followUp('❌ Aucune musique trouvée pour ta recherche.');
        }
      
        // Récupère la première track
        const track = searchResult.tracks[0];
      
        // Crée une copie du track avec skipFFmpeg forcé à false
        const modifiedTrack = {
          ...track,
          dispatcherConfig: {
            ...track.dispatcherConfig,
            skipFFmpeg: false,
          },
        };
      
        const queue = await player.nodes.create(interaction.guild, {
          metadata: { channel: interaction.channel },
          leaveOnEnd: false,
          leaveOnEmpty: false,
          leaveOnStop: false,
          skipFFmpeg: false,
        });
      
        try {
          if (!queue.connection) await queue.connect(voiceChannel);
        } catch (error) {
          player.nodes.delete(interaction.guild.id);
          return interaction.followUp(`❌ Impossible de rejoindre le salon vocal : ${error}`);
        }
      
        queue.addTrack(modifiedTrack);
      
        if (!queue.node.isPlaying()) {
          await queue.node.play();
        }
      
        return interaction.followUp(`▶️ **${modifiedTrack.title}** ajouté à la file d'attente !`);
      }           
  
      case 'skip': {
        const queue = player.nodes.get(interaction.guildId);
        if (!queue || !queue.node.isPlaying()) {
          return interaction.reply('❌ Aucune musique en cours.');
        }
        await queue.node.skip();
        return interaction.reply('⏭️ Musique suivante !');
      }
  
      case 'stop': {
        const queue = player.nodes.get(interaction.guildId);
        if (!queue || !queue.node.isPlaying()) {
          return interaction.reply('❌ Aucune musique en cours.');
        }
        queue.delete();
        return interaction.reply('🛑 Musique arrêtée et file d\'attente vidée.');
      }
  
      case 'queue': {
        const queue = player.nodes.get(interaction.guildId);
        if (!queue || !queue.tracks) {
          return interaction.reply('❌ Aucune musique dans la queue.');
        }
        const tracks = queue.tracks.toArray();
        const description = tracks.slice(0, 10).map((track, i) => `${i+1}. ${track.title}`).join('\n');
  
        const embed = new EmbedBuilder()
          .setTitle('File d\'attente')
          .setDescription(description || 'Vide')
          .setColor('#2f3136');
  
        return interaction.reply({ embeds: [embed] });
      }
  
      case 'pause': {
        const queue = player.nodes.get(interaction.guildId);
        if (!queue || !queue.node.isPlaying()) {
          return interaction.reply('❌ Aucune musique en cours.');
        }
        queue.node.setPaused(true);
        return interaction.reply('⏸️ Musique mise en pause.');
      }
  
      case 'resume': {
        const queue = player.nodes.get(interaction.guildId);
        if (!queue || !queue.node.isPlaying()) {
          return interaction.reply('❌ Aucune musique en cours.');
        }
        queue.node.setPaused(false);
        return interaction.reply('▶️ Musique relancée.');
      }
  
      default:
        return interaction.reply('❌ Sous-commande inconnue.');
    }
  },
};
