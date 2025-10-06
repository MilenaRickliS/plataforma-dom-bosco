# Plataforma do Instituto Assitencial Dom Bosco - Guarapuava PR

Aplicação web desenvolvida em **React + Vite** para gestão e navegação da Plataforma do Instituto Assitencial Dom Bosco - Guarapuava PR.  
O projeto ainda está sendo desenvolvido...

---

## 🚀 Tecnologias

- [React](https://react.dev/) — biblioteca para interfaces de usuário  
- [Vite](https://vitejs.dev/) — bundler e dev server rápido  
- [JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)  
- [CSS](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
- [Firebase](https://firebase.google.com/) 
- [Cloudinary](https://cloudinary.com/) 

---

## 📂 Estrutura do projeto

```
plataforma-dom-bosco/client
├── public/              # Arquivos estáticos
├── src/                 # Código-fonte principal
│   ├── assets/          # Imagens                
│   ├── components/      # Componentes reutilizáveis
│   ├── contexts/        # Para o gerenciamento da autenticação
│   ├── fonts/           # Fontes do projeto
│   ├── pages/           # Páginas da aplicação
│   ├── routes/          # Rotas da aplicação
│   ├── services/        # Conexão com o Firebase
│   ├── index.css        # Estilo comum de toda aplicação
│   └── App.jsx          # Arquivo principal
├── index.html           # HTML base
├── package.json         # Dependências e scripts
├── vite.config.js       # Configuração do Vite
└── eslint.config.js     # Regras de linting
```
```
plataforma-dom-bosco/server
├── node_modules/          # Arquivos Node
├── src/                   # Backend
│   ├── routes/
│     ├── auth.js          # Autenticação 
│     ├── equipe.js        # Gestão equipe                
│     └── depoimentos.js   # Depoimentos         
│   └── firebaseAdmin.js   # Configurações Firebase
├── package.json           # Dependências e scripts
└── server.js              # Principal arquivo
```

---

## 🛠️ Pré-requisitos

- Node.js (>= 18)  
- npm ou yarn  

---

## ▶️ Como rodar o projeto

1. Clone o repositório  
   ```bash
   git clone https://github.com/MilenaRickliS/plataforma-dom-bosco.git
   ```

2. Acesse a pasta server  
   ```bash
   cd server
   ```

3. Instale as dependências  
   ```bash
   npm init
   ```

4. Execute o backend 
   ```bash
   node server.js
   ```
   
5. Acesse a pasta do projeto  
   ```bash
   cd client
   ```

6. Instale as dependências  
   ```bash
   npm install
   # ou
   yarn
   ```

7. Execute em ambiente de desenvolvimento  
   ```bash
   npm run dev
   ```

8. Abra no navegador:  
   ```
   http://localhost:5173
   ```

---


🙋‍♀️ Desenvolvedores

Bruno Thomé
🔗 GitHub

Milena Rickli Silvério Kriger
🔗 GitHub

Paulo Cesar Matsuda Almeida
🔗 GitHub