// models/FavoriteCharacter.js
const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const FavoriteCharacter = sequelize.define('FavoriteCharacter', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  characterMalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'character_favorites',
  timestamps: true,
});

FavoriteCharacter.isFavorite = async function(userId, characterMalId) {
  const fav = await FavoriteCharacter.findOne({ where: { userId, characterMalId } });
  return !!fav;
};

module.exports = FavoriteCharacter;
