# Plataforma do Instituto Assitencial Dom Bosco - Guarapuava PR

Aplicação web desenvolvida em **React + Vite** com **backend em Node.js + Firebase + Cloudinary**, criada para realizar o controle e o gerenciamento das refeições de forma automatizada e em tempo real.
O sistema foi desenvolvido para atender às necessidades do Instituto Assistencial Dom Bosco, promovendo a modernização do processo de controle alimentar e oferecendo uma solução digital eficiente para nutricionistas, gestores e colaboradores envolvidos no serviço de alimentação. A plataforma permite o monitoramento da quantidade de refeições servidas por meio da integração com uma balança desevolvida pelo grupo com Esp32.

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
│   │   ├── data/               # Json frases salensianas
│   │   ├── fonts/              # Fontes personalizadas
│   │   ├── pages/              # Páginas principais
│   │   ├── routes/             # Rotas da aplicação
│   │   ├── services/           # Conexão com Firebase e API
│   │   ├── utils/              # Cálculos para cardápio nutricional
│   │   ├── index.css           # Estilo global
│   │   └── App.jsx             # Componente raiz
│   ├── package.json
│   └── vite.config.js
│
└── server/                     # Backend Node.js + Express
    ├── src/
    │   ├── api/       # Principais Rotas
    │   │   ├── auth.js
    │   │   ├── balanca.js
    │   │   ├── cursos.js
    │   │   ├── depoimentos.js
    │   │   ├── email.js
    │   │   ├── equipe.js
    │   │   ├── galeria.js
    │   │   ├── refeicoes.js
    │   │   ├── relatorios.js
    │   │   ├── tarefas.js
    │   │   ├── usuarios.js
    │   │   └── videos.js
    │   ├── cloudinary.js        # Banco de dados (Fotos e Vídeos)
    │   └── firebaseAdmin.js     # Banco de dados Firebase
    ├── server.js                # Código principal            
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
   # VITE_API_URL=http://localhost:5000 - quando localmente
   VITE_API_URL=https://plataforma-dom-bosco-backend.vercel.app

   # Cloudinary
   VITE_CLOUDINARY_NAME=xxxx
   CLOUDINARY_KEY="----- PRIVATE KEY-----"
   CLOUDINARY_SECRET=xxxx
   VITE_CLOUDINARY_PRESET=name
```

📁 .env (server)
```bash
   FIREBASE_PROJECT_ID=xxxx
   FIREBASE_CLIENT_EMAIL=xxxx@xxxx.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXX\n-----END PRIVATE KEY-----\n"
   CLOUDINARY_NAME=xxxx
   CLOUDINARY_KEY=xxxx
   CLOUDINARY_SECRET=xxxx
   CLOUDINARY_PRESET=xxxx
   EMAIL_USER=xxxx@gmail.com
   EMAIL_PASS=xxxx
   DEVICE_TOKEN=xxxx
   API_URL=http://localhost:5000

```

---

🙋‍♀️ Desenvolvedores

Bruno Thomé
🔗 [GitHub](https://github.com/BrunoFhome)

Milena Rickli Silvério Kriger
🔗 [GitHub](https://github.com/MilenaRickliS)

Paulo Cesar Matsuda Almeida
🔗 [GitHub](https://github.com/PauloCMatsudaA)

---
## 📜 Licença
Projeto acadêmico e institucional — Instituto Assistencial Dom Bosco - Guarapuava/PR.
© 2025 — Todos os direitos reservados.

---