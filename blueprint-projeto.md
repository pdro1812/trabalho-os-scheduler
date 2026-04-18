# CONTEXTO GERAL
Estou desenvolvendo um simulador de gerenciador de processos (Scheduler) para um trabalho acadêmico de Sistemas Operacionais. 
O objetivo principal é a corretude matemática e lógica dos algoritmos de escalonamento.

# STACK TECNOLÓGICA
- Backend: Go (Golang) sem frameworks pesados, rodando na porta 8080.
- Frontend: React via Vite, rodando na porta 5173.
- Infraestrutura: Docker e Docker Compose.

# REQUISITOS DO SISTEMA
O sistema deve receber como entrada:
1. Uma lista de Processos, cada um contendo PID e Tempo de Execução (Burst Time). Assumiremos Tempo de Chegada (Arrival Time) padrão como 0, mas permitiremos customização.
2. A política de escalonamento (FCFS, SJF Não Preemptivo, SJF Preemptivo / SRTF, Round Robin).
3. O Quantum (apenas para Round Robin).
4. O TTC (Tempo de Troca de Contexto).

O sistema deve calcular e devolver:
1. A Ordem de Execução (timeline para gerar um Gráfico de Gantt, incluindo os momentos de TTC).
2. O Tempo Efetivo (Turnaround Time) e o Tempo de Espera (Waiting Time) detalhado por processo.
3. O Tempo Médio de Espera e o Tempo Médio de Turnaround globais.

# ESTRUTURA DO BACKEND (Go)
/cmd/api/main.go -> Inicializa o servidor HTTP nativo ou com Gorilla Mux. Lida com CORS.
/internal/models/models.go -> Define as Structs: Process, SimulationRequest, SimulationResponse, ExecutionBlock.
/internal/scheduler/*.go -> Um arquivo por algoritmo, todos recebendo os mesmos parâmetros e devolvendo um SimulationResponse.
/internal/handlers/simulate.go -> Rota `POST /api/simulate` que recebe o JSON, faz o parse, chama o algoritmo correto pelo switch-case, e retorna a resposta.

# ESTRUTURA DO FRONTEND (React)
/src/components/ProcessForm.jsx -> Formulário para adicionar N processos e definir algoritmo, quantum e ttc.
/src/components/GanttChart.jsx -> Visualização da ordem de execução (timeline).
/src/components/ProcessTable.jsx -> Tabela listando as métricas finais de cada processo.
/src/services/api.js -> Configuração do Axios apontando para `http://localhost:8080`.

# REGRAS DE NEGÓCIO E RESTRIÇÕES
- TTC só deve ser aplicado quando há UMA TROCA de processo ativo para outro diferente.
- O SJF Preemptivo deve checar a cada tick de tempo se um processo menor chegou para roubar a CPU.
- O código deve ser limpo, fortemente tipado em Go e orientado a componentes no React.