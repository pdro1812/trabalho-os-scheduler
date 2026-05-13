function runFCFS(requisicao) {
    // Pegamos a lista de processos da requisição
    const processos = [];
    for (let i = 0; i < requisicao.Processes.length; i++) {
        processos.push(requisicao.Processes[i]);
    }

    // Primeiro, ordenamos os processos por tempo de chegada (ArrivalTime)
    processos.sort((a, b) => a.ArrivalTime - b.ArrivalTime);

    const ordemExecucao = [];
    const metricas = [];
    let tempoAtual = 0;
    let somaEspera = 0;
    let somaTurnaround = 0;

    // Esta variável ajuda a saber se a CPU acabou de sair de um estado parada
    let veioDeOciosidade = true;

    for (let i = 0; i < processos.length; i++) {
        const p = processos[i];

        // Se o processo ainda não chegou, a CPU fica ociosa (parada)
        if (tempoAtual < p.ArrivalTime) {
            tempoAtual = p.ArrivalTime;
            veioDeOciosidade = true;
        }

        // Se NÃO veio de ociosidade e existe um tempo de troca de contexto (TTC)
        // Adicionamos esse tempo antes de começar o processo
        if (i > 0 && veioDeOciosidade === false && requisicao.TTC > 0) {
            ordemExecucao.push({
                PID: "TTC",
                Start: tempoAtual,
                End: tempoAtual + requisicao.TTC
            });
            tempoAtual = tempoAtual + requisicao.TTC;
        }

        // Agora o processo vai rodar
        veioDeOciosidade = false;
        const inicio = tempoAtual;
        tempoAtual = tempoAtual + p.BurstTime;
        const fim = tempoAtual;

        // Registramos a execução no gráfico de Gantt
        ordemExecucao.push({
            PID: p.PID,
            Start: inicio,
            End: fim
        });

        // Calculamos as métricas deste processo
        // Turnaround: quanto tempo o processo ficou no sistema (do início até o fim)
        const turnaround = fim - p.ArrivalTime;
        // Espera: tempo total no sistema menos o tempo que ele realmente rodou
        const espera = turnaround - p.BurstTime;

        metricas.push({
            PID: p.PID,
            EffectiveTime: turnaround,
            WaitingTime: espera
        });

        somaTurnaround += turnaround;
        somaEspera += espera;
    }

    // Calculamos as médias finais
    const totalProcessos = processos.length;
    return {
        ExecutionOrder: ordemExecucao,
        Metrics: metricas,
        AvgWaitTime: somaEspera / totalProcessos,
        AvgTurnaroundTime: somaTurnaround / totalProcessos
    };
}

module.exports = { runFCFS };