const express = require('express');
const AuthController = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/login - Login/Registro de usuário
router.post('/login', AuthController.login);

// GET /api/auth/user/:userId - Obter dados do usuário
router.get('/user/:userId', AuthController.getUser);

// PUT /api/auth/user/:userId - Atualizar dados do usuário
router.put('/user/:userId', AuthController.updateUser);

module.exports = router;

