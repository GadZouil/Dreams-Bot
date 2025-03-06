// models/index.js
const sequelize = require('../sequelize');
const User = require('./user');
const Favorite = require('./Favorite');

module.exports = {
  sequelize,
  User,
  Favorite,
};
