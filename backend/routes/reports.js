const express = require('express');
const ReportsController = require('../controllers/reportsController');

const router = express.Router();

// GET /api/reports/ranking - Obter ranking de usuários
router.get('/ranking', ReportsController.getUserRanking);

// GET /api/reports/stats - Obter estatísticas gerais
router.get('/stats', ReportsController.getGeneralStats);

// GET /api/reports/user/:userId - Obter relatório detalhado do usuário
router.get('/user/:userId', ReportsController.getUserReport);

// GET /api/reports/search - Buscar usuários por nome
router.get('/search', ReportsController.searchUsers);

module.exports = router;

