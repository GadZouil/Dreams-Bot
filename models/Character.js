const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Character = sequelize.define('Character', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  mal_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  favorites: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  aliases: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  anime_mal_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'character',
  timestamps: false,
});

module.exports = Character;
