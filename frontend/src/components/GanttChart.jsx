import React from 'react';

/**
 * GanttChart – Visualização da linha do tempo de execução da CPU.
 *
 * CONTRATO DE DADOS (handlers.js / mapResponseToDTO):
 * executionOrder[i] = { pid, start, end }  ← camelCase
 * Todos os acessos usam camelCase para espelhar exatamente o que o backend entrega.
 */
const GanttChart = ({ executionOrder }) => {
  if (!executionOrder || executionOrder.length === 0) return null;

  // 'end' do último bloco é o tempo total de execução (camelCase — contrato do backend)
  const totalTime = executionOrder[executionOrder.length - 1].end;

  // Coleta todos os instantes de transição para a régua de tempo
  const timeMarks = [...new Set(
    executionOrder.flatMap(b => [b.start, b.end])
  )].sort((a, b) => a - b);

  // Paleta de cores consistente por PID — ângulo áureo evita colisões
  const getColor = (pid) => {
    if (pid === 'TTC') return '#475569'; // Cinza-ardósia para troca de contexto
    const num = parseInt(pid.replace(/\D/g, ''), 10) || 0;
    const hue = (num * 137.508) % 360;
    return `hsl(${hue}, 65%, 52%)`;
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', color: '#1e293b', fontWeight: 700 }}>
        Diagrama de Gantt
      </h3>

      {/* ── Barra do Gantt ── */}
      <div style={{
        display: 'flex', height: '56px',
        borderRadius: '8px', overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        backgroundColor: '#e2e8f0',
      }}>
        {executionOrder.map((block, index) => {
          const duration   = block.end - block.start;   // camelCase
          const percentage = totalTime > 0 ? (duration / totalTime) * 100 : 0;
          const isTTC      = block.pid === 'TTC';       // camelCase
          const showLabel  = percentage > 4;            // só mostra label se houver espaço

          return (
            <div
              key={index}
              title={`${block.pid}: ${block.start}ms → ${block.end}ms (duração: ${duration}ms)`}
              style={{
                width: `${percentage}%`,
                backgroundColor: getColor(block.pid),  // camelCase
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                color: isTTC ? '#cbd5e1' : '#ffffff',
                fontWeight: 700, fontSize: '0.78rem',
                borderRight: '1px solid rgba(255,255,255,0.25)',
                overflow: 'hidden', flexShrink: 0,
                cursor: 'default', letterSpacing: '0.02em',
                transition: 'filter 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
            >
              {showLabel && (
                <>
                  <span>{block.pid}</span>
                  <span style={{ fontSize: '0.6rem', opacity: 0.85, marginTop: '1px' }}>
                    {duration}ms
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Régua de tempo com marcação em cada transição ── */}
      <div style={{ position: 'relative', height: '28px', marginTop: '4px' }}>
        {timeMarks.map((t) => {
          const leftPct = totalTime > 0 ? (t / totalTime) * 100 : 0;
          return (
            <span key={t} style={{
              position: 'absolute', left: `${leftPct}%`,
              transform: 'translateX(-50%)',
              fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap',
            }}>
              {t}
            </span>
          );
        })}
      </div>

      {/* ── Legenda de cores por processo ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
        {[...new Set(executionOrder.map(b => b.pid))].map(pid => (   // camelCase
          <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#374151' }}>
            <div style={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: getColor(pid), flexShrink: 0 }} />
            {pid === 'TTC' ? 'TTC (Troca de Contexto)' : pid}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GanttChart;