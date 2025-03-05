const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Sondage oui/non interactif.'),
    async execute(interaction) {
        // Créer deux boutons : "Oui" et "Non"
        const yesButton = new ButtonBuilder()
            .setCustomId('poll_yes')               // identifiant du bouton "Oui"
            .setLabel('✅ Oui')                    // texte du bouton
            .setStyle(ButtonStyle.Success);        // style vert

        const noButton = new ButtonBuilder()
            .setCustomId('poll_no') 
            .setLabel('❌ Non')
            .setStyle(ButtonStyle.Danger);         // style rouge

        // Regrouper les boutons dans une ligne (ActionRow)
        const row = new ActionRowBuilder().addComponents(yesButton, noButton);

        // Envoyer le message avec les boutons
        await interaction.reply({ content: 'Veuillez voter en cliquant sur un bouton :', components: [row] });
    },
};
