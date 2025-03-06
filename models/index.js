// models/index.js
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql', // ou 'mariadb'
    logging: false,   // désactive les logs SQL si tu le souhaites
  }
);

module.exports = { sequelize, DataTypes };
