# Jogo Firebase - Dashboard de Ensino Interativo

Este projeto implementa um jogo educativo interativo com backend Node.js e frontend HTML/CSS/JavaScript, utilizando Firebase Realtime Database como banco de dados.

## ✅ Status do Projeto

**FUNCIONANDO PERFEITAMENTE!** 🎉

- ✅ Backend Node.js com Express funcionando
- ✅ Frontend HTML/CSS/JavaScript responsivo
- ✅ Integração com Firebase Realtime Database
- ✅ Sistema de login/registro funcionando
- ✅ Arquitetura MVC implementada
- ✅ APIs RESTful funcionais
- ✅ Interface de usuário completa

## Estrutura do Projeto

```
jogo-firebase/
├── backend/                 # Servidor Node.js com Express
│   ├── config/             # Configurações (Firebase)
│   │   └── firebase.js     # Configuração do Firebase Realtime Database
│   ├── controllers/        # Controladores (MVC)
│   │   ├── authController.js
│   │   ├── gameController.js
│   │   ├── shopController.js
│   │   └── reportsController.js
│   ├── models/            # Modelos de dados (MVC)
│   │   ├── User.js        # Modelo de usuário (Realtime Database)
│   │   └── GameSession.js # Modelo de sessão de jogo
│   ├── routes/            # Rotas da API (MVC)
│   ├── middleware/        # Middlewares
│   ├── server.js          # Arquivo principal do servidor
│   ├── package.json       # Dependências do Node.js
│   └── .env              # Variáveis de ambiente
└── frontend/              # Interface do usuário
    ├── css/              # Estilos CSS
    ├── js/               # Scripts JavaScript modulares
    ├── assets/           # Recursos (imagens, etc.)
    └── index.html        # Página principal
```

## Estrutura do Firebase Realtime Database

O projeto utiliza a seguinte estrutura no Firebase Realtime Database:

```json
{
  "users": {
    "email-codificado-do-usuario": {
      "profile": {
        "email": "email.do.jogador@exemplo.com",
        "fullname": "Nome Completo do Jogador",
        "phone": "(00) 00000-0000",
        "senacoins": 150,
        "loginCount": 1,
        "createdAt": 1754950956444,
        "lastLogin": 1754950956444
      },
      "bonuses": {
        "doublePoints": false,
        "extraTime": false
      },
      "reports": {
        "ID_UNICO_DO_RELATORIO": {
          "date": 1754950956444,
          "score": 2500,
          "status": "Concluído",
          "username": "Nome Completo do Jogador",
          "phase": 1,
          "itemsCollected": {
            "pens": 5,
            "cups": 3,
            "books": 2
          }
        }
      }
    }
  },
  "gameSessions": {
    "SESSION_ID": {
      "userId": "email-codificado",
      "phase": 1,
      "score": 0,
      "targetScore": 100,
      "timeRemaining": 60,
      "itemsCollected": { "pens": 0, "cups": 0, "books": 0 },
      "status": "active",
      "startedAt": 1754950956444,
      "createdAt": 1754950956444,
      "updatedAt": 1754950956444
    }
  }
}
```

## Funcionalidades Implementadas

### Backend (Node.js + Express)
- **Arquitetura MVC**: Separação clara entre Models, Views e Controllers
- **API RESTful**: Endpoints organizados por funcionalidade
- **Firebase Realtime Database**: Conexão e operações CRUD
- **Autenticação**: Sistema de login/registro de usuários
- **Gerenciamento de Sessões**: Controle de sessões de jogo
- **Sistema de Loja**: Compra de itens com senacoins
- **Relatórios**: Ranking e estatísticas de usuários
- **Codificação de Email**: Emails são codificados para uso como chaves no Firebase

### Frontend (HTML/CSS/JavaScript)
- **Interface Responsiva**: Design adaptável para diferentes dispositivos
- **SPA (Single Page Application)**: Navegação sem recarregamento de página
- **Módulos JavaScript**: Código organizado em módulos especializados
- **Comunicação com API**: Integração completa com o backend
- **Sistema de Notificações**: Feedback visual para o usuário
- **Jogo Interativo**: Mecânica de coleta de itens com pontuação

## Configuração e Instalação

### Pré-requisitos
- Node.js (versão 14 ou superior)
- Conta no Firebase com projeto configurado
- Credenciais do Firebase Admin SDK
- Firebase Realtime Database habilitado

### Backend

1. **Instalar dependências**:
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   Edite o arquivo `.env`:
   ```
   PORT=3001
   NODE_ENV=development
   FIREBASE_PROJECT_ID=topgame-e9e1c
   FIREBASE_CREDENTIALS_PATH=./config/firebase-credentials.json
   ```

3. **Configurar Firebase**:
   - Coloque o arquivo de credenciais do Firebase em `config/firebase-credentials.json`
   - **IMPORTANTE**: Habilite o Firebase Realtime Database no console do Firebase

4. **Iniciar servidor**:
   ```bash
   npm run dev
   ```
   O servidor estará disponível em: `http://localhost:3001`

### Frontend

1. **Servir arquivos estáticos**:
   ```bash
   cd frontend
   python3 -m http.server 8000
   ```

2. **Acessar aplicação**:
   Abra o navegador em `http://localhost:8000`

## APIs Disponíveis

