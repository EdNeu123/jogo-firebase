// Módulo de Relatórios
class ReportsManager {
    constructor() {
        this.currentData = [];
        this.filteredData = [];
        this.isLoading = false;
    }

    // Inicializar relatórios
    async initialize() {
        await this.loadReportsData();
        this.initializeEvents();
    }

    // Carregar dados dos relatórios (agora com foco no ranking Top 10)
    async loadReportsData() {
        try {
            this.isLoading = true;
            // CORREÇÃO: Busca o ranking com limite de 10 jogadores
            const response = await api.getUserRanking(10); 
            
            if (response.success) {
                this.currentData = response.ranking;
                this.filteredData = [...this.currentData];
                this.renderReportsTable();
            }
        } catch (error)
        {
            console.error('Erro ao carregar relatórios:', error);
            showNotification('Erro ao carregar relatórios', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // Renderizar tabela de relatórios
    renderReportsTable() {
        const tableBody = document.getElementById('reports-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (this.filteredData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    Nenhum jogador encontrado
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }

        this.filteredData.forEach((user) => {
            const row = this.createTableRow(user);
            tableBody.appendChild(row);
        });

        // Recria os ícones Lucide após a tabela ser renderizada
        lucide.createIcons();
    }

    // Criar linha da tabela (com o novo visual do ranking)
    createTableRow(user) {
        const row = document.createElement('tr');
        row.className = 'table-row hover:bg-gray-50';

        const createdDate = new Date(user.createdAt).toLocaleDateString('pt-BR');

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3 font-bold text-indigo-600 text-lg">
                        ${user.position}º
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-900">${user.fullname}</div>
                        <div class="text-sm text-gray-500">${User.decodeEmail(user.id)}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center text-sm font-semibold text-gray-800">
                    <i data-lucide="star" class="w-4 h-4 text-yellow-500 mr-2"></i>
                    ${user.totalScore ? user.totalScore.toLocaleString('pt-BR') : 0}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center text-sm font-semibold text-yellow-700">
                    <i data-lucide="coins" class="w-4 h-4 text-yellow-500 mr-2"></i>
                    ${user.senacoins.toLocaleString('pt-BR')}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${createdDate}
            </td>
        `;

        return row;
    }

    // Inicializar eventos dos relatórios
    initializeEvents() {
        const searchInput = document.getElementById('table-search');
        if (searchInput) {
            // A busca agora filtra a lista local do Top 10
            searchInput.addEventListener('input', (e) => {
                this.filterData(e.target.value);
            });
        }
    }

    // Filtrar dados (busca local no ranking já carregado)
    filterData(query) {
        if (!query.trim()) {
            this.filteredData = [...this.currentData];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredData = this.currentData.filter(user =>
                user.fullname.toLowerCase().includes(searchTerm)
            );
        }
        this.renderReportsTable();
    }

    // --- FUNCIONALIDADES RESTAURADAS ---

    // Buscar usuários na API (mantido para uso futuro)
    async searchUsers(query) {
        try {
            if (query.length < 2) {
                this.filteredData = [...this.currentData];
                this.renderReportsTable();
                return;
            }
            this.isLoading = true;
            const response = await api.searchUsers(query);
            if (response.success) {
                this.filteredData = response.results.map((user, index) => ({
                    ...user,
                    position: index + 1 // A posição aqui seria baseada na busca
                }));
                this.renderReportsTable();
            }
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            this.filterData(query); // Usa o filtro local como fallback
        } finally {
            this.isLoading = false;
        }
    }

    // Obter estatísticas gerais (mantido para uso futuro)
    async loadGeneralStats() {
        try {
            const response = await api.getGeneralStats();
            if (response.success) {
                this.displayGeneralStats(response.stats);
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }

    // Exibir estatísticas gerais (mantido para uso futuro)
    displayGeneralStats(stats) {
        console.log('Estatísticas gerais:', stats);
    }

    // Obter relatório detalhado do usuário atual (mantido para uso futuro)
    async loadUserReport() {
        try {
            const user = authManager.getCurrentUser();
            if (!user) return;
            const response = await api.getUserReport(user.id);
            if (response.success) {
                this.displayUserReport(response.report);
            }
        } catch (error) {
            console.error('Erro ao carregar relatório do usuário:', error);
        }
    }

    // Exibir relatório do usuário (mantido para uso futuro)
    displayUserReport(report) {
        console.log('Relatório do usuário:', report);
    }

    // Exportar dados (mantido para uso futuro)
    exportData(format = 'csv') {
        console.log(`Exportando dados em formato ${format}`);
        showNotification('Funcionalidade de exportação em desenvolvimento', 'info');
    }

    // Atualizar dados
    async refresh() {
        await this.loadReportsData();
        showNotification('Ranking atualizado', 'success');
    }

    // Mostrar seção de relatórios
    show() {
        const reportsSection = document.getElementById('reports-section');
        if (reportsSection) {
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.add('hidden');
                section.classList.remove('active');
            });
            reportsSection.classList.remove('hidden');
            setTimeout(() => reportsSection.classList.add('active'), 10);
            
            const sectionTitle = document.getElementById('section-title');
            if (sectionTitle) {
                // CORREÇÃO: Atualiza o título da seção
                sectionTitle.textContent = 'Ranking de Jogadores'; 
            }

            // Recarregar dados ao exibir a seção
            this.loadReportsData();
        }
    }
}

// Objeto auxiliar para decodificar e-mail no frontend
const User = {
    decodeEmail(encodedEmail) {
        if (!encodedEmail) return '';
        return encodedEmail.replace(/,/g, '.').replace(/_at_/g, '@');
    }
};

// Instância global do gerenciador de relatórios
const reportsManager = new ReportsManager();