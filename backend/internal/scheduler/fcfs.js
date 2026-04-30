// fcfc.js (ou o nome que preferir para o seu controller/service)

function runFCFS(req) {
    // Cria uma cópia rasa do array para não mutar os dados originais da requisição
    const processes = [...req.Processes];

    // Ordena por Arrival Time (O sort do JS moderno, ES2019+, é estável por padrão)
    processes.sort((a, b) => a.ArrivalTime - b.ArrivalTime);

    const executionOrder = [];
    const metrics = [];

    let currentTime = 0;
    let totalWaitTime = 0;
    let totalTurnaroundTime = 0;

    processes.forEach((p, i) => {
        // Se a CPU estiver ociosa esperando o processo chegar
        if (currentTime < p.ArrivalTime) {
            currentTime = p.ArrivalTime;
        }

        const start = currentTime;
        currentTime += p.BurstTime;
        const end = currentTime;

        executionOrder.push({
            PID: p.PID,
            Start: start,
            End: end
        });

        const turnaround = end - p.ArrivalTime;
        const wait = turnaround - p.BurstTime;

        metrics.push({
            PID: p.PID,
            EffectiveTime: turnaround,
            WaitingTime: wait
        });

        totalTurnaroundTime += turnaround;
        totalWaitTime += wait;

        // Aplica TTC (Time To Context switch) se não for o último processo a executar
        if (i < processes.length - 1 && req.TTC > 0) {
            executionOrder.push({
                PID: "TTC",
                Start: currentTime,
                End: currentTime + req.TTC
            });
            currentTime += req.TTC;
        }
    });

    const n = processes.length;
    
    return {
        ExecutionOrder: executionOrder,
        Metrics: metrics,
        AvgWaitTime: totalWaitTime / n,
        AvgTurnaroundTime: totalTurnaroundTime / n
    };
}

// Exporte a função conforme o padrão que estiver usando (CommonJS ou ES Modules)
module.exports = { runFCFS };
// export { runFCFS }; // Se estiver usando ES Modules (type: "module" no package.json)