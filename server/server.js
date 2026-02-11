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
import avisosRoutes from "./src/api/avisos.js";
import medalhasRoutes from "./src/api/medalhas.js"; 
import gamificacaoRoutes from "./src/api/gamificacao.js";
import logsRoutes from "./src/api/logs/gamificacao.js";
import chatRoutes from "./src/api/chat.js";
import chatPrivadoRoutes from "./src/api/chatPrivado.js";
import publicacoesRoutes from "./src/api/publicacoes.js";
import conteudoRoutes from "./src/api/conteudo.js";
import atividadeRoutes from "./src/api/atividades.js";
import avaliacoesRoutes from "./src/api/avaliacoes.js";
import questoesRoutes from "./src/api/questoes.js";
import contadorRoutes from "./src/api/contarEsp32.js";
import repostasRoutes from "./src/api/respostas.js";
import entregasRoutes from "./src/api/entregas.js";
import uploadsRoutes from "./src/api/uploads.js";
import notasRoutes from "./src/api/notas.js";
import balancaRoutes from "./src/api/balanca.js";
import searchRoutes from "./src/api/search.js";
import gestaoTurmas from "./src/api/gestaoTurmas.js";
import tarefasProfessorRoutes from "./src/api/tarefasProfessor.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://plataforma-dom-bosco.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/api/medalhas", medalhasRoutes);



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
app.use("/api/avisos", avisosRoutes);
app.use("/api/gamificacao", gamificacaoRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chatPrivado", chatPrivadoRoutes);
app.use("/api/publicacoes", publicacoesRoutes);
app.use("/api/conteudo", conteudoRoutes);
app.use("/api/atividade", atividadeRoutes);
app.use("/api/avaliacoes", avaliacoesRoutes);
app.use("/api/questoes", questoesRoutes);
app.use("/api/contador", contadorRoutes);
app.use("/api/respostas", repostasRoutes);
app.use("/api/entregas", entregasRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/notas", notasRoutes);
app.use("/api/pesagem", balancaRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/gestao-turmas", gestaoTurmas);
app.use("/api/tarefas-professor", tarefasProfessorRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

export default app;
