// Importamos as bibliotecas necessárias
const express = require('express');
const cors = require('cors');

// Importamos a função que processa a simulação
// Ela está em outro arquivo para organizar melhor o código
const { simulateHandler } = require('../../internal/handlers/handlers'); 

// Criamos o aplicativo do servidor
const app = express();

// Configuramos o CORS para permitir que o navegador acesse nossa API
// Isso é necessário quando o front-end e o back-end estão em endereços diferentes
app.use(cors());

// Configuramos o servidor para entender dados enviados em formato JSON
app.use(express.json());

// Definimos a "rota" da nossa API
// Quando alguém enviar um POST para '/api/simulate', chamamos o simulateHandler
app.post('/api/simulate', simulateHandler);

// Escolhemos a porta onde o servidor vai "escutar" (8080)
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});