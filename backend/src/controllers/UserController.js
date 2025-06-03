const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

class UserController {
  async store(req, res) {
    try {
      const { name, email, password, birthDate } = req.body;

      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'Usuário já existe' });
      }

      const user = await User.create({
        name,
        email,
        password,
        birthDate,
      });

      user.password = undefined;

      return res.json({
        user,
        token: jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: '7d',
        }),
      });
    } catch (error) {
      return res.status(400).json({ error: 'Falha no registro' });
    }
  }

  async signin(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      if (!(await user.checkPassword(password))) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      user.password = undefined;

      return res.json({
        user,
        token: jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: '7d',
        }),
      });
    } catch (error) {
      return res.status(400).json({ error: 'Falha na autenticação' });
    }
  }

  async show(req, res) {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: ['id', 'name', 'email', 'birthDate'],
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json(user);
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao buscar usuário' });
    }
  }
}

module.exports = new UserController(); 