# JantaJá 🍽️

Aplicativo mobile para casais planejarem jantares da semana e gerenciarem a lista de compras compartilhada.

## Funcionalidades

- Autenticação de usuários (email e senha)
- Criação e entrada em um casal via código de convite
- Sugestão de jantares por dia da semana com emoji e ingredientes
- Aprovação ou recusa de jantares pelo parceiro(a)
- Lista de compras compartilhada em tempo real
- Convite do parceiro por e-mail

## Stack

| Camada | Tecnologia |
|---|---|
| Framework mobile | [React Native](https://reactnative.dev/) + [Expo SDK 54](https://expo.dev/) |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) |
| Navegação | [React Navigation 7](https://reactnavigation.org/) (Stack + Bottom Tabs) |
| Backend / Banco de dados | [Firebase Firestore](https://firebase.google.com/docs/firestore) (tempo real com `onSnapshot`) |
| Autenticação | [Firebase Authentication](https://firebase.google.com/docs/auth) (email/senha) |
| Notificações | [Expo Notifications](https://docs.expo.dev/push-notifications/overview/) |
| Variáveis de ambiente | `EXPO_PUBLIC_*` via arquivo `.env` |

## Estrutura do projeto

```
src/
├── hooks/          # useJantares, useCompras (listeners Firestore)
├── navigation/     # AppNavigator (roteamento autenticado)
├── screens/        # Telas do app
│   ├── LoginScreen
│   ├── CasalScreen
│   ├── HomeScreen
│   ├── SugestaoScreen
│   ├── AprovacaoScreen
│   └── ComprasScreen
├── services/       # Firebase (auth, jantares, compras, notificações)
└── types/          # Interfaces TypeScript
```

## Como rodar

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Copie o arquivo de exemplo e preencha com suas credenciais Firebase:
   ```bash
   cp .env.example .env
   ```
4. Inicie o servidor Expo:
   ```bash
   npx expo start
   ```
   Para desenvolvimento em Codespaces ou sem acesso à rede local, use túnel:
   ```bash
   npx expo start --tunnel
   ```
5. Escaneie o QR code com o app **Expo Go** no seu celular.

## Configuração Firebase

O app requer um projeto Firebase com:
- **Authentication** habilitado (provedor Email/Senha)
- **Firestore Database** criado e com regras que permitam leitura/escrita para usuários autenticados

Exemplo de regras para desenvolvimento:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
