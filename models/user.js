// models/user.js
const { sequelize, DataTypes } = require('./index');

const user = sequelize.define('user', {
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
  timestamps: false, // si ta table n'a pas de colonnes createdAt/updatedAt
});

module.exports = user;
