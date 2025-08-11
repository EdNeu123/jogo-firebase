const { db } = require('../config/firebase');

class User {
  constructor(data) {
    this.id = data.id || null; // email codificado
    this.email = data.email || '';
    this.fullname = data.fullname || '';
    this.phone = data.phone || '';
    this.senacoins = data.senacoins || 100;
    this.loginCount = data.loginCount || 0;
    this.createdAt = data.createdAt || Date.now();
    this.lastLogin = data.lastLogin || Date.now();
    
    // Bônus disponíveis
    this.bonuses = data.bonuses || {
      doublePoints: false,
      extraTime: false
    };
  }

  // Codificar email para usar como chave no Firebase
  static encodeEmail(email) {
    return email.replace(/\./g, ',').replace(/@/g, '_at_');
  }

  // Decodificar email
  static decodeEmail(encodedEmail) {
    return encodedEmail.replace(/,/g, '.').replace(/_at_/g, '@');
  }

  // Salvar usuário no Firebase Realtime Database
  async save() {
    try {
      if (!this.id) {
        this.id = User.encodeEmail(this.email);
      }

      const userData = {
        profile: {
          email: this.email,
          fullname: this.fullname,
          phone: this.phone,
          senacoins: this.senacoins,
          loginCount: this.loginCount,
          createdAt: this.createdAt,
          lastLogin: this.lastLogin
        },
        bonuses: this.bonuses
      };

      await db.ref(`users/${this.id}`).update(userData);
      return this;
    } catch (error) {
      throw new Error(`Erro ao salvar usuário: ${error.message}`);
    }
  }

  // Buscar usuário por email
  static async findByEmail(email) {
    try {
      const encodedEmail = User.encodeEmail(email);
      const snapshot = await db.ref(`users/${encodedEmail}`).once('value');
      const userData = snapshot.val();
      
      if (!userData || !userData.profile) {
        return null;
      }

      return new User({
        id: encodedEmail,
        email: userData.profile.email,
        fullname: userData.profile.fullname,
        phone: userData.profile.phone,
        senacoins: userData.profile.senacoins || 100,
        loginCount: userData.profile.loginCount || 0,
        createdAt: userData.profile.createdAt,
        lastLogin: userData.profile.lastLogin,
        bonuses: userData.bonuses || { doublePoints: false, extraTime: false }
      });
    } catch (error) {
      throw new Error(`Erro ao buscar usuário por email: ${error.message}`);
    }
  }

  // Buscar usuário por ID (email codificado)
  static async findById(id) {
    try {
      const snapshot = await db.ref(`users/${id}`).once('value');
      const userData = snapshot.val();
      
      if (!userData || !userData.profile) {
        return null;
      }

      return new User({
        id,
        email: userData.profile.email,
        fullname: userData.profile.fullname,
        phone: userData.profile.phone,
        senacoins: userData.profile.senacoins || 100,
        loginCount: userData.profile.loginCount || 0,
        createdAt: userData.profile.createdAt,
        lastLogin: userData.profile.lastLogin,
        bonuses: userData.bonuses || { doublePoints: false, extraTime: false }
      });
    } catch (error) {
      throw new Error(`Erro ao buscar usuário por ID: ${error.message}`);
    }
  }

  // Listar todos os usuários
  static async findAll() {
    try {
      const snapshot = await db.ref('users').once('value');
      const usersData = snapshot.val();
      
      if (!usersData) {
        return [];
      }

      const users = [];
      for (const [encodedEmail, userData] of Object.entries(usersData)) {
        if (userData.profile) {
          // Calcular pontuação total dos relatórios
          let totalScore = 0;
          if (userData.reports) {
            totalScore = Object.values(userData.reports)
              .reduce((sum, report) => sum + (report.score || 0), 0);
          }

          users.push(new User({
            id: encodedEmail,
            email: userData.profile.email,
            fullname: userData.profile.fullname,
            phone: userData.profile.phone,
            senacoins: userData.profile.senacoins || 100,
            loginCount: userData.profile.loginCount || 0,
            createdAt: userData.profile.createdAt,
            lastLogin: userData.profile.lastLogin,
            bonuses: userData.bonuses || { doublePoints: false, extraTime: false },
            totalScore
          }));
        }
      }

      // Ordenar por pontuação total (maior para menor)
      users.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

      return users;
    } catch (error) {
      throw new Error(`Erro ao listar usuários: ${error.message}`);
    }
  }

