/**
 * SJF Preemptivo – Shortest Remaining Time First (SRTF)
 * A cada tick de tempo, o processo com o menor tempo RESTANTE vence a CPU.
 * Se um novo processo chegar com burst menor que o restante do atual, ocorre preempção.
 */
function runSJFPreemptive(req) {
    const processes = [...req.Processes];
    const n = processes.length;

    // remainingTime armazena quanto cada processo ainda precisa rodar
    const remainingTime     = processes.map(p => p.BurstTime);
    const executionOrder    = [];
    const metrics           = [];
    let currentTime         = 0;
    let completed           = 0;
    let totalWaitTime       = 0;
    let totalTurnaroundTime = 0;

    // Controle de bloco contínuo no Gantt: consolidamos ticks consecutivos do mesmo processo
    let lastPID    = "";   // PID do processo rodando no tick anterior
    let blockStart = 0;    // início do bloco atual no Gantt

    // Flag de ociosidade: quando verdadeira, o próximo processo não paga TTC 
    let cameFromIdle = true;

    // Função auxiliar: seleciona o índice do processo com menor remainingTime
    // disponível no instante t, aplicando os desempates.
    const selectProcess = (t) => {
        let idx   = -1;
        let minRT = Infinity;
        for (let i = 0; i < n; i++) {
            if (processes[i].ArrivalTime <= t && remainingTime[i] > 0) {
                if (remainingTime[i] < minRT) {
                    minRT = remainingTime[i];
                    idx   = i;
                } else if (remainingTime[i] === minRT && idx !== -1) {
                    // Desempate primário: quem chegou primeiro (Regra 3)
                    if (processes[i].ArrivalTime < processes[idx].ArrivalTime) {
                        idx = i;
                    }
                    // Desempate secundário: posição original no array (sort estável garante isso)
                }
            }
        }
        return idx;
    };

    while (completed < n) {
        const idx = selectProcess(currentTime);

        if (idx === -1) {
            // --- OCIOSIDADE ---
            // Nenhum processo disponível. Fechamos o bloco atual (se houver) e avançamos o tempo.
            if (lastPID !== "" && blockStart < currentTime) {
                executionOrder.push({ PID: lastPID, Start: blockStart, End: currentTime });
            }

            // Como a CPU ficou ociosa, limpamos o contexto para não cobrar TTC no próximo processo 
            lastPID      = "";
            cameFromIdle = true;

            // Salta diretamente para o instante de chegada do próximo processo 
            let nextArrival = Infinity;
            for (let i = 0; i < n; i++) {
                if (remainingTime[i] > 0 && processes[i].ArrivalTime < nextArrival) {
                    nextArrival = processes[i].ArrivalTime;
                }
            }
            currentTime  = nextArrival;
            blockStart   = currentTime; // o próximo bloco começa aqui
            continue;
        }

        const p = processes[idx];

        // --- TROCA DE CONTEXTO POR PREEMPÇÃO ---
        // Ocorre quando o processo selecionado é DIFERENTE do que estava rodando antes.
        // Se viemos da ociosidade, o TTC NÃO é cobrado (contexto já foi limpo no repouso).
        if (p.PID !== lastPID) {
            // Fecha o bloco Gantt do processo anterior
            if (lastPID !== "" && blockStart < currentTime) {
                executionOrder.push({ PID: lastPID, Start: blockStart, End: currentTime });
            }

            // Aplica o TTC apenas em transição direta entre dois processos (não saindo da ociosidade)
            if (!cameFromIdle && lastPID !== "" && req.TTC > 0) {
                executionOrder.push({
                    PID  : "TTC",
                    Start: currentTime,
                    End  : currentTime + req.TTC
                });
                currentTime += req.TTC;

                // Após o TTC, a seleção pode mudar (novos processos podem ter chegado).
                // Recomeçamos o loop para garantir que o processo correto vença a CPU.
                blockStart = currentTime;
                lastPID    = ""; // força reavaliação sem cobrar TTC duplo
                continue;
            }

            // Inicia o novo bloco para o processo recém-selecionado
            lastPID      = p.PID;
            blockStart   = currentTime;
            cameFromIdle = false;
        }

        // --- EXECUÇÃO DE 1 TICK ---
        // O SRTF avança 1 unidade por vez para poder reavaliar preempções a cada instante
        remainingTime[idx]--;
        currentTime++;

        // --- TÉRMINO DO PROCESSO ---
        if (remainingTime[idx] === 0) {
            completed++;

            // Fecha o bloco Gantt do processo que acabou de terminar
            executionOrder.push({ PID: p.PID, Start: blockStart, End: currentTime });

            // --- MÉTRICAS  ---
            const turnaround = currentTime - p.ArrivalTime;
            const wait       = turnaround - p.BurstTime;
            totalTurnaroundTime += turnaround;
            totalWaitTime       += wait;
            metrics.push({ PID: p.PID, EffectiveTime: turnaround, WaitingTime: wait });

            // Mantemos lastPID com o PID do processo que terminou:
            // assim, se o próximo processo for diferente, o TTC será cobrado corretamente.
            // Mas NÃO zeramos cameFromIdle — a CPU não ficou ociosa, apenas o processo terminou.
            blockStart = currentTime; // atualizamos o início do próximo bloco potencial
        }
    }

    return {
        ExecutionOrder    : executionOrder,
        Metrics           : metrics,
        AvgWaitTime       : totalWaitTime / n,
        AvgTurnaroundTime : totalTurnaroundTime / n
    };
}

module.exports = { runSJFPreemptive };