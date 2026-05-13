function runSJFPreemptive(requisicao) {
    const processos = [];
    for (let i = 0; i < requisicao.Processes.length; i++) {
        processos.push(requisicao.Processes[i]);
    }

    const n = processos.length;
    const tempoRestante = [];
    for (let i = 0; i < n; i++) {
        tempoRestante.push(processos[i].BurstTime);
    }

    const ordemExecucao = [];
    const metricas = [];
    let tempoAtual = 0;
    let concluidos = 0;
    let somaEspera = 0;
    let somaTurnaround = 0;

    // Variáveis para controlar o desenho do gráfico de Gantt
    let ultimoPID = "";
    let inicioDoBloco = 0;

    // Flag para saber se a CPU estava parada
    let veioDeOciosidade = true;

    // Loop que roda enquanto houver processos para terminar
    while (concluidos < n) {
        
        // --- PASSO 1: Encontrar o processo com menor tempo restante ---
        let indiceEscolhido = -1;
        let menorTempo = Infinity;

        for (let i = 0; i < n; i++) {
            // O processo precisa ter chegado E ainda ter tempo para rodar
            if (processos[i].ArrivalTime <= tempoAtual && tempoRestante[i] > 0) {
                if (tempoRestante[i] < menorTempo) {
                    menorTempo = tempoRestante[i];
                    indiceEscolhido = i;
                }
                // Em caso de empate, o que chegou primeiro tem prioridade
                else if (tempoRestante[i] === menorTempo) {
                    if (processos[i].ArrivalTime < processos[indiceEscolhido].ArrivalTime) {
                        indiceEscolhido = i;
                    }
                }
            }
        }

        // --- PASSO 2: Se ninguém puder rodar agora, a CPU fica ociosa ---
        if (indiceEscolhido === -1) {
            // Se alguém estava rodando antes, fechamos o bloco dele no Gantt
            if (ultimoPID !== "" && inicioDoBloco < tempoAtual) {
                ordemExecucao.push({ PID: ultimoPID, Start: inicioDoBloco, End: tempoAtual });
            }

            ultimoPID = "";
            veioDeOciosidade = true;

            // Avançamos o tempo para a próxima chegada
            let proximaChegada = Infinity;
            for (let i = 0; i < n; i++) {
                if (tempoRestante[i] > 0 && processos[i].ArrivalTime < proximaChegada) {
                    proximaChegada = processos[i].ArrivalTime;
                }
            }
            tempoAtual = proximaChegada;
            inicioDoBloco = tempoAtual;
            continue;
        }

        const p = processos[indiceEscolhido];

        // --- PASSO 3: Lidar com a troca de processo (Preempção ou Início) ---
        if (p.PID !== ultimoPID) {
            
            // Fecha o bloco do processo anterior no Gantt
            if (ultimoPID !== "" && inicioDoBloco < tempoAtual) {
                ordemExecucao.push({ PID: ultimoPID, Start: inicioDoBloco, End: tempoAtual });
            }

            // Se mudou de processo e não veio de ociosidade, cobra TTC
            if (veioDeOciosidade === false && ultimoPID !== "" && requisicao.TTC > 0) {
                ordemExecucao.push({
                    PID: "TTC",
                    Start: tempoAtual,
                    End: tempoAtual + requisicao.TTC
                });
                tempoAtual = tempoAtual + requisicao.TTC;
                
                // Após o TTC, precisamos reavaliar quem deve rodar (novos processos podem ter chegado)
                inicioDoBloco = tempoAtual;
                ultimoPID = ""; 
                continue; 
            }

            // Começa um novo bloco para o novo processo
            ultimoPID = p.PID;
            inicioDoBloco = tempoAtual;
            veioDeOciosidade = false;
        }

        // --- PASSO 4: Executar 1 unidade de tempo (Tick) ---
        tempoRestante[indiceEscolhido]--;
        tempoAtual++;

        // --- PASSO 5: Se o processo terminou, calculamos as métricas ---
        if (tempoRestante[indiceEscolhido] === 0) {
            concluidos++;

            // Fecha o bloco no Gantt
            ordemExecucao.push({ PID: p.PID, Start: inicioDoBloco, End: tempoAtual });

            const turnaround = tempoAtual - p.ArrivalTime;
            const espera = turnaround - p.BurstTime;

            metricas.push({
                PID: p.PID,
                EffectiveTime: turnaround,
                WaitingTime: espera
            });

            somaTurnaround += turnaround;
            somaEspera += espera;

            // Prepara para o próximo bloco
            inicioDoBloco = tempoAtual;
        }
    }

    return {
        ExecutionOrder: ordemExecucao,
        Metrics: metricas,
        AvgWaitTime: somaEspera / n,
        AvgTurnaroundTime: somaTurnaround / n
    };
}

module.exports = { runSJFPreemptive };