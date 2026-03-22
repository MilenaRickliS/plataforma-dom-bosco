// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";

// import authRoutes from "./src/api/auth.js";
// import depoimentosRoutes from "./src/api/depoimentos.js";
// import equipeRoutes from "./src/api/equipe.js";
// import emailRoutes from "./src/api/email.js";
// import galeriaRoutes from "./src/api/galeria.js";
// import cursosRoutes from "./src/api/cursos.js";
// import usuariosRoutes from "./src/api/usuarios.js";
// import videosRoutes from "./src/api/videos.js";
// import refeicoesRoutes from "./src/api/refeicoes.js";
// import relatoriosRoutes from "./src/api/relatorios.js";
// import tarefasRoutes from "./src/api/tarefas.js";
// import balancaRoutes from "./src/api/balanca.js";
// import corsMiddleware from "./src/middlewares/cors.js";

// dotenv.config();

// const app = express();
// app.use(corsMiddleware);

// app.use(cors({
//   origin: [
//     "http://localhost:5173",
//     "https://plataforma-dom-bosco.vercel.app",
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));

// app.options(/.*/, cors());

// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// app.use("/api/auth", authRoutes);
// app.use("/api/depoimentos", depoimentosRoutes);
// app.use("/api/equipe", equipeRoutes);
// app.use("/api/email", emailRoutes);
// app.use("/api/galeria", galeriaRoutes);
// app.use("/api/cursos", cursosRoutes);
// app.use("/api/usuarios", usuariosRoutes);
// app.use("/api/videos", videosRoutes);
// app.use("/api/refeicoes", refeicoesRoutes);
// app.use("/api/relatorios", relatoriosRoutes);
// app.use("/api/tarefas", tarefasRoutes);
// app.use("/api/pesagem", balancaRoutes);


// export default app;
import express from "express";
import dotenv from "dotenv";
import corsMiddleware from "./src/middlewares/cors.js";
import authRoutes from "./src/api/auth.js";
import depoimentosRoutes from "./src/api/depoimentos.js";
import equipeRoutes from "./src/api/equipe.js";
import emailRoutes from "./src/api/email.js";
import galeriaRoutes from "./src/api/galeria.js";
import cursosRoutes from "./src/api/cursos.js";
import usuariosRoutes from "./src/api/usuarios.js";
import videosRoutes from "./src/api/videos.js";
import refeicoesRoutes from "./src/api/refeicoes.js";
import relatoriosRoutes from "./src/api/relatorios.js";
import tarefasRoutes from "./src/api/tarefas.js";
import balancaRoutes from "./src/api/balanca.js";


dotenv.config();

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ ok: true, message: "API online" });
});

app.get("/api/teste", (req, res) => {
  res.status(200).json({ ok: true, rota: "teste funcionando" });
});

app.use("/api/auth", authRoutes);
app.use("/api/depoimentos", depoimentosRoutes);
app.use("/api/equipe", equipeRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/galeria", galeriaRoutes);
app.use("/api/cursos", cursosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/videos", videosRoutes);
app.use("/api/refeicoes", refeicoesRoutes);
app.use("/api/relatorios", relatoriosRoutes);
app.use("/api/tarefas", tarefasRoutes);
app.use("/api/pesagem", balancaRoutes);

export default app;