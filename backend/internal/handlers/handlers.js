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

// Handler de Stress Test (/api/stress-test)
function stressTestHandler(req, res) {
    try {
        const { processCount, maxBurst, quantum, ttc } = req.body;

        if (!processCount || !maxBurst) {
            return res.status(400).json({ error: "Os campos 'processCount' e 'maxBurst' são obrigatórios" });
        }

        // 1. Gerar carga de processos aleatórios para o teste
        const processes = [];
        for (let i = 0; i < processCount; i++) {
            processes.push({
                PID: `P${i + 1}`,
                BurstTime: Math.floor(Math.random() * maxBurst) + 1, // Tempo entre 1 e maxBurst
                ArrivalTime: Math.floor(Math.random() * (processCount / 2)) // Chegadas aleatórias espalhadas
            });
        }

        // Objeto base para passar aos algoritmos
        const baseReq = { TTC: ttc || 0, Processes: processes };
        const results = [];

        // 2. Rodar todos os algoritmos com a MESMA lista de processos

        // FCFS
        const resFCFS = runFCFS({ ...baseReq, Algorithm: "FCFS" });
        results.push({
            algorithm: "FCFS",
            avgWaitTime: resFCFS.AvgWaitTime,
            avgTurnaroundTime: resFCFS.AvgTurnaroundTime
        });

        // SJF Não-Preemptivo
        const resSJFNP = runSJFNonPreemptive({ ...baseReq, Algorithm: "SJF-NP" });
        results.push({
            algorithm: "SJF-NP",
            avgWaitTime: resSJFNP.AvgWaitTime,
            avgTurnaroundTime: resSJFNP.AvgTurnaroundTime
        });

        // SJF Preemptivo
        const resSJFP = runSJFPreemptive({ ...baseReq, Algorithm: "SJF-P" });
        results.push({
            algorithm: "SJF-P",
            avgWaitTime: resSJFP.AvgWaitTime,
            avgTurnaroundTime: resSJFP.AvgTurnaroundTime
        });

        // Round Robin
        const resRR = runRoundRobin({ ...baseReq, Algorithm: "RR", Quantum: quantum || 2 });
        results.push({
            algorithm: "RR",
            avgWaitTime: resRR.AvgWaitTime,
            avgTurnaroundTime: resRR.AvgTurnaroundTime
        });

        // Devolve o array de resultados exatamente como o Go fazia
        res.json(results);

    } catch (error) {
        console.error("Erro no Stress Test:", error);
        res.status(500).json({ error: "Erro interno ao processar o teste de estresse" });
    }
}

module.exports = {
    simulateHandler,
    stressTestHandler
};