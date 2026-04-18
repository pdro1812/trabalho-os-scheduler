package scheduler

import (
    "github.com/pdro1812/trabalho-os-scheduler/backend/internal/models"
)

func RunSJFPreemptive(req models.SimulationRequest) models.SimulationResponse {
    processes := make([]models.Process, len(req.Processes))
    copy(processes, req.Processes)

    n := len(processes)
    remainingTime := make([]int, n)
    for i := range processes {
        remainingTime[i] = processes[i].BurstTime
    }

    var executionOrder []models.ExecutionBlock
    var metrics []models.ProcessMetrics

    currentTime := 0
    completed := 0
    lastPID := ""
    var blockStart int

    totalWaitTime := 0
    totalTurnaroundTime := 0

    for completed < n {
        idx := -1
        minRT := 999999999

        // Procura quem tem o menor tempo restante NESTE EXATO MILISSEGUNDO
        for i := 0; i < n; i++ {
            if processes[i].ArrivalTime <= currentTime && remainingTime[i] > 0 {
                if remainingTime[i] < minRT {
                    minRT = remainingTime[i]
                    idx = i
                } else if remainingTime[i] == minRT && idx != -1 {
                    // Desempate: quem chegou primeiro
                    if processes[i].ArrivalTime < processes[idx].ArrivalTime {
                        idx = i
                    }
                }
            }
        }

        if idx != -1 {
            p := processes[idx]

            // Se a CPU trocou de processo (Preempção ou Fim de execução anterior)
            if lastPID != p.PID {
                // Salva o bloco do processo anterior
                if lastPID != "" && blockStart < currentTime {
                    executionOrder = append(executionOrder, models.ExecutionBlock{
                        PID:   lastPID,
                        Start: blockStart,
                        End:   currentTime,
                    })
                }

                // Aplica o TTC
                if lastPID != "" && req.TTC > 0 {
                    executionOrder = append(executionOrder, models.ExecutionBlock{
                        PID:   "TTC",
                        Start: currentTime,
                        End:   currentTime + req.TTC,
                    })
                    currentTime += req.TTC
                    lastPID = "" // Reseta para forçar a reavaliação (alguém pode ter chegado durante o TTC)
                    continue
                }

                lastPID = p.PID
                blockStart = currentTime
            }

            // Roda por 1 unidade de tempo (Tick)
            remainingTime[idx]--
            currentTime++

            // Se o processo acabou neste tick
            if remainingTime[idx] == 0 {
                completed++
                executionOrder = append(executionOrder, models.ExecutionBlock{
                    PID:   p.PID,
                    Start: blockStart,
                    End:   currentTime,
                })

                turnaround := currentTime - p.ArrivalTime
                wait := turnaround - p.BurstTime
                totalTurnaroundTime += turnaround
                totalWaitTime += wait

                metrics = append(metrics, models.ProcessMetrics{
                    PID:           p.PID,
                    EffectiveTime: turnaround,
                    WaitingTime:   wait,
                })

                // CORREÇÃO: Avançamos o blockStart para evitar salvar esse bloco duplicado na próxima troca, 
                // mas MANTEMOS o lastPID para que o próximo processo acione o TTC.
                blockStart = currentTime
            }
        } else {
            // CPU Ociosa
            // CORREÇÃO: Como a CPU ficou ociosa, limpamos o contexto. O próximo processo não deve sofrer TTC de saída.
            lastPID = ""
            
            nextArrival := 999999999
            for i := 0; i < n; i++ {
                if remainingTime[i] > 0 && processes[i].ArrivalTime < nextArrival {
                    nextArrival = processes[i].ArrivalTime
                }
            }
            currentTime = nextArrival
        }
    }

    return models.SimulationResponse{
        ExecutionOrder:    executionOrder,
        Metrics:           metrics,
        AvgWaitTime:       float64(totalWaitTime) / float64(n),
        AvgTurnaroundTime: float64(totalTurnaroundTime) / float64(n),
    }
}