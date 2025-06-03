const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MonthlyLimit = sequelize.define('MonthlyLimit', {
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  referenceMonth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
});

module.exports = MonthlyLimit; 