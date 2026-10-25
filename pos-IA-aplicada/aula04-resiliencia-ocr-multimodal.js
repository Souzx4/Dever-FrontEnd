/**
 * AULA 04 - ENGENHARIA DE IA APLICADA (MÓDULO 2 COMPLETO)
 * Prática: Integração Back-end com Retry, Fallback Automático,
 * Observabilidade (Tracing) e OCR Inteligente Multimodal.
 */

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 1. SIMULANDO PROVEDORES DE IA (OpenAI instável vs. Gemini como Fallback estável)
async function chamarOpenAIVision(documento, tentativa) {
    console.log(`   ⏳ [Tentativa #${tentativa}] Chamando Provedor Primário (OpenAI GPT-4o Vision)...`);
    await esperar(300);
    // Simulando um erro real de produção (Erro 503 - Servidor sobrecarregado)
    throw new Error("HTTP 503: OpenAI API temporariamente indisponível (Overloaded).");
}

async function chamarGeminiMultimodalFallback(documento) {
    console.log(`   🛡️ [FALLBACK ACIONADO] Redirecionando chamada para Google Gemini 2.5 Flash Multimodal...`);
    await esperar(250);

    // O modelo multimodal lê o documento bagunçado/imagem e devolve um JSON perfeitamente estruturado
    return JSON.stringify({
        tipo_documento: "NOTA_FISCAL_SERVICO",
        fornecedor: "Cloud Server Brasil LTDA",
        cnpj: "12.345.678/0001-99",
        data_emissao: "2026-10-24",
        itens: [
            { descricao: "Servidor Dedicado GPU L4", valor: 1850.0 },
            { descricao: "Banco PostgreSQL Gerenciado (pgvector)", valor: 450.0 }
        ],
        valor_total: 2300.0,
        auditoria_ia: {
            soma_correta: true,
            risco_fraude: "BAIXO",
            categoria_finops: "INFRAESTRUTURA_IA"
        }
    });
}

// 2. ORQUESTRADOR BACK-END COM RETRY, FALLBACK E OBSERVABILIDADE
async function processarDocumentoComResiliencia(imagemOuTextoBruto, maxRetries = 2) {
    const inicio = Date.now();
    const traceLog = {
        traceId: "TRC-" + Math.floor(100000 + Math.random() * 900000),
        promptVersion: "v2.1-ocr-financeiro-multimodal",
        provedorInicial: "OpenAI-GPT4o-Vision",
        provedorFinal: null,
        tentativasRealizadas: 0,
        usouFallback: false,
        status: "PENDENTE",
        latenciaTotalMs: 0
    };

    console.log(`\n=============================================================`);
    console.log(`📄 INICIANDO OCR INTELIGENTE | Trace ID: ${traceLog.traceId}`);
    console.log(`=============================================================`);

    let respostaStringJSON = null;

    // Etapa A: Tenta o provedor principal com política de Re-tentativas (Retries)
    for (let tentativa = 1; tentativa <= maxRetries; tentativa++) {
        traceLog.tentativasRealizadas++;
        try {
            respostaStringJSON = await chamarOpenAIVision(imagemOuTextoBruto, tentativa);
            traceLog.provedorFinal = "OpenAI-GPT4o-Vision";
            break;
        } catch (erro) {
            console.log(`   ❌ Falha detectada: ${erro.message}`);
            if (tentativa < maxRetries) {
                console.log(`   🔄 Aguardando 500ms para nova tentativa (Backoff)...`);
                await esperar(500);
            }
        }
    }

    // Etapa B: Se todas as tentativas falharem, aciona o Fallback automático!
    if (!respostaStringJSON) {
        traceLog.usouFallback = true;
        traceLog.tentativasRealizadas++;
        respostaStringJSON = await chamarGeminiMultimodalFallback(imagemOuTextoBruto);
        traceLog.provedorFinal = "Google-Gemini-2.5-Flash";
    }

    // Etapa C: Validação do Schema JSON (Garante que o back-end não quebre)
    const dadosExtraidos = JSON.parse(respostaStringJSON);
    traceLog.status = "SUCESSO_200";
    traceLog.latenciaTotalMs = Date.now() - inicio;

    console.log(`\n✅ DADOS EXTRAÍDOS E VALIDADOS PELO OCR MULTIMODAL:`);
    console.log(dadosExtraidos);

    console.log(`\n📊 LOG DE OBSERVABILIDADE (LLMOps Trace):`);
    console.table(traceLog);
}

// Simulando o envio de uma foto/PDF de Nota Fiscal recebida no sistema:
const notaFiscalRecebida = "IMG_BASE64_NF_CLOUD_SERVER_2300_REAIS";
processarDocumentoComResiliencia(notaFiscalRecebida);