import React, { useState } from 'react';
import api from './services/api';
import ProcessForm  from './components/ProcessForm';
import GanttChart   from './components/GanttChart';
import ProcessTable from './components/ProcessTable';

/**
 * App – Componente raiz do Simulador de Escalonamento de CPU.
 *
 * MAPEAMENTO DE CAMPOS — fluxo completo:
 *
 *  Front (camelCase) ──► handlers.js/mapRequestToModel ──► Algoritmos (PascalCase)
 *  Algoritmos (PascalCase) ──► handlers.js/mapResponseToDTO ──► Front (camelCase)
 *
 * O backend SEMPRE devolve camelCase para o front:
 *   { executionOrder, metrics, avgWaitTime, avgTurnaroundTime }
 *   executionOrder[i]: { pid, start, end }
 *   metrics[i]:        { pid, waitingTime, effectiveTime }
 *
 * GanttChart e ProcessTable recebem esses dados já em camelCase.
 */

// Injeta o keyframe de loading uma única vez (evita duplicar a cada render)
const injectSpinKeyframe = () => {
  if (document.getElementById('cpu-sim-spin')) return;
  const style = document.createElement('style');
  style.id = 'cpu-sim-spin';
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
};
injectSpinKeyframe();

const ALGORITHM_LABELS = {
  'FCFS'  : 'FCFS – First-Come, First-Served',
  'SJF-NP': 'SJF – Não Preemptivo',
  'SJF-P' : 'SJF – Preemptivo (SRTF)',
  'RR'    : 'Round Robin',
};

function App() {
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [lastAlgo, setLastAlgo] = useState('');

  const handleSimulate = async (payload) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setLastAlgo(payload.algorithm); // camelCase — vem do ProcessForm

    try {
      // payload em camelCase — handlers.js converte internamente
      const response = await api.post('/simulate', payload);
      // response.data já vem em camelCase (mapResponseToDTO)
      setResult(response.data);
    } catch (err) {
      console.error('[Simulador] Erro:', err);
      const msg = err.response
        ? `Backend retornou ${err.response.status}: ${err.response.data?.error ?? 'erro desconhecido'}.`
        : 'Não foi possível conectar ao backend. Verifique se o servidor está rodando na porta 8080.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#f1f5f9',
      padding: '2rem 1rem',
      fontFamily: '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* ── Cabeçalho ── */}
        <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            backgroundColor: '#1e3a8a', color: '#ffffff',
            padding: '6px 18px', borderRadius: '999px',
            fontSize: '0.78rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px',
          }}>
            ⚙️ Sistemas Operacionais
          </div>
          <h1 style={{
            color: '#0f172a', margin: '0 0 8px 0',
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.02em',
          }}>
            Simulador de Escalonamento de CPU
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
            FCFS · SJF Não-Preemptivo · SJF Preemptivo (SRTF) · Round Robin
          </p>
        </header>

        {/* ── Formulário ── */}
        <ProcessForm onSimulate={handleSimulate} />

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: 'center', marginTop: '3rem', color: '#475569', fontWeight: 500 }}>
            <span style={{ fontSize: '2rem', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>
              ⚙️
            </span>
            <p style={{ marginTop: '8px' }}>Processando simulação no backend…</p>
          </div>
        )}

        {/* ── Erro ── */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2', color: '#991b1b',
            padding: '1rem 1.25rem', borderRadius: '8px',
            marginTop: '2rem', border: '1px solid #fca5a5',
            fontWeight: 500, lineHeight: 1.5,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Resultado ── */}
        {result && !loading && (
          <div style={{
            marginTop: '2.5rem', backgroundColor: '#ffffff',
            borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '2rem',
          }}>
            <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
              <h2 style={{ color: '#0f172a', margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 700 }}>
                Relatório de Execução
              </h2>
              <span style={{
                fontSize: '0.8rem', fontWeight: 600, color: '#1e40af',
                backgroundColor: '#dbeafe', padding: '3px 10px', borderRadius: '999px',
              }}>
                {ALGORITHM_LABELS[lastAlgo] ?? lastAlgo}
              </span>
            </div>

            {/*
             * GanttChart recebe executionOrder em camelCase: [{ pid, start, end }]
             * ProcessTable recebe metrics em camelCase: [{ pid, waitingTime, effectiveTime }]
             * e averages também em camelCase: { avgWaitTime, avgTurnaroundTime }
             * — tudo exatamente como o mapResponseToDTO do backend entrega.
             */}
            <GanttChart executionOrder={result.executionOrder} />

            <ProcessTable
              metrics={result.metrics}
              averages={{
                avgWaitTime      : result.avgWaitTime,
                avgTurnaroundTime: result.avgTurnaroundTime,
              }}
            />
          </div>
        )}

        <footer style={{ textAlign: 'center', marginTop: '3rem', color: '#94a3b8', fontSize: '0.78rem' }}>
          Trabalho Acadêmico — Sistemas Operacionais
        </footer>

      </div>
    </div>
  );
}

export default App;