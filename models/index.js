// models/index.js
const sequelize = require('../sequelize');
const User = require('./user');
const Favorite = require('./Favorite');
const Character = require('./Character');
const Anime = require('./Anime');

Character.belongsTo(Anime, { foreignKey: 'anime_mal_id', targetKey: 'mal_id', as: 'anime' });
Anime.hasMany(Character, { foreignKey: 'anime_mal_id', sourceKey: 'mal_id', as: 'characters' });

module.exports = {
  sequelize,
  User,
  Favorite,
  Character,
  Anime,
};
