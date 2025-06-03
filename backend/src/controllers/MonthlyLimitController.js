const { Op } = require('sequelize');
const MonthlyLimit = require('../models/MonthlyLimit');
const Expense = require('../models/Expense');

class MonthlyLimitController {
  async store(req, res) {
    try {
      const { value, referenceMonth } = req.body;
      const userId = req.userId;

      const currentDate = new Date();
      const referenceDate = new Date(referenceMonth);

      if (referenceDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)) {
        return res.status(400).json({ error: 'Não é possível cadastrar limite para meses anteriores' });
      }

      const existingLimit = await MonthlyLimit.findOne({
        where: {
          userId,
          referenceMonth: {
            [Op.between]: [
              new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1),
              new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0),
            ],
          },
        },
      });

      if (existingLimit) {
        return res.status(400).json({ error: 'Já existe um limite cadastrado para este mês' });
      }

      const limit = await MonthlyLimit.create({
        value,
        referenceMonth,
        userId,
      });

      return res.json(limit);
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao cadastrar limite' });
    }
  }

  async show(req, res) {
    try {
      const { month } = req.query;
      const userId = req.userId;

      const startDate = new Date(month);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

      const limit = await MonthlyLimit.findOne({
        where: {
          userId,
          referenceMonth: {
            [Op.between]: [startDate, endDate],
          },
        },
      });

      if (!limit) {
        return res.status(404).json({ error: 'Limite não encontrado para este mês' });
      }

      const expenses = await Expense.findAll({
        where: {
          userId,
          referenceMonth: {
            [Op.between]: [startDate, endDate],
          },
        },
      });

      const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.value), 0);
      const remaining = Number(limit.value) - totalExpenses;

      return res.json({
        limit,
        totalExpenses,
        remaining,
        status: remaining >= 0 ? 'success' : 'failure',
      });
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao buscar limite' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { value, referenceMonth } = req.body;
      const userId = req.userId;

      const limit = await MonthlyLimit.findOne({
        where: { id, userId },
      });

      if (!limit) {
        return res.status(404).json({ error: 'Limite não encontrado' });
      }

      const currentDate = new Date();
      const referenceDate = new Date(referenceMonth);

      if (referenceDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)) {
        return res.status(400).json({ error: 'Não é possível editar limite de meses anteriores' });
      }

      await limit.update({
        value,
        referenceMonth,
      });

      return res.json(limit);
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao atualizar limite' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const limit = await MonthlyLimit.findOne({
        where: { id, userId },
      });

      if (!limit) {
        return res.status(404).json({ error: 'Limite não encontrado' });
      }

      const currentDate = new Date();
      const referenceDate = new Date(limit.referenceMonth);

      if (referenceDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)) {
        return res.status(400).json({ error: 'Não é possível excluir limite de meses anteriores' });
      }

      await limit.destroy();

      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao excluir limite' });
    }
  }
}

module.exports = new MonthlyLimitController(); 