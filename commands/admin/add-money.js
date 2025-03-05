const { SlashCommandBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-money')
        .setDescription("Ajoute de l'argent à un utilisateur.")
        .addUserOption(option => 
            option.setName('utilisateur')
                .setDescription('L\'utilisateur auquel ajouter de l\'argent')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('montant')
                .setDescription("Montant à ajouter")
                .setRequired(true)),
    
    async execute(interaction) {
        const user = interaction.options.getUser('utilisateur');
        const amount = interaction.options.getInteger('montant');

        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: "❌ Tu n'as pas la permission d'utiliser cette commande.", ephemeral: true });
        }

        // Vérifier si l'utilisateur est déjà en base
        db.query('SELECT * FROM user WHERE id = ?', [user.id], (err, results) => {
            if (err) {
                console.error('Erreur SQL:', err);
                return interaction.reply({ content: '❌ Erreur interne.', ephemeral: true });
            }

            if (results.length === 0) {
                // Insérer le nouvel utilisateur
                db.query('INSERT INTO user (id, name, money) VALUES (?, ?, ?)', [user.id, user.username, amount], (err) => {
                    if (err) {
                        console.error('Erreur SQL:', err);
                        return interaction.reply({ content: '❌ Erreur interne.', ephemeral: true });
                    }
                    interaction.reply(`✅ ${user.username} a été ajouté avec **${amount}**💰.`);
                });
            } else {
                // Mettre à jour l'argent existant
                db.query('UPDATE user SET money = money + ? WHERE id = ?', [amount, user.id], (err) => {
                    if (err) {
                        console.error('Erreur SQL:', err);
                        return interaction.reply({ content: '❌ Erreur interne.', ephemeral: true });
                    }
                    interaction.reply(`✅ ${user.username} a maintenant **${results[0].money + amount}**💰.`);
                });
            }
        });
    },
};

