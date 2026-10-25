/**
 * AULA 01 - ENGENHARIA DE IA APLICADA
 * Parte 1: Criando e treinando uma Rede Neural do zero em JavaScript
 * Cenário: A IA deve aprender sozinha se um servidor vai cair (1) ou ficar estável (0)
 * com base em [Uso de CPU (0 a 1), Uso de Memória (0 a 1)].
 */

// Função de Ativação Sigmoid: espreme qualquer número para um valor entre 0 e 1 (probabilidade)
const sigmoid = (x) => 1 / (1 + Math.exp(-x));
const derivadaSigmoid = (x) => x * (1 - x);

// 1. DADOS DE TREINO (Entradas: [CPU, Memória] -> Saída esperada: 0 = Normal, 1 = Alerta Crítico)
const dadosTreino = [
    { entrada: [0.1, 0.2], esperado: 0 }, // Uso baixo -> Normal
    { entrada: [0.2, 0.3], esperado: 0 }, // Uso baixo -> Normal
    { entrada: [0.8, 0.9], esperado: 1 }, // Uso alto  -> Alerta Crítico
    { entrada: [0.9, 0.85], esperado: 1 } // Uso alto  -> Alerta Crítico
];

// Inicializando Pesos (Weights) e Viés (Bias) de forma determinística para estudo
let pesos = [0.5, -0.5];
let bias = 0.1;
const taxaAprendizado = 0.5; // Learning Rate

// 2. TREINO (Ciclo de aprendizado ajustando os pesos pelo erro)
for (let epoca = 1; epoca <= 2000; epoca++) {
    for (const item of dadosTreino) {
        // Forward Pass: multiplica entrada pelos pesos + bias
        const somaPonderada =
            item.entrada[0] * pesos[0] +
            item.entrada[1] * pesos[1] +
            bias;
        const predicao = sigmoid(somaPonderada);

        // Cálculo do Erro (Loss)
        const erro = item.esperado - predicao;

        // Backpropagation: ajusta os pesos proporcionalmente ao erro
        const ajuste = erro * derivadaSigmoid(predicao);
        pesos[0] += taxaAprendizado * ajuste * item.entrada[0];
        pesos[1] += taxaAprendizado * ajuste * item.entrada[1];
        bias += taxaAprendizado * ajuste;
    }
}

// 3. VALIDAÇÃO E INFERÊNCIA (Testando com dados novos que a rede nunca viu!)
function inferencia(cpu, memoria) {
    const soma = cpu * pesos[0] + memoria * pesos[1] + bias;
    return sigmoid(soma);
}

console.log("=== PARTE 1: REDE NEURAL TREINADA DO ZERO ===");
console.log("Pesos aprendidos pela IA:", pesos.map((p) => p.toFixed(2)));
console.log(
    "Teste Servidor Tranquilo (CPU 15%, RAM 25%):",
    (inferencia(0.15, 0.25) * 100).toFixed(1) + "% de risco de queda"
);
console.log(
    "Teste Servidor Sobrecarregado (CPU 95%, RAM 90%):",
    (inferencia(0.95, 0.90) * 100).toFixed(1) + "% de risco de queda\n"
);

/**
 * Parte 2: Como Tensores (Embeddings) e Busca Semântica (RAG) funcionam por dentro
 * Calculando a Similaridade de Cosseno (Cosine Similarity) entre vetores
 */
function similaridadeCosseno(vetorA, vetorB) {
    const produtoEscalar = vetorA.reduce((acc, val, i) => acc + val * vetorB[i], 0);
    const magnitudeA = Math.sqrt(vetorA.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(vetorB.reduce((acc, val) => acc + val * val, 0));
    return produtoEscalar / (magnitudeA * magnitudeB);
}

// Simulando Embeddings simplificados de 3 dimensões: [Infraestrutura, BancoDeDados, Financeiro]
const perguntaUsuario = [0.9, 0.8, 0.1]; // "Meu banco Postgres está lento no servidor"
const docRunbookInfra = [0.85, 0.9, 0.05]; // Documento 1: "Como otimizar queries no PostgreSQL"
const docReembolsoRH = [0.1, 0.05, 0.95]; // Documento 2: "Política de reembolso de notas fiscais"

console.log("=== PARTE 2: BUSCA SEMÂNTICA COM EMBEDDINGS (BASE DO RAG) ===");
console.log(
    "Similaridade com Runbook de Infra:",
    (similaridadeCosseno(perguntaUsuario, docRunbookInfra) * 100).toFixed(1) + "%"
);
console.log(
    "Similaridade com Documento Financeiro:",
    (similaridadeCosseno(perguntaUsuario, docReembolsoRH) * 100).toFixed(1) + "%"
);