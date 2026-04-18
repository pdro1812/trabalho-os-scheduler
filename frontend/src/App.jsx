import React, { useState } from 'react';
import api from './services/api';
import ProcessForm from './components/ProcessForm';
import GanttChart from './components/GanttChart';
import ProcessTable from './components/ProcessTable';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSimulate = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      // Bate na rota do seu Go!
      const response = await api.post('/simulate', payload);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao comunicar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e3a8a', margin: '0 0 10px 0' }}>Simulador de Escalonamento de CPU</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Trabalho de Sistemas Operacionais</p>
      </header>

      <ProcessForm onSimulate={handleSimulate} />

      {loading && <p style={{ textAlign: 'center', marginTop: '2rem' }}>Calculando simulação...</p>}
      
      {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>{error}</p>}

      {result && !loading && (
        <>
          <GanttChart executionOrder={result.executionOrder} />
          <ProcessTable metrics={result.metrics} averages={{ avgWaitTime: result.avgWaitTime, avgTurnaroundTime: result.avgTurnaroundTime }} />
        </>
      )}
    </div>
  );
}

export default App;