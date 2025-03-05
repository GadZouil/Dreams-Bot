const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Affiche des informations formatées dans un embed.'),
    async execute(interaction) {
        // Créer un embed personnalisé
        const infoEmbed = new EmbedBuilder()
            .setColor('#0099ff') // Couleur de l'accent de l'embed (bleu dans cet exemple)
            .setTitle('Informations du serveur')
            .setDescription(`Voici les informations sur le serveur **${interaction.guild.name}** :`)
            .addFields(
                { name: 'Nombre de membres', value: `${interaction.guild.memberCount}`, inline: true },
                { name: 'Propriétaire', value: `<@${interaction.guild.ownerId}>`, inline: true }
            )
            .setThumbnail(interaction.guild.iconURL()); // Image miniature (l'icône du serveur)

        await interaction.reply({ embeds: [infoEmbed] });
    },
};
