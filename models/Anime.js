const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Anime = sequelize.define('Anime', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  synopsis: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  episodes: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  score: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  popularity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  members: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  favorites: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'anime',
  timestamps: false,
});

module.exports = Anime;
