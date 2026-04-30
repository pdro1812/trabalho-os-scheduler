# Usa uma imagem oficial do Node.js baseada em Alpine (leve e rápida)
FROM node:20-alpine

WORKDIR /app

# Copia apenas os arquivos de dependência primeiro
# Isso otimiza o cache do Docker; o npm install só vai rodar de novo se você mudar algo no package.json
COPY package*.json ./

# Instala as dependências (express, cors, etc.)
RUN npm install

# Copia o restante do código fonte
COPY . .

# Expõe a porta da API
EXPOSE 8080

# Roda o servidor
CMD ["node", "cmd/api/server.js"]