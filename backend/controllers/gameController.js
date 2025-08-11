const User = require('../models/User');
const GameSession = require('../models/GameSession');

class GameController {
  // Iniciar nova sessão de jogo
  static async startGame(req, res) {
    try {
      const { userId, phase = 1 } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório'
        });
      }

      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Verificar se há sessão ativa
      const activeSession = await GameSession.findActiveByUserId(userId);
      if (activeSession) {
        return res.json({
          success: true,
          message: 'Sessão ativa encontrada',
          session: activeSession.toJSON()
        });
      }

      // Calcular pontuação alvo baseada na fase
      const targetScore = phase * 100;

      // Criar nova sessão
      const session = new GameSession({
        userId,
        phase,
        targetScore,
        timeRemaining: 60,
        itemsCollected: { pens: 0, cups: 0, books: 0 }
      });

      await session.save();

      res.json({
        success: true,
        message: 'Jogo iniciado com sucesso',
        session: session.toJSON()
      });

    } catch (error) {
      console.error('Erro ao iniciar jogo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar pontuação do jogo
  static async updateScore(req, res) {
    try {
      const { sessionId } = req.params;
      const { points, itemType } = req.body;

      if (!points || points <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Pontuação inválida'
        });
      }

      const session = await GameSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Sessão não encontrada'
        });
      }

      if (session.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Sessão não está ativa'
        });
      }

      // Atualizar pontuação da sessão
      await session.updateScore(points, itemType);

      res.json({
        success: true,
        message: 'Pontuação atualizada',
        session: session.toJSON()
      });

    } catch (error) {
      console.error('Erro ao atualizar pontuação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Finalizar jogo
  static async endGame(req, res) {
    try {
      const { sessionId } = req.params;

      const session = await GameSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Sessão não encontrada'
        });
      }

      // Completar sessão
      await session.complete();

      // Atualizar pontuação do usuário (criar relatório)
      const user = await User.findById(session.userId);
      if (user) {
        await user.updateScore(session.score, {
          status: session.status === 'completed' ? 'Concluído' : 'Falhou',
          phase: session.phase,
          itemsCollected: session.itemsCollected
        });
      }

      const userData = user ? await user.toJSON() : null;

      res.json({
        success: true,
        message: 'Jogo finalizado',
        session: session.toJSON(),
        user: userData
      });

    } catch (error) {
      console.error('Erro ao finalizar jogo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Pausar jogo
  static async pauseGame(req, res) {
    try {
      const { sessionId } = req.params;

      const session = await GameSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Sessão não encontrada'
        });
      }

      await session.pause();

      res.json({
        success: true,
        message: 'Jogo pausado',
        session: session.toJSON()
      });

    } catch (error) {
      console.error('Erro ao pausar jogo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Retomar jogo
  static async resumeGame(req, res) {
    try {
      const { sessionId } = req.params;

      const session = await GameSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Sessão não encontrada'
        });
      }

      await session.resume();

      res.json({
        success: true,
        message: 'Jogo retomado',
        session: session.toJSON()
      });

    } catch (error) {
      console.error('Erro ao retomar jogo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obter sessão ativa
  static async getActiveSession(req, res) {
    try {
      const { userId } = req.params;

      const session = await GameSession.findActiveByUserId(userId);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Nenhuma sessão ativa encontrada'
        });
      }

      res.json({
        success: true,
        session: session.toJSON()
      });

    } catch (error) {
      console.error('Erro ao obter sessão ativa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obter histórico de sessões
  static async getGameHistory(req, res) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 10;

      const sessions = await GameSession.findByUserId(userId, limit);

      res.json({
        success: true,
        sessions: sessions.map(session => session.toJSON())
      });

    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = GameController;

