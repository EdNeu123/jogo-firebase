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
    }

    // Inicializar jogo
    initialize() {
        this.gameArea = document.getElementById('game-area');
        this.initializeEvents();
        this.loadAudioSettings();
    }

    // Carregar configurações de áudio
    loadAudioSettings() {
        const audioSettings = localStorage.getItem(CONFIG.STORAGE_KEYS.AUDIO_SETTINGS);
        if (audioSettings) {
            const settings = JSON.parse(audioSettings);
            this.audioEnabled = settings.enabled;
        }
    }

    // Salvar configurações de áudio
    saveAudioSettings() {
        const settings = { enabled: this.audioEnabled };
        localStorage.setItem(CONFIG.STORAGE_KEYS.AUDIO_SETTINGS, JSON.stringify(settings));
    }

    // Inicializar eventos do jogo
    initializeEvents() {
        // Botão de iniciar jogo
        const startButton = document.getElementById('overlay-action-button');
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.handleOverlayAction();
            });
        }

        // Botão de ir para loja
        const shopButton = document.getElementById('overlay-shop-button');
        if (shopButton) {
            shopButton.addEventListener('click', () => {
                if (shopManager) {
                    shopManager.show();
                }
            });
        }

        // Botão de pausa
        const pauseButton = document.getElementById('pause-button');
        if (pauseButton) {
            pauseButton.addEventListener('click', () => {
                this.togglePause();
            });
        }

        // Botões do menu de pausa
        const resumeButton = document.getElementById('resume-button');
        if (resumeButton) {
            resumeButton.addEventListener('click', () => {
                this.resumeGame();
            });
        }

        const homeButton = document.getElementById('home-button');
        if (homeButton) {
            homeButton.addEventListener('click', () => {
                this.goHome();
            });
        }

        const toggleAudioButton = document.getElementById('toggle-audio-button');
        if (toggleAudioButton) {
            toggleAudioButton.addEventListener('click', () => {
                this.toggleAudio();
            });
        }

        const exitGameButton = document.getElementById('exit-game-button');
        if (exitGameButton) {
            exitGameButton.addEventListener('click', () => {
                this.exitGame();
            });
        }

        // Cliques na área do jogo
        if (this.gameArea) {
            this.gameArea.addEventListener('click', (e) => {
                this.handleGameAreaClick(e);
            });
        }
    }

    // Manipular ação do overlay
    async handleOverlayAction() {
        const overlay = document.getElementById('game-overlay');
        const actionButton = document.getElementById('overlay-action-button');
        
        if (!overlay || !actionButton) return;

        const buttonText = actionButton.textContent.trim();

        if (buttonText === 'Iniciar Jogo' || buttonText === 'Jogar Novamente') {
            await this.startNewGame();
        } else if (buttonText === 'Próxima Fase') {
            await this.startNextPhase();
        }
    }

    // Iniciar novo jogo
    async startNewGame(phase = 1) {
        try {
            const user = authManager.getCurrentUser();
            if (!user) {
                showNotification('Usuário não está logado', 'error');
                return;
            }

            // Iniciar sessão no backend
            const response = await api.startGame(user.id, phase);
            
            if (response.success) {
                this.currentSession = response.session;
                this.setupGameSession();
                this.hideOverlay();
                this.startGameLoop();
                
                showNotification(CONFIG.MESSAGES.GAME_START, 'success');
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Erro ao iniciar jogo:', error);
            showNotification('Erro ao iniciar jogo', 'error');
        }
    }

    // Configurar sessão do jogo
    setupGameSession() {
        if (!this.currentSession) return;

        // Atualizar interface
        document.getElementById('game-phase').textContent = this.currentSession.phase;
        document.getElementById('game-score').textContent = this.currentSession.score;
        document.getElementById('game-target-score').textContent = this.currentSession.targetScore;
        document.getElementById('game-timer').textContent = this.currentSession.timeRemaining;

        // Carregar itens comprados
        this.purchasedItems = shopManager ? shopManager.getPurchasedItems() : [];

        this.isGameActive = true;
        this.isPaused = false;
    }

    // Iniciar loop do jogo
    startGameLoop() {
        if (!this.currentSession) return;

        // Timer do jogo
        this.gameTimer = setInterval(() => {
            if (!this.isPaused && this.isGameActive) {
                this.currentSession.timeRemaining--;
                document.getElementById('game-timer').textContent = this.currentSession.timeRemaining;

                if (this.currentSession.timeRemaining <= 0) {
                    this.endGame();
                }
            }
        }, 1000);

        // Gerar itens
        this.generateGameItems();
    }

    // Gerar itens do jogo
    generateGameItems() {
        if (!this.isGameActive || this.isPaused) return;

        const itemTypes = ['pen', 'cup', 'book'];
        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        
        this.createGameItem(itemType);

        // Próximo item
        const delay = Math.random() * 2000 + 1000; // 1-3 segundos
        setTimeout(() => {
            this.generateGameItems();
        }, delay);
    }

    // Criar item do jogo
    createGameItem(type) {
        if (!this.gameArea) return;

        const item = document.createElement('div');
        item.className = 'game-item';
        item.dataset.type = type;

        // Definir aparência do item
        const itemConfig = {
            pen: { emoji: '✏️', color: 'text-green-600' },
            cup: { emoji: '☕', color: 'text-blue-600' },
            book: { emoji: '📚', color: 'text-red-600' }
        };

        const config = itemConfig[type];
        item.innerHTML = `<span class="text-4xl ${config.color}">${config.emoji}</span>`;

        // Posição aleatória
        const areaRect = this.gameArea.getBoundingClientRect();
        const maxX = areaRect.width - 60;
        const maxY = areaRect.height - 60;
        
        item.style.left = Math.random() * maxX + 'px';
        item.style.top = Math.random() * maxY + 'px';

        this.gameArea.appendChild(item);
        this.gameItems.push(item);

        // Remover item após um tempo
        setTimeout(() => {
            if (item.parentNode) {
                item.parentNode.removeChild(item);
                this.gameItems = this.gameItems.filter(i => i !== item);
            }
        }, 5000);
    }

    // Manipular clique na área do jogo
    async handleGameAreaClick(event) {
        if (!this.isGameActive || this.isPaused) return;

        const clickedItem = event.target.closest('.game-item');
        if (!clickedItem) return;

        const itemType = clickedItem.dataset.type;
        const points = CONFIG.GAME.POINTS_PER_ITEM[itemType] || 10;

        try {
            // Atualizar pontuação no backend
            const response = await api.updateScore(this.currentSession.id, points, itemType);
            
            if (response.success) {
                this.currentSession = response.session;
                
                // Atualizar interface
                document.getElementById('game-score').textContent = this.currentSession.score;
                
                // Efeito visual
                this.showPointsFeedback(event.clientX, event.clientY, points);
                clickedItem.classList.add('clicked');
                
                // Remover item
                setTimeout(() => {
                    if (clickedItem.parentNode) {
                        clickedItem.parentNode.removeChild(clickedItem);
                        this.gameItems = this.gameItems.filter(i => i !== clickedItem);
                    }
                }, 300);

                // Verificar se atingiu a meta
                if (this.currentSession.score >= this.currentSession.targetScore) {
                    this.endGame(true);
                }

                // Som de coleta (se habilitado)
                if (this.audioEnabled) {
                    this.playCollectSound();
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar pontuação:', error);
        }
    }

    // Mostrar feedback de pontos
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
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 1000);
    }

    // Finalizar jogo
    async endGame(victory = false) {
        try {
            this.isGameActive = false;
            
            if (this.gameTimer) {
                clearInterval(this.gameTimer);
                this.gameTimer = null;
            }

            // Limpar itens do jogo
            this.clearGameItems();

            if (this.currentSession) {
                // Finalizar sessão no backend
                const response = await api.endGame(this.currentSession.id);
                
                if (response.success) {
                    // Atualizar dados do usuário
                    if (response.user) {
                        authManager.updateUserData(response.user);
                    }

                    // Mostrar resultado
                    this.showGameResult(victory);

                    // Atualizar dashboard
                    if (dashboardManager) {
                        dashboardManager.refreshAfterGameAction();
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao finalizar jogo:', error);
        }
    }

    // Mostrar resultado do jogo
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

    // Limpar itens do jogo
    clearGameItems() {
        this.gameItems.forEach(item => {
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
        });
        this.gameItems = [];
    }

    // Pausar/despausar jogo
    togglePause() {
        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    // Pausar jogo
    pauseGame() {
        this.isPaused = true;
        document.getElementById('pause-menu').classList.remove('hidden');
        document.getElementById('pause-menu').classList.add('flex');
    }

    // Retomar jogo
    resumeGame() {
        this.isPaused = false;
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('pause-menu').classList.remove('flex');
    }

    // Ir para home
    goHome() {
        this.exitGame();
        if (dashboardManager) {
            dashboardManager.show();
        }
    }

    // Alternar áudio
    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        this.saveAudioSettings();
        
        const iconContainer = document.getElementById('audio-icon-container');
        if (iconContainer) {
            iconContainer.innerHTML = this.audioEnabled ? 
                '<i data-lucide="volume-2" class="w-12 h-12"></i>' : 
                '<i data-lucide="volume-x" class="w-12 h-12"></i>';
            lucide.createIcons();
        }

        showNotification(`Áudio ${this.audioEnabled ? 'ativado' : 'desativado'}`, 'info');
    }

    // Sair do jogo
    exitGame() {
        this.isGameActive = false;
        this.isPaused = false;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }

        this.clearGameItems();
        this.currentSession = null;
        
        // Mostrar tela inicial
        this.showInitialScreen();
    }

    // Mostrar tela inicial do jogo
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

    // Mostrar overlay
    showOverlay() {
        document.getElementById('game-overlay').style.display = 'flex';
    }

    // Esconder overlay
    hideOverlay() {
        document.getElementById('game-overlay').style.display = 'none';
    }

    // Tocar som de coleta
    playCollectSound() {
        // Implementar som usando Tone.js ou Web Audio API
        if (typeof Tone !== 'undefined') {
            const synth = new Tone.Synth().toDestination();
            synth.triggerAttackRelease('C5', '8n');
        }
    }

    // Mostrar seção do jogo
    show() {
        const gameSection = document.getElementById('game-section');
        if (gameSection) {
            // Esconder outras seções
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.add('hidden');
                section.classList.remove('active');
            });

            // Mostrar jogo
            gameSection.classList.remove('hidden');
            setTimeout(() => {
                gameSection.classList.add('active');
            }, 10);

            // Atualizar título da seção
            const sectionTitle = document.getElementById('section-title');
            if (sectionTitle) {
                sectionTitle.textContent = 'Jogo Interativo';
            }

            // Mostrar tela inicial se não há jogo ativo
            if (!this.isGameActive) {
                this.showInitialScreen();
            }
        }
    }
}

// Instância global do gerenciador do jogo
const gameManager = new GameManager();

