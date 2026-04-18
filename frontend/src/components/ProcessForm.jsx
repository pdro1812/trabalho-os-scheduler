import React, { useState } from 'react';

const ProcessForm = ({ onSimulate }) => {
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [quantum, setQuantum] = useState(2);
  const [ttc, setTtc] = useState(1);
  const [processes, setProcesses] = useState([
    { pid: 'P1', burstTime: 5, arrivalTime: 0 }
  ]);

  const addProcess = () => {
    const nextPid = `P${processes.length + 1}`;
    setProcesses([...processes, { pid: nextPid, burstTime: 1, arrivalTime: 0 }]);
  };

  const updateProcess = (index, field, value) => {
    const newProcs = [...processes];
    newProcs[index][field] = Number(value);
    setProcesses(newProcs);
  };

  const removeProcess = (index) => {
    const newProcs = processes.filter((_, i) => i !== index);
    setProcesses(newProcs);
  };

  // Botão 1: Caos (Aleatório)
  const generateRandom = () => {
    const count = Math.floor(Math.random() * 5) + 4; 
    const randomProcs = Array.from({ length: count }, (_, i) => ({
      pid: `P${i + 1}`,
      burstTime: Math.floor(Math.random() * 10) + 1,
      arrivalTime: Math.floor(Math.random() * 5) 
    }));
    setProcesses(randomProcs);
  };

  // Botão 2: O Cenário de Prova (Perfeito para o Professor corrigir)
  const generateProfessorTest = () => {
    setAlgorithm('RR'); // Já seta RR como padrão pra mostrar fragmentação
    setQuantum(3);
    setTtc(1);
    setProcesses([
      { pid: 'P1', burstTime: 8, arrivalTime: 0 },
      { pid: 'P2', burstTime: 4, arrivalTime: 1 },
      { pid: 'P3', burstTime: 9, arrivalTime: 2 },
      { pid: 'P4', burstTime: 5, arrivalTime: 3 }
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSimulate({
      algorithm,
      quantum: algorithm === 'RR' ? Number(quantum) : 0,
      ttc: Number(ttc),
      processes
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      padding: '2rem', 
      backgroundColor: '#ffffff', 
      borderRadius: '12px', 
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' 
    }}>
      
      {/* Linha de Configurações Globais */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Política de Escalonamento:</label>
          <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb' }}>
            <option value="FCFS">FCFS (First-Come, First-Served)</option>
            <option value="SJF-NP">SJF (Não Preemptivo)</option>
            <option value="SJF-P">SJF (Preemptivo / SRTF)</option>
            <option value="RR">Round Robin</option>
          </select>
        </div>
        
        {algorithm === 'RR' && (
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Quantum:</label>
            <input type="number" min="1" value={quantum} onChange={(e) => setQuantum(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>
        )}

        <div style={{ flex: '1 1 100px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>TTC (Segundos):</label>
          <input type="number" min="0" value={ttc} onChange={(e) => setTtc(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: '1.5rem' }} />

      {/* Cabeçalho da Lista de Processos e Botões Geradores */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0, color: '#111827' }}>Fila de Processos</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={generateProfessorTest} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', transition: 'background 0.2s' }}>
            🎓 Cenário de Prova
          </button>
          <button type="button" onClick={generateRandom} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500' }}>
            🎲 Aleatório
          </button>
          <button type="button" onClick={addProcess} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500' }}>
            + Adicionar
          </button>
        </div>
      </div>

      {/* Lista de Processos */}
      {processes.map((p, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '15px', marginBottom: '12px', alignItems: 'center', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ width: '60px', textAlign: 'center', fontWeight: 'bold', color: '#4b5563', backgroundColor: '#e5e7eb', padding: '6px', borderRadius: '4px' }}>
            {p.pid}
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: '500' }}>Chegada:</label>
            <input type="number" min="0" value={p.arrivalTime} onChange={(e) => updateProcess(idx, 'arrivalTime', e.target.value)} style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: '500' }}>Tempo (Burst):</label>
            <input type="number" min="1" value={p.burstTime} onChange={(e) => updateProcess(idx, 'burstTime', e.target.value)} style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          </div>
          <button type="button" onClick={() => removeProcess(idx)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', padding: '0 10px' }} title="Remover processo">
            ×
          </button>
        </div>
      ))}

      {/* Botão Principal de Simulação */}
      <button type="submit" style={{ 
        width: '100%', 
        padding: '14px', 
        marginTop: '2rem', 
        backgroundColor: '#2563eb', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        fontSize: '1.1rem', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)',
        transition: 'transform 0.1s, background 0.2s'
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
      onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
      onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
      onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
      >
        🚀 Iniciar Simulação na CPU
      </button>
    </form>
  );
};

export default ProcessForm;