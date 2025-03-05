const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Répond avec Pong!'),
    async execute(interaction) {
        // Lorsque cette commande est exécutée, répondre avec "Pong!"
        await interaction.reply('Pong!');
    },
};
