/**
 * AULA 03 - ENGENHARIA DE IA APLICADA (MÓDULOS 1, 2 e 8)
 * Arquitetura de Produção: Semantic Cache + Model Router + FinOps (Controle de Custos)
 */

// 1. TABELA DE PREÇOS E CARACTERÍSTICAS DOS MODELOS (Via OpenRouter / APIs)
const CATALOGO_MODELOS = {
    LOCAL_OLLAMA: {
        nome: "Llama-3.2-Local (via Ollama)",
        custoPorChamadaRS: 0.0, // Roda na própria máquina/servidor
        latenciaMediaMs: 120
    },
    ECONOMICO_FLASH: {
        nome: "Gemini-2.5-Flash / GPT-4o-mini",
        custoPorChamadaRS: 0.005, // Meio centavo por requisição
        latenciaMediaMs: 350
    },
    FRONTIER_PRO: {
        nome: "Gemini-2.5-Pro / Claude-3.7-Sonnet",
        custoPorChamadaRS: 0.15, // 15 centavos por requisição complexa (30x mais caro que o Flash)
        latenciaMediaMs: 1800
    }
};

// 2. GERADOR DE EMBEDDINGS E SIMILARIDADE (Para o nosso Semantic Cache)
function gerarEmbeddingIntencao(texto) {
    const t = texto.toLowerCase();
    const contar = (termos) => termos.reduce((acc, p) => acc + (t.includes(p) ? 1 : 0), 0);

    return [
        contar(["cancelar", "multa", "rescisão", "encerrar", "contrato", "fidelidade"]) + 0.01,
        contar(["arquitetura", "microsserviço", "refatorar", "escalar", "kubernetes", "erro 500"]) + 0.01,
        contar(["horário", "atendimento", "telefone", "suporte", "bom dia", "olá"]) + 0.01
    ];
}

function similaridadeCosseno(vetorA, vetorB) {
    const prod = vetorA.reduce((acc, val, i) => acc + val * vetorB[i], 0);
    const magA = Math.sqrt(vetorA.reduce((acc, val) => acc + val * val, 0));
    const magB = Math.sqrt(vetorB.reduce((acc, val) => acc + val * val, 0));
    return prod / (magA * magB);
}

// 3. BANCO DE SEMANTIC CACHE EM MEMÓRIA (Em produção: Redis ou Postgres pgvector)
const semanticCache = [];

// 4. MODEL ROUTER (Decide qual modelo usar com base na complexidade e privacidade)
function roteadorDeModelos(pergunta) {
    const t = pergunta.toLowerCase();

    // Regra 1: Dados ultra-confidenciais ou triagem simples -> Modelo Local (Ollama)
    if (t.includes("interno") || t.includes("horário") || t.includes("bom dia")) {
        return CATALOGO_MODELOS.LOCAL_OLLAMA;
    }

    // Regra 2: Problemas complexos de Engenharia/Arquitetura -> Modelo Frontier Pro
    if (t.includes("arquitetura") || t.includes("refatorar") || t.includes("escalar")) {
        return CATALOGO_MODELOS.FRONTIER_PRO;
    }

    // Regra 3: Dúvidas comerciais padrão e RAG do dia a dia -> Modelo Econômico Flash
    return CATALOGO_MODELOS.ECONOMICO_FLASH;
}

// 5. ORQUESTRADOR DE IA COM OBSERVABILIDADE E FINOPS
let metricasFinOps = {
    totalRequisicoes: 0,
    cacheHits: 0,
    custoRealGastoRS: 0,
    custoSemOtimizacaoRS: 0 // Quanto custaria se mandasse tudo para o modelo mais caro
};

