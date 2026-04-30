function runRoundRobin(req) {
    // Cria uma cópia para não mutar os dados originais
    const processes = [...req.Processes];

    // Ordena inicialmente por tempo de chegada
    processes.sort((a, b) => a.ArrivalTime - b.ArrivalTime);

    const n = processes.length;
    const remainingTime = processes.map(p => p.BurstTime);

    const executionOrder = [];
    const metrics = [];

    let currentTime = 0;
    let completed = 0;
    const queue = [];
    let arrivalIdx = 0;

    // Nova função blindada: Adiciona na fila apenas quem chegou no tempo atual e ainda não entrou
    const checkArrivals = () => {
        while (arrivalIdx < n && processes[arrivalIdx].ArrivalTime <= currentTime) {
            queue.push(arrivalIdx);
            arrivalIdx++;
        }
    };

    // Adiciona os processos que chegam no tempo 0
    checkArrivals();
    let lastPID = "";

    let totalWaitTime = 0;
    let totalTurnaroundTime = 0;

    while (completed < n) {
        // Se a fila está vazia, a CPU fica ociosa até o próximo processo chegar
        if (queue.length === 0) {
            if (arrivalIdx < n) {
                currentTime = processes[arrivalIdx].ArrivalTime;
                checkArrivals();
            }
            continue;
        }

        // Retira o primeiro da fila
        const idx = queue.shift();
        const p = processes[idx];

        // Aplica TTC se mudou de processo
        if (lastPID !== "" && lastPID !== p.PID && req.TTC > 0) {
            executionOrder.push({
                PID: "TTC",
                Start: currentTime,
                End: currentTime + req.TTC
            });
            currentTime += req.TTC;
            checkArrivals(); // Verifica se alguém chegou DENTRO do tempo de troca de contexto
        }

        // Define quanto tempo vai rodar (o Quantum ou o que sobrou)
        let runTime = req.Quantum;
        if (remainingTime[idx] < runTime) {
            runTime = remainingTime[idx];
        }

        const start = currentTime;
        currentTime += runTime;
        remainingTime[idx] -= runTime;

        executionOrder.push({
            PID: p.PID,
            Start: start,
            End: currentTime
        });

        // Verifica quem chegou ENQUANTO esse processo rodava na CPU
        checkArrivals();

        // Se o processo ainda não terminou, volta pro final da fila
        if (remainingTime[idx] > 0) {
            queue.push(idx);
        } else {
            // Processo terminou
            completed++;
            const turnaround = currentTime - p.ArrivalTime;
            const wait = turnaround - p.BurstTime;
            totalTurnaroundTime += turnaround;
            totalWaitTime += wait;

            metrics.push({
                PID: p.PID,
                EffectiveTime: turnaround,
                WaitingTime: wait
            });
        }
        lastPID = p.PID;
    }

    return {
        ExecutionOrder: executionOrder,
        Metrics: metrics,
        AvgWaitTime: totalWaitTime / n,
        AvgTurnaroundTime: totalTurnaroundTime / n
    };
}

module.exports = { runRoundRobin };