/**
 * Round Robin (RR)
 * Cada processo recebe uma fatia de tempo (Quantum) em rodízio circular.
 * É o algoritmo mais justo para sistemas de tempo compartilhado.
 */
function runRoundRobin(req) {
    // Cria uma cópia para não mutar os dados originais da requisição
    const processes = [...req.Processes];

    // Ordena por ArrivalTime para processarmos chegadas em ordem cronológica.
    // Sort estável garante desempate por posição original (Regra 3).
    processes.sort((a, b) => a.ArrivalTime - b.ArrivalTime);

    const n             = processes.length;
    const remainingTime = processes.map(p => p.BurstTime);
    const executionOrder    = [];
    const metrics           = [];
    let currentTime         = 0;
    let completed           = 0;
    let totalWaitTime       = 0;
    let totalTurnaroundTime = 0;

    // Fila de prontos: armazena os ÍNDICES dos processos aguardando a CPU
    const queue     = [];
    let arrivalIdx  = 0; // ponteiro para o próximo processo a chegar (no array ordenado)

    // Flag de ociosidade: quando verdadeira, o próximo processo não paga TTC
    let cameFromIdle = true;
    // PID do último processo que usou a CPU — usado para detectar troca de contexto
    let lastPID = "";

    /**
     * Verifica chegadas: adiciona à fila de prontos todos os processos
     * cujo ArrivalTime <= currentTime e que ainda não foram enfileirados.
     * Chamada após cada evento relevante (fim de quantum, fim de processo, TTC).
     */
    const checkArrivals = () => {
        while (arrivalIdx < n && processes[arrivalIdx].ArrivalTime <= currentTime) {
            queue.push(arrivalIdx);
            arrivalIdx++;
        }
    };

    // Enfileira os processos que chegam no instante inicial (t = 0)
    checkArrivals();

    while (completed < n) {
        // --- OCIOSIDADE ---
        // Se a fila está vazia, a CPU fica parada até o próximo processo chegar .
        if (queue.length === 0) {
            if (arrivalIdx < n) {
                // Como a CPU ficou ociosa, limpamos o contexto para não cobrar TTC no próximo processo
                cameFromIdle = true;
                lastPID      = "";
                currentTime  = processes[arrivalIdx].ArrivalTime;
                checkArrivals();
            }
            continue;
        }

        // Retira o primeiro processo da fila de prontos
        const idx = queue.shift();
        const p   = processes[idx];

        // --- TROCA DE CONTEXTO ---
        // Cobrado apenas em transição DIRETA entre dois processos DIFERENTES.
        // Saída da ociosidade NÃO cobra TTC (contexto já limpo no repouso).
        if (!cameFromIdle && lastPID !== "" && lastPID !== p.PID && req.TTC > 0) {
            executionOrder.push({
                PID  : "TTC",
                Start: currentTime,
                End  : currentTime + req.TTC
            });
            currentTime += req.TTC;

            // Verifica se novos processos chegaram DURANTE o TTC (podem entrar na fila)
            checkArrivals();
        }

        // CPU está pronta para executar: resetamos a flag de ociosidade
        cameFromIdle = false;

        // --- CÁLCULO DA FATIA DE TEMPO ---
        // O processo roda pelo Quantum ou pelo que ainda resta, o que for menor
        const runTime = Math.min(req.Quantum, remainingTime[idx]);

        const start = currentTime;
        currentTime += runTime;
        remainingTime[idx] -= runTime;

        executionOrder.push({ PID: p.PID, Start: start, End: currentTime });
        lastPID = p.PID;

        // --- CHEGADAS DURANTE A EXECUÇÃO ---
        // Processos que chegaram ENQUANTO este processo rodava entram na fila AGORA,
        // ANTES de recolocarmos o processo preemptado.
        // Isso garante o padrão POSIX: novos chegantes têm prioridade sobre o preemptado.
        checkArrivals();

        if (remainingTime[idx] === 0) {
            // --- TÉRMINO DO PROCESSO ---
            completed++;
            const turnaround = currentTime - p.ArrivalTime;
            const wait       = turnaround - p.BurstTime;
            totalTurnaroundTime += turnaround;
            totalWaitTime       += wait;
            metrics.push({ PID: p.PID, EffectiveTime: turnaround, WaitingTime: wait });

        } else {
            // --- QUANTUM EXPIRADO (PREEMPÇÃO) ---
            // O processo ainda tem tempo restante: volta para o FINAL da fila.
            // Os novos chegantes (checkArrivals acima) já estão na fila,
            // portanto vão na frente do preemptado .

            // Caso especial: se o processo é o ÚNICO no sistema (fila vazia após checkArrivals),
            // ele volta à CPU sem pagar TTC — não há troca de contexto real.
            if (queue.length === 0) {
                // Sinaliza que é o mesmo processo continuando: não cobra TTC no próximo ciclo
                lastPID = p.PID; // já está setado, mas explicitamos para clareza
            }

            queue.push(idx);
        }
    }

    return {
        ExecutionOrder    : executionOrder,
        Metrics           : metrics,
        AvgWaitTime       : totalWaitTime / n,
        AvgTurnaroundTime : totalTurnaroundTime / n
    };
}

module.exports = { runRoundRobin };