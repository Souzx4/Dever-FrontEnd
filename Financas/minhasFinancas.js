// 1. Espera a página carregar
window.addEventListener('DOMContentLoaded', () => {
    //tenta carregar dados salvos na memoria do navegador
    carregarDadosSalvos()
    // 2. Roda a função principal para calcular tudo
    atualizarTodosOsTotais()

    // O "Ouvinte": Fica vigiando se você digita algo na tabela para recalcular e salvar
    document.querySelector('table').addEventListener('input', () => {
        atualizarTodosOsTotais()
        salvarDados() // salva os dados na memoria do navegador
    })
});

function atualizarTodosOsTotais() {
    // Calcula os totais
    const totalValor = calcularSoma('.valor')
    const totalPago = calcularSoma('.pagas')
    const saldoRestante = totalValor - totalPago

    //FORMATA OS VALORES PARA MOEDA BRASILEIRA
    const formatoMoeda = { style: 'currency', currency: 'BRL'}
    /*const formatoValor = totalValor.toLocaleString('pt-br', formatoMoeda)     <- usar somente se quiser mostrar o total a receber
    const formatopago = totalPago.toLocaleString('pt-br', formatoMoeda)*/       // <- usar somente se quiser mostrar o total já pago
    const formatoRestante = saldoRestante.toLocaleString('pt-br', formatoMoeda)

    // Atualiza o HTML no rodapé (tfoot) com os valores calculados
    /*document.getElementById('res').innerHTML = `<strong>${formatoValor}</strong>`      <- usar somente se quiser mostrar o total a receber
    document.getElementById('res2').innerHTML = `<strong>${formatopago}</strong>`        <- usar somente se quiser mostrar o total já pago
    document.getElementById('res3').innerHTML = `<strong>${formatoRestante}</strong>` */
    const elementoRes = document.getElementById('res3')
    if (elementoRes) {
        elementoRes.innerHTML = `<strong>${formatoRestante}</strong>`
    }
}

function calcularSoma(seletorClasse) {
    const celulas = document.querySelectorAll(seletorClasse)
    let soma = 0

    celulas.forEach(celula => {
        let texto = celula.textContent // ex: "150" ou 5 (juros) = 270

        //limpa o texto para garantir que é um número válido
        if (texto.includes('=')) {
            texto = texto.split('=')[1] // pega " 270"
        }

        // Limpa o texto: tira R$, tira espaços, troca vírgula por ponto
        const textoLimpo = texto.trim()
            .replace('R$', '')
            .replace(/\./g, '')
            .replace(',', '.')
        
        // Converte para número e soma
        const valor = parseFloat(textoLimpo)
        if (!isNaN(valor)) {
            soma += valor
        }
    })
    return soma
}

function adicionarLinha() {
    // adicionar um corpo da tabela
    const tbody = document.querySelector('tbody')
    // cria um elemento na linha tr
    const novaLinha = document.createElement('tr')
    // adicionando os dados na linha
    novaLinha.innerHTML = `
        <td contenteditable="true">Nome do Cliente</td>
        <td class="num" contenteditable="true">data</td>
        <td class="num valor" contenteditable="true">0</td>
        <td contenteditable="true">0</td>
        <td class="num" contenteditable="true">0</td>
        <td class="pagas" contenteditable="true">0</td>
    `
    tbody.appendChild(novaLinha)

    // Atuaizar e salvar assim que cria a linha
    atualizarTodosOsTotais()
    salvarDados()
}

// --- FUNÇÕES DE BANCO DE DADOS (LOCALSTORAGE) ---

function salvarDados() {
    // Pega todo o conteúdo HTML de dentro do corpo da tabela
    const conteudotabela = document.querySelector('tbody').innerHTML
    // Salva no LocalStorage do navegador
    localStorage.setItem('minhasFinancas', conteudotabela)
}

function carregarDadosSalvos() {
    // verificar se existe algo salvo
    const dados = localStorage.getItem('minhasFinancas')
    if (dados) {
        // se existir, substitui o corpo da tabela pelo que foi salvo
        document.querySelector('tbody').innerHTML = dados
    }
}

function resetarDados() {
    // pergunta para confirmar se quer realmente resetar (segurança)
    if ( confirm('Tem certeza que deseja resetar todos os dados?')) {
        localStorage.removeItem('minhasFinancas') // apaga os dados salvos
        location.reload() // recarrega a página
    }
}
