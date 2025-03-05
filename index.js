// Chargement des variables d'environnement
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

// Création du client Discord
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Collection pour stocker les commandes
client.commands = new Collection();

// Fonction pour charger les commandes récursivement depuis les sous-dossiers
function loadCommands(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
        const filePath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
            // Exploration récursive des sous-dossiers
            loadCommands(filePath);
        } else if (file.name.endsWith('.js')) {
            const command = require(filePath);
            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
                console.log(`✅ Commande chargée : ${command.data.name} (${filePath})`);
            } else {
                console.log(`[⚠️] Commande ignorée (manque "data" ou "execute"): ${filePath}`);
            }
        }
    }
}

// Chargement des commandes depuis "commands/"
const commandsPath = path.join(__dirname, 'commands');
loadCommands(commandsPath);

// Événement déclenché quand le bot est prêt
client.once('ready', () => {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

// Gestion des interactions (commandes, boutons, menus, modals)
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Une erreur est survenue en exécutant la commande.', ephemeral: true });
        }
    } else if (interaction.isButton()) {
        if (interaction.customId === 'poll_yes') {
            await interaction.reply({ content: '👍 Vous avez voté **Oui**.', ephemeral: true });
        } else if (interaction.customId === 'poll_no') {
            await interaction.reply({ content: '👎 Vous avez voté **Non**.', ephemeral: true });
        }
    } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'choose_role') {
            const selected = interaction.values[0];
            await interaction.reply({ content: `Vous avez choisi : **${selected}**`, ephemeral: true });
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'feedbackModal') {
            const topic = interaction.fields.getTextInputValue('feedbackTopic');
            const description = interaction.fields.getTextInputValue('feedbackDescription');
            console.log("Feedback reçu :", topic, description);
            await interaction.reply({ content: "🙏 Merci pour votre feedback !", ephemeral: true });
        }
    }
});

// Connexion du bot avec le token Discord
client.login(process.env.TOKEN);