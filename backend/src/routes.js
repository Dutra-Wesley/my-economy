const { Router } = require('express');
const UserController = require('./controllers/UserController');
const ExpenseController = require('./controllers/ExpenseController');
const MonthlyLimitController = require('./controllers/MonthlyLimitController');
const authMiddleware = require('./middlewares/auth');

const routes = Router();

// Rotas públicas
routes.post('/users', UserController.store);
routes.post('/sessions', UserController.signin);

// Middleware de autenticação
routes.use(authMiddleware);

// Rotas de usuário
routes.get('/users', UserController.show);

// Rotas de despesas
routes.post('/expenses', ExpenseController.store);
routes.get('/expenses', ExpenseController.index);
routes.put('/expenses/:id', ExpenseController.update);
routes.delete('/expenses/:id', ExpenseController.delete);

// Rotas de limites mensais
routes.post('/monthly-limits', MonthlyLimitController.store);
routes.get('/monthly-limits', MonthlyLimitController.show);
routes.put('/monthly-limits/:id', MonthlyLimitController.update);
routes.delete('/monthly-limits/:id', MonthlyLimitController.delete);

module.exports = routes; 