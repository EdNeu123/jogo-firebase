// Módulo da Loja
class ShopManager {
    constructor() {
        this.shopItems = [];
        this.isLoading = false;
    }

    // Inicializar loja
    async initialize() {
        await this.loadShopItems();
        this.initializeEvents();
    }

    // Carregar itens da loja
    async loadShopItems() {
        try {
            this.isLoading = true;
            const response = await api.getShopItems();
            
            if (response.success) {
                this.shopItems = response.items;
                this.renderShopItems();
                await this.updateUserBalance();
            }
        } catch (error) {
            console.error('Erro ao carregar itens da loja:', error);
            showNotification('Erro ao carregar loja', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // Renderizar itens da loja
    renderShopItems() {
        const container = document.getElementById('shop-items-container');
        if (!container) return;

        container.innerHTML = '';

        this.shopItems.forEach(item => {
            const itemElement = this.createShopItemElement(item);
            container.appendChild(itemElement);
        });
    }

    // Criar elemento de item da loja
    createShopItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow';
        
        itemDiv.innerHTML = `
            <div class="flex items-center mb-4">
                <div class="p-3 bg-indigo-100 rounded-full mr-4">
                    <i data-lucide="${item.icon}" class="w-6 h-6 text-indigo-600"></i>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-900">${item.name}</h3>
                    <p class="text-sm text-gray-500">${item.category}</p>
                </div>
            </div>
            <p class="text-gray-600 mb-4">${item.description}</p>
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <i data-lucide="coins" class="w-5 h-5 text-yellow-500 mr-1"></i>
                    <span class="text-lg font-bold text-yellow-600">${item.price}</span>
                </div>
                <button 
                    class="purchase-btn px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    data-item-id="${item.id}"
                    data-item-price="${item.price}"
                >
                    Comprar
                </button>
            </div>
        `;

        // Inicializar ícones Lucide
        lucide.createIcons();

        return itemDiv;
    }

    // Atualizar saldo do usuário
    async updateUserBalance() {
        try {
            const user = authManager.getCurrentUser();
            if (!user) return;

            const response = await api.getUserBalance(user.id);
            
            if (response.success) {
                const balance = response.balance;
                
                // Atualizar display do saldo
                const balanceElement = document.getElementById('shop-senacoins');
                if (balanceElement) {
                    balanceElement.textContent = balance;
                }

                // Atualizar estado dos botões de compra
                this.updatePurchaseButtons(balance);

                // Atualizar dados do usuário
                authManager.updateUserData({ senacoins: balance });
            }
        } catch (error) {
            console.error('Erro ao atualizar saldo:', error);
        }
    }

    // Atualizar estado dos botões de compra
    updatePurchaseButtons(userBalance) {
        const purchaseButtons = document.querySelectorAll('.purchase-btn');
        
        purchaseButtons.forEach(button => {
            const itemPrice = parseInt(button.dataset.itemPrice);
            
            if (userBalance < itemPrice) {
                button.disabled = true;
                button.textContent = 'Sem Senacoins';
            } else {
                button.disabled = false;
                button.textContent = 'Comprar';
            }
        });
    }

    // Inicializar eventos da loja
    initializeEvents() {
        // Delegação de eventos para botões de compra
        const container = document.getElementById('shop-items-container');
        if (container) {
            container.addEventListener('click', async (e) => {
                if (e.target.classList.contains('purchase-btn')) {
                    const itemId = e.target.dataset.itemId;
                    await this.purchaseItem(itemId, e.target);
                }
            });
        }
    }

    // Comprar item
    async purchaseItem(itemId, button) {
        try {
            const user = authManager.getCurrentUser();
            if (!user) {
                showNotification('Usuário não está logado', 'error');
                return;
            }

            // Mostrar loading no botão
            const originalText = button.textContent;
            button.textContent = 'Comprando...';
            button.disabled = true;

            const response = await api.purchaseItem(user.id, itemId);
            
            if (response.success) {
                showNotification(CONFIG.MESSAGES.PURCHASE_SUCCESS, 'success');
                
                // Atualizar dados do usuário
                authManager.updateUserData(response.user);
                
                // Atualizar saldo na interface
                await this.updateUserBalance();
                
                // Atualizar dashboard se estiver visível
                if (dashboardManager) {
                    dashboardManager.refreshAfterGameAction();
                }

                // Aplicar efeito do item (se necessário)
                this.applyItemEffect(itemId);
                
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Erro ao comprar item:', error);
            showNotification(error.message || CONFIG.MESSAGES.PURCHASE_ERROR, 'error');
        } finally {
            // Restaurar botão
            button.textContent = 'Comprar';
            button.disabled = false;
            
            // Atualizar estado dos botões
            const user = authManager.getCurrentUser();
            if (user) {
                this.updatePurchaseButtons(user.senacoins);
            }
        }
    }

    // Aplicar efeito do item comprado
    applyItemEffect(itemId) {
        // Salvar item comprado para uso no jogo
        const purchasedItems = JSON.parse(localStorage.getItem('purchasedItems') || '[]');
        purchasedItems.push({
            itemId,
            purchasedAt: new Date().toISOString(),
            used: false
        });
        localStorage.setItem('purchasedItems', JSON.stringify(purchasedItems));

        // Mostrar notificação sobre como usar o item
        const itemNames = {
            'time-bonus': 'Bônus de Tempo',
            'score-multiplier': 'Multiplicador de Pontos',
            'item-magnet': 'Ímã de Itens',
            'extra-life': 'Vida Extra',
            'hint-system': 'Sistema de Dicas',
            'speed-boost': 'Impulso de Velocidade'
        };

        const itemName = itemNames[itemId] || 'Item';
        showNotification(`${itemName} adicionado ao seu inventário! Use no jogo.`, 'info');
    }

    // Obter itens comprados não utilizados
    getPurchasedItems() {
        const purchasedItems = JSON.parse(localStorage.getItem('purchasedItems') || '[]');
        return purchasedItems.filter(item => !item.used);
    }

    // Marcar item como usado
    markItemAsUsed(itemId) {
        const purchasedItems = JSON.parse(localStorage.getItem('purchasedItems') || '[]');
        const itemIndex = purchasedItems.findIndex(item => item.itemId === itemId && !item.used);
        
        if (itemIndex !== -1) {
            purchasedItems[itemIndex].used = true;
            purchasedItems[itemIndex].usedAt = new Date().toISOString();
            localStorage.setItem('purchasedItems', JSON.stringify(purchasedItems));
            return true;
        }
        
        return false;
    }

    // Mostrar seção da loja
    show() {
        const shopSection = document.getElementById('shop-section');
        if (shopSection) {
            // Esconder outras seções
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.add('hidden');
                section.classList.remove('active');
            });

            // Mostrar loja
            shopSection.classList.remove('hidden');
            setTimeout(() => {
                shopSection.classList.add('active');
            }, 10);

            // Atualizar título da seção
            const sectionTitle = document.getElementById('section-title');
            if (sectionTitle) {
                sectionTitle.textContent = 'Loja de Bônus';
            }

            // Recarregar dados
            this.loadShopItems();
        }
    }
}

// Instância global do gerenciador da loja
const shopManager = new ShopManager();

