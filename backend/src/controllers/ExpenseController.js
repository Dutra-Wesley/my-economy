const { Op } = require('sequelize');
const Expense = require('../models/Expense');

class ExpenseController {
  async store(req, res) {
    try {
      const { description, value, referenceMonth } = req.body;
      const userId = req.userId;

      const currentDate = new Date();
      const referenceDate = new Date(referenceMonth);

      if (referenceDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)) {
        return res.status(400).json({ error: 'Não é possível cadastrar despesas para meses anteriores' });
      }

      const expense = await Expense.create({
        description,
        value,
        referenceMonth,
        userId,
      });

      return res.json(expense);
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao cadastrar despesa' });
    }
  }

  async index(req, res) {
    try {
      const { month } = req.query;
      const userId = req.userId;

      const startDate = new Date(month);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

      const expenses = await Expense.findAll({
        where: {
          userId,
          referenceMonth: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['createdAt', 'DESC']],
      });

      return res.json(expenses);
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao buscar despesas' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { description, value, referenceMonth } = req.body;
      const userId = req.userId;

      const expense = await Expense.findOne({
        where: { id, userId },
      });

      if (!expense) {
        return res.status(404).json({ error: 'Despesa não encontrada' });
      }

      const currentDate = new Date();
      const referenceDate = new Date(referenceMonth);

      if (referenceDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)) {
        return res.status(400).json({ error: 'Não é possível editar despesas de meses anteriores' });
      }

      await expense.update({
        description,
        value,
        referenceMonth,
      });

      return res.json(expense);
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao atualizar despesa' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const expense = await Expense.findOne({
        where: { id, userId },
      });

      if (!expense) {
        return res.status(404).json({ error: 'Despesa não encontrada' });
      }

      const currentDate = new Date();
      const referenceDate = new Date(expense.referenceMonth);

      if (referenceDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)) {
        return res.status(400).json({ error: 'Não é possível excluir despesas de meses anteriores' });
      }

      await expense.destroy();

      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao excluir despesa' });
    }
  }
}

module.exports = new ExpenseController(); 