const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolemenu')
        .setDescription('Affiche un menu déroulant de rôles.'),
    async execute(interaction) {
        // Créer un menu déroulant avec 3 options de rôle fictives
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('choose_role')
            .setPlaceholder('Choisissez un rôle…') // texte par défaut
            .addOptions(
                new StringSelectMenuOptionBuilder({ label: 'Guerrier', value: 'warrior' }),
                new StringSelectMenuOptionBuilder({ label: 'Mage', value: 'mage' }),
                new StringSelectMenuOptionBuilder({ label: 'Éclaireur', value: 'scout' })
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({ content: 'Sélectionnez un rôle :', components: [row] });
    },
};
