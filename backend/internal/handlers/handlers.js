// Importamos os algoritmos de escalonamento
const { runFCFS }             = require('../scheduler/fcfs.js');
const { runRoundRobin }       = require('../scheduler/rr.js');
const { runSJFNonPreemptive } = require('../scheduler/sjf.js');
const { runSJFPreemptive }    = require('../scheduler/sjf_preemptive.js');

// Função que transforma os dados que vêm do front-end (React)
// O front usa nomes como 'algorithm', o back interno usa 'Algorithm'
function prepararDadosParaAlgoritmo(dadosDoFront) {
    const processosFormatados = [];
    
    // Usamos um loop simples para copiar cada processo
    const processosEntrada = dadosDoFront.processes || [];
    for (let i = 0; i < processosEntrada.length; i++) {
        const p = processosEntrada[i];
        processosFormatados.push({
            PID: p.pid,
            BurstTime: p.burstTime,
            ArrivalTime: p.arrivalTime || 0
        });
    }

    return {
        Algorithm: dadosDoFront.algorithm,
        Quantum: dadosDoFront.quantum || 0,
        TTC: dadosDoFront.ttc || 0,
        Processes: processosFormatados
    };
}

// Função que transforma o resultado dos algoritmos de volta para o front-end
function prepararRespostaParaFront(resultadoInterno) {
    if (!resultadoInterno) {
        return {};
    }

    // Formatamos a ordem de execução (Gantt)
    const ordemExecucao = [];
    for (let i = 0; i < resultadoInterno.ExecutionOrder.length; i++) {
        const e = resultadoInterno.ExecutionOrder[i];
        ordemExecucao.push({
            pid: e.PID,
            start: e.Start,
            end: e.End
        });
    }

    // Formatamos as métricas de cada processo
    const metricas = [];
    for (let i = 0; i < resultadoInterno.Metrics.length; i++) {
        const m = resultadoInterno.Metrics[i];
        metricas.push({
            pid: m.PID,
            effectiveTime: m.EffectiveTime,
            waitingTime: m.WaitingTime
        });
    }

    // Retornamos o objeto final como o front espera
    return {
        executionOrder: ordemExecucao,
        metrics: metricas,
        avgWaitTime: resultadoInterno.AvgWaitTime,
        avgTurnaroundTime: resultadoInterno.AvgTurnaroundTime
    };
}

// Esta é a função que o servidor chama quando recebe um POST em /api/simulate
function simulateHandler(req, res) {
    try {
        // 1. Preparamos os dados
        const requisicao = prepararDadosParaAlgoritmo(req.body);

        let resultado;

        // 2. Escolhemos qual algoritmo rodar
        const nomeAlgoritmo = requisicao.Algorithm;

        if (nomeAlgoritmo === 'FCFS') {
            resultado = runFCFS(requisicao);
        } 
        else if (nomeAlgoritmo === 'SJF' || nomeAlgoritmo === 'SJF-NP') {
            resultado = runSJFNonPreemptive(requisicao);
        } 
        else if (nomeAlgoritmo === 'SJF-P' || nomeAlgoritmo === 'SRTF') {
            resultado = runSJFPreemptive(requisicao);
        } 
        else if (nomeAlgoritmo === 'RR' || nomeAlgoritmo === 'RoundRobin') {
            resultado = runRoundRobin(requisicao);
        } 
        else {
            // Se o nome não bater com nenhum, avisamos que deu erro
            return res.status(400).json({
                error: 'Algoritmo não reconhecido: ' + nomeAlgoritmo
            });
        }

        // 3. Enviamos a resposta formatada de volta
        const respostaFinal = prepararRespostaParaFront(resultado);
        res.json(respostaFinal);

    } catch (erro) {
        console.error('Erro na simulação:', erro);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
}

module.exports = { simulateHandler };