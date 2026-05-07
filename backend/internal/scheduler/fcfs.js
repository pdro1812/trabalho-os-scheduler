/**
 * FCFS – First Come, First Served (Não Preemptivo)
 * Regra fundamental: quem chega primeiro, executa primeiro.
 */

function runFCFS(req) {
    // Cria uma cópia rasa para não mutar os dados originais da requisição
    const processes = [...req.Processes];

    // Ordena por ArrivalTime. 
    // então empates mantêm a ordem original do array 
    processes.sort((a, b) => a.ArrivalTime - b.ArrivalTime);

    const executionOrder = [];
    const metrics       = [];
    let currentTime     = 0;
    let totalWaitTime   = 0;
    let totalTurnaroundTime = 0;

    // Flag que registra se a CPU esteve ociosa antes deste processo.
    // Quando verdadeira, o TTC NÃO é cobrado
    let cameFromIdle = true;

    processes.forEach((p, i) => {
        // --- OCIOSIDADE ---
        // Se nenhum processo está disponível, a CPU fica parada.
        // Avançamos o tempo diretamente para a chegada do próximo processo.
        if (currentTime < p.ArrivalTime) {
            // Como a CPU ficou ociosa, limpamos o contexto para não cobrar TTC na chegada do próximo processo
            currentTime  = p.ArrivalTime;
            cameFromIdle = true; // sinaliza que voltamos do repouso
        }

        // --- TROCA DE CONTEXTO ---
        // O TTC só é cobrado em transição DIRETA entre dois processos diferentes.
        // Se viemos da ociosidade, o contexto já foi "limpo" no repouso, então pulamos o TTC
        if (i > 0 && !cameFromIdle && req.TTC > 0) {
            executionOrder.push({
                PID  : "TTC",
                Start: currentTime,
                End  : currentTime + req.TTC
            });
            currentTime += req.TTC;
        }

        // Após inserir (ou não) o TTC, a CPU está pronta para executar o processo
        cameFromIdle = false;

        // --- EXECUÇÃO ---
        const start = currentTime;
        currentTime += p.BurstTime;
        const end = currentTime;

        executionOrder.push({ PID: p.PID, Start: start, End: end });

        // --- MÉTRICAS ---
        // Turnaround = Tempo de Término - Tempo de Chegada
        const turnaround = end - p.ArrivalTime;
        // Espera = Turnaround - Burst Time original
        const wait = turnaround - p.BurstTime;

        metrics.push({ PID: p.PID, EffectiveTime: turnaround, WaitingTime: wait });
        totalTurnaroundTime += turnaround;
        totalWaitTime       += wait;
    });

    const n = processes.length;
    return {
        ExecutionOrder     : executionOrder,
        Metrics            : metrics,
        AvgWaitTime        : totalWaitTime / n,
        AvgTurnaroundTime  : totalTurnaroundTime / n
    };
}

module.exports = { runFCFS };