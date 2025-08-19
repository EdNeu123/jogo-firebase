// Módulo do Jogo
class GameManager {
    constructor() {
        this.currentSession = null;
        this.gameTimer = null;
        this.gameItems = [];
        this.isGameActive = false;
        this.isPaused = false;
        this.gameArea = null;
        this.audioEnabled = true;
        this.purchasedItems = [];
        this.isScoreMultiplierActive = false; // Flag para bônus de pontos
    }

    // Inicializar jogo
    initialize() {
        this.gameArea = document.getElementById('game-area');
        this.initializeEvents();
        this.loadAudioSettings(); // Função original restaurada
    }

    // Função original restaurada
    loadAudioSettings() {
        const audioSettings = localStorage.getItem(CONFIG.STORAGE_KEYS.AUDIO_SETTINGS);
        if (audioSettings) {
            const settings = JSON.parse(audioSettings);
            this.audioEnabled = settings.enabled;
        }
    }

    // Função original restaurada (embora sem botão, a lógica pode ser útil no futuro)
    saveAudioSettings() {
        const settings = { enabled: this.audioEnabled };
        localStorage.setItem(CONFIG.STORAGE_KEYS.AUDIO_SETTINGS, JSON.stringify(settings));
    }

    // Inicializar eventos do jogo
    initializeEvents() {
        const startButton = document.getElementById('overlay-action-button');
        if (startButton) startButton.addEventListener('click', () => this.handleOverlayAction());

        const shopButton = document.getElementById('overlay-shop-button');
        if (shopButton) shopButton.addEventListener('click', () => app.showSection('shop'));

        const pauseButton = document.getElementById('pause-button');
        if (pauseButton) pauseButton.addEventListener('click', () => this.togglePause());

        const resumeButton = document.getElementById('resume-button');
        if (resumeButton) resumeButton.addEventListener('click', () => this.resumeGame());

        const homeButton = document.getElementById('home-button');
        if (homeButton) homeButton.addEventListener('click', () => this.goHome());
        
        const exitGameButton = document.getElementById('exit-game-button');
        if (exitGameButton) exitGameButton.addEventListener('click', () => this.exitGame());

        if (this.gameArea) this.gameArea.addEventListener('click', (e) => this.handleGameAreaClick(e));

        // ADIÇÃO: Evento de clique para o inventário
        const inventoryBar = document.getElementById('inventory-bar');
        if (inventoryBar) {
            inventoryBar.addEventListener('click', (e) => {
                const itemElement = e.target.closest('.inventory-item');
                if (itemElement && !itemElement.disabled) {
                    const itemId = itemElement.dataset.itemId;
                    this.useItem(itemId, itemElement);
                }
            });
        }
    }

    // ADIÇÃO: Função para renderizar o inventário
    renderInventory() {
        const inventoryBar = document.getElementById('inventory-bar');
        const emptyMessage = document.getElementById('empty-inventory-message');
        if (!inventoryBar || !emptyMessage) return;

        inventoryBar.innerHTML = ''; // Limpa antes de renderizar
        this.purchasedItems = shopManager.getPurchasedItems();

        if (this.purchasedItems.length === 0) {
            inventoryBar.appendChild(emptyMessage);
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
            this.purchasedItems.forEach(itemData => {
                const item = shopManager.shopItems.find(shopItem => shopItem.id === itemData.itemId);
                if (item) {
                    const itemElement = document.createElement('button');
                    itemElement.className = 'inventory-item p-2 bg-white rounded-lg shadow hover:bg-indigo-100 transition cursor-pointer';
                    itemElement.dataset.itemId = item.id;
                    itemElement.title = `${item.name}\n${item.description}`;
                    // Adicionado pointer-events-none ao ícone para garantir que o clique seja no botão
                    itemElement.innerHTML = `<i data-lucide="${item.icon}" class="w-8 h-8 text-indigo-600 pointer-events-none"></i>`;
                    inventoryBar.appendChild(itemElement);
                }
            });
            lucide.createIcons();
        }
    }

