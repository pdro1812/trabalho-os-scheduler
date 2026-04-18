package scheduler

import (
	"sort"

	"github.com/pdro1812/trabalho-os-scheduler/backend/internal/models"
)

func RunFCFS(req models.SimulationRequest) models.SimulationResponse {
	processes := make([]models.Process, len(req.Processes))
	copy(processes, req.Processes)

	// Ordena por Arrival Time (Garante o FCFS caso tenham tempos de chegada diferentes)
	sort.SliceStable(processes, func(i, j int) bool {
		return processes[i].ArrivalTime < processes[j].ArrivalTime
	})

	var executionOrder []models.ExecutionBlock
	var metrics []models.ProcessMetrics

	currentTime := 0
	totalWaitTime := 0
	totalTurnaroundTime := 0

	for i, p := range processes {
		// Se a CPU estiver ociosa esperando o processo chegar
		if currentTime < p.ArrivalTime {
			currentTime = p.ArrivalTime
		}

		start := currentTime
		currentTime += p.BurstTime
		end := currentTime

		executionOrder = append(executionOrder, models.ExecutionBlock{
			PID:   p.PID,
			Start: start,
			End:   end,
		})

		turnaround := end - p.ArrivalTime
		wait := turnaround - p.BurstTime

		metrics = append(metrics, models.ProcessMetrics{
			PID:           p.PID,
			EffectiveTime: turnaround,
			WaitingTime:   wait,
		})

		totalTurnaroundTime += turnaround
		totalWaitTime += wait

		// Aplica TTC se não for o último processo a executar
		if i < len(processes)-1 && req.TTC > 0 {
			executionOrder = append(executionOrder, models.ExecutionBlock{
				PID:   "TTC",
				Start: currentTime,
				End:   currentTime + req.TTC,
			})
			currentTime += req.TTC
		}
	}

	n := float64(len(processes))
	return models.SimulationResponse{
		ExecutionOrder:    executionOrder,
		Metrics:           metrics,
		AvgWaitTime:       float64(totalWaitTime) / n,
		AvgTurnaroundTime: float64(totalTurnaroundTime) / n,
	}
}