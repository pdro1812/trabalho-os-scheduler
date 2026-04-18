FROM golang:1.22-alpine

WORKDIR /app

# Copia os arquivos de dependência
COPY go.mod ./
# Se tiver go.sum, descomente a linha abaixo
# COPY go.sum ./
RUN go mod download

# Copia o código fonte
COPY . .

# Expõe a porta da API
EXPOSE 8080

# Roda o servidor
CMD ["go", "run", "./cmd/api/main.go"]