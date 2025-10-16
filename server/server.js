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
dotenv.config();

const app = express();
app.use(cors());
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

export default app; 
