// Módulo de autenticação
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.loadUserFromStorage();
    }

    // Carregar dados do usuário do localStorage
    loadUserFromStorage() {
        const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
            }
        }
    }

    // Salvar dados do usuário no localStorage
    saveUserToStorage(userData) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        this.currentUser = userData;
    }

    // Fazer login
    async login(formData) {
        try {
            const response = await api.login(formData);
            
            if (response.success) {
                this.saveUserToStorage(response.user);
                return response;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    // Fazer logout
    logout() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.GAME_SESSION);
        this.currentUser = null;
        
        // Redirecionar para tela de login
        this.showLoginScreen();
    }

    // Verificar se o usuário está logado
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Obter dados do usuário atual
    getCurrentUser() {
        return this.currentUser;
    }

    // Atualizar dados do usuário
    async updateUser(userData) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuário não está logado');
            }

            const response = await api.updateUser(this.currentUser.id, userData);
            
            if (response.success) {
                this.saveUserToStorage(response.user);
                return response;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }
    }

    // Atualizar dados do usuário localmente (após ações do jogo)
    updateUserData(newData) {
        if (this.currentUser) {
            this.currentUser = { ...this.currentUser, ...newData };
            this.saveUserToStorage(this.currentUser);
        }
    }

    // Mostrar tela de login
    showLoginScreen() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('main-interface').classList.add('hidden');
    }

    // Mostrar interface principal
    showMainInterface() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-interface').classList.remove('hidden');
        
        // Atualizar display do usuário
        this.updateUserDisplay();
    }

    // Atualizar display do usuário na interface
    updateUserDisplay() {
        if (this.currentUser) {
            const userDisplay = document.getElementById('user-display');
            if (userDisplay) {
                userDisplay.textContent = this.currentUser.fullname;
            }
        }
    }

    // Inicializar eventos de autenticação
    initializeAuthEvents() {
        // Evento de submit do formulário de login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin(e);
            });
        }

        // Evento de logout
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    // Manipular login
    async handleLogin(event) {
        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const buttonText = submitButton.querySelector('.btn-text');
        const loader = submitButton.querySelector('.loader');

        try {
            // Mostrar loading
            buttonText.classList.add('hidden');
            loader.classList.remove('hidden');
            submitButton.disabled = true;

            // Coletar dados do formulário
            const formData = new FormData(form);
            const userData = {
                fullname: formData.get('fullname'),
                email: formData.get('email'),
                phone: formData.get('phone')
            };

            // Fazer login
            const response = await this.login(userData);

            // Mostrar mensagem de sucesso
            showNotification(CONFIG.MESSAGES.LOGIN_SUCCESS, 'success');

            // Mostrar interface principal
            this.showMainInterface();

        } catch (error) {
            console.error('Erro no login:', error);
            showNotification(error.message || CONFIG.MESSAGES.LOGIN_ERROR, 'error');
        } finally {
            // Esconder loading
            buttonText.classList.remove('hidden');
            loader.classList.add('hidden');
            submitButton.disabled = false;
        }
    }
}

// Instância global do gerenciador de autenticação
const authManager = new AuthManager();

