/**
 * SJF – Shortest Job First (Não Preemptivo)
 * Em cada decisão de escalonamento, escolhe o processo disponível
 * com o menor BurstTime. Uma vez iniciado, roda até o fim.
 */
function runSJFNonPreemptive(req) {
    const processes = [...req.Processes];
    const n = processes.length;

    const executionOrder    = [];
    const metrics           = [];
    let currentTime         = 0;
    let completed           = 0;
    const isCompleted       = new Array(n).fill(false);
    let totalWaitTime       = 0;
    let totalTurnaroundTime = 0;

    // Flag que indica se a CPU estava ociosa antes do processo atual.
    // Saída da ociosidade NÃO cobra TTC.
    let cameFromIdle = true;

    while (completed < n) {
        let idx      = -1;
        let minBurst = Infinity;

        // --- SELEÇÃO DO PRÓXIMO PROCESSO  ---
        // Critério primário: menor BurstTime.
        // Critério secundário: menor ArrivalTime (quem chegou primeiro).
        // Critério terciário: posição original no array (garantida pelo sort estável do JS).
        for (let i = 0; i < n; i++) {
            if (!isCompleted[i] && processes[i].ArrivalTime <= currentTime) {
                if (processes[i].BurstTime < minBurst) {
                    // Encontrou um candidato com burst menor: atualiza
                    minBurst = processes[i].BurstTime;
                    idx      = i;
                } else if (processes[i].BurstTime === minBurst && idx !== -1) {
                    // Empate no burst: desempata por ArrivalTime
                    // 'else if' é obrigatório aqui para não comparar o mesmo processo consigo mesmo
                    if (processes[i].ArrivalTime < processes[idx].ArrivalTime) {
                        idx = i;
                    }
                }
            }
        }

        if (idx !== -1) {
            const p = processes[idx];

            // --- TROCA DE CONTEXTO ---
            // Cobrado apenas em transição direta entre processos diferentes.
            // Se a CPU veio da ociosidade, o contexto já está limpo — TTC não é aplicado.
            if (!cameFromIdle && req.TTC > 0) {
                executionOrder.push({
                    PID  : "TTC",
                    Start: currentTime,
                    End  : currentTime + req.TTC
                });
                currentTime += req.TTC;

                // Após o TTC, novos processos podem ter chegado; a seleção já foi feita,
                // mas no SJF não-preemptivo não há preempção, então continuamos com o mesmo idx.
            }

            // CPU está pronta para executar: resetamos a flag de ociosidade
            cameFromIdle = false;

            // --- EXECUÇÃO ---
            const start = currentTime;
            currentTime += p.BurstTime;
            const end = currentTime;

            executionOrder.push({ PID: p.PID, Start: start, End: end });

            // --- MÉTRICAS ---
            const turnaround = end - p.ArrivalTime;
            const wait       = turnaround - p.BurstTime;

            metrics.push({ PID: p.PID, EffectiveTime: turnaround, WaitingTime: wait });
            totalTurnaroundTime += turnaround;
            totalWaitTime       += wait;

            isCompleted[idx] = true;
            completed++;

        } else {
            // --- OCIOSIDADE ---
            // Nenhum processo disponível ainda. Avançamos o tempo para a chegada do próximo
            let nextArrival = Infinity;
            for (let i = 0; i < n; i++) {
                if (!isCompleted[i] && processes[i].ArrivalTime < nextArrival) {
                    nextArrival = processes[i].ArrivalTime;
                }
            }

            // Como a CPU ficou ociosa, limpamos o contexto para não cobrar TTC no próximo processo
            currentTime  = nextArrival;
            cameFromIdle = true;
        }
    }

    return {
        ExecutionOrder    : executionOrder,
        Metrics           : metrics,
        AvgWaitTime       : totalWaitTime / n,
        AvgTurnaroundTime : totalTurnaroundTime / n
    };
}

module.exports = { runSJFNonPreemptive };