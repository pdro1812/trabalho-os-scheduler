package handlers

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/pdro1812/trabalho-os-scheduler/backend/internal/models"
	"github.com/pdro1812/trabalho-os-scheduler/backend/internal/scheduler"
)

func StressTestHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var req models.StressRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Erro no JSON", http.StatusBadRequest)
		return
	}

	// 1. Gera os processos aleatórios
	rand.Seed(time.Now().UnixNano())
	var processes []models.Process
	for i := 0; i < req.ProcessCount; i++ {
		// Burst de 1 até MaxBurst. Arrival Time aleatório entre 0 e um valor dinâmico
		processes = append(processes, models.Process{
			PID:         "P" + string(rune(i)), // Apenas para ter um ID
			BurstTime:   rand.Intn(req.MaxBurst) + 1,
			ArrivalTime: rand.Intn(req.ProcessCount / 2), 
		})
	}

	// 2. Prepara o payload base para todos os algoritmos
	baseSimReq := models.SimulationRequest{
		Quantum:   req.Quantum,
		TTC:       req.TTC,
		Processes: processes,
	}

	// 3. Concorrência: Roda os 4 algoritmos ao mesmo tempo
	var results []models.StressResult
	var mu sync.Mutex // Mutex para não dar erro ao escrever no array "results" ao mesmo tempo
	var wg sync.WaitGroup

	algos := []string{"FCFS", "SJF-NP", "SJF-P", "RR"}

	for _, algo := range algos {
		wg.Add(1)
		go func(algorithm string) {
			defer wg.Done()

			simReq := baseSimReq
			simReq.Algorithm = algorithm

			var res models.SimulationResponse
			switch algorithm {
			case "FCFS":
				res = scheduler.RunFCFS(simReq)
			case "SJF-NP":
				res = scheduler.RunSJFNonPreemptive(simReq)
			case "SJF-P":
				res = scheduler.RunSJFPreemptive(simReq)
			case "RR":
				res = scheduler.RunRoundRobin(simReq)
			}

			// Trava, escreve o resultado e destrava
			mu.Lock()
			results = append(results, models.StressResult{
				Algorithm:         algorithm,
				AvgWaitTime:       res.AvgWaitTime,
				AvgTurnaroundTime: res.AvgTurnaroundTime,
			})
			mu.Unlock()
		}(algo)
	}

	wg.Wait() // Espera todos os algoritmos terminarem de calcular

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}