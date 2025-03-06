// commands/add-money.js
const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/user');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-money')
    .setDescription("Ajoute de l'argent à un utilisateur.")
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('L\'utilisateur auquel ajouter de l\'argent')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('montant')
        .setDescription("Montant à ajouter")
        .setRequired(true)),
  
  async execute(interaction) {
    const userDiscord = interaction.options.getUser('utilisateur');
    const amount = interaction.options.getInteger('montant');

    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply({ content: "❌ Tu n'as pas la permission d'utiliser cette commande.", ephemeral: true });
    }

    let user = await User.findByPk(userDiscord.id);
    if (!user) {
      // Créer l'utilisateur s'il n'existe pas
      user = await User.create({ id: userDiscord.id, name: userDiscord.username, money: amount });
      return interaction.reply(`✅ ${userDiscord.username} a été créé avec **${amount}**💰.`);
    } else {
      // Ajouter de l'argent à l'utilisateur existant
      user.money += amount;
      await user.save();
      return interaction.reply(`✅ ${userDiscord.username} a maintenant **${user.money}**💰.`);
    }
  },
};
