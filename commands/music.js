// commands/music.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { QueryType } = require('discord-player');

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

    // Gestion des autres sous-commandes
    if (subcommand !== 'play') {
      const player = interaction.client.player;
      switch (subcommand) {
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
          const description = tracks.slice(0, 10).map((track, i) => `${i + 1}. ${track.title}`).join('\n');
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
    }

    // Pour la sous-commande "play"
    const query = interaction.options.getString('query');
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply('❌ Tu dois être dans un salon vocal pour utiliser cette commande.');
    }
    const player = interaction.client.player;

    // Traitement pour lien direct YouTube
    if (query.startsWith('https://youtu.be/') || query.includes('youtube.com')) {
      const searchResult = await player.search(query, { requestedBy: interaction.user });
      if (!searchResult || !searchResult.tracks.length) {
        return interaction.reply('❌ Aucune musique trouvée pour ce lien.');
      }
      const track = searchResult.tracks[0];
      if (!track.dispatcherConfig) track.dispatcherConfig = {};
      track.dispatcherConfig.skipFFmpeg = false;
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
        return interaction.reply(`❌ Impossible de rejoindre le salon vocal : ${error}`);
      }
      queue.addTrack(track);
      if (!queue.node.isPlaying()) await queue.node.play();
      return interaction.reply(`▶️ **${track.title}** ajouté à la file d'attente !`);
    }

    // Recherche par mots-clés : afficher 5 résultats pour sélection
    await interaction.deferReply();
    const searchResult = await player.search(query, {
      requestedBy: interaction.user,
      searchEngine: QueryType.AUTO,
    });
    if (!searchResult || !searchResult.tracks.length) {
      return interaction.followUp('❌ Aucune musique trouvée pour ta recherche.');
    }
    // Limiter aux 5 premiers résultats
    const tracks = searchResult.tracks.slice(0, 5);
    const embed = new EmbedBuilder()
      .setTitle('Résultats de recherche')
      .setDescription(tracks.map((track, i) => `**${i + 1}.** ${track.title}`).join('\n'))
      .setColor('#2f3136')
      .setFooter({ text: 'Cliquez sur un bouton pour sélectionner la piste à ajouter.' });
      
    const row = new ActionRowBuilder();
    tracks.forEach((_, i) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`music_choice_${i}`)
          .setLabel(`${i + 1}`)
          .setStyle(ButtonStyle.Primary)
      );
    });

    // Stocker temporairement les résultats pour cet ID d'interaction
    if (!interaction.client.searchCache) interaction.client.searchCache = new Map();
    interaction.client.searchCache.set(interaction.id, tracks);

    await interaction.followUp({ embeds: [embed], components: [row] });
  },
};
