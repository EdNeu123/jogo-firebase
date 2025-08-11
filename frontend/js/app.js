// Aplicação Principal
class App {
    constructor() {
        this.currentSection = 'dashboard';
        this.managers = {};
    }

    // Inicializar aplicação
    async initialize() {
        try {
            // Verificar se o usuário está logado
            if (authManager.isLoggedIn()) {
                authManager.showMainInterface();
                await this.initializeManagers();
                this.initializeNavigation();
                this.showSection('dashboard');
            } else {
                authManager.showLoginScreen();
            }

            // Inicializar eventos de autenticação
            authManager.initializeAuthEvents();

            // Verificar conectividade com a API
            await this.checkApiConnection();

        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
            showNotification('Erro ao inicializar aplicação', 'error');
        }
    }

    // Inicializar gerenciadores
    async initializeManagers() {
        try {
            // Inicializar dashboard
            if (typeof DashboardManager !== 'undefined') {
                this.managers.dashboard = dashboardManager;
                await dashboardManager.initialize();
            }

            // Inicializar loja
            if (typeof ShopManager !== 'undefined') {
                this.managers.shop = shopManager;
                await shopManager.initialize();
            }

            // Inicializar jogo
            if (typeof GameManager !== 'undefined') {
                this.managers.game = gameManager;
                gameManager.initialize();
            }

            // Inicializar relatórios
            if (typeof ReportsManager !== 'undefined') {
                this.managers.reports = reportsManager;
                await reportsManager.initialize();
            }

        } catch (error) {
            console.error('Erro ao inicializar gerenciadores:', error);
        }
    }

    // Verificar conexão com a API
    async checkApiConnection() {
        try {
            await api.healthCheck();
            console.log('✅ Conexão com API estabelecida');
        } catch (error) {
            console.warn('⚠️ Problemas de conectividade com a API:', error);
            showNotification('Problemas de conectividade. Algumas funcionalidades podem não funcionar.', 'warning');
        }
    }

    // Inicializar navegação
    initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.dataset.target;
                const sectionName = target.replace('-section', '');
                this.showSection(sectionName);
            });
        });

        // Marcar primeiro link como ativo
        this.updateActiveNavLink('dashboard');
    }

    // Mostrar seção
    showSection(sectionName) {
        this.currentSection = sectionName;
        
        // Atualizar navegação ativa
        this.updateActiveNavLink(sectionName);

        // Mostrar seção correspondente
        switch (sectionName) {
            case 'dashboard':
                if (this.managers.dashboard) {
                    this.managers.dashboard.show();
                }
                break;
                
            case 'shop':
                if (this.managers.shop) {
                    this.managers.shop.show();
                }
                break;
                
            case 'game':
                if (this.managers.game) {
                    this.managers.game.show();
                }
                break;
                
            case 'reports':
                if (this.managers.reports) {
                    this.managers.reports.show();
                }
                break;
                
            default:
                console.warn('Seção não encontrada:', sectionName);
        }
    }

    // Atualizar link de navegação ativo
    updateActiveNavLink(sectionName) {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const target = link.dataset.target;
            const linkSectionName = target.replace('-section', '');
            
            if (linkSectionName === sectionName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Obter seção atual
    getCurrentSection() {
        return this.currentSection;
    }

    // Recarregar dados da seção atual
    async refreshCurrentSection() {
        const manager = this.managers[this.currentSection];
        if (manager && typeof manager.refresh === 'function') {
            await manager.refresh();
        }
    }
}

// Funções utilitárias globais

// Mostrar notificação
function showNotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover notificação após o tempo especificado
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, duration);
}

// Formatar número
function formatNumber(num) {
    return num.toLocaleString('pt-BR');
}

// Formatar data
function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleDateString('pt-BR');
}

// Debounce para otimizar eventos
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle para otimizar eventos
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Instância global da aplicação
const app = new App();

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando aplicação...');
    
    // Inicializar ícones Lucide
    lucide.createIcons();
    
    // Inicializar aplicação
    await app.initialize();
    
    console.log('✅ Aplicação inicializada com sucesso');
});

// Manipular erros globais
window.addEventListener('error', (event) => {
    console.error('Erro global capturado:', event.error);
    showNotification('Ocorreu um erro inesperado', 'error');
});

// Manipular promessas rejeitadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejeitada:', event.reason);
    showNotification('Erro de conectividade', 'error');
});

// Exportar para uso global se necessário
window.app = app;

