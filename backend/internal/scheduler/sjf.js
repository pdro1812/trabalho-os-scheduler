function runSJFNonPreemptive(requisicao) {
    const processos = [];
    for (let i = 0; i < requisicao.Processes.length; i++) {
        processos.push(requisicao.Processes[i]);
    }

    const n = processos.length;
    const ordemExecucao = [];
    const metricas = [];
    let tempoAtual = 0;
    let processosConcluidos = 0;

    // Array para marcar quais processos já terminaram
    const concluido = new Array(n).fill(false);

    let somaEspera = 0;
    let somaTurnaround = 0;

    // Ajuda a saber se a CPU estava parada (ociosa)
    let veioDeOciosidade = true;

    while (processosConcluidos < n) {
        let indiceEscolhido = -1;
        let menorBurst = Infinity;

        // --- PASSO 1: Selecionar o próximo processo ---
        // Procuramos o processo que já chegou e tem o menor tempo de execução (BurstTime)
        for (let i = 0; i < n; i++) {
            // Só olhamos processos que ainda não terminaram E que já chegaram no tempo atual
            if (concluido[i] === false && processos[i].ArrivalTime <= tempoAtual) {

                // Critério: menor BurstTime
                if (processos[i].BurstTime < menorBurst) {
                    menorBurst = processos[i].BurstTime;
                    indiceEscolhido = i;
                } 
                // Se houver empate no BurstTime, escolhemos o que chegou primeiro
                else if (processos[i].BurstTime === menorBurst) {
                    if (processos[i].ArrivalTime < processos[indiceEscolhido].ArrivalTime) {
                        indiceEscolhido = i;
                    }
                }
            }
        }

        // --- PASSO 2: Executar o processo escolhido ---
        if (indiceEscolhido !== -1) {
            const p = processos[indiceEscolhido];

            // Se não veio de ociosidade, cobramos o tempo de troca de contexto (TTC)
            if (veioDeOciosidade === false && requisicao.TTC > 0) {
                ordemExecucao.push({
                    PID: "TTC",
                    Start: tempoAtual,
                    End: tempoAtual + requisicao.TTC
                });
                tempoAtual = tempoAtual + requisicao.TTC;
            }

            // Agora o processo roda até o fim (não-preemptivo)
            veioDeOciosidade = false;
            const inicio = tempoAtual;
            tempoAtual = tempoAtual + p.BurstTime;
            const fim = tempoAtual;

            ordemExecucao.push({
                PID: p.PID,
                Start: inicio,
                End: fim
            });

            // Calculamos as métricas
            const turnaround = fim - p.ArrivalTime;
            const espera = turnaround - p.BurstTime;

            metricas.push({
                PID: p.PID,
                EffectiveTime: turnaround,
                WaitingTime: espera
            });

            somaTurnaround += turnaround;
            somaEspera += espera;

            // Marcamos como concluído para não escolher ele de novo
            concluido[indiceEscolhido] = true;
            processosConcluidos++;

        } else {
            // --- PASSO 3: Lidar com a ociosidade ---
            // Se nenhum processo chegou ainda, avançamos o tempo para a chegada do próximo processo
            let proximaChegada = Infinity;
            for (let i = 0; i < n; i++) {
                if (concluido[i] === false && processos[i].ArrivalTime < proximaChegada) {
                    proximaChegada = processos[i].ArrivalTime;
                }
            }

            tempoAtual = proximaChegada;
            veioDeOciosidade = true;
        }
    }

    return {
        ExecutionOrder: ordemExecucao,
        Metrics: metricas,
        AvgWaitTime: somaEspera / n,
        AvgTurnaroundTime: somaTurnaround / n
    };
}

module.exports = { runSJFNonPreemptive };