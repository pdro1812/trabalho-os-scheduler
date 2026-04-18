package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/pdro1812/trabalho-os-scheduler/backend/internal/models"
	"github.com/pdro1812/trabalho-os-scheduler/backend/internal/scheduler"
)

func SimulateHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var req models.SimulationRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Erro ao processar o JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Printf("Simulação Recebida: Algoritmo=%s, Processos=%d, TTC=%d\n", req.Algorithm, len(req.Processes), req.TTC)

	var response models.SimulationResponse

	algo := strings.ToUpper(req.Algorithm)

	switch algo {
	case "FCFS":
		response = scheduler.RunFCFS(req)
	case "SJF-NP":
		response = scheduler.RunSJFNonPreemptive(req)
	case "SJF-P":
		response = scheduler.RunSJFPreemptive(req)
	case "RR":
		response = scheduler.RunRoundRobin(req)
	default:
		http.Error(w, "Algoritmo desconhecido", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}