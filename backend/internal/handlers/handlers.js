// backend/internal/handlers/handlers.js

const { runFCFS } = require('../scheduler/fcfs.js');
const { runRoundRobin } = require('../scheduler/rr.js');
const { runSJFNonPreemptive } = require('../scheduler/sjf.js');
const { runSJFPreemptive } = require('../scheduler/sjf_preemptive.js');

// Helper para converter o Request do Front (camelCase) para o formato do Algoritmo (PascalCase)
function mapRequestToModel(data) {
    return {
        Algorithm: data.algorithm,
        Quantum: data.quantum || 0,
        TTC: data.ttc || 0,
        Processes: (data.processes || []).map(p => ({
            PID: p.pid,
            BurstTime: p.burstTime,
            ArrivalTime: p.arrivalTime || 0
        }))
    };
}


// Helper para converter a Resposta do Algoritmo (PascalCase) para o Front (camelCase)
function mapResponseToDTO(response) {
    if (!response) return {};
    
    return {
        executionOrder: response.ExecutionOrder.map(e => ({
            pid: e.PID,
            start: e.Start,
            end: e.End
        })),
        metrics: response.Metrics.map(m => ({
            pid: m.PID,
            effectiveTime: m.EffectiveTime,
            waitingTime: m.WaitingTime
        })),
        avgWaitTime: response.AvgWaitTime,
        avgTurnaroundTime: response.AvgTurnaroundTime
    };
}

// Handler Principal de Simulação (/api/simulate)
function simulateHandler(req, res) {
    try {
        const simReq = mapRequestToModel(req.body);
        let result;

        // Roteamento para o algoritmo correto com base na string enviada pelo front
        switch (simReq.Algorithm) {
            case "FCFS":
                result = runFCFS(simReq);
                break;
            case "SJF-NP":
            case "SJF": // Aceita ambas as formas para evitar quebra no front
                result = runSJFNonPreemptive(simReq);
                break;
            case "SJF-P":
            case "SRTF":
                result = runSJFPreemptive(simReq);
                break;
            case "RR":
            case "RoundRobin":
                result = runRoundRobin(simReq);
                break;
            default:
                return res.status(400).json({ error: "Algoritmo não suportado: " + simReq.Algorithm });
        }

        // Devolve o JSON convertido para o padrão do React
        res.json(mapResponseToDTO(result));

    } catch (error) {
        console.error("Erro na simulação:", error);
        res.status(500).json({ error: "Erro interno ao processar a simulação" });
    }
}


module.exports = {
    simulateHandler,
};