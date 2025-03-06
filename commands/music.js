// commands/music.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("music")
    .setDescription("Contrôler la musique avec Distube")
    .addSubcommand((sub) =>
      sub
        .setName("play")
        .setDescription("Jouer une musique via URL ou recherche")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("Lien YouTube ou mot-clé")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("skip").setDescription("Passer à la musique suivante")
    )
    .addSubcommand((sub) =>
      sub.setName("stop").setDescription("Arrêter la musique et vider la file d'attente")
    )
    .addSubcommand((sub) =>
      sub.setName("pause").setDescription("Mettre la musique en pause")
    )
    .addSubcommand((sub) =>
      sub.setName("resume").setDescription("Reprendre la musique")
    )
    .addSubcommand((sub) =>
      sub.setName("queue").setDescription("Afficher la file d'attente")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const distube = interaction.client.distube;

    if (sub === "play") {
      const query = interaction.options.getString("query");
      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
        return interaction.reply("❌ Tu dois être dans un salon vocal pour jouer de la musique.");
      }

      await interaction.deferReply();

      try {
        // Distube gère automatiquement la recherche quand l'URL n'est pas fournie
        await distube.play(voiceChannel, query, {
          member: interaction.member,
          textChannel: interaction.channel,
        });
        interaction.followUp(`▶️ La musique a été ajoutée à la file d'attente !`);
      } catch (error) {
        console.error(error);
        interaction.followUp("❌ Une erreur s'est produite lors de la lecture.");
      }
    } else if (sub === "skip") {
      try {
        await distube.skip(interaction);
        interaction.reply("⏭️ Musique suivante !");
      } catch (error) {
        console.error(error);
        interaction.reply("❌ Aucune musique en cours.");
      }
    } else if (sub === "stop") {
      try {
        await distube.stop(interaction);
        interaction.reply("🛑 La musique a été arrêtée et la file d'attente vidée.");
      } catch (error) {
        console.error(error);
        interaction.reply("❌ Aucune musique en cours.");
      }
    } else if (sub === "pause") {
      try {
        await distube.pause(interaction);
        interaction.reply("⏸️ La musique est en pause.");
      } catch (error) {
        console.error(error);
        interaction.reply("❌ Aucune musique en cours.");
      }
    } else if (sub === "resume") {
      try {
        await distube.resume(interaction);
        interaction.reply("▶️ La musique a repris.");
      } catch (error) {
        console.error(error);
        interaction.reply("❌ Aucune musique en cours.");
      }
    } else if (sub === "queue") {
      const queue = distube.getQueue(interaction);
      if (!queue) return interaction.reply("❌ La file d'attente est vide.");
      const embed = new EmbedBuilder()
        .setTitle("File d'attente")
        .setDescription(
          queue.songs
            .map((song, i) => `${i + 1}. [${song.name}](${song.url}) - \`${song.formattedDuration}\``)
            .join("\n")
        )
        .setColor("#2f3136");
      interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply("❌ Sous-commande inconnue.");
    }
  },
};
