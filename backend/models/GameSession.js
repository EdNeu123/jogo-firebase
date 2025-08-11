const { db } = require('../config/firebase');

class GameSession {
  constructor(data) {
    this.id = data.id || null;
    this.userId = data.userId || ''; // email codificado
    this.phase = data.phase || 1;
    this.score = data.score || 0;
    this.targetScore = data.targetScore || 100;
    this.timeRemaining = data.timeRemaining || 60;
    this.itemsCollected = data.itemsCollected || { pens: 0, cups: 0, books: 0 };
    this.status = data.status || 'active'; // active, paused, completed, failed
    this.startedAt = data.startedAt || Date.now();
    this.completedAt = data.completedAt || null;
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  // Salvar sessão no Firebase Realtime Database
  async save() {
    try {
      this.updatedAt = Date.now();
      
      if (this.id) {
        // Atualizar sessão existente
        await db.ref(`gameSessions/${this.id}`).update(this.toObject());
        return this;
      } else {
        // Criar nova sessão
        this.createdAt = Date.now();
        const sessionRef = db.ref('gameSessions').push();
        this.id = sessionRef.key;
        await sessionRef.set(this.toObject());
        return this;
      }
    } catch (error) {
      throw new Error(`Erro ao salvar sessão de jogo: ${error.message}`);
    }
  }

  // Buscar sessão por ID
  static async findById(id) {
    try {
      const snapshot = await db.ref(`gameSessions/${id}`).once('value');
      const sessionData = snapshot.val();
      
      if (!sessionData) {
        return null;
      }

      return new GameSession({ id, ...sessionData });
    } catch (error) {
      throw new Error(`Erro ao buscar sessão por ID: ${error.message}`);
    }
  }

  // Buscar sessões ativas do usuário
  static async findActiveByUserId(userId) {
    try {
      const snapshot = await db.ref('gameSessions')
        .orderByChild('userId')
        .equalTo(userId)
        .once('value');
      
      const sessions = snapshot.val();
      
      if (!sessions) {
        return null;
      }

      // Filtrar sessões ativas e pegar a mais recente
      const activeSessions = Object.keys(sessions)
        .map(id => ({ id, ...sessions[id] }))
        .filter(session => session.status === 'active')
        .sort((a, b) => b.createdAt - a.createdAt);

      if (activeSessions.length === 0) {
        return null;
      }

      const latestSession = activeSessions[0];
      return new GameSession(latestSession);
    } catch (error) {
      throw new Error(`Erro ao buscar sessão ativa: ${error.message}`);
    }
  }

  // Buscar histórico de sessões do usuário
  static async findByUserId(userId, limit = 10) {
    try {
      const snapshot = await db.ref('gameSessions')
        .orderByChild('userId')
        .equalTo(userId)
        .once('value');
      
      const sessionsData = snapshot.val();
      
      if (!sessionsData) {
        return [];
      }

      const sessions = Object.keys(sessionsData)
        .map(id => new GameSession({ id, ...sessionsData[id] }))
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);

      return sessions;
    } catch (error) {
      throw new Error(`Erro ao buscar sessões do usuário: ${error.message}`);
    }
  }

  // Atualizar pontuação da sessão
  async updateScore(points, itemType = null) {
    try {
      this.score += points;
      
      if (itemType && this.itemsCollected[itemType] !== undefined) {
        this.itemsCollected[itemType]++;
      }

      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Erro ao atualizar pontuação da sessão: ${error.message}`);
    }
  }

  // Completar sessão
  async complete() {
    try {
      this.status = this.score >= this.targetScore ? 'completed' : 'failed';
      this.completedAt = Date.now();
      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Erro ao completar sessão: ${error.message}`);
    }
  }

  // Pausar sessão
  async pause() {
    try {
      this.status = 'paused';
      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Erro ao pausar sessão: ${error.message}`);
    }
  }

  // Retomar sessão
  async resume() {
    try {
      this.status = 'active';
      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Erro ao retomar sessão: ${error.message}`);
    }
  }

  // Converter para objeto simples
  toObject() {
    return {
      userId: this.userId,
      phase: this.phase,
      score: this.score,
      targetScore: this.targetScore,
      timeRemaining: this.timeRemaining,
      itemsCollected: this.itemsCollected,
      status: this.status,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Converter para resposta da API
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      phase: this.phase,
      score: this.score,
      targetScore: this.targetScore,
      timeRemaining: this.timeRemaining,
      itemsCollected: this.itemsCollected,
      status: this.status,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = GameSession;