    // ADIÇÃO: Função para usar um item
    useItem(itemId, itemElement) {
        if (!this.isGameActive || this.isPaused) {
            showNotification('Você só pode usar itens durante o jogo ativo!', 'warning');
            return;
        }

        let itemUsed = false;
        switch (itemId) {
            case 'time-bonus':
                this.currentSession.timeRemaining += 30;
                document.getElementById('game-timer').textContent = this.currentSession.timeRemaining;
                showNotification('+30 segundos!', 'success');
                itemUsed = true;
                break;

            case 'score-multiplier':
                if (this.isScoreMultiplierActive) {
                    showNotification('Multiplicador de pontos já está ativo!', 'info');
                    return;
                }
                this.isScoreMultiplierActive = true;
                showNotification('Pontos em dobro por 60 segundos!', 'success');
                itemElement.classList.add('opacity-50', 'ring-2', 'ring-indigo-500'); // Feedback visual
                setTimeout(() => {
                    this.isScoreMultiplierActive = false;
                    showNotification('Multiplicador de pontos acabou.', 'info');
                    if(itemElement) itemElement.classList.remove('opacity-50', 'ring-2', 'ring-indigo-500');
                }, 60000); // 60 segundos
                itemUsed = true;
                break;
            
            default:
                showNotification('Este item ainda não tem um efeito implementado.', 'info');
                return;
        }

        if (itemUsed) {
            shopManager.markItemAsUsed(itemId);
            itemElement.classList.add('used', 'opacity-25', 'cursor-not-allowed');
            itemElement.disabled = true;
        }
    }

    async handleOverlayAction() {
        const actionButton = document.getElementById('overlay-action-button');
        if (!actionButton) return;
        const buttonText = actionButton.textContent.trim();
        if (buttonText === 'Iniciar Jogo' || buttonText === 'Jogar Novamente') {
            await this.startNewGame();
        } else if (buttonText === 'Próxima Fase') {
            await this.startNextPhase();
        }
    }
    
