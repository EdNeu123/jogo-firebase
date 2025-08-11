// Módulo para comunicação com a API
class ApiService {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
    }

    // Método genérico para fazer requisições
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error('Erro na API:', error);
            throw error;
        }
    }

    // Métodos de autenticação
    async login(userData) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getUser(userId) {
        return this.request(`/auth/user/${userId}`);
    }

    async updateUser(userId, userData) {
        return this.request(`/auth/user/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    // Métodos do jogo
    async startGame(userId, phase = 1) {
        return this.request('/game/start', {
            method: 'POST',
            body: JSON.stringify({ userId, phase })
        });
    }

    async updateScore(sessionId, points, itemType) {
        return this.request(`/game/session/${sessionId}/score`, {
            method: 'PUT',
            body: JSON.stringify({ points, itemType })
        });
    }

    async endGame(sessionId) {
        return this.request(`/game/session/${sessionId}/end`, {
            method: 'PUT'
        });
    }

    async pauseGame(sessionId) {
        return this.request(`/game/session/${sessionId}/pause`, {
            method: 'PUT'
        });
    }

    async resumeGame(sessionId) {
        return this.request(`/game/session/${sessionId}/resume`, {
            method: 'PUT'
        });
    }

    async getActiveSession(userId) {
        return this.request(`/game/user/${userId}/active`);
    }

    async getGameHistory(userId, limit = 10) {
        return this.request(`/game/user/${userId}/history?limit=${limit}`);
    }

    // Métodos da loja
    async getShopItems() {
        return this.request('/shop/items');
    }

    async purchaseItem(userId, itemId) {
        return this.request('/shop/purchase', {
            method: 'POST',
            body: JSON.stringify({ userId, itemId })
        });
    }

    async getUserBalance(userId) {
        return this.request(`/shop/user/${userId}/balance`);
    }

    // Métodos de relatórios
    async getUserRanking(limit = 50) {
        return this.request(`/reports/ranking?limit=${limit}`);
    }

    async getGeneralStats() {
        return this.request('/reports/stats');
    }

    async getUserReport(userId) {
        return this.request(`/reports/user/${userId}`);
    }

    async searchUsers(query) {
        return this.request(`/reports/search?query=${encodeURIComponent(query)}`);
    }

    // Método para verificar saúde da API
    async healthCheck() {
        return this.request('/health', { method: 'GET' });
    }
}

// Instância global da API
const api = new ApiService();