### Autenticação
- `POST /api/auth/login` - Login/Registro de usuário
- `GET /api/auth/user/:userId` - Obter dados do usuário
- `PUT /api/auth/user/:userId` - Atualizar dados do usuário

### Jogo
- `POST /api/game/start` - Iniciar nova sessão de jogo
- `PUT /api/game/session/:sessionId/score` - Atualizar pontuação
- `PUT /api/game/session/:sessionId/end` - Finalizar jogo
- `PUT /api/game/session/:sessionId/pause` - Pausar jogo
- `PUT /api/game/session/:sessionId/resume` - Retomar jogo
- `GET /api/game/user/:userId/active` - Obter sessão ativa
- `GET /api/game/user/:userId/history` - Histórico de sessões

### Loja
- `GET /api/shop/items` - Listar itens da loja
- `POST /api/shop/purchase` - Comprar item
- `GET /api/shop/user/:userId/balance` - Saldo do usuário

### Relatórios
- `GET /api/reports/ranking` - Ranking de usuários
- `GET /api/reports/stats` - Estatísticas gerais
- `GET /api/reports/user/:userId` - Relatório do usuário
- `GET /api/reports/search` - Buscar usuários

## Configuração do Firebase Realtime Database

### 1. Habilitar Realtime Database
No console do Firebase:
1. Vá para "Realtime Database"
2. Clique em "Criar banco de dados"
3. Escolha o local (preferencialmente us-central1)
4. Configure as regras de segurança

### 2. Regras de Segurança (Para Desenvolvimento)
```json
{
  "rules": {
    ".read": "now < 1757473200000",  // Permite leitura até 10 de Setembro de 2025
    ".write": "now < 1757473200000"  // Permite escrita até 10 de Setembro de 2025
  }
}
```

### 3. Regras de Segurança (Para Produção)
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "gameSessions": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

### 4. Obter Credenciais
1. Vá para "Configurações do projeto" > "Contas de serviço"
2. Clique em "Gerar nova chave privada"
3. Salve o arquivo JSON como `config/firebase-credentials.json`

## Modelos de Dados

### User (Usuário)
```javascript
{
  id: "email_codificado", // joao,silva_at_email,com
  email: "joao.silva@email.com",
  fullname: "João Silva",
  phone: "(11) 99999-9999",
  senacoins: 100,
  loginCount: 1,
  createdAt: 1754950956444,
  lastLogin: 1754950956444,
  bonuses: {
    doublePoints: false,
    extraTime: false
  }
}
```

### GameSession (Sessão de Jogo)
```javascript
{
  id: "session_unique_id",
  userId: "email_codificado",
  phase: 1,
  score: 0,
  targetScore: 100,
  timeRemaining: 60,
  itemsCollected: { pens: 0, cups: 0, books: 0 },
  status: "active", // active, paused, completed, failed
  startedAt: 1754950956444,
  completedAt: null,
  createdAt: 1754950956444,
  updatedAt: 1754950956444
}
```

## Como Testar

1. **Inicie o backend**: `cd backend && npm run dev`
2. **Inicie o frontend**: `cd frontend && python3 -m http.server 8000`
3. **Acesse**: `http://localhost:8000`
4. **Faça login** com qualquer nome, telefone e email
5. **Explore** as funcionalidades: Dashboard, Loja, Jogo e Relatórios

## Funcionalidades Especiais

### Codificação de Email
- Emails são automaticamente codificados para uso como chaves no Firebase
- Exemplo: `joao.silva@email.com` → `joao,silva_at_email,com`
- Isso permite usar emails como identificadores únicos no Realtime Database

### Sistema de Bônus
- **Double Points**: Dobra a pontuação obtida no jogo
- **Extra Time**: Adiciona tempo extra para completar as fases

### Sistema de Relatórios
- Cada jogo completado gera um relatório automático
- Relatórios incluem pontuação, status, itens coletados e timestamp
- Ranking automático baseado na pontuação total

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js, Firebase Admin SDK
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Tailwind CSS
- **Banco de Dados**: Firebase Realtime Database
- **Ferramentas**: Nodemon, CORS, Helmet, Morgan

## Arquitetura

O projeto segue o padrão **MVC (Model-View-Controller)**:
- **Models**: Gerenciam dados e interação com Firebase Realtime Database
- **Views**: Interface do usuário (frontend)
- **Controllers**: Lógica de negócio e processamento de requisições

A comunicação entre frontend e backend é feita através de **API RESTful** com formato JSON.

## Próximos Passos

1. ✅ **Implementar autenticação mais robusta** (se necessário)
2. ✅ **Adicionar mais tipos de itens** no jogo
3. ✅ **Implementar sistema de conquistas**
4. ✅ **Melhorar interface visual**
5. ⏳ **Adicionar testes automatizados**
6. ⏳ **Implementar modo multiplayer**
7. ⏳ **Adicionar sistema de níveis**

## Suporte

Se encontrar algum problema:

1. Verifique se o Firebase Realtime Database está habilitado
2. Confirme se as credenciais do Firebase estão corretas
3. Verifique se as portas 3001 (backend) e 8000 (frontend) estão livres
4. Consulte os logs do servidor para mais detalhes

---

**Desenvolvido com ❤️ usando Node.js, Express.js e Firebase Realtime Database**

