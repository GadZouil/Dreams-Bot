// handlers/buttonHandler.js
module.exports = async function handleButton(interaction) {
    if (interaction.customId === 'poll_yes') {
        await interaction.reply({ content: '👍 Vous avez voté **Oui**.', ephemeral: true });
    } else if (interaction.customId === 'poll_no') {
        await interaction.reply({ content: '👎 Vous avez voté **Non**.', ephemeral: true });
    }
};