    async startNewGame(phase = 1) {
        try {
            const user = authManager.getCurrentUser();
            if (!user) {
                showNotification('Usuário não está logado', 'error');
                return;
            }
            const response = await api.startGame(user.id, phase);
            if (response.success) {
                this.currentSession = response.session;
                this.setupGameSession();
                this.hideOverlay();
                this.startGameLoop();
                this.renderInventory(); // MODIFICAÇÃO: Renderiza o inventário
                showNotification(CONFIG.MESSAGES.GAME_START, 'success');
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Erro ao iniciar jogo:', error);
            showNotification('Erro ao iniciar jogo', 'error');
        }
    }
    
    async startNextPhase() {
        if (this.currentSession && this.currentSession.phase) {
            const nextPhase = this.currentSession.phase + 1;
            await this.startNewGame(nextPhase);
        } else {
            console.error('Não foi possível determinar a próxima fase.');
            showNotification('Erro ao iniciar a próxima fase', 'error');
        }
    }
    
    setupGameSession() {
        if (!this.currentSession) return;
        document.getElementById('game-phase').textContent = this.currentSession.phase;
        document.getElementById('game-score').textContent = this.currentSession.score;
        document.getElementById('game-target-score').textContent = this.currentSession.targetScore;
        document.getElementById('game-timer').textContent = this.currentSession.timeRemaining;
        this.purchasedItems = shopManager ? shopManager.getPurchasedItems() : [];
        this.isGameActive = true;
        this.isPaused = false;
        this.isScoreMultiplierActive = false; // Reseta bônus
    }

    startGameLoop() {
        if (!this.currentSession) return;
        if(this.gameTimer) clearInterval(this.gameTimer);
        this.gameTimer = setInterval(() => {
            if (!this.isPaused && this.isGameActive) {
                this.currentSession.timeRemaining--;
                document.getElementById('game-timer').textContent = this.currentSession.timeRemaining;
                if (this.currentSession.timeRemaining <= 0) {
                    this.endGame(false);
                }
            }
        }, 1000);
        this.generateGameItems();
    }

    generateGameItems() {
        if (!this.isGameActive || this.isPaused) return;
        const itemTypes = ['pen', 'cup', 'book'];
        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        this.createGameItem(itemType);
        const delay = Math.random() * 2000 + 1000;
        setTimeout(() => this.generateGameItems(), delay);
    }
    
    createGameItem(type) {
        if (!this.gameArea) return;
        const item = document.createElement('div');
        item.className = 'game-item';
        item.dataset.type = type;
        const itemConfig = { pen: { emoji: '✏️', color: 'text-green-600' }, cup: { emoji: '☕', color: 'text-blue-600' }, book: { emoji: '📚', color: 'text-red-600' } };
        const config = itemConfig[type];
        item.innerHTML = `<span class="text-4xl ${config.color}">${config.emoji}</span>`;
        const areaRect = this.gameArea.getBoundingClientRect();
        const maxX = areaRect.width - 60;
        const maxY = areaRect.height - 60;
        item.style.left = Math.random() * maxX + 'px';
        item.style.top = Math.random() * maxY + 'px';
        this.gameArea.appendChild(item);
        this.gameItems.push(item);
        setTimeout(() => {
            if (item.parentNode) {
                item.parentNode.removeChild(item);
                this.gameItems = this.gameItems.filter(i => i !== item);
            }
        }, 5000);
    }

    async handleGameAreaClick(event) {
        if (!this.isGameActive || this.isPaused) return;
        const clickedItem = event.target.closest('.game-item');
        if (!clickedItem) return;
        
        const itemType = clickedItem.dataset.type;
        let points = CONFIG.GAME.POINTS_PER_ITEM[itemType] || 10;

        // MODIFICAÇÃO: Aplica bônus de pontos
        if (this.isScoreMultiplierActive) {
            points *= 2;
        }

        try {
            const response = await api.updateScore(this.currentSession.id, points, itemType);
            if (response.success) {
                this.currentSession = response.session;
                document.getElementById('game-score').textContent = this.currentSession.score;
                this.showPointsFeedback(event.clientX, event.clientY, points);
                clickedItem.classList.add('clicked');
                setTimeout(() => {
                    if (clickedItem.parentNode) clickedItem.parentNode.removeChild(clickedItem);
                }, 300);
                if (this.currentSession.score >= this.currentSession.targetScore) {
                    this.endGame(true);
                }
                if (this.audioEnabled) this.playCollectSound();
            }
        } catch (error) {
            console.error('Erro ao atualizar pontuação:', error);
        }
    }
    
    showPointsFeedback(x, y, points) {
        const feedback = document.createElement('div');
        feedback.className = 'points-feedback';
        feedback.textContent = `+${points}`;
        feedback.style.left = x + 'px';
        feedback.style.top = y + 'px';
        feedback.style.position = 'fixed';
        feedback.style.zIndex = '1000';
        document.body.appendChild(feedback);
        setTimeout(() => {
            if (feedback.parentNode) feedback.parentNode.removeChild(feedback);
        }, 1000);
    }
    
    async endGame(victory = false) {
        if (!this.isGameActive) return;
        this.isGameActive = false;
        if (this.gameTimer) clearInterval(this.gameTimer);
        this.gameTimer = null;
        this.clearGameItems();
        if (this.currentSession) {
            try {
                const response = await api.endGame(this.currentSession.id);
                if (response.success) {
                    if (response.user) authManager.updateUserData(response.user);
                    this.showGameResult(victory);
                    if (dashboardManager) dashboardManager.refreshAfterGameAction();
                }
            } catch (error) {
                console.error('Erro ao finalizar jogo:', error);
            }
        }
    }
    
    showGameResult(victory) {
        const overlay = document.getElementById('game-overlay');
        const title = document.getElementById('overlay-title');
        const message = document.getElementById('overlay-message');
        const actionButton = document.getElementById('overlay-action-button');
        const shopButton = document.getElementById('overlay-shop-button');
        if (victory) {
            overlay.className = 'absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg overlay-victory';
            title.textContent = 'Parabéns!';
            message.textContent = `Você completou a fase ${this.currentSession.phase} com ${this.currentSession.score} pontos!`;
            actionButton.textContent = 'Próxima Fase';
            shopButton.classList.add('hidden');
        } else {
            overlay.className = 'absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg overlay-defeat';
            title.textContent = 'Que pena!';
            message.textContent = `Você fez ${this.currentSession.score} pontos. Tente novamente!`;
            actionButton.textContent = 'Jogar Novamente';
            shopButton.classList.remove('hidden');
        }
        this.showOverlay();
    }
    
    clearGameItems() {
        this.gameItems.forEach(item => {
            if (item.parentNode) item.parentNode.removeChild(item);
        });
        this.gameItems = [];
    }

    togglePause() {
        if (!this.isGameActive) return;
        this.isPaused = !this.isPaused;
        const pauseMenu = document.getElementById('pause-menu');
        if (this.isPaused) {
            pauseMenu.classList.remove('hidden');
            pauseMenu.classList.add('flex');
        } else {
            pauseMenu.classList.add('hidden');
            pauseMenu.classList.remove('flex');
        }
    }

    pauseGame() {
        this.isPaused = true;
        document.getElementById('pause-menu').classList.remove('hidden');
        document.getElementById('pause-menu').classList.add('flex');
    }

    resumeGame() {
        this.isPaused = false;
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('pause-menu').classList.remove('flex');
    }

    goHome() {
        if (!this.isPaused) this.togglePause();
        document.getElementById('pause-menu').classList.add('hidden');
        app.showSection('dashboard');
    }

    async exitGame() {
        if (!this.isGameActive) {
            app.showSection('dashboard');
            return;
        }
        if (this.currentSession) {
            try {
                await api.endGame(this.currentSession.id);
            } catch (error) {
                console.error("Erro ao finalizar o jogo ao sair:", error);
            }
        }
        this.isGameActive = false;
        this.isPaused = false;
        if (this.gameTimer) clearInterval(this.gameTimer);
        this.gameTimer = null;
        this.clearGameItems();
        this.currentSession = null;
        document.getElementById('pause-menu').classList.add('hidden');
        if (dashboardManager) await dashboardManager.refreshAfterGameAction();
        app.showSection('dashboard');
    }
    
    showInitialScreen() {
        const overlay = document.getElementById('game-overlay');
        const title = document.getElementById('overlay-title');
        const message = document.getElementById('overlay-message');
        const actionButton = document.getElementById('overlay-action-button');
        const shopButton = document.getElementById('overlay-shop-button');
        overlay.className = 'absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg';
        title.textContent = 'Jogo Interativo';
        message.textContent = 'Colete itens para ganhar pontos e senacoins!';
        actionButton.textContent = 'Iniciar Jogo';
        shopButton.classList.add('hidden');
        this.showOverlay();
    }

    showOverlay() { document.getElementById('game-overlay').style.display = 'flex'; }
    hideOverlay() { document.getElementById('game-overlay').style.display = 'none'; }

    playCollectSound() {
        if (typeof Tone !== 'undefined') {
            const synth = new Tone.Synth().toDestination();
            synth.triggerAttackRelease('C5', '8n');
        }
    }
    
    show() {
        const gameSection = document.getElementById('game-section');
        if (gameSection) {
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.add('hidden');
                section.classList.remove('active');
            });
            gameSection.classList.remove('hidden');
            setTimeout(() => gameSection.classList.add('active'), 10);
            
            const sectionTitle = document.getElementById('section-title');
            if (sectionTitle) sectionTitle.textContent = 'Jogo Interativo';

            if (!this.isGameActive) {
                this.showInitialScreen();
            } else {
                 this.renderInventory();
            }
        }
    }
}

const gameManager = new GameManager();