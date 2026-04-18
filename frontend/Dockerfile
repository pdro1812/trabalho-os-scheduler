FROM node:20-alpine

WORKDIR /app

# Copia os pacotes e instala
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta do Vite
EXPOSE 5173

# Inicia em modo de desenvolvimento liberando o host
CMD ["npm", "run", "dev", "--", "--host"]