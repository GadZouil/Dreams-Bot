// models/Favorite.js
const sequelize = require('../sequelize');
const { DataTypes } = require('sequelize');

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'favorites',
  timestamps: true,
});

module.exports = Favorite;
