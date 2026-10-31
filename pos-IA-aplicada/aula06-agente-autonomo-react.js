/**
 * AULA 06 - ENGENHARIA DE IA APLICADA (MÓDULO 4 - UNIDADES 1 A 5)
 * Prática: Agente Autônomo com Ciclo ReAct (Thought -> Action -> Observation),
 * Autoavaliação (Reflection Pattern), Memória Episódica e Context Pruning.
 */

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

class AgenteAutonomoReAct {
    constructor(nome) {
        this.nome = nome;
        this.MAX_ITERACOES = 6; // Guardrail contra loop infinito (Unidade 7)

        // MEMÓRIA DO AGENTE (Curto Prazo + Episódica)
        this.memoria = {
            curtoPrazo: [], // Histórico de passos da tarefa atual
            episodica: [
                "Lembrança #01: Nunca tente rodar REINDEX direto em horário comercial sem usar modo CONCURRENTLY, pois trava a tabela."
            ]
        };

        // TOOLBOX (Ferramentas conectadas via Function Calling / MCP - Unidade 3)
        this.toolbox = {
            diagnosticar_metricas_cliente: ({ empresa }) => ({
                status: "DEGRADADO",
                latenciaMediaMs: 4200,
                causaDetectada: "Índice corrompido na tabela 'pedidos' do PostgreSQL"
            }),

            executar_sql_reparo: ({ comandoSql }) => {
                // Simulando falha se o agente esquecer o modo seguro (testando o Reflection!)
                if (!comandoSql.includes("CONCURRENTLY")) {
                    throw new Error("ERRO POSTGRES: Comando REINDEX comum bloqueado para evitar lock em produção!");
                }
                return { sucesso: true, mensagem: `Comando '${comandoSql}' executado sem travar o banco. Latência caiu para 38ms!` };
            },

            notificar_cliente: ({ empresa, mensagem }) => ({
                enviado: true,
                canal: "Slack Enterprise + E-mail",
                protocolo: "NOTIF-" + Math.floor(1000 + Math.random() * 9000)
            })
        };
    }

    // UNIDADE 5: Context Pruning (Mantém o contexto enxuto podando detalhes antigos)
    realizarContextPruning() {
        if (this.memoria.curtoPrazo.length > 3) {
            console.log(`   ✂️ [CONTEXT PRUNING] Podando logs brutos antigos para economizar tokens...`);
            this.memoria.curtoPrazo[0].observacao = "[Resumo Compactado: Diagnóstico inicial concluído]";
        }
    }

    // O CÉREBRO DO AGENTE (Simula o raciocínio do LLM decidindo o próximo passo do loop)
    pensarProximoPasso(objetivo) {
        const passoAtual = this.memoria.curtoPrazo.length + 1;
        const ultimoRegistro = this.memoria.curtoPrazo[this.memoria.curtoPrazo.length - 1];

        // Passo 1: Ainda não sabe o que está causando a lentidão -> Diagnostica
        if (passoAtual === 1) {
            return {
                thought: "Preciso primeiro investigar as métricas da TechCorp para descobrir a causa raiz da lentidão.",
                action: { tool: "diagnosticar_metricas_cliente", args: { empresa: "TechCorp" } }
            };
        }

        // Passo 2: Descobriu índice corrompido -> Tenta reparar (mas erra na 1ª tentativa)
        if (passoAtual === 2) {
            return {
                thought: "O diagnóstico mostrou índice corrompido na tabela 'pedidos'. Vou rodar um REINDEX no banco.",
                action: { tool: "executar_sql_reparo", args: { comandoSql: "REINDEX TABLE pedidos;" } }
            };
        }

        // Passo 3: REFLECTION PATTERN! O agente vê que tomou erro no Passo 2, consulta a memória episódica e se corrige!
        if (ultimoRegistro && ultimoRegistro.erro) {
            return {
                thought: `🔍 [REFLECTION / AUTOCORREÇÃO] Meu comando anterior falhou com o erro: "${ultimoRegistro.observacao}". Consultando minha Memória Episódica (${this.memoria.episodica[0]}), devo usar 'REINDEX TABLE CONCURRENTLY pedidos;'!`,
                action: { tool: "executar_sql_reparo", args: { comandoSql: "REINDEX TABLE CONCURRENTLY pedidos;" } }
            };
        }

        // Passo 4: Banco reparado com sucesso -> Notifica o cliente
        if (passoAtual === 4) {
            return {
                thought: "O reparo com CONCURRENTLY funcionou e a latência voltou para 38ms. Agora vou notificar o cliente.",
                action: {
                    tool: "notificar_cliente",
                    args: { empresa: "TechCorp", mensagem: "Índice otimizado com zero downtime. Sistema normalizado (38ms)." }
                }
            };
        }

        // Passo 5: Tudo concluído -> Finaliza o Agent Loop
        return {
            thought: "O problema foi diagnosticado, corrigido no banco e o cliente já foi notificado. Missão cumprida!",
            finalAnswer: "Incidente da TechCorp resolvido autonomamente em 4 etapas (com 1 autocorreção via Reflection)."
        };
    }

    // O MOTOR DE EXECUÇÃO (Agent Loop: Percepção -> Raciocínio -> Ação -> Feedback)
    async executarMissao(objetivo) {
        console.log(`\n======================================================================`);
        console.log(`🤖 INICIANDO AGENTE AUTÔNOMO: ${this.nome}`);
        console.log(`🎯 OBJETIVO: "${objetivo}"`);
        console.log(`======================================================================`);

        for (let iteracao = 1; iteracao <= this.MAX_ITERACOES; iteracao++) {
            console.log(`\n🔄 [Ciclo #${iteracao} do Agent Loop]`);
            this.realizarContextPruning();

            const decisao = this.pensarProximoPasso(objetivo);
            console.log(`   🧠 RACIOCÍNIO (Thought): ${decisao.thought}`);

            // Se o agente decidiu que terminou a missão, sai do loop!
            if (decisao.finalAnswer) {
                console.log(`\n✅ [MISSÃO CONCLUÍDA PELO AGENTE]: ${decisao.finalAnswer}`);
                break;
            }

            // Executa a Tool escolhida (Function Calling)
            const { tool, args } = decisao.action;
            console.log(`   🛠️ AÇÃO (Tool Call)    : ${tool}(${JSON.stringify(args)})`);
            await esperar(300);

            try {
                const resultadoTool = this.toolbox[tool](args);
                console.log(`   👁️ OBSERVAÇÃO (Feedback): ${JSON.stringify(resultadoTool)}`);
                this.memoria.curtoPrazo.push({ iteracao, tool, observacao: resultadoTool, erro: false });
            } catch (erroExecucao) {
                console.log(`   ❌ OBSERVAÇÃO DE ERRO  : ${erroExecucao.message}`);
                this.memoria.curtoPrazo.push({ iteracao, tool, observacao: erroExecucao.message, erro: true });
            }
        }
    }
}

// Disparando nosso Agente Autônomo:
const agenteSRE = new AgenteAutonomoReAct("Agente-SRE-Autonomo-v1");
agenteSRE.executarMissao("Investigar lentidão na TechCorp, reparar o banco de dados e avisar o cliente.");