import React from 'react';

/**
 * ProcessTable – Exibe as métricas individuais de cada processo.
 *
 * CONTRATO DE DADOS (handlers.js / mapResponseToDTO):
 * metrics[i] = { pid, waitingTime, effectiveTime }  ← camelCase
 * averages   = { avgWaitTime, avgTurnaroundTime }    ← camelCase (mapeado em App.jsx)
 */
const ProcessTable = ({ metrics, averages }) => {
  if (!metrics || metrics.length === 0) return null;

  // Calcula os melhores valores para destaque visual
  const minWait       = Math.min(...metrics.map(m => m.waitingTime));    // camelCase
  const minTurnaround = Math.min(...metrics.map(m => m.effectiveTime));  // camelCase

  // Paleta consistente com o GanttChart
  const getPIDColor = (pid) => {
    const num = parseInt(pid.replace(/\D/g, ''), 10) || 0;
    const hue = (num * 137.508) % 360;
    return `hsl(${hue}, 65%, 52%)`;
  };

  const cellStyle = (extra = {}) => ({ padding: '11px 14px', ...extra });

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', color: '#1e293b', fontWeight: 700 }}>
        Métricas por Processo
      </h3>

      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#1e3a8a', color: '#ffffff' }}>
              <th style={cellStyle()}>Processo</th>
              <th style={cellStyle()}>Tempo de Espera (Wait)</th>
              <th style={cellStyle()}>Tempo de Retorno (Turnaround)</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, i) => {
              // camelCase — contrato exato do mapResponseToDTO
              const isBestWait       = m.waitingTime   === minWait;
              const isBestTurnaround = m.effectiveTime === minTurnaround;
              const rowBg = i % 2 === 0 ? '#ffffff' : '#f8fafc';

              return (
                <tr key={m.pid} style={{ backgroundColor: rowBg, borderBottom: '1px solid #e2e8f0' }}>
                  {/* Badge colorido com o PID */}
                  <td style={cellStyle()}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontWeight: 700, color: '#1e293b' }}>
                      <span style={{
                        width: 10, height: 10, borderRadius: '50%',
                        backgroundColor: getPIDColor(m.pid),   // camelCase
                        display: 'inline-block', flexShrink: 0,
                      }} />
                      {m.pid}  {/* camelCase */}
                    </span>
                  </td>

                  {/* Tempo de espera */}
                  <td style={cellStyle()}>
                    <span style={{ color: isBestWait ? '#059669' : '#334155', fontWeight: isBestWait ? 700 : 400 }}>
                      {m.waitingTime}ms  {/* camelCase */}
                      {isBestWait && metrics.length > 1 && (
                        <span title="Menor tempo de espera" style={{ marginLeft: 5, fontSize: '0.7rem' }}>✓</span>
                      )}
                    </span>
                  </td>

                  {/* Turnaround */}
                  <td style={cellStyle()}>
                    <span style={{ color: isBestTurnaround ? '#059669' : '#334155', fontWeight: isBestTurnaround ? 700 : 400 }}>
                      {m.effectiveTime}ms  {/* camelCase */}
                      {isBestTurnaround && metrics.length > 1 && (
                        <span title="Menor turnaround" style={{ marginLeft: 5, fontSize: '0.7rem' }}>✓</span>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Médias — props em camelCase vindas do App.jsx */}
      <div style={{
        display: 'flex', gap: '1.5rem', marginTop: '1rem',
        padding: '14px 18px', backgroundColor: '#eff6ff',
        borderRadius: '8px', border: '1px solid #bfdbfe',
        flexWrap: 'wrap', fontSize: '0.9rem',
      }}>
        <div>
          <span style={{ color: '#64748b' }}>Média de Espera: </span>
          <strong style={{ color: '#1e40af' }}>{averages.avgWaitTime.toFixed(2)}ms</strong>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Média de Turnaround: </span>
          <strong style={{ color: '#1e40af' }}>{averages.avgTurnaroundTime.toFixed(2)}ms</strong>
        </div>
      </div>
    </div>
  );
};

export default ProcessTable;