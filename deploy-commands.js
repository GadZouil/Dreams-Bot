require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const clientId = '858396486383042570';
const guildId = '1285605460526895154';
const token = process.env.TOKEN;

// Fonction pour charger récursivement toutes les commandes
function loadCommands(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let commands = [];
    
    for (const file of files) {
        const filePath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
            commands = commands.concat(loadCommands(filePath));
        } else if (file.name.endsWith('.js')) {
            const command = require(filePath);
            if (command.data) {
                commands.push(command.data.toJSON());
            }
        }
    }
    return commands;
}

// Charger toutes les commandes définies dans le dossier commands
const commandsPath = path.join(__dirname, 'commands');
const commands = loadCommands(commandsPath);

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
