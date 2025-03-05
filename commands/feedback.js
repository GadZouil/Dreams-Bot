const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Donner un feedback via un formulaire.'),
    async execute(interaction) {
        // Créer la modal
        const modal = new ModalBuilder()
            .setCustomId('feedbackModal')
            .setTitle('Votre Feedback');

        // Champ de texte (une ligne) pour le sujet
        const topicInput = new TextInputBuilder()
            .setCustomId('feedbackTopic')
            .setLabel("Sujet")
            .setStyle(TextInputStyle.Short);

        // Champ de texte (paragraphe) pour la description
        const descriptionInput = new TextInputBuilder()
            .setCustomId('feedbackDescription')
            .setLabel("Détails")
            .setStyle(TextInputStyle.Paragraph);

        // Chaque champ doit être emballé dans une ActionRow
        const firstRow = new ActionRowBuilder().addComponents(topicInput);
        const secondRow = new ActionRowBuilder().addComponents(descriptionInput);

        // Ajouter les champs à la modal
        modal.addComponents(firstRow, secondRow);

        // Afficher la modal à l'utilisateur
        await interaction.showModal(modal);
    },
};
