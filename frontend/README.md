# My Economy - Frontend

Aplicativo mobile para controle de gastos mensais.

## Requisitos

- Node.js 14 ou superior
- npm ou yarn
- React Native CLI
- Android Studio (para desenvolvimento Android)
- Xcode (para desenvolvimento iOS, apenas macOS)

## Instalação

1. Instale as dependências:
```bash
npm install
# ou
yarn install
```

2. Para Android, certifique-se de ter o Android Studio instalado e configurado com um emulador.

3. Para iOS, instale as dependências do CocoaPods:
```bash
cd ios && pod install
```

## Executando o aplicativo

### Android
```bash
npm run android
# ou
yarn android
```

### iOS
```bash
npm run ios
# ou
yarn ios
```

## Estrutura do projeto

```
src/
  ├── contexts/     # Contextos React (Auth, etc)
  ├── pages/        # Telas do aplicativo
  ├── routes/       # Configuração de navegação
  ├── services/     # Serviços (API, etc)
  └── utils/        # Funções utilitárias
```

## Funcionalidades

- Autenticação de usuários
- Cadastro de despesas
- Definição de limites mensais
- Visualização de gastos por mês
- Perfil do usuário 