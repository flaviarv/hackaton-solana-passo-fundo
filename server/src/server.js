import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import loteRoutes from './routes/loteRoutes.js'; // ou o caminho onde estão suas rotas

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Suas rotas
app.use('/api', loteRoutes);

// Garante que o processo continue rodando e escutando requisições
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});