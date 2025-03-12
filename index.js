// Chargement des variables d'environnement
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { sequelize } = require('./models');

// Création du client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Collection pour stocker les commandes
client.commands = new Collection();

// Initialisation de Distube et attache-le au client
client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  // Autres options si nécessaire
});

// Chargement des commandes récursivement
function loadCommands(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
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

const commandsPath = path.join(__dirname, 'commands');
loadCommands(commandsPath);

// Importation des handlers
const buttonHandler = require('./handlers/buttonHandler');
const selectMenuHandler = require('./handlers/selectMenuHandler');
const modalHandler = require('./handlers/modalHandler');

// Gestion des interactions
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
    await buttonHandler(interaction);
  } else if (interaction.isStringSelectMenu()) {
    await selectMenuHandler(interaction);
  } else if (interaction.isModalSubmit()) {
    await modalHandler(interaction);
  }
});

// Synchronisation des modèles
sequelize.sync()
  .then(() => {
    console.log('✅ Modèles synchronisés avec la base de données.');
  })
  .catch(err => console.error('Erreur de synchronisation :', err));

// Dès que le bot est prêt, démarre les tâches cron
client.once('ready', () => {
  console.log(`✅ Bot prêt en tant que ${client.user.tag}`);
  const startCron = require('./cron');
  startCron(client);
});

// Connexion du bot avec le token Discord
client.login(process.env.TOKEN);
