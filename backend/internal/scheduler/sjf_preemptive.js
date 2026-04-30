function runSJFPreemptive(req) {
    const processes = [...req.Processes];
    const n = processes.length;
    const remainingTime = processes.map(p => p.BurstTime);

    const executionOrder = [];
    const metrics = [];

    let currentTime = 0;
    let completed = 0;
    let lastPID = "";
    let blockStart = 0;

    let totalWaitTime = 0;
    let totalTurnaroundTime = 0;

    while (completed < n) {
        let idx = -1;
        let minRT = Infinity; // Trocamos 999999999 pelo Infinity nativo do JS

        // Procura quem tem o menor tempo restante NESTE EXATO MILISSEGUNDO
        for (let i = 0; i < n; i++) {
            if (processes[i].ArrivalTime <= currentTime && remainingTime[i] > 0) {
                if (remainingTime[i] < minRT) {
                    minRT = remainingTime[i];
                    idx = i;
                } else if (remainingTime[i] === minRT && idx !== -1) {
                    // Desempate: quem chegou primeiro
                    if (processes[i].ArrivalTime < processes[idx].ArrivalTime) {
                        idx = i;
                    }
                }
            }
        }

        if (idx !== -1) {
            const p = processes[idx];

            // Se a CPU trocou de processo (Preempção ou Fim de execução anterior)
            if (lastPID !== p.PID) {
                // Salva o bloco do processo anterior
                if (lastPID !== "" && blockStart < currentTime) {
                    executionOrder.push({
                        PID: lastPID,
                        Start: blockStart,
                        End: currentTime
                    });
                }

                // Aplica o TTC
                if (lastPID !== "" && req.TTC > 0) {
                    executionOrder.push({
                        PID: "TTC",
                        Start: currentTime,
                        End: currentTime + req.TTC
                    });
                    currentTime += req.TTC;
                    lastPID = ""; // Reseta para forçar a reavaliação (alguém pode ter chegado durante o TTC)
                    continue;
                }

                lastPID = p.PID;
                blockStart = currentTime;
            }

            // Roda por 1 unidade de tempo (Tick)
            remainingTime[idx]--;
            currentTime++;

            // Se o processo acabou neste tick
            if (remainingTime[idx] === 0) {
                completed++;
                executionOrder.push({
                    PID: p.PID,
                    Start: blockStart,
                    End: currentTime
                });

                const turnaround = currentTime - p.ArrivalTime;
                const wait = turnaround - p.BurstTime;
                totalTurnaroundTime += turnaround;
                totalWaitTime += wait;

                metrics.push({
                    PID: p.PID,
                    EffectiveTime: turnaround,
                    WaitingTime: wait
                });

                // Avançamos o blockStart para evitar salvar esse bloco duplicado na próxima troca, 
                // mas MANTEMOS o lastPID para que o próximo processo acione o TTC.
                blockStart = currentTime;
            }
        } else {
            // CPU Ociosa
            // Como a CPU ficou ociosa, limpamos o contexto. O próximo processo não deve sofrer TTC de saída.
            lastPID = "";
            
            let nextArrival = Infinity;
            for (let i = 0; i < n; i++) {
                if (remainingTime[i] > 0 && processes[i].ArrivalTime < nextArrival) {
                    nextArrival = processes[i].ArrivalTime;
                }
            }
            currentTime = nextArrival;
        }
    }

    return {
        ExecutionOrder: executionOrder,
        Metrics: metrics,
        AvgWaitTime: totalWaitTime / n,
        AvgTurnaroundTime: totalTurnaroundTime / n
    };
}

module.exports = { runSJFPreemptive };