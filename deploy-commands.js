require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const clientId = '858396486383042570';
const guildId = '1285605460526895154';
const token = process.env.TOKEN;

// Chargement des commandes définies dans le dossier commands
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data) {
        commands.push(command.data.toJSON());
    }
}

// Initialiser la requête REST avec le token du bot
const rest = new REST({ version: '10' }).setToken(token);

// Déployer les commandes sur un serveur (guild) spécifique
(async () => {
    try {
        console.log(`Déploiement de ${commands.length} commande(s) slash...`);
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
        console.log('✅ Commandes enregistrées avec succès.');
    } catch (error) {
        console.error(error);
    }
})();
