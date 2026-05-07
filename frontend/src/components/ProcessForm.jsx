import React, { useState } from 'react';

/**
 * ProcessForm – Formulário de entrada para configuração da simulação.
 *
 * CONTRATO DE DADOS COM O BACKEND (handlers.js):
 * O backend espera camelCase: { algorithm, quantum, ttc, processes: [{pid, burstTime, arrivalTime}] }
 * O mapRequestToModel() do handlers.js converte para PascalCase internamente.
 * Portanto, enviamos camelCase diretamente — o estado interno já é o payload correto.
 */
const ProcessForm = ({ onSimulate }) => {
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [quantum,   setQuantum]   = useState(3);
  const [ttc,       setTtc]       = useState(1);
  const [processes, setProcesses] = useState([
    { pid: 'P1', burstTime: 8, arrivalTime: 0 },
    { pid: 'P2', burstTime: 4, arrivalTime: 1 },
    { pid: 'P3', burstTime: 9, arrivalTime: 2 },
    { pid: 'P4', burstTime: 5, arrivalTime: 3 },
  ]);

  // ── Manipulação da lista ──────────────────────────────────────────────────

  const addProcess = () => {
    setProcesses([...processes, { pid: `P${processes.length + 1}`, burstTime: 4, arrivalTime: 0 }]);
  };

  const removeProcess = (index) => {
    if (processes.length === 1) return;
    setProcesses(processes.filter((_, i) => i !== index));
  };

  const updateProcess = (index, field, rawValue) => {
    const updated = [...processes];
    if (field === 'pid') {
      updated[index] = { ...updated[index], pid: rawValue };
    } else {
      const value = Math.max(field === 'burstTime' ? 1 : 0, Number(rawValue));
      updated[index] = { ...updated[index], [field]: value };
    }
    setProcesses(updated);
  };

  // ── Geradores de Cenários ─────────────────────────────────────────────────

  const generateRandom = () => {
    const count = Math.floor(Math.random() * 4) + 3;
    setProcesses(Array.from({ length: count }, (_, i) => ({
      pid        : `P${i + 1}`,
      burstTime  : Math.floor(Math.random() * 9) + 1,
      arrivalTime: Math.floor(Math.random() * 6),
    })));
  };

  /** Cenário clássico de prova: ideal para corrigir manualmente com RR Q=3 */
  const generateProfessorTest = () => {
    setAlgorithm('RR');
    setQuantum(3);
    setTtc(1);
    setProcesses([
      { pid: 'P1', burstTime: 8, arrivalTime: 0 },
      { pid: 'P2', burstTime: 4, arrivalTime: 1 },
      { pid: 'P3', burstTime: 9, arrivalTime: 2 },
      { pid: 'P4', burstTime: 5, arrivalTime: 3 },
    ]);
  };

  // ── Submit: estado interno já é camelCase — contrato exato do handlers.js ─

  const handleSubmit = (e) => {
    e.preventDefault();
    // handlers.js lê: data.algorithm, data.quantum, data.ttc
    // e data.processes[i].pid, .burstTime, .arrivalTime
    onSimulate({
      algorithm,
      quantum   : algorithm === 'RR' ? Number(quantum) : 0,
      ttc       : Number(ttc),
      processes,          // [{ pid, burstTime, arrivalTime }] — já no formato certo
    });
  };

  // ── Estilos ───────────────────────────────────────────────────────────────

  const inputStyle = {
    width: '100%', padding: '9px 11px', borderRadius: '6px',
    border: '1px solid #cbd5e1', backgroundColor: '#f8fafc',
    fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block', marginBottom: '6px', fontWeight: 600,
    color: '#374151', fontSize: '0.85rem',
  };

  return (
    <form onSubmit={handleSubmit} style={{
      padding: '2rem', backgroundColor: '#ffffff',
      borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    }}>

      {/* ── Configurações Globais ── */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 220px' }}>
          <label style={labelStyle}>Política de Escalonamento:</label>
          <select value={algorithm} onChange={e => setAlgorithm(e.target.value)} style={inputStyle}>
            <option value="FCFS">FCFS – First-Come, First-Served</option>
            <option value="SJF-NP">SJF – Não Preemptivo</option>
            <option value="SJF-P">SJF – Preemptivo (SRTF)</option>
            <option value="RR">Round Robin</option>
          </select>
        </div>

        {algorithm === 'RR' && (
          <div style={{ flex: '1 1 100px' }}>
            <label style={labelStyle}>Quantum (ms):</label>
            <input type="number" min="1" value={quantum}
              onChange={e => setQuantum(e.target.value)} style={inputStyle} />
          </div>
        )}

        <div style={{ flex: '1 1 100px' }}>
          <label style={labelStyle}>TTC (ms):</label>
          <input type="number" min="0" value={ttc}
            onChange={e => setTtc(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: '1.5rem' }} />

      {/* ── Cabeçalho + Botões ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px',
      }}>
        <h3 style={{ margin: 0, color: '#111827', fontSize: '1rem' }}>
          Fila de Processos ({processes.length})
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" onClick={generateProfessorTest}
            title="4 processos, RR Q=3, TTC=1 — ideal para corrigir manualmente"
            style={{ padding: '8px 14px', cursor: 'pointer', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem' }}>
            📋 Cenário do Professor
          </button>
          <button type="button" onClick={generateRandom}
            style={{ padding: '8px 14px', cursor: 'pointer', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem' }}>
            🎲 Aleatório
          </button>
          <button type="button" onClick={addProcess} disabled={processes.length >= 10}
            style={{ padding: '8px 14px', cursor: processes.length >= 10 ? 'not-allowed' : 'pointer', backgroundColor: processes.length >= 10 ? '#9ca3af' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem' }}>
            + Adicionar
          </button>
        </div>
      </div>

      {/* Cabeçalho das colunas */}
      <div style={{
        display: 'grid', gridTemplateColumns: '60px 1fr 1fr 36px',
        gap: '10px', padding: '6px 10px',
        fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8',
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
        <span>PID</span><span>Chegada (ms)</span><span>Burst (ms)</span><span />
      </div>

      {/* ── Lista de Processos ── */}
      {processes.map((p, idx) => (
        <div key={idx} style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 1fr 36px',
          gap: '10px', marginBottom: '8px', alignItems: 'center',
          backgroundColor: '#f8fafc', padding: '8px 10px',
          borderRadius: '8px', border: '1px solid #e2e8f0',
        }}>
          <div style={{
            textAlign: 'center', fontWeight: 700, color: '#1e3a8a',
            backgroundColor: '#dbeafe', padding: '6px 4px',
            borderRadius: '6px', fontSize: '0.85rem',
          }}>
            {p.pid}
          </div>

          <input type="number" min="0" value={p.arrivalTime}
            onChange={e => updateProcess(idx, 'arrivalTime', e.target.value)}
            style={inputStyle} />

          <input type="number" min="1" value={p.burstTime}
            onChange={e => updateProcess(idx, 'burstTime', e.target.value)}
            style={inputStyle} />

          <button type="button" onClick={() => removeProcess(idx)}
            disabled={processes.length === 1} title="Remover processo"
            style={{
              color: processes.length === 1 ? '#d1d5db' : '#ef4444',
              border: 'none', background: 'none',
              cursor: processes.length === 1 ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: '1.3rem', lineHeight: 1, padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            ×
          </button>
        </div>
      ))}

      {/* ── Botão Principal ── */}
      <button type="submit" style={{
        width: '100%', padding: '13px', marginTop: '1.5rem',
        backgroundColor: '#1e3a8a', color: 'white', border: 'none',
        borderRadius: '8px', fontSize: '1rem', cursor: 'pointer',
        fontWeight: 700, letterSpacing: '0.03em',
        boxShadow: '0 4px 12px rgba(30,58,138,0.35)',
        transition: 'background 0.15s, transform 0.1s',
      }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e40af'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1e3a8a'}
        onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
      >
        🚀 Simular Escalonamento
      </button>
    </form>
  );
};

export default ProcessForm;