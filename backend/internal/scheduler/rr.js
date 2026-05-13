function runRoundRobin(requisicao) {
    const processos = [];
    for (let i = 0; i < requisicao.Processes.length; i++) {
        processos.push(requisicao.Processes[i]);
    }

    // Ordenamos por tempo de chegada para saber quem entra primeiro na fila
    processos.sort((a, b) => a.ArrivalTime - b.ArrivalTime);

    const n = processos.length;
    const tempoRestante = [];
    for (let i = 0; i < n; i++) {
        tempoRestante.push(processos[i].BurstTime);
    }

    const ordemExecucao = [];
    const metricas = [];
    let tempoAtual = 0;
    let concluídos = 0;
    let somaEspera = 0;
    let somaTurnaround = 0;

    // Fila de prontos (guarda os índices dos processos)
    const fila = [];
    let proximoChegando = 0;

    // Controle de troca de contexto
    let veioDeOciosidade = true;
    let ultimoPID = "";

    // Função simples para colocar na fila quem acabou de chegar
    function checarChegadas() {
        while (proximoChegando < n && processos[proximoChegando].ArrivalTime <= tempoAtual) {
            fila.push(proximoChegando);
            proximoChegando++;
        }
    }

    // Começamos checando quem chega no tempo 0
    checarChegadas();

    while (concluídos < n) {
        
        // Se a fila estiver vazia, a CPU fica ociosa
        if (fila.length === 0) {
            if (proximoChegando < n) {
                tempoAtual = processos[proximoChegando].ArrivalTime;
                veioDeOciosidade = true;
                ultimoPID = "";
                checarChegadas();
            }
            continue;
        }

        // Tiramos o primeiro processo da fila
        const indice = fila.shift();
        const p = processos[indice];

        // --- TROCA DE CONTEXTO ---
        // Se mudou o processo e não veio de ociosidade, cobra TTC
        if (veioDeOciosidade === false && ultimoPID !== "" && ultimoPID !== p.PID && requisicao.TTC > 0) {
            ordemExecucao.push({
                PID: "TTC",
                Start: tempoAtual,
                End: tempoAtual + requisicao.TTC
            });
            tempoAtual = tempoAtual + requisicao.TTC;
            
            // Durante o TTC, outros processos podem ter chegado
            checarChegadas();
        }

        veioDeOciosidade = false;

        // --- EXECUÇÃO (QUANTUM) ---
        // O processo roda o valor do Quantum OU o que resta dele (o que for menor)
        const tempoParaRodar = Math.min(requisicao.Quantum, tempoRestante[indice]);

        const inicio = tempoAtual;
        tempoAtual = tempoAtual + tempoParaRodar;
        tempoRestante[indice] = tempoRestante[indice] - tempoParaRodar;

        ordemExecucao.push({
            PID: p.PID,
            Start: inicio,
            End: tempoAtual
        });
        ultimoPID = p.PID;

        // --- CHECAR NOVAS CHEGADAS ---
        // Importante: quem chega enquanto o processo rodava entra na fila ANTES
        // de quem foi interrompido pelo Quantum (preemptado)
        checarChegadas();

        if (tempoRestante[indice] === 0) {
            // Processo terminou
            concluídos++;
            const turnaround = tempoAtual - p.ArrivalTime;
            const espera = turnaround - p.BurstTime;

            metricas.push({
                PID: p.PID,
                EffectiveTime: turnaround,
                WaitingTime: espera
            });

            somaTurnaround += turnaround;
            somaEspera += espera;
        } else {
            // Processo ainda tem tempo, volta para o fim da fila
            fila.push(indice);
        }
    }

    return {
        ExecutionOrder: ordemExecucao,
        Metrics: metricas,
        AvgWaitTime: somaEspera / n,
        AvgTurnaroundTime: somaTurnaround / n
    };
}

module.exports = { runRoundRobin };