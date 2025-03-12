// commands/favorites.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { Favorite } = require('../models');
const player = require('../utils/musicManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('favorites')
    .setDescription('Liste tes musiques favorites et permet de les jouer.'),
  async execute(interaction) {
    // Récupère les favoris de l'utilisateur
    const favorites = await Favorite.findAll({ where: { userId: interaction.user.id } });

    if (!favorites.length) {
      return interaction.reply('❌ Tu n\'as aucun favori pour le moment.');
    }

    // Crée un menu déroulant pour choisir un favori à jouer
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('choose_favorite')
      .setPlaceholder('Choisis un favori…');

    // Ajoute les favoris en options
    favorites.forEach((fav, index) => {
      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder({
          label: fav.title.slice(0, 25), // label max 25 caractères
          value: String(fav.id)
        })
      );
    });

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({ content: 'Voici tes favoris :', components: [row] });
  },
};
