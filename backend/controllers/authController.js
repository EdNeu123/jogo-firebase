const User = require('../models/User');

class AuthController {
  // Login/Registro de usuário
  static async login(req, res) {
    try {
      const { fullname, email, phone } = req.body;

      // Validação básica
      if (!fullname || !email || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos são obrigatórios'
        });
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }

      // Buscar usuário existente
      let user = await User.findByEmail(email);

      if (user) {
        // Atualizar dados do usuário existente e login
        user.fullname = fullname;
        user.phone = phone;
        await user.updateLogin();
        await user.save();
      } else {
        // Criar novo usuário
        user = new User({
          email,
          fullname,
          phone,
          senacoins: 100, // Bônus inicial
          loginCount: 1,
          createdAt: Date.now(),
          lastLogin: Date.now()
        });
        await user.save();
      }

      // Retornar dados do usuário
      const userData = await user.toJSON();

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        user: userData
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obter dados do usuário
  static async getUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const userData = await user.toJSON();

      res.json({
        success: true,
        user: userData
      });

    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar dados do usuário
  static async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const { fullname, phone } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      if (fullname) user.fullname = fullname;
      if (phone) user.phone = phone;

      await user.save();

      const userData = await user.toJSON();

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        user: userData
      });

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = AuthController;

