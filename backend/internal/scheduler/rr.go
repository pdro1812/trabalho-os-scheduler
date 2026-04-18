package scheduler

import (
	"sort"

	"github.com/pdro1812/trabalho-os-scheduler/backend/internal/models"
)

func RunRoundRobin(req models.SimulationRequest) models.SimulationResponse {
	processes := make([]models.Process, len(req.Processes))
	copy(processes, req.Processes)

	// Ordena inicialmente por tempo de chegada
	sort.SliceStable(processes, func(i, j int) bool {
		return processes[i].ArrivalTime < processes[j].ArrivalTime
	})

	n := len(processes)
	remainingTime := make([]int, n)
	for i := range processes {
		remainingTime[i] = processes[i].BurstTime
	}

	var executionOrder []models.ExecutionBlock
	var metrics []models.ProcessMetrics

	currentTime := 0
	completed := 0
	queue := []int{}
	arrivalIdx := 0

	// Nova função blindada: Adiciona na fila apenas quem chegou no tempo atual e ainda não entrou
	checkArrivals := func() {
		for arrivalIdx < n && processes[arrivalIdx].ArrivalTime <= currentTime {
			queue = append(queue, arrivalIdx)
			arrivalIdx++
		}
	}

	// Adiciona os processos que chegam no tempo 0
	checkArrivals()
	lastPID := ""

	totalWaitTime := 0
	totalTurnaroundTime := 0

	for completed < n {
		// Se a fila está vazia, a CPU fica ociosa até o próximo processo chegar
		if len(queue) == 0 {
			if arrivalIdx < n {
				currentTime = processes[arrivalIdx].ArrivalTime
				checkArrivals()
			}
			continue
		}

		// Retira o primeiro da fila
		idx := queue[0]
		queue = queue[1:]
		p := processes[idx]

		// Aplica TTC se mudou de processo
		if lastPID != "" && lastPID != p.PID && req.TTC > 0 {
			executionOrder = append(executionOrder, models.ExecutionBlock{
				PID:   "TTC",
				Start: currentTime,
				End:   currentTime + req.TTC,
			})
			currentTime += req.TTC
			checkArrivals() // Verifica se alguém chegou DENTRO do tempo de troca de contexto
		}

		// Define quanto tempo vai rodar (o Quantum ou o que sobrou)
		runTime := req.Quantum
		if remainingTime[idx] < runTime {
			runTime = remainingTime[idx]
		}

		start := currentTime
		currentTime += runTime
		remainingTime[idx] -= runTime

		executionOrder = append(executionOrder, models.ExecutionBlock{
			PID:   p.PID,
			Start: start,
			End:   currentTime,
		})

		// Verifica quem chegou ENQUANTO esse processo rodava na CPU
		checkArrivals()

		// Se o processo ainda não terminou, volta pro final da fila
		if remainingTime[idx] > 0 {
			queue = append(queue, idx)
		} else {
			// Processo terminou
			completed++
			turnaround := currentTime - p.ArrivalTime
			wait := turnaround - p.BurstTime
			totalTurnaroundTime += turnaround
			totalWaitTime += wait

			metrics = append(metrics, models.ProcessMetrics{
				PID:           p.PID,
				EffectiveTime: turnaround,
				WaitingTime:   wait,
			})
		}
		lastPID = p.PID
	}

	return models.SimulationResponse{
		ExecutionOrder:    executionOrder,
		Metrics:           metrics,
		AvgWaitTime:       float64(totalWaitTime) / float64(n),
		AvgTurnaroundTime: float64(totalTurnaroundTime) / float64(n),
	}
}