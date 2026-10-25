/**
 * AULA 02 - ENGENHARIA DE IA APLICADA
 * Construindo um Pipeline de RAG (Retrieval-Augmented Generation) Completo em JS
 * Etapas: 1. Chunking -> 2. Vetorização -> 3. Busca Semântica -> 4. Prompt Blindado
 */

// 1. DOCUMENTO ORIGINAL (Simulando um PDF ou Manual Interno da Empresa)
const manualDaEmpresa = `
POLÍTICA DE INFRAESTRUTURA E DEPLOY:
Todo deploy em produção deve acontecer de terça a quinta-feira entre 10h e 16h via GitHub Actions.
É proibido fazer deploy na sexta-feira, exceto em caso de correção crítica de segurança (Hotfix) aprovada pelo Tech Lead.

POLÍTICA DE MONITORAMENTO E INCIDENTES (SLA):
Quando o monitoramento acusar erro 502 ou queda de servidor, o engenheiro de plantão tem até 15 minutos para iniciar o diagnóstico.
O primeiro passo obrigatório é verificar os logs do container Docker e checar se a conexão com o banco PostgreSQL atingiu o limite de conexões.

POLÍTICA COMERCIAL E REEMBOLSO DE CLIENTES:
Clientes do plano Enterprise têm direito a reembolso proporcional caso o sistema fique fora do ar (Uptime abaixo de 99.9% no mês).
O prazo para pagamento de reembolsos aprovados pelo financeiro é de até 10 dias úteis via PIX ou boleto.
`;

// 2. ETAPA DE CHUNKING (Quebrando o documento grande em pedaços menores por seção)
function fatiarDocumentoEmChunks(texto) {
    return texto
        .trim()
        .split("\n\n")
        .map((trecho, index) => ({
            id: index + 1,
            conteudo: trecho.trim()
        }));
}

// 3. GERADOR DE EMBEDDINGS DIDÁTICO (Transforma o significado do texto em um vetor de 3 temas:
// [Deploy/GitHub, Monitoramento/Servidor, Financeiro/Reembolso])
function gerarEmbedding(texto) {
    const t = texto.toLowerCase();
    const scoreDeploy =
        (t.includes("deploy") ? 0.5 : 0) +
        (t.includes("sexta") ? 0.4 : 0) +
        (t.includes("github") ? 0.3 : 0);
    const scoreMonitoramento =
        (t.includes("502") || t.includes("queda") || t.includes("caiu") ? 0.5 : 0) +
        (t.includes("15 minutos") || t.includes("tempo") || t.includes("logs") ? 0.4 : 0) +
        (t.includes("postgres") || t.includes("servidor") ? 0.3 : 0);
    const scoreFinanceiro =
        (t.includes("reembolso") || t.includes("dinheiro") ? 0.5 : 0) +
        (t.includes("uptime") || t.includes("99.9%") ? 0.4 : 0) +
        (t.includes("pix") || t.includes("clientes") ? 0.3 : 0);

    // Garantindo um valor mínimo para evitar divisão por zero
    return [scoreDeploy || 0.05, scoreMonitoramento || 0.05, scoreFinanceiro || 0.05];
}

// Função matemática de Similaridade de Cosseno (a mesma que o pgvector usa no Postgres!)
function calcularSimilaridade(vetorA, vetorB) {
    const produto = vetorA.reduce((acc, val, i) => acc + val * vetorB[i], 0);
    const magA = Math.sqrt(vetorA.reduce((acc, val) => acc + val * val, 0));
    const magB = Math.sqrt(vetorB.reduce((acc, val) => acc + val * val, 0));
    return produto / (magA * magB);
}

// 4. BANCO DE DADOS VETORIAL EM MEMÓRIA (Simulando nossa tabela no PostgreSQL + pgvector)
const chunks = fatiarDocumentoEmChunks(manualDaEmpresa);
const bancoVetorial = chunks.map((chunk) => ({
    ...chunk,
    embedding: gerarEmbedding(chunk.conteudo)
}));

console.log(`=== 1. INGESTÃO CONCLUÍDA: ${bancoVetorial.length} Chunks salvos no Banco Vetorial ===\n`);

// 5. MOTOR DE BUSCA DO RAG (Retrieval)
function buscarContextoRelevante(pergunta, topK = 1) {
    const vetorPergunta = gerarEmbedding(pergunta);

    const resultadosOrdenados = bancoVetorial
        .map((item) => ({
            ...item,
            similaridade: calcularSimilaridade(vetorPergunta, item.embedding)
        }))
        .sort((a, b) => b.similaridade - a.similaridade); // Ordena do mais parecido para o menos parecido

    return resultadosOrdenados.slice(0, topK);
}

// 6. MONTAGEM DO PROMPT PROFISSIONAL (Augmented Generation)
function montarPromptParaLLM(perguntaUsuario) {
    const trechosEncontrados = buscarContextoRelevante(perguntaUsuario, 1);
    const melhorTrecho = trechosEncontrados[0];

    console.log(`=== 2. BUSCA SEMÂNTICA PARA A PERGUNTA: "${perguntaUsuario}" ===`);
    console.log(`-> Chunk Escolhido: #${melhorTrecho.id} (Compatibilidade: ${(melhorTrecho.similaridade * 100).toFixed(1)}%)\n`);

    // Este é o Prompt final que enviamos para a API da OpenAI / Gemini / Ollama:
    const promptFinal = `
[SYSTEM PROMPT - ENGENHARIA DE IA]
Você é um assistente técnico corporativo.
REGRA DE OURO: Responda à pergunta do usuário APENAS com base no [CONTEXTO RECUPERADO] abaixo.
Não invente informações. Retorne a resposta em formato JSON com as chaves "resposta" e "fonte_chunk_id".

[CONTEXTO RECUPERADO DO POSTGRES]
Chunk #${melhorTrecho.id}: "${melhorTrecho.conteudo}"

[PERGUNTA DO USUÁRIO]
"${perguntaUsuario}"
`.trim();

    console.log("=== 3. PROMPT AUMENTADO PRONTO PARA ENVIAR AO LLM ===");
    console.log(promptFinal);
}

// TESTANDO NOSSO RAG NA PRÁTICA:
montarPromptParaLLM("O servidor caiu com erro 502! Quanto tempo eu tenho para agir e o que devo olhar primeiro?");
montarPromptParaLLM("Meu cliente Enterprise quer reembolso, qual é o prazo e como devo proceder?");