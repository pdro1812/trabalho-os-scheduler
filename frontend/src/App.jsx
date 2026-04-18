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
      const response = await api.post('/simulate', payload);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError('Falha de comunicação com o Backend Go. Verifique se o container está rodando na porta 8080.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' 
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Cabeçalho Bonitão */}
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ color: '#1e3a8a', margin: '0 0 10px 0' }}>Simulador de Escalonamento de CPU</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Trabalho de Sistemas Operacionais</p>
        </header>

        {/* Formulário Central */}
        <ProcessForm onSimulate={handleSimulate} />

        {/* Estados de Carregamento/Erro */}
        {loading && (
          <div style={{ textAlign: 'center', marginTop: '3rem', color: '#4b5563', fontWeight: '500' }}>
            <span style={{ fontSize: '1.5rem', display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</span> 
            <p>Processando simulação no Backend...</p>
          </div>
        )}
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', textAlign: 'center', marginTop: '2rem', fontWeight: '500', border: '1px solid #f87171' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Resultados (Gantt e Tabela) renderizados sob demanda */}
        {result && !loading && (
          <div style={{ 
            marginTop: '3rem', 
            backgroundColor: '#ffffff', 
            padding: '2rem', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
          }}>
            <h2 style={{ color: '#1f2937', marginBottom: '0.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
              Relatório de Execução
            </h2>
            <GanttChart executionOrder={result.executionOrder} />
            <ProcessTable metrics={result.metrics} averages={{ avgWaitTime: result.avgWaitTime, avgTurnaroundTime: result.avgTurnaroundTime }} />
          </div>
        )}

      </div>
    </div>
  );
}

export default App;