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

  // O seu diferencial: Botão para o professor não perder tempo
  const generateRandom = () => {
    const count = Math.floor(Math.random() * 5) + 4; // Gera entre 4 e 8 processos
    const randomProcs = Array.from({ length: count }, (_, i) => ({
      pid: `P${i + 1}`,
      burstTime: Math.floor(Math.random() * 10) + 1,
      arrivalTime: Math.floor(Math.random() * 5) // Chegadas diferentes para testar preempção
    }));
    setProcesses(randomProcs);
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
    <form onSubmit={handleSubmit} style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label>Algoritmo:</label>
          <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} style={{ display: 'block', width: '100%', padding: '8px' }}>
            <option value="FCFS">FCFS (First-Come, First-Served)</option>
            <option value="SJF-NP">SJF (Não Preemptivo)</option>
            <option value="SJF-P">SJF (Preemptivo / SRTF)</option>
            <option value="RR">Round Robin</option>
          </select>
        </div>
        
        {algorithm === 'RR' && (
          <div>
            <label>Quantum:</label>
            <input type="number" min="1" value={quantum} onChange={(e) => setQuantum(e.target.value)} style={{ display: 'block', width: '100%', padding: '8px' }} />
          </div>
        )}

        <div>
          <label>TTC (Troca Contexto):</label>
          <input type="number" min="0" value={ttc} onChange={(e) => setTtc(e.target.value)} style={{ display: 'block', width: '100%', padding: '8px' }} />
        </div>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>Lista de Processos</h4>
        <div>
          <button type="button" onClick={generateRandom} style={{ marginRight: '10px', padding: '6px 12px', cursor: 'pointer', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px' }}>🎲 Gerar Aleatórios</button>
          <button type="button" onClick={addProcess} style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px' }}>+ Adicionar Manual</button>
        </div>
      </div>

      {processes.map((p, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
          <input type="text" value={p.pid} readOnly style={{ width: '60px', padding: '6px', backgroundColor: '#eee' }} />
          <div>
            <span style={{ fontSize: '0.8rem' }}>Chegada:</span>
            <input type="number" min="0" value={p.arrivalTime} onChange={(e) => updateProcess(idx, 'arrivalTime', e.target.value)} style={{ width: '70px', padding: '6px', marginLeft: '5px' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem' }}>Tempo (Burst):</span>
            <input type="number" min="1" value={p.burstTime} onChange={(e) => updateProcess(idx, 'burstTime', e.target.value)} style={{ width: '70px', padding: '6px', marginLeft: '5px' }} />
          </div>
          <button type="button" onClick={() => removeProcess(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
        </div>
      ))}

      <button type="submit" style={{ width: '100%', padding: '12px', marginTop: '1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
        🚀 Rodar Simulação
      </button>
    </form>
  );
};

export default ProcessForm;