  // Atualizar pontuação do usuário (criar relatório)
  async updateScore(newScore, gameData = {}) {
    try {
      // Criar novo relatório
      const reportId = db.ref().push().key;
      const reportData = {
        date: Date.now(),
        score: newScore,
        status: gameData.status || 'Concluído',
        username: this.fullname,
        phase: gameData.phase || 1,
        itemsCollected: gameData.itemsCollected || { pens: 0, cups: 0, books: 0 }
      };

      // Salvar relatório
      await db.ref(`users/${this.id}/reports/${reportId}`).set(reportData);

      // Atualizar senacoins (1 senacoin a cada 10 pontos)
      const bonusCoins = Math.floor(newScore / 10);
      this.senacoins += bonusCoins;

      // Atualizar profile
      await db.ref(`users/${this.id}/profile/senacoins`).set(this.senacoins);
      await db.ref(`users/${this.id}/profile/lastLogin`).set(Date.now());

      return this;
    } catch (error) {
      throw new Error(`Erro ao atualizar pontuação: ${error.message}`);
    }
  }

  // Gastar senacoins
  async spendSenacoins(amount) {
    try {
      if (this.senacoins < amount) {
        throw new Error('Senacoins insuficientes');
      }

      this.senacoins -= amount;
      await db.ref(`users/${this.id}/profile/senacoins`).set(this.senacoins);
      return this;
    } catch (error) {
      throw new Error(`Erro ao gastar senacoins: ${error.message}`);
    }
  }

  // Ativar bônus
  async activateBonus(bonusType) {
    try {
      this.bonuses[bonusType] = true;
      await db.ref(`users/${this.id}/bonuses/${bonusType}`).set(true);
      return this;
    } catch (error) {
      throw new Error(`Erro ao ativar bônus: ${error.message}`);
    }
  }

  // Desativar bônus
  async deactivateBonus(bonusType) {
    try {
      this.bonuses[bonusType] = false;
      await db.ref(`users/${this.id}/bonuses/${bonusType}`).set(false);
      return this;
    } catch (error) {
      throw new Error(`Erro ao desativar bônus: ${error.message}`);
    }
  }

  // Atualizar login
  async updateLogin() {
    try {
      this.loginCount += 1;
      this.lastLogin = Date.now();
      
      await db.ref(`users/${this.id}/profile`).update({
        loginCount: this.loginCount,
        lastLogin: this.lastLogin
      });
      
      return this;
    } catch (error) {
      throw new Error(`Erro ao atualizar login: ${error.message}`);
    }
  }

  // Obter relatórios do usuário
  async getReports() {
    try {
      const snapshot = await db.ref(`users/${this.id}/reports`).once('value');
      const reportsData = snapshot.val();
      
      if (!reportsData) {
        return [];
      }

      return Object.keys(reportsData).map(id => ({
        id,
        ...reportsData[id]
      })).sort((a, b) => b.date - a.date);
    } catch (error) {
      throw new Error(`Erro ao obter relatórios: ${error.message}`);
    }
  }

  // Calcular pontuação total
  async getTotalScore() {
    try {
      const reports = await this.getReports();
      return reports.reduce((sum, report) => sum + (report.score || 0), 0);
    } catch (error) {
      return 0;
    }
  }

  // Converter para resposta da API
  async toJSON() {
    const totalScore = await this.getTotalScore();
    const reports = await this.getReports();
    
    return {
      id: this.id,
      email: this.email,
      fullname: this.fullname,
      phone: this.phone,
      senacoins: this.senacoins,
      loginCount: this.loginCount,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin,
      bonuses: this.bonuses,
      totalScore,
      reportsCount: reports.length,
      // Calcular itens coletados dos relatórios
      pensCollected: reports.reduce((sum, r) => sum + (r.itemsCollected?.pens || 0), 0),
      cupsCollected: reports.reduce((sum, r) => sum + (r.itemsCollected?.cups || 0), 0),
      booksCollected: reports.reduce((sum, r) => sum + (r.itemsCollected?.books || 0), 0)
    };
  }
}

module.exports = User;

