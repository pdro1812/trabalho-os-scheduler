// backend/internal/handlers/handlers.js
const { runFCFS }             = require('../scheduler/fcfs.js');
const { runRoundRobin }       = require('../scheduler/rr.js');
const { runSJFNonPreemptive } = require('../scheduler/sjf.js');
const { runSJFPreemptive }    = require('../scheduler/sjf_preemptive.js');

/**
 * Converte o corpo da requisição (camelCase do React) para o formato
 * interno dos algoritmos (PascalCase).
 *
 * Esta separação garante que o front-end nunca precise conhecer os detalhes
 * internos dos algoritmos — é o padrão DTO (Data Transfer Object).
 */
function mapRequestToModel(data) {
    return {
        Algorithm : data.algorithm,
        Quantum   : data.quantum   || 0,
        TTC       : data.ttc       || 0,
        // Cada processo é mapeado individualmente; arrivalTime padrão 0
        // caso o front omita o campo (tolerância a entradas incompletas)
        Processes : (data.processes || []).map(p => ({
            PID        : p.pid,
            BurstTime  : p.burstTime,
            ArrivalTime: p.arrivalTime || 0
        }))
    };
}

/**
 * Converte a resposta dos algoritmos (PascalCase) de volta para camelCase,
 * que é o padrão esperado pelo React e pela convenção JSON do front-end.
 *
 * Mantemos o mapeamento explícito campo a campo para que qualquer
 * alteração futura nos algoritmos não vaze acidentalmente para o front.
 */
function mapResponseToDTO(response) {
    if (!response) return {};

    return {
        executionOrder: response.ExecutionOrder.map(e => ({
            pid  : e.PID,
            start: e.Start,
            end  : e.End
        })),
        metrics: response.Metrics.map(m => ({
            pid          : m.PID,
            effectiveTime: m.EffectiveTime,
            waitingTime  : m.WaitingTime
        })),
        avgWaitTime      : response.AvgWaitTime,
        avgTurnaroundTime: response.AvgTurnaroundTime
    };
}

/**
 * Handler principal — rota POST /api/simulate
 *
 * Recebe a configuração do front, roteia para o algoritmo correto
 * e devolve o resultado já formatado para o React.
 */
function simulateHandler(req, res) {
    try {
        // Converte o body camelCase para o modelo PascalCase dos algoritmos
        const simReq = mapRequestToModel(req.body);

        let result;

        // Roteamento para o algoritmo correto com base na string enviada pelo front.
        // Cada case aceita variações de nome para tolerância a entradas futuras.
        switch (simReq.Algorithm) {
            case 'FCFS':
                result = runFCFS(simReq);
                break;

            case 'SJF-NP':
            case 'SJF':
                result = runSJFNonPreemptive(simReq);
                break;

            case 'SJF-P':
            case 'SRTF':
                result = runSJFPreemptive(simReq);
                break;

            case 'RR':
            case 'RoundRobin':  
                result = runRoundRobin(simReq);
                break;

            default:
                // Retorna 400 com o valor recebido para facilitar o diagnóstico no front
                return res.status(400).json({
                    error: 'Algoritmo não suportado: ' + simReq.Algorithm
                });
        }

        // Converte a resposta PascalCase para camelCase antes de enviar ao React
        res.json(mapResponseToDTO(result));

    } catch (error) {
        console.error('[simulateHandler] Erro na simulação:', error);
        res.status(500).json({ error: 'Erro interno ao processar a simulação.' });
    }
}

module.exports = { simulateHandler };