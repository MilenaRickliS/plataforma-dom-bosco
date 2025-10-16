# Plataforma do Instituto Assitencial Dom Bosco - Guarapuava PR

Aplicação web desenvolvida em **React + Vite** com **backend em Node.js + Firebase + Cloudinary.**
A plataforma foi criada para facilitar a gestão, a divulgação e integração das atividades do Instituto Assitencial Dom Bosco - Guarapuava PR, promovendo a comunicação entre alunos, professores e comunidade.

O projeto ainda está em desenvolvimento...

---

## 🚀 Tecnologias

### 🖥️ **Frontend**
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

### ⚙️ **Backend**
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)
![Cloudinary](https://img.shields.io/badge/Cloudinary-4285F4?logo=cloudinary&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-323330?logo=npm&logoColor=white)
![Dotenv](https://img.shields.io/badge/Dotenv-00C853?logo=npm&logoColor=white)
![CORS](https://img.shields.io/badge/CORS-FF5722?logo=javascript&logoColor=white)


---

## 📂 Estrutura do projeto

```bash
plataforma-dom-bosco/
├── client/                     # Aplicação Frontend (React + Vite)
│   ├── public/                 # Arquivos estáticos
│   ├── src/
│   │   ├── assets/             # Imagens e vídeos
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── contexts/           # Contextos (ex: autenticação)
│   │   ├── fonts/              # Fontes personalizadas
│   │   ├── pages/              # Páginas principais
│   │   ├── routes/             # Rotas da aplicação
│   │   ├── services/           # Conexão com Firebase e API
│   │   ├── index.css           # Estilo global
│   │   └── App.jsx             # Componente raiz
│   ├── package.json
│   └── vite.config.js
│
└── server/                     # Backend Node.js + Express
    ├── src/
    │   ├── api/
    │   │   ├── auth.js
    │   │   ├── depoimentos.js
    │   │   ├── equipe.js
    │   │   ├── eventos.js
    │   │   ├── oficinas.js
    │   │   ├── projetos.js
    │   │   └── cursos.js
    │   └── firebaseAdmin.js
    ├── server.js
    ├── package.json
    └── vercel.json
```

---

## 🛠️ Pré-requisitos

- Node.js (>= 18)  
- npm ou yarn  
- conta no Firebase
- conta no Cloudinary

---

## ▶️ Como rodar o projeto

1. Clone o repositório  
   ```bash
   git clone https://github.com/MilenaRickliS/plataforma-dom-bosco.git
   ```

2. Rodar Backend 
   ```bash
   cd server
   npm init
   node server.js
   ```

3. Rodar o Frontend  
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

4. Abra no navegador:  
   ```
   http://localhost:5173
   ```

---

## ☁️ Deploy na Vercel

- Frontend
🌍 https://plataforma-dom-bosco.vercel.app

- Backend
⚙️ https://plataforma-dom-bosco-backend.vercel.app

---

## 🔐 Variáveis de Ambiente

📁 .env (client)
```bash
   VITE_API_URL=https://plataforma-dom-bosco-backend.vercel.app
```

📁 .env (server)
```bash
   FIREBASE_PROJECT_ID=xxxx
   FIREBASE_CLIENT_EMAIL=xxxx@xxxx.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXX\n-----END PRIVATE KEY-----\n"
   CLOUDINARY_NAME=xxxx
   CLOUDINARY_KEY=xxxx
   CLOUDINARY_SECRET=xxxx
   EMAIL_USER=xxxx@gmail.com
   EMAIL_PASS=xxxx

```

---

🙋‍♀️ Desenvolvedores

Bruno Thomé
🔗 GitHub

Milena Rickli Silvério Kriger
🔗 GitHub

Paulo Cesar Matsuda Almeida
🔗 GitHub

---
## 📜 Licença
Projeto acadêmico e institucional — Instituto Assistencial Dom Bosco - Guarapuava/PR.
© 2025 — Todos os direitos reservados.

---