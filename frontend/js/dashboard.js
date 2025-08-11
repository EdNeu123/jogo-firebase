// Módulo do Dashboard
class DashboardManager {
    constructor() {
        this.isLoading = false;
    }

    // Inicializar dashboard
    async initialize() {
        await this.loadDashboardData();
        this.initializeEvents();
    }

    // Carregar dados do dashboard
    async loadDashboardData() {
        try {
            const user = authManager.getCurrentUser();
            if (!user) return;

            this.isLoading = true;
            await this.updateUserStats(user);
            
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            showNotification('Erro ao carregar dados do dashboard', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // Atualizar estatísticas do usuário
    async updateUserStats(user) {
        try {
            // Buscar dados atualizados do usuário
            const response = await api.getUser(user.id);
            
            if (response.success) {
                const userData = response.user;
                
                // Atualizar elementos do dashboard
                this.updateElement('dashboard-senacoins', userData.senacoins);
                this.updateElement('dashboard-score', userData.totalScore);
                this.updateElement('dashboard-pens', userData.pensCollected);
                this.updateElement('dashboard-cups', userData.cupsCollected);
                this.updateElement('dashboard-books', userData.booksCollected);

                // Atualizar dados do usuário no authManager
                authManager.updateUserData(userData);
            }
        } catch (error) {
            console.error('Erro ao atualizar estatísticas:', error);
        }
    }

    // Atualizar elemento do DOM
    updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            // Animação de contagem
            this.animateNumber(element, parseInt(element.textContent) || 0, value);
        }
    }

    // Animação de contagem de números
    animateNumber(element, start, end, duration = 1000) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    // Inicializar eventos do dashboard
    initializeEvents() {
        // Evento do botão de gerar dica
        const generateTipButton = document.getElementById('generate-tip-button');
        if (generateTipButton) {
            generateTipButton.addEventListener('click', () => {
                this.generateTip();
            });
        }
    }

    // Gerar dica do Senacão
    async generateTip() {
        const button = document.getElementById('generate-tip-button');
        const buttonText = button.querySelector('.btn-text');
        const loader = button.querySelector('.loader');
        const tipDisplay = document.getElementById('gemini-tip-display');

        try {
            // Mostrar loading
            buttonText.classList.add('hidden');
            loader.classList.remove('hidden');
            button.disabled = true;

            // Simular geração de dica (pode ser integrado com IA posteriormente)
            await this.simulateApiDelay(1500);

            const tips = [
                "🎯 Foque nos itens de maior pontuação primeiro!",
                "⚡ Use os bônus da loja para maximizar sua pontuação!",
                "🕒 Gerencie bem seu tempo - não deixe para o último minuto!",
                "🎮 Pratique os movimentos para ficar mais rápido!",
                "💡 Observe os padrões de aparição dos itens!",
                "🏆 Mantenha a calma mesmo quando o tempo estiver acabando!",
                "🎪 Combine diferentes tipos de itens para bônus extras!",
                "📚 Livros valem mais pontos - priorize eles!",
                "☕ Copos aparecem em grupos - colete todos de uma vez!",
                "✏️ Canetas são rápidas de coletar - use para ganhar tempo!"
            ];

            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            tipDisplay.textContent = randomTip;

            showNotification('Nova dica gerada!', 'success');

        } catch (error) {
            console.error('Erro ao gerar dica:', error);
            showNotification('Erro ao gerar dica', 'error');
        } finally {
            // Esconder loading
            buttonText.classList.remove('hidden');
            loader.classList.add('hidden');
            button.disabled = false;
        }
    }

    // Simular delay da API
    simulateApiDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Atualizar dashboard após ações do jogo
    async refreshAfterGameAction() {
        const user = authManager.getCurrentUser();
        if (user) {
            await this.updateUserStats(user);
        }
    }

    // Mostrar seção do dashboard
    show() {
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection) {
            // Esconder outras seções
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.add('hidden');
                section.classList.remove('active');
            });

            // Mostrar dashboard
            dashboardSection.classList.remove('hidden');
            setTimeout(() => {
                dashboardSection.classList.add('active');
            }, 10);

            // Atualizar título da seção
            const sectionTitle = document.getElementById('section-title');
            if (sectionTitle) {
                sectionTitle.textContent = 'Dashboard';
            }

            // Recarregar dados
            this.loadDashboardData();
        }
    }
}

// Instância global do gerenciador do dashboard
const dashboardManager = new DashboardManager();

