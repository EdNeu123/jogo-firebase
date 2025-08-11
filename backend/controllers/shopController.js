const User = require('../models/User');

class ShopController {
  // Obter itens da loja
  static async getShopItems(req, res) {
    try {
      const shopItems = [
        {
          id: 'time-bonus',
          name: 'Bônus de Tempo',
          description: 'Adiciona 30 segundos extras ao jogo',
          price: 50,
          icon: 'clock',
          category: 'bonus'
        },
        {
          id: 'score-multiplier',
          name: 'Multiplicador de Pontos',
          description: 'Dobra os pontos por 1 minuto',
          price: 75,
          icon: 'zap',
          category: 'bonus'
        },
        {
          id: 'item-magnet',
          name: 'Ímã de Itens',
          description: 'Atrai itens automaticamente por 30 segundos',
          price: 60,
          icon: 'magnet',
          category: 'bonus'
        },
        {
          id: 'extra-life',
          name: 'Vida Extra',
          description: 'Uma chance extra de completar a fase',
          price: 100,
          icon: 'heart',
          category: 'bonus'
        },
        {
          id: 'hint-system',
          name: 'Sistema de Dicas',
          description: 'Mostra a localização de itens próximos',
          price: 40,
          icon: 'eye',
          category: 'bonus'
        },
        {
          id: 'speed-boost',
          name: 'Impulso de Velocidade',
          description: 'Aumenta a velocidade de movimento por 45 segundos',
          price: 55,
          icon: 'wind',
          category: 'bonus'
        }
      ];

      res.json({
        success: true,
        items: shopItems
      });

    } catch (error) {
      console.error('Erro ao obter itens da loja:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Comprar item da loja
  static async purchaseItem(req, res) {
    try {
      const { userId, itemId } = req.body;

      if (!userId || !itemId) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário e do item são obrigatórios'
        });
      }

      // Buscar usuário
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Definir preços dos itens
      const itemPrices = {
        'time-bonus': 50,
        'score-multiplier': 75,
        'item-magnet': 60,
        'extra-life': 100,
        'hint-system': 40,
        'speed-boost': 55
      };

      const price = itemPrices[itemId];
      if (!price) {
        return res.status(400).json({
          success: false,
          message: 'Item não encontrado'
        });
      }

      // Verificar se o usuário tem senacoins suficientes
      if (user.senacoins < price) {
        return res.status(400).json({
          success: false,
          message: 'Senacoins insuficientes'
        });
      }

      // Realizar a compra
      await user.spendSenacoins(price);

      res.json({
        success: true,
        message: 'Item comprado com sucesso',
        user: user.toJSON(),
        purchasedItem: itemId
      });

    } catch (error) {
      console.error('Erro ao comprar item:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Obter saldo de senacoins do usuário
  static async getUserBalance(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      res.json({
        success: true,
        balance: user.senacoins,
        user: user.toJSON()
      });

    } catch (error) {
      console.error('Erro ao obter saldo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = ShopController;

