package scheduler

import (
	"github.com/pdro1812/trabalho-os-scheduler/backend/internal/models"
)

func RunSJFNonPreemptive(req models.SimulationRequest) models.SimulationResponse {
	processes := make([]models.Process, len(req.Processes))
	copy(processes, req.Processes)

	var executionOrder []models.ExecutionBlock
	var metrics []models.ProcessMetrics

	currentTime := 0
	completed := 0
	n := len(processes)
	isCompleted := make([]bool, n)

	totalWaitTime := 0
	totalTurnaroundTime := 0

	for completed < n {
		idx := -1
		minBurst := 999999999 // Valor alto para servir de infinito

		// Procura o processo que já chegou e tem o menor tempo de CPU
		for i := 0; i < n; i++ {
			if !isCompleted[i] && processes[i].ArrivalTime <= currentTime {
				if processes[i].BurstTime < minBurst {
					minBurst = processes[i].BurstTime
					idx = i
				}
				// Critério de desempate caso dois tenham o mesmo burst time: quem chegou primeiro ganha
				if processes[i].BurstTime == minBurst && idx != -1 {
					if processes[i].ArrivalTime < processes[idx].ArrivalTime {
						idx = i
					}
				}
			}
		}

		if idx != -1 {
			// Encontramos o menor processo, vamos rodá-lo
			p := processes[idx]
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
			isCompleted[idx] = true
			completed++

			// Aplica TTC
			if completed < n && req.TTC > 0 {
				executionOrder = append(executionOrder, models.ExecutionBlock{
					PID:   "TTC",
					Start: currentTime,
					End:   currentTime + req.TTC,
				})
				currentTime += req.TTC
			}

		} else {
			// CPU Ociosa: Ninguém chegou ainda. Avança o tempo para a chegada do próximo.
			nextTime := 999999999
			for i := 0; i < n; i++ {
				if !isCompleted[i] && processes[i].ArrivalTime < nextTime {
					nextTime = processes[i].ArrivalTime
				}
			}
			currentTime = nextTime
		}
	}

	return models.SimulationResponse{
		ExecutionOrder:    executionOrder,
		Metrics:           metrics,
		AvgWaitTime:       float64(totalWaitTime) / float64(n),
		AvgTurnaroundTime: float64(totalTurnaroundTime) / float64(n),
	}
}