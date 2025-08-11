const express = require('express');
const GameController = require('../controllers/gameController');

const router = express.Router();

// POST /api/game/start - Iniciar nova sessão de jogo
router.post('/start', GameController.startGame);

// PUT /api/game/session/:sessionId/score - Atualizar pontuação
router.put('/session/:sessionId/score', GameController.updateScore);

// PUT /api/game/session/:sessionId/end - Finalizar jogo
router.put('/session/:sessionId/end', GameController.endGame);

// PUT /api/game/session/:sessionId/pause - Pausar jogo
router.put('/session/:sessionId/pause', GameController.pauseGame);

// PUT /api/game/session/:sessionId/resume - Retomar jogo
router.put('/session/:sessionId/resume', GameController.resumeGame);

// GET /api/game/user/:userId/active - Obter sessão ativa do usuário
router.get('/user/:userId/active', GameController.getActiveSession);

// GET /api/game/user/:userId/history - Obter histórico de sessões
router.get('/user/:userId/history', GameController.getGameHistory);

module.exports = router;

