const User = require('../models/User');
const GameSession = require('../models/GameSession');

class ReportsController {
  // Obter ranking de usuários
  static async getUserRanking(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const users = await User.findAll();

      // Limitar resultados
      const ranking = users.slice(0, limit).map((user, index) => ({
        position: index + 1,
        id: user.id,
        fullname: user.fullname,
        totalScore: user.totalScore,
        senacoins: user.senacoins,
        pensCollected: user.pensCollected,
        cupsCollected: user.cupsCollected,
        booksCollected: user.booksCollected,
        createdAt: user.createdAt
      }));

      res.json({
        success: true,
        ranking
      });

    } catch (error) {
      console.error('Erro ao obter ranking:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obter estatísticas gerais
  static async getGeneralStats(req, res) {
    try {
      const users = await User.findAll();
      
      const stats = {
        totalUsers: users.length,
        totalScore: users.reduce((sum, user) => sum + user.totalScore, 0),
        totalSenacoins: users.reduce((sum, user) => sum + user.senacoins, 0),
        totalPensCollected: users.reduce((sum, user) => sum + user.pensCollected, 0),
        totalCupsCollected: users.reduce((sum, user) => sum + user.cupsCollected, 0),
        totalBooksCollected: users.reduce((sum, user) => sum + user.booksCollected, 0),
        averageScore: users.length > 0 ? Math.round(users.reduce((sum, user) => sum + user.totalScore, 0) / users.length) : 0,
        topPlayer: users.length > 0 ? {
          fullname: users[0].fullname,
          totalScore: users[0].totalScore
        } : null
      };

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obter relatório detalhado do usuário
  static async getUserReport(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const sessions = await GameSession.findByUserId(userId, 20);
      
      // Calcular estatísticas das sessões
      const completedSessions = sessions.filter(s => s.status === 'completed');
      const failedSessions = sessions.filter(s => s.status === 'failed');
      
      const report = {
        user: user.toJSON(),
        sessionStats: {
          total: sessions.length,
          completed: completedSessions.length,
          failed: failedSessions.length,
          successRate: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0
        },
        recentSessions: sessions.slice(0, 10).map(session => session.toJSON())
      };

      res.json({
        success: true,
        report
      });

    } catch (error) {
      console.error('Erro ao obter relatório do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Buscar usuários por nome
  static async searchUsers(req, res) {
    try {
      const { query } = req.query;

      if (!query || query.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Query de busca deve ter pelo menos 2 caracteres'
        });
      }

      const users = await User.findAll();
      
      // Filtrar usuários por nome (busca case-insensitive)
      const filteredUsers = users.filter(user => 
        user.fullname.toLowerCase().includes(query.toLowerCase())
      );

      const results = filteredUsers.slice(0, 20).map(user => ({
        id: user.id,
        fullname: user.fullname,
        totalScore: user.totalScore,
        senacoins: user.senacoins,
        createdAt: user.createdAt
      }));

      res.json({
        success: true,
        results,
        total: filteredUsers.length
      });

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = ReportsController;

