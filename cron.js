const cron = require('node-cron');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = (client) => {
    // Fonction qui récupère un personnage random et l’envoie dans le salon configuré
    async function sendRandomCharacter() {
        try {
            // Import dynamique de node-fetch (compatible ESM)
            const { default: fetch } = await import('node-fetch');
            const response = await fetch('https://api.jikan.moe/v4/random/character');
            const data = await response.json();
            const character = data.data;
            
            const embed = new EmbedBuilder()
                .setTitle(character.name)
                .setDescription(character.about ? character.about.substring(0, 2048) : 'Aucune description.')
                .setThumbnail(character.images.jpg.image_url)
                .setColor('#FF4500');
            
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`vote_character_${character.mal_id}`)
                .setPlaceholder('Votez pour ce personnage (choisissez une lettre)')
                .addOptions([
                    { label: 'S', value: 'S' },
                    { label: 'A', value: 'A' },
                    { label: 'B', value: 'B' },
                    { label: 'C', value: 'C' },
                    { label: 'D', value: 'D' },
                    { label: 'E', value: 'E' },
                ]);
            
            const row = new ActionRowBuilder().addComponents(selectMenu);
            
            const channelId = process.env.CHARACTER_CHANNEL_ID;
            if (!channelId) {
                console.error("CHARACTER_CHANNEL_ID non défini dans .env");
                return;
            }
            const channel = await client.channels.fetch(channelId);
            if (!channel) {
                console.error("Salon introuvable pour CHARACTER_CHANNEL_ID");
                return;
            }
            await channel.send({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error("Erreur lors de l'envoi du personnage random :", error);
        }
    }

    // Planifie l’envoi du personnage à 10h (cron : minute 0, heure 10)
    cron.schedule('0 10 * * *', () => {
        console.log("Envoi du personnage random à 10h");
        sendRandomCharacter();
    });

    // Planifie l’envoi du personnage à 18h (cron : minute 0, heure 18)
    cron.schedule('0 18 * * *', () => {
        console.log("Envoi du personnage random à 18h");
        sendRandomCharacter();
    });
};
