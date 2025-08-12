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

    // Carregar dados dos relatórios
    async loadReportsData() {
        try {
            this.isLoading = true;
            const response = await api.getUserRanking(50);
            console.log("response", response)
            
            if (response.success) {
                this.currentData = response.ranking;
                this.filteredData = [...this.currentData];
                this.renderReportsTable();
            }
        } catch (error) {
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
                    Nenhum dado encontrado
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }

        this.filteredData.forEach((user, index) => {
            const row = this.createTableRow(user, index);
            tableBody.appendChild(row);
        });
    }

    // Criar linha da tabela
    createTableRow(user, index) {
        const row = document.createElement('tr');
        row.className = 'table-row hover:bg-gray-50';

        const createdDate = new Date(user.createdAt).toLocaleDateString('pt-BR');
        console.log("user total score:", user.totalScore)

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <span class="text-sm font-medium text-indigo-600">${user.position}</span>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-900">${user.fullname}</div>
                        <div class="text-sm text-gray-500">ID: ${user.id.substring(0, 8)}...</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <i data-lucide="star" class="w-4 h-4 text-yellow-500 mr-1"></i>
                    <span class="text-sm font-bold text-gray-900">${user.totalScore ? user.totalScore.toString() : 0}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <i data-lucide="coins" class="w-4 h-4 text-yellow-500 mr-1"></i>
                    <span class="text-sm font-bold text-yellow-600">${user.senacoins.toString()}</span>
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
        // Evento de busca
        const searchInput = document.getElementById('table-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterData(e.target.value);
            });
        }
    }

    // Filtrar dados
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
        
        // Recriar ícones Lucide após renderizar
        lucide.createIcons();
    }

    // Buscar usuários na API
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
                    position: index + 1
                }));
                this.renderReportsTable();
            }
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            // Fallback para busca local
            this.filterData(query);
        } finally {
            this.isLoading = false;
        }
    }

    // Obter estatísticas gerais
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

    // Exibir estatísticas gerais
    displayGeneralStats(stats) {
        // Implementar exibição de estatísticas gerais se necessário
        console.log('Estatísticas gerais:', stats);
    }

    // Obter relatório detalhado do usuário atual
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

    // Exibir relatório do usuário
    displayUserReport(report) {
        // Implementar exibição do relatório detalhado se necessário
        console.log('Relatório do usuário:', report);
    }

    // Exportar dados (funcionalidade futura)
    exportData(format = 'csv') {
        // Implementar exportação de dados
        console.log(`Exportando dados em formato ${format}`);
        showNotification('Funcionalidade de exportação em desenvolvimento', 'info');
    }

    // Atualizar dados
    async refresh() {
        await this.loadReportsData();
        showNotification('Relatórios atualizados', 'success');
    }

    // Mostrar seção de relatórios
    show() {
        const reportsSection = document.getElementById('reports-section');
        if (reportsSection) {
            // Esconder outras seções
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.add('hidden');
                section.classList.remove('active');
            });

            // Mostrar relatórios
            reportsSection.classList.remove('hidden');
            setTimeout(() => {
                reportsSection.classList.add('active');
            }, 10);

            // Atualizar título da seção
            const sectionTitle = document.getElementById('section-title');
            if (sectionTitle) {
                sectionTitle.textContent = 'Relatórios';
            }

            // Recarregar dados
            this.loadReportsData();

            // Recriar ícones Lucide
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }
}

// Instância global do gerenciador de relatórios
const reportsManager = new ReportsManager();

