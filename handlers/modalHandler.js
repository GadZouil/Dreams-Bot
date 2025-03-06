// handlers/modalHandler.js
module.exports = async function handleModal(interaction) {
    if (interaction.customId === 'feedbackModal') {
        const topic = interaction.fields.getTextInputValue('feedbackTopic');
        const description = interaction.fields.getTextInputValue('feedbackDescription');
        console.log("Feedback reçu :", topic, description);
        await interaction.reply({ content: "🙏 Merci pour votre feedback !", ephemeral: true });
    }
};
