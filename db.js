// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

connection.connect(err => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données :', err);
  } else {
    console.log('✅ Connecté à la base de données MySQL');
  }
});

// Exporter la connexion en mode promesse
module.exports = connection.promise();
