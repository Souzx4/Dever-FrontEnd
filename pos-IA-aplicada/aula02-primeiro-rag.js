/**
 * AULA 02 - ENGENHARIA DE IA APLICADA
 * Projeto Prático: Construindo o Pipeline Completo do Primeiro RAG em JavaScript
 * (Chunking -> Indexação Vetorial -> Busca por Similaridade -> Prompt Blindado Anti-Alucinação)
 */

// 1. BASE DE DOCUMENTOS BRUTOS DA EMPRESA (Ex: Manuais internos, Contratos, Runbooks)
const documentosBrutos = [
    {
        id: "DOC-01",
        titulo: "Política de SLA e Monitoramento de Servidores",
        conteudo:
            "Todos os servidores de produção são monitorados a cada 60 segundos. Caso um serviço apresente erro 500 ou latência acima de 2000ms por 3 minutos seguidos, o alerta crítico é disparado via Webhook para o N8N, que aciona o plantonista e inicia o rollback automático no GitHub."
    },
    {
        id: "DOC-02",
        titulo: "Regras de Arquitetura Back-end Node.js",
        conteudo:
            "Todo projeto em Node.js da empresa deve utilizar arquitetura modular dividida por domínios. É proibido acessar o banco de dados diretamente nos controllers. Todas as credenciais devem ficar no arquivo .env e nunca subir para o repositório Git."
    },
    {
        id: "DOC-03",
        titulo: "Contrato Comercial e Multa Rescisória",
        conteudo:
            "O plano Enterprise possui fidelidade de 12 meses com valor mensal de R$ 2.500. Em caso de cancelamento antecipado, aplica-se multa contratual de 20% sobre o saldo restante do contrato, isenta apenas se o uptime mensal ficar abaixo de 99.0%."
    }
];

// 2. GERADOR DE EMBEDDINGS (Transforma qualquer texto em um Vetor de Significado)
// Nota: Em produção chamamos a API da OpenAI/Gemini; aqui calculamos um vetor semântico local de 4 dimensões:
// Dimensões: [0: Infra/Monitoramento, 1: Código/Arquitetura, 2: Financeiro/Contratos, 3: Automação/Deploy]
function gerarEmbedding(texto) {
    const t = texto.toLowerCase();
    const contar = (palavras) =>
        palavras.reduce((soma, p) => soma + (t.includes(p) ? 1 : 0), 0);

    const vetor = [
        contar(["servidor", "erro", "latência", "monitora", "uptime", "caiu", "lento", "alerta"]) + 0.01,
        contar(["node", "código", "arquitetura", "controller", "domínio", "banco", "git"]) + 0.01,
        contar(["contrato", "multa", "cancelamento", "valor", "mensal", "fidelidade", "r$"]) + 0.01,
        contar(["n8n", "webhook", "rollback", "github", "automático", "deploy"]) + 0.01
    ];
    return vetor;
}

// 3. CÁLCULO DE SIMILARIDADE DE COSSENO (O mesmo operador <=> do PostgreSQL pgvector)
function similaridadeCosseno(vetorA, vetorB) {
    const produtoEscalar = vetorA.reduce((acc, val, i) => acc + val * vetorB[i], 0);
    const magA = Math.sqrt(vetorA.reduce((acc, val) => acc + val * val, 0));
    const magB = Math.sqrt(vetorB.reduce((acc, val) => acc + val * val, 0));
    return produtoEscalar / (magA * magB);
}

// 4. INDEXAÇÃO NO BANCO VETORIAL (Simulando INSERT na tabela do Postgres com pgvector)
const bancoVetorialPostgres = documentosBrutos.map((doc) => ({
    ...doc,
    embedding: gerarEmbedding(doc.titulo + " " + doc.conteudo)
}));

// 5. MOTOR DE BUSCA RAG + ENGENHARIA DE PROMPT AVANÇADA
function executarRAG(perguntaUsuario, limiteMinimoSimilaridade = 0.5) {
    console.log(`\n🔎 PERGUNTA DO USUÁRIO: "${perguntaUsuario}"`);

    // Passo A: Transforma a pergunta do usuário em vetor (Embedding)
    const vetorPergunta = gerarEmbedding(perguntaUsuario);

    // Passo B: Busca no banco os documentos mais parecidos e ordena do maior para o menor
    const resultados = bancoVetorialPostgres
        .map((doc) => ({
            id: doc.id,
            titulo: doc.titulo,
            conteudo: doc.conteudo,
            score: similaridadeCosseno(vetorPergunta, doc.embedding)
        }))
        .sort((a, b) => b.score - a.score);

    console.log("📊 Ranking de Busca no Banco Vetorial:");
    resultados.forEach((r) =>
        console.log(`   - [${r.id}] ${r.titulo}: ${(r.score * 100).toFixed(1)}% de relevância`)
    );

    // Passo C: Filtra apenas o que atingiu a nota de corte (evita enviar lixo/ruído para a IA)
    const contextoRelevante = resultados.filter((r) => r.score >= limiteMinimoSimilaridade);

    // Passo D: Monta o System Prompt Blindado (Pronto para enviar ao Gemini/OpenAI/N8N)
    const promptFinalParaLLM = `
[SYSTEM PROMPT - ENGENHARIA DE IA]
Você é um Assistente Técnico Corporativo.
Sua regra de ouro: Responda à pergunta do usuário baseando-se EXCLUSIVAMENTE nos documentos fornecidos dentro da tag <contexto>.
Se a resposta não estiver no <contexto>, responda exatamente: "Informação não localizada nos manuais da empresa."

<contexto>
${contextoRelevante.map((c) => `Fonte [${c.id} - ${c.titulo}]: ${c.conteudo}`).join("\n\n")}
</contexto>

<pergunta_usuario>
${perguntaUsuario}
</pergunta_usuario>

Responda em formato JSON com as chaves: { "resposta": "...", "fonte_utilizada": "..." }
`.trim();

    console.log("\n🤖 PROMPT AUMENTADO GERADO PARA O LLM (RAG):");
    console.log("--------------------------------------------------");
    console.log(promptFinalParaLLM);
    console.log("--------------------------------------------------");
}

// TESTANDO NOSSO RAG COM 2 CENÁRIOS DIFERENTES:
executarRAG("O que acontece no N8N se o servidor der erro 500 ou ficar lento?");
executarRAG("Qual é o valor da multa se eu cancelar o contrato antes do prazo?");
executarRAG("Como faço para acessar o banco de dados diretamente no controller?");