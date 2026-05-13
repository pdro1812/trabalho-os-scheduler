# Guia de Explicação do Código (Para Defesa do Trabalho)

Este guia foi feito para você olhar para o código e saber exatamente o que dizer para o professor. O foco não é o conceito do algoritmo (que você já sabe), mas sim **como o JavaScript está executando esse conceito**.

---

## 1. FCFS (First-Come, First-Served) - `fcfs.js`

**O que dizer ao professor:** "Este é um algoritmo linear. O código segue três passos claros: ordenar, verificar ociosidade e executar."

*   **A Ordenação (`processos.sort`):** Explique que a primeira coisa que o código faz é garantir que os processos estejam em ordem de chegada. Sem isso, o FCFS não funciona.
*   **O Loop `for`:** Diga que percorremos a lista uma única vez. Cada processo que entra, roda até o fim.
*   **A Variável `veioDeOciosidade`:** Explique que ela serve para o código saber se a CPU estava parada. Se ela estava parada e um processo chega, **não cobramos TTC** (Troca de Contexto), porque a CPU já estava "limpa".
*   **O Cálculo de Métricas:** Mostre que o `Turnaround` é calculado no momento em que o processo termina (`fim - ArrivalTime`) e a `Espera` é o que sobra desse tempo tirando o que ele realmente trabalhou (`turnaround - BurstTime`).

---

## 2. SJF Não-Preemptivo (Shortest Job First) - `sjf.js`

**O que dizer ao professor:** "A diferença aqui é que, a cada vez que a CPU libera, o código faz uma busca para encontrar o processo mais curto entre os que já chegaram."

*   **O `while (processosConcluidos < n)`:** Explique que o código continua rodando até que todos os processos sejam marcados como `concluido[i] = true`.
*   **A Busca pelo Menor (`indiceEscolhido`):** Aponte para o loop `for` interno. Diga: "Aqui o código olha para todos os processos. Ele ignora os que já terminaram e os que ainda não chegaram. Dos que sobraram, ele guarda o índice daquele que tem o menor `BurstTime`."
*   **O Desempate:** Se dois processos têm o mesmo tempo de execução, o `if` de desempate escolhe o que chegou primeiro (`ArrivalTime`).
*   **Execução Atômica:** Explique que uma vez escolhido, o processo soma o seu `BurstTime` inteiro ao `tempoAtual`, pois ele não pode ser interrompido.

---

## 3. Round Robin (RR) - `rr.js`

**O que dizer ao professor:** "Este código usa uma fila circular. O processo não roda até o fim, ele roda apenas um pedaço (Quantum) e volta para o fim da fila."

*   **A Fila (`const fila = []`):** Explique que usamos um array como uma fila real (FIFO). Usamos `push` para colocar no fim e `shift()` para tirar do começo.
*   **A Função `checarChegadas`:** É o ponto mais importante. Diga: "Sempre que o tempo passa, o código verifica se novos processos chegaram e os coloca na fila **antes** de qualquer outra coisa."
*   **O `Math.min(Quantum, tempoRestante)`:** Explique que isso garante que o processo rode ou o tempo do Quantum, ou o que resta dele (caso o resto seja menor que o Quantum).
*   **A Preempção:** Mostre o `if (tempoRestante > 0)`. Se o processo ainda tem trabalho a fazer, ele é colocado de volta no fim da fila (`fila.push(indice)`). Se terminou, ele sai do sistema.

---

## 4. SJF Preemptivo / SRTF (Shortest Remaining Time First) - `sjf_preemptive.js`

**O que dizer ao professor:** "Este é o código mais detalhado porque ele simula a CPU segundo a segundo (tick-a-tick) para permitir que um processo novo interrompa o que está rodando."

*   **O "Tick" (`tempoAtual++`):** Explique que, diferente dos outros, este código avança de 1 em 1. A cada segundo que passa, ele reavalia quem é o processo com o menor tempo **restante**.
*   **O Controle do Gantt (`ultimoPID` e `inicioDoBloco`):** Como o processo pode rodar vários segundos seguidos, o código não cria um bloco no gráfico a cada segundo. Ele espera o processo mudar ou terminar para gravar um bloco único no `ordemExecucao`. Isso deixa o gráfico limpo.
*   **A Troca de Contexto (TTC):** Explique que se o `indiceEscolhido` mudar (um processo novo e mais curto chegou), o código fecha o bloco do anterior, soma o tempo de TTC e só então começa o novo.
*   **Tempo Restante:** Destaque que o critério de escolha aqui é o `tempoRestante[i]`, que diminui a cada segundo que o processo ganha a CPU.

---

## Dicas Gerais para a Explicação:
1.  **Variáveis de Acúmulo:** Sempre que ver `somaEspera` ou `somaTurnaround`, explique que elas guardam os valores de cada processo para, no final, dividirmos pelo total e ter a média.
2.  **O Objeto de Retorno:** Todos os algoritmos retornam `ExecutionOrder` (para o gráfico de Gantt) e `Metrics` (para a tabela de resultados).
3.  **Por que loops `for`?** Se o professor perguntar, diga que escolheu loops tradicionais para que a lógica de busca e comparação ficasse explícita e fácil de rastrear passo a passo.
