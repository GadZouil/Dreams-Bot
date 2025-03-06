// handlers/selectMenuHandler.js
module.exports = async function handleSelectMenu(interaction) {
    if (interaction.customId === 'choose_role') {
        const selected = interaction.values[0];
        await interaction.reply({ content: `Vous avez choisi : **${selected}**`, ephemeral: true });
    }
};
