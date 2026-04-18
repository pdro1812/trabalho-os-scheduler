package main

import (
	"fmt"
	"net/http"

	"github.com/pdro1812/trabalho-os-scheduler/backend/internal/handlers"
)

// Middleware básico para permitir que o React (porta 5173) acesse o Go (porta 8080)
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Se for uma requisição de pré-vôo (OPTIONS), responde com OK e sai
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()

	// Registra a rota apontando para o nosso handler
	mux.HandleFunc("/api/simulate", handlers.SimulateHandler)
	mux.HandleFunc("/api/stress-test", handlers.StressTestHandler)

	// Aplica o CORS e prepara o servidor
	handler := corsMiddleware(mux)

	port := ":8080"
	fmt.Println("🚀 Servidor Go rodando na porta", port)
	
	err := http.ListenAndServe(port, handler)
	if err != nil {
		fmt.Println("Erro ao iniciar o servidor:", err)
	}
}