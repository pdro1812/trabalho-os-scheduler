package models

// Process representa o processo que chega na API
type Process struct {
	PID         string `json:"pid"`
	BurstTime   int    `json:"burstTime"`
	ArrivalTime int    `json:"arrivalTime"` // Vamos assumir 0 se não for enviado
}

// SimulationRequest é o payload esperado no POST /api/simulate
type SimulationRequest struct {
	Algorithm string    `json:"algorithm"` // Ex: "FCFS", "SJF-NP", "SJF-P", "RR"
	Quantum   int       `json:"quantum,omitempty"`
	TTC       int       `json:"ttc"`
	Processes []Process `json:"processes"`
}

// ExecutionBlock representa um pedaço de tempo na CPU (usado para o Gráfico de Gantt)
type ExecutionBlock struct {
	PID   string `json:"pid"` // Pode ser "P1", "P2" ou "TTC" (Troca de Contexto)
	Start int    `json:"start"`
	End   int    `json:"end"`
}

// ProcessMetrics guarda os tempos finais calculados para cada processo
type ProcessMetrics struct {
	PID           string `json:"pid"`
	EffectiveTime int    `json:"effectiveTime"` // Tempo de Conclusão - Tempo de Chegada (Turnaround)
	WaitingTime   int    `json:"waitingTime"`   // Turnaround - BurstTime Original
}

// SimulationResponse é o que a API devolve para o React
type SimulationResponse struct {
	ExecutionOrder    []ExecutionBlock `json:"executionOrder"`
	Metrics           []ProcessMetrics `json:"metrics"`
	AvgWaitTime       float64          `json:"avgWaitTime"`
	AvgTurnaroundTime float64          `json:"avgTurnaroundTime"`
}

// StressRequest é o que vamos receber do front para iniciar o teste
type StressRequest struct {
	ProcessCount int `json:"processCount"`
	MaxBurst     int `json:"maxBurst"`
	Quantum      int `json:"quantum"`
	TTC          int `json:"ttc"`
}

// StressResult é o resumo do desempenho de um algoritmo
type StressResult struct {
	Algorithm         string  `json:"algorithm"`
	AvgWaitTime       float64 `json:"avgWaitTime"`
	AvgTurnaroundTime float64 `json:"avgTurnaroundTime"`
}