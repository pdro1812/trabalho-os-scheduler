import React from 'react';

const GanttChart = ({ executionOrder }) => {
  if (!executionOrder || executionOrder.length === 0) return null;

  // O tempo total é o 'End' do último bloco
  const totalTime = executionOrder[executionOrder.length - 1].end;

  // Função para gerar cores consistentes baseadas no PID
  const getColorForPID = (pid) => {
    if (pid === 'TTC') return '#4b5563'; // Cinza escuro para TTC
    
    // Gera uma cor baseada no número do processo (P1, P2, etc)
    const num = parseInt(pid.replace(/\D/g, '')) || 0;
    const hue = (num * 137.5) % 360; 
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', color: '#333' }}>Gráfico de Gantt (Ordem de Execução)</h3>
      
      <div style={{ 
        display: 'flex', 
        height: '60px', 
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {executionOrder.map((block, index) => {
          const duration = block.end - block.start;
          const percentage = (duration / totalTime) * 100;

          return (
            <div 
              key={index} 
              style={{
                width: `${percentage}%`,
                backgroundColor: getColorForPID(block.pid),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                borderRight: '1px solid rgba(255,255,255,0.3)'
              }}
              title={`${block.pid}: ${block.start}s até ${block.end}s`}
            >
              <span>{block.pid}</span>
              <span style={{ fontSize: '0.6rem' }}>{duration}s</span>
            </div>
          );
        })}
      </div>

      {/* Régua de tempo abaixo do gráfico */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
        <span>0s</span>
        <span>{totalTime}s</span>
      </div>
    </div>
  );
};

export default GanttChart;