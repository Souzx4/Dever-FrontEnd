/**
 * AULA 05 - ENGENHARIA DE IA APLICADA (MÓDULO 3 COMPLETO)
 * Hands-on: Criando um MCP Server Corporativo do Zero em JavaScript
 * Inclui: Padronização de Tools/Resources + Segurança (Service Token, Rate Limiting e WAF)
 */

class EnterpriseMCPServer {
    constructor(nomeServidor) {
        this.nomeServidor = nomeServidor;
        this.serviceTokensValidos = new Set(["mcp_secret_token_n8n_prod_2026"]);
        this.rateLimitMap = new Map(); // Controla quantas chamadas cada cliente fez
        this.LIMITE_CHAMADAS_POR_MINUTO = 3;

        // 1. RESOURCES (Dados corporativos expostos para leitura segura pela IA)
        this.resources = {
            "mcp://empresa/status-servicos": () => ({
                api_pagamentos: "ONLINE (Latência: 42ms)",
                banco_postgres: "ONLINE (Conexões: 18/100)",
                worker_n8n: "ONLINE (Filas: 0 pendentes)"
            })
        };

        // 2. TOOLS (Ferramentas executáveis expostas pelo protocolo MCP)
        this.tools = {
            consultar_fatura_crm: {
                descricao: "Consulta o status de fatura e plano de um cliente no CRM pelo ID",
                inputSchema: { type: "object", required: ["clienteId"] },
                executar: ({ clienteId }) => ({
                    clienteId,
                    empresa: "TechCorp Brasil",
                    plano: "Enterprise AI",
                    statusFatura: "PAGA",
                    valorMensal: 2500.0
                })
            },
            criar_ticket_suporte: {
                descricao: "Abre um chamado técnico no sistema de suporte/Jira da empresa",
                inputSchema: { type: "object", required: ["titulo", "prioridade"] },
                executar: ({ titulo, prioridade }) => ({
                    ticketId: "SUP-" + Math.floor(1000 + Math.random() * 9000),
                    titulo,
                    prioridade,
                    status: "ABERTO_NO_JIRA",
                    notificadoNoSlack: true
                })
            }
        };
    }

    // CAMADA DE SEGURANÇA 1: WAF (Web Application Firewall contra SQL/Prompt Injection)
    passarPeloWAF(payloadString) {
        const padroesProibidos = [/drop\s+table/i, /delete\s+from/i, /ignore\s+previous\s+instructions/i, /<script>/i];
        for (const regex of padroesProibidos) {
            if (regex.test(payloadString)) {
                throw new Error("🛡️ [WAF BLOCK] Ataque de Injeção ou comando destrutivo detectado nos parâmetros da IA!");
            }
        }
    }

    // CAMADA DE SEGURANÇA 2: Autenticação Service Token + Rate Limiting
    validarSeguranca(clientId, serviceToken) {
        if (!this.serviceTokensValidos.has(serviceToken)) {
            throw new Error("🔒 [AUTH ERROR 401] Service Token inválido ou não autorizado no MCP Server.");
        }

        const chamadasAtuais = this.rateLimitMap.get(clientId) || 0;
        if (chamadasAtuais >= this.LIMITE_CHAMADAS_POR_MINUTO) {
            throw new Error(`🛑 [RATE LIMIT 429] Cliente '${clientId}' excedeu o limite de ${this.LIMITE_CHAMADAS_POR_MINUTO} chamadas/minuto (Proteção contra Runaway Loop).`);
        }
        this.rateLimitMap.set(clientId, chamadasAtuais + 1);
    }

    // ENDPOINT PADRONIZADO DO PROTOCOLO MCP (JSON-RPC 2.0)
    processarRequisicaoMCP(requisicao) {
        const { clientId, serviceToken, method, params } = requisicao;
        console.log(`\n🔌 [MCP Request] Cliente: ${clientId} | Método: ${method}`);

        try {
            // 1. Valida Token, Rate Limit e WAF antes de tocar no sistema interno
            this.validarSeguranca(clientId, serviceToken);
            this.passarPeloWAF(JSON.stringify(params || {}));

            // 2. Roteamento de métodos padrão do protocolo MCP
            if (method === "tools/list") {
                const listaTools = Object.entries(this.tools).map(([nome, dados]) => ({
                    name: nome,
                    description: dados.descricao,
                    inputSchema: dados.inputSchema
                }));
                return { jsonrpc: "2.0", status: "SUCCESS", result: { tools: listaTools } };
            }

            if (method === "resources/read") {
                const recurso = this.resources[params.uri];
                if (!recurso) throw new Error("Recurso não encontrado.");
                return { jsonrpc: "2.0", status: "SUCCESS", result: recurso() };
            }

            if (method === "tools/call") {
                const tool = this.tools[params.name];
                if (!tool) throw new Error(`Tool '${params.name}' não existe neste MCP.`);
                const resultadoExecucao = tool.executar(params.arguments);
                return { jsonrpc: "2.0", status: "SUCCESS", result: resultadoExecucao };
            }
        } catch (erroSeguranca) {
            return { jsonrpc: "2.0", status: "BLOCKED", error: erroSeguranca.message };
        }
    }
}

// =====================================================================
// SIMULANDO A INTEGRAÇÃO EM PRODUÇÃO (N8N / Agente consumindo o MCP)
// =====================================================================
const mcpEmpresa = new EnterpriseMCPServer("MCP-Core-Empresa");
const TOKEN_CORRETO = "mcp_secret_token_n8n_prod_2026";

console.log("🚀 INICIANDO SERVIDOR MCP CORPORATIVO (AULA 05 - MÓDULO 3)");

// Teste 1: Agente do N8N descobre quais ferramentas existem na empresa (tools/list)
console.log(mcpEmpresa.processarRequisicaoMCP({
    clientId: "Agente-N8N-Atendimento",
    serviceToken: TOKEN_CORRETO,
    method: "tools/list"
}));

// Teste 2: Agente executa uma Tool real para consultar o CRM e abrir chamado no Jira (tools/call)
console.log(mcpEmpresa.processarRequisicaoMCP({
    clientId: "Agente-N8N-Atendimento",
    serviceToken: TOKEN_CORRETO,
    method: "tools/call",
    params: {
        name: "criar_ticket_suporte",
        arguments: { titulo: "Cliente Enterprise solicitou revisão de fatura", prioridade: "ALTA" }
    }
}));

// Teste 3: Tentativa de ataque via Prompt/SQL Injection nos argumentos da IA (WAF deve bloquear!)
console.log(mcpEmpresa.processarRequisicaoMCP({
    clientId: "Agente-N8N-Atendimento",
    serviceToken: TOKEN_CORRETO,
    method: "tools/call",
    params: {
        name: "consultar_fatura_crm",
        arguments: { clienteId: "123; DROP TABLE clientes; --" }
    }
}));

// Teste 4: Agente entra em loop infinito tentando chamar o servidor uma 4ª vez seguida (Rate Limit deve bloquear!)
console.log(mcpEmpresa.processarRequisicaoMCP({
    clientId: "Agente-N8N-Atendimento",
    serviceToken: TOKEN_CORRETO,
    method: "resources/read",
    params: { uri: "mcp://empresa/status-servicos" }
}));