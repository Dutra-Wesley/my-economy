const { Op } = require('sequelize');
const Expense = require('../models/Expense');
const sequelize = require('sequelize');

class ExpenseController {
  async store(req, res) {
    try {
      const { description, value, referenceMonth } = req.body;
      const userId = req.userId;

      const [year, month] = referenceMonth.split('-');
      const referenceDate = new Date(Number(year), Number(month) - 1, 1);
      const currentDate = new Date();

      const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const referenceYearMonth = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}`;

      if (referenceYearMonth < currentYearMonth) {
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
      const [year, monthNum] = month.split('-');
      const monthInt = parseInt(monthNum, 10);
      const expenses = await Expense.findAll({
        where: {
          userId,
          referenceMonth: {
            [Op.like]: `${month}%`,
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

      const [year, month] = referenceMonth.split('-');
      const referenceDate = new Date(Number(year), Number(month) - 1, 1);
      const currentDate = new Date();

      const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const referenceYearMonth = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}`;

      if (referenceYearMonth < currentYearMonth) {
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

      const [year, month] = expense.referenceMonth.split('-');
      const referenceDate = new Date(Number(year), Number(month) - 1, 1);
      const currentDate = new Date();

      const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const referenceYearMonth = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}`;

      if (referenceYearMonth < currentYearMonth) {
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