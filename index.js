// index.js
require('dotenv').config();  // Charge les variables d'environnement depuis le fichier .env

const { Client, GatewayIntentBits } = require('discord.js');
// Crée une nouvelle instance de client Discord.
const client = new Client({
    intents: [GatewayIntentBits.Guilds] // Intention d'accès aux guildes (serveurs Discord)
});

// Événement déclenché quand le bot est prêt et connecté à Discord
client.once('ready', () => {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

// Préparer une collection (map) pour stocker les commandes du bot
client.commands = new Collection();

// Lire tous les fichiers du dossier commands (qui finissent par .js)
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Vérifier que la commande exporte bien les propriétés nécessaires
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[AVERTISSEMENT] La commande dans ${file} n'a pas "data" ou "execute".`);
    }
}

// Écouter les interactions de commande (slash commands)
client.on('interactionCreate', async interaction => {

    if (interaction.isChatInputCommand()) {
        // ... (gestion des commandes slash, comme implémenté plus haut)
        const command = client.commands.get(interaction.commandName);
        // exécuter la commande...
    } else if (interaction.isButton()) {
        // Gérer les clics de bouton
        if (interaction.customId === 'poll_yes') {
            await interaction.reply({ content: '👍 Vous avez voté **Oui**.', ephemeral: true });
        } else if (interaction.customId === 'poll_no') {
            await interaction.reply({ content: '👎 Vous avez voté **Non**.', ephemeral: true });
        }
    } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'choose_role') {
            const selected = interaction.values[0];  // values est un tableau des valeurs choisies (ici une seule possible)
            await interaction.reply({ content: `Vous avez choisi : **${selected}**`, ephemeral: true });
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'feedbackModal') {
            // Récupérer les valeurs saisies
            const topic = interaction.fields.getTextInputValue('feedbackTopic');
            const description = interaction.fields.getTextInputValue('feedbackDescription');
            console.log("Feedback reçu :", topic, description);

            await interaction.reply({ content: "🙏 Merci pour votre feedback !", ephemeral: true });
            // Ici on pourrait par exemple envoyer ces infos dans un salon spécial, ou les stocker en base, etc.
        }
    }

    if (!interaction.isChatInputCommand()) return;  // ne traiter que les commandes slash (et pas les autres interactions ici)

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        // Exécuter la commande correspondante
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        // Répondre par un message d'erreur utilisateur si la commande a échoué
        await interaction.reply({ content: 'Une erreur est survenue en exécutant la commande.', ephemeral: true });
    }
});



// On démarre la connexion du bot avec son token
client.login(process.env.TOKEN);
