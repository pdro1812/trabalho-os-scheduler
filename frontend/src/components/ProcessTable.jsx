import React from 'react';

const ProcessTable = ({ metrics, averages }) => {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', color: '#333' }}>Métricas por Processo</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '12px' }}>PID</th>
            <th style={{ padding: '12px' }}>Tempo de Espera (Wait)</th>
            <th style={{ padding: '12px' }}>Tempo Efetivo (Turnaround)</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.pid} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{m.pid}</td>
              <td style={{ padding: '12px' }}>{m.waitingTime}</td>
              <td style={{ padding: '12px' }}>{m.effectiveTime}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        marginTop: '1.5rem', 
        padding: '1rem', 
        backgroundColor: '#eef2ff', 
        borderRadius: '8px' 
      }}>
        <div>
          <strong>Tempo Médio de Espera:</strong> {averages.avgWaitTime.toFixed(2)}
        </div>
        <div>
          <strong>Tempo Médio de Turnaround:</strong> {averages.avgTurnaroundTime.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default ProcessTable;