function processarRequisicaoIA(perguntaUsuario) {
    metricasFinOps.totalRequisicoes++;
    metricasFinOps.custoSemOtimizacaoRS += CATALOGO_MODELOS.FRONTIER_PRO.custoPorChamadaRS;

    console.log(`\n=============================================================`);
    console.log(`📥 REQUISIÇÃO #${metricasFinOps.totalRequisicoes}: "${perguntaUsuario}"`);

    const vetorPergunta = gerarEmbeddingIntencao(perguntaUsuario);

    // PASSO 1: Verificar no Semantic Cache (nota de corte: 92% de similaridade)
    for (const itemCache of semanticCache) {
        const similaridade = similaridadeCosseno(vetorPergunta, itemCache.embedding);
        if (similaridade >= 0.92) {
            metricasFinOps.cacheHits++;
            console.log(`⚡ [SEMANTIC CACHE HIT!] Similaridade: ${(similaridade * 100).toFixed(1)}% com pergunta anterior.`);
            console.log(`   -> Pergunta original no cache: "${itemCache.perguntaOriginal}"`);
            console.log(`   -> Custo de API: R$ 0.000 | Latência: 2ms`);
            console.log(`   -> Resposta entregue: "${itemCache.resposta}"`);
            return;
        }
    }

    // PASSO 2: Se não está no cache, aciona o Model Router
    const modeloEscolhido = roteadorDeModelos(perguntaUsuario);
    metricasFinOps.custoRealGastoRS += modeloEscolhido.custoPorChamadaRS;

    console.log(`🧭 [MODEL ROUTER] Tarefa roteada para: ${modeloEscolhido.nome}`);
    console.log(`   -> Custo da chamada: R$ ${modeloEscolhido.custoPorChamadaRS.toFixed(3)} | Latência estimada: ${modeloEscolhido.latenciaMediaMs}ms`);

    // Simulando a geração da resposta pelo LLM e salvando no Semantic Cache
    const respostaGerada = `[Resposta processada via ${modeloEscolhido.nome} para: "${perguntaUsuario}"]`;
    semanticCache.push({
        perguntaOriginal: perguntaUsuario,
        embedding: vetorPergunta,
        resposta: respostaGerada
    });

    console.log(`   -> Resposta salva no Semantic Cache para futuras consultas!`);
}

// =============================================================
// SIMULANDO 4 REQUISIÇÕES REAIS EM PRODUÇÃO:
// =============================================================

// 1. Cliente A pergunta sobre cancelamento (Vai para o modelo Flash e salva no Cache)
processarRequisicaoIA("Qual é a multa contratual se eu cancelar meu contrato hoje?");

// 2. Engenheiro pede análise complexa (Roteador manda para o modelo Frontier Pro)
processarRequisicaoIA("Como desenhar uma arquitetura para escalar microsserviços em Kubernetes?");

// 3. Usuário faz pergunta simples de triagem (Roteador manda para o Ollama Local Custo Zero)
processarRequisicaoIA("Bom dia, qual o horário de atendimento do suporte interno?");

// 4. Cliente B faz a MESMA pergunta do Cliente A, mas usando OUTRAS palavras!
processarRequisicaoIA("Quero encerrar minha fidelidade do contrato, pago alguma multa de rescisão?");

processarRequisicaoIA("queria entender como funciona sua empresa, como é o catalogo de preços?");

processarRequisicaoIA("Meu servidor caiu com erro 502, quanto tempo tenho para agir e o que devo olhar primeiro?");

processarRequisicaoIA("Vocês aceitam pagamento via PIX?");

processarRequisicaoIA("qual a raiz quadrada do delta de 25?");

// =============================================================
// RELATÓRIO FINAL DE FINOPS (O QUE O DIRETOR DE TECNOLOGIA QUER VER)
// =============================================================
const economiaPercentual =
    ((metricasFinOps.custoSemOtimizacaoRS - metricasFinOps.custoRealGastoRS) /
        metricasFinOps.custoSemOtimizacaoRS) *
    100;

console.log(`\n📊 ================== RELATÓRIO DE FINOPS ==================`);
console.log(`Total de Requisições Processadas : ${metricasFinOps.totalRequisicoes}`);
console.log(`Respostas via Semantic Cache     : ${metricasFinOps.cacheHits} (Custo Zero e 2ms)`);
console.log(`Custo se usasse só Modelo Pro    : R$ ${metricasFinOps.custoSemOtimizacaoRS.toFixed(3)}`);
console.log(`Custo Real na sua Arquitetura    : R$ ${metricasFinOps.custoRealGastoRS.toFixed(3)}`);
console.log(`💰 Economia Gerada pelo Engenheiro: ${economiaPercentual.toFixed(1)}% de redução de custos!`);
console.log(`============================================================\n`);