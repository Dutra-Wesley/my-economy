# My Economy

Um aplicativo completo para controle de despesas pessoais, desenvolvido com React Native (Expo) no frontend e Node.js no backend.

## 🚀 Tecnologias

### Frontend
- React Native (Expo) v52.0.0
- React v18.3.1
- React Navigation v6
- Axios v1.6.2
- AsyncStorage v1.23.1
- React Native Vector Icons v10.0.2
- Date-fns v2.30.0

### Backend
- Node.js
- Express v4.18.2
- Sequelize v6.35.1
- MySQL v3.6.5
- JWT v9.0.2
- Bcryptjs v2.4.3
- CORS v2.8.5
- Dotenv v16.3.1

## 📋 Pré-requisitos

- Node.js (versão LTS recomendada)
- npm ou yarn
- Expo CLI
- MySQL
- Git

## 🔧 Instalação

### Backend

1. Clone o repositório
```bash
git clone [URL_DO_REPOSITÓRIO]
cd my-economy/backend
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do backend com as seguintes variáveis:
```
DB_HOST=seu_host
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=nome_do_banco
JWT_SECRET=seu_secret_jwt
```

4. Inicie o servidor
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

### Frontend

1. Entre na pasta do frontend
```bash
cd ../frontend
```

2. Instale as dependências
```bash
npm install
```

3. Inicie o aplicativo
```bash
npm start
```

4. Use o Expo Go no seu dispositivo móvel para escanear o QR Code ou execute em um emulador

## 📱 Funcionalidades

- Autenticação de usuários
- Registro de despesas e receitas
- Categorização de transações
- Visualização de histórico
- Relatórios e gráficos
- Controle de orçamento

## 📁 Estrutura do Projeto

```
my-economy/
├── backend/
│   ├── src/
│   │   ├── config/         # Configurações do banco de dados e outras
│   │   ├── controllers/    # Controladores da aplicação
│   │   ├── middlewares/    # Middlewares (autenticação, validação, etc)
│   │   ├── models/         # Modelos do Sequelize
│   │   ├── routes.js       # Definição das rotas
│   │   └── server.js       # Arquivo principal do servidor
│   ├── package.json
│   └── .env               # Variáveis de ambiente
│
└── frontend/
    ├── src/
    │   ├── contexts/      # Contextos do React (Auth, Theme, etc)
    │   ├── pages/         # Componentes de página
    │   ├── routes/        # Configuração de navegação
    │   └── services/      # Serviços de API
    ├── App.js
    └── package.json
```

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Faça o Commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça o Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✒️ Autor

* **Wesley Dutra** - [Seu GitHub](https://github.com/Dutra-Wesley)
