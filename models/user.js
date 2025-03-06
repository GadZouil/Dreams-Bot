// models/user.js
const sequelize = require('../sequelize');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  money: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  tableName: 'user',
  timestamps: false,
});

module.exports = User;
