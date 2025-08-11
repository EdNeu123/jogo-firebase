// Configurações da aplicação
const CONFIG = {
    // URL base da API (ajustar conforme necessário)
    API_BASE_URL: 'http://localhost:3001/api',
    
    // Configurações do jogo
    GAME: {
        DEFAULT_TIME: 60,
        POINTS_PER_ITEM: {
            pen: 10,
            cup: 15,
            book: 20
        },
        PHASES: {
            1: { targetScore: 100, timeLimit: 60 },
            2: { targetScore: 200, timeLimit: 90 },
            3: { targetScore: 300, timeLimit: 120 },
            4: { targetScore: 400, timeLimit: 150 },
            5: { targetScore: 500, timeLimit: 180 }
        }
    },
    
    // Configurações de áudio
    AUDIO: {
        enabled: true,
        volume: 0.5
    },
    
    // Configurações de localStorage
    STORAGE_KEYS: {
        USER_DATA: 'gameUserData',
        GAME_SESSION: 'gameSession',
        AUDIO_SETTINGS: 'audioSettings'
    },
    
    // Mensagens padrão
    MESSAGES: {
        LOGIN_SUCCESS: 'Login realizado com sucesso!',
        LOGIN_ERROR: 'Erro ao fazer login. Tente novamente.',
        GAME_START: 'Jogo iniciado! Boa sorte!',
        GAME_COMPLETE: 'Parabéns! Você completou a fase!',
        GAME_FAILED: 'Que pena! Tente novamente!',
        PURCHASE_SUCCESS: 'Item comprado com sucesso!',
        PURCHASE_ERROR: 'Erro ao comprar item. Verifique seu saldo.',
        NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.'
    }
};

// Função para obter configuração
function getConfig(key) {
    return key.split('.').reduce((obj, k) => obj && obj[k], CONFIG);
}

// Função para definir configuração
function setConfig(key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, k) => obj[k] = obj[k] || {}, CONFIG);
    target[lastKey] = value;
}

