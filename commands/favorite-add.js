// commands/favorite-add.js
const { SlashCommandBuilder } = require('discord.js');
const { Favorite } = require('../models');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('favorite-add')
    .setDescription('Ajoute la musique indiquée en favori.')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Titre de la musique')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('url')
        .setDescription('URL de la musique')
        .setRequired(true)
    ),
  async execute(interaction) {
    const title = interaction.options.getString('title');
    const url = interaction.options.getString('url');

    // Enregistre dans la table favorites
    await Favorite.create({
      userId: interaction.user.id,
      title,
      url
    });

    return interaction.reply(`✅ **${title}** a été ajouté à tes favoris !`);
  },
};
