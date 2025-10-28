import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/api/auth.js";
import depoimentosRoutes from "./src/api/depoimentos.js";
import equipeRoutes from "./src/api/equipe.js";
import emailRoutes from "./src/api/email.js";
import galeriaRoutes from "./src/api/galeria.js";
import projetosRoutes from "./src/api/projetos.js";
import eventosRoutes from "./src/api/eventos.js";
import oficinasRoutes from "./src/api/oficinas.js";
import cursosRoutes from "./src/api/cursos.js";
import usuariosRoutes from "./src/api/usuarios.js";
import videosRoutes from "./src/api/videos.js";
import turmasRoutes from "./src/api/turmas.js";
import refeicoesRoutes from "./src/api/refeicoes.js";
import relatoriosRoutes from "./src/api/relatorios.js";
import tarefasRoutes from "./src/api/tarefas.js";
dotenv.config();

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://plataforma-dom-bosco.vercel.app" 
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/depoimentos", depoimentosRoutes);
app.use("/api/equipe", equipeRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/galeria", galeriaRoutes);
app.use("/api/projetos", projetosRoutes);
app.use("/api/eventos", eventosRoutes);
app.use("/api/oficinas", oficinasRoutes);
app.use("/api/cursos", cursosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/videos", videosRoutes);
app.use("/api/turmas", turmasRoutes);
app.use("/api/refeicoes", refeicoesRoutes);
app.use("/api/relatorios", relatoriosRoutes);
app.use("/api/tarefas", tarefasRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

export default app; 
