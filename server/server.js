import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.js";
import depoimentosRoutes from "./src/routes/depoimentos.js";
import equipeRoutes from "./src/routes/equipe.js";
import emailRoutes from "./src/routes/email.js";
import galeriaRoutes from "./src/routes/galeria.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/depoimentos", depoimentosRoutes);
app.use("/api/equipe", equipeRoutes);
app.use("/api", emailRoutes);
app.use("/api/galeria", galeriaRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
