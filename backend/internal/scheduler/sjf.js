function runSJFNonPreemptive(req) {
    const processes = [...req.Processes];
    
    const executionOrder = [];
    const metrics = [];

    let currentTime = 0;
    let completed = 0;
    const n = processes.length;
    const isCompleted = new Array(n).fill(false);

    let totalWaitTime = 0;
    let totalTurnaroundTime = 0;

    while (completed < n) {
        let idx = -1;
        let minBurst = Infinity;

        // Procura o processo que já chegou e tem o menor tempo de CPU
        for (let i = 0; i < n; i++) {
            if (!isCompleted[i] && processes[i].ArrivalTime <= currentTime) {
                if (processes[i].BurstTime < minBurst) {
                    minBurst = processes[i].BurstTime;
                    idx = i;
                }
                // Critério de desempate caso dois tenham o mesmo burst time: quem chegou primeiro ganha
                if (processes[i].BurstTime === minBurst && idx !== -1) {
                    if (processes[i].ArrivalTime < processes[idx].ArrivalTime) {
                        idx = i;
                    }
                }
            }
        }

        if (idx !== -1) {
            // Encontramos o menor processo, vamos rodá-lo
            const p = processes[idx];
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
            isCompleted[idx] = true;
            completed++;

            // Aplica TTC se não for o último processo
            if (completed < n && req.TTC > 0) {
                executionOrder.push({
                    PID: "TTC",
                    Start: currentTime,
                    End: currentTime + req.TTC
                });
                currentTime += req.TTC;
            }

        } else {
            // CPU Ociosa: Ninguém chegou ainda. Avança o tempo para a chegada do próximo.
            let nextTime = Infinity;
            for (let i = 0; i < n; i++) {
                if (!isCompleted[i] && processes[i].ArrivalTime < nextTime) {
                    nextTime = processes[i].ArrivalTime;
                }
            }
            currentTime = nextTime;
        }
    }

    return {
        ExecutionOrder: executionOrder,
        Metrics: metrics,
        AvgWaitTime: totalWaitTime / n,
        AvgTurnaroundTime: totalTurnaroundTime / n
    };
}

module.exports = { runSJFNonPreemptive };