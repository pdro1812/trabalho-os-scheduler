// server.js (Equivalente ao main.go)

const express = require('express');
const cors = require('cors');

// Importação dos handlers corrigida para buscar na pasta certa
// Voltamos duas pastas (cmd e api) usando '../../' e entramos em internal/handlers
const { simulateHandler } = require('../../internal/handlers/handlers'); 

const app = express();

// Middleware básico para CORS (exatamente como sua função corsMiddleware)
app.use(cors({
    origin: '*',
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Middleware obrigatório no Express para ele entender o JSON que vem do React
// Faz o papel de ler o corpo da requisição que o Go faz por baixo dos panos
app.use(express.json());

// Rotas
app.post('/api/simulate', simulateHandler);

// Inicialização do servidor
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Node.js rodando na porta ${PORT}`);
});