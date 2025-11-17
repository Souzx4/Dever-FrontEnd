// 1. Espera a página carregar
window.addEventListener('DOMContentLoaded', () => {
    // 2. Roda a função principal para calcular tudo
    atualizarTodosOsTotais()
});

function atualizarTodosOsTotais() {
    // Calcula os totais
    const totalValor = calcularSoma('.valor')
    const totalPago = calcularSoma('.pagas')
    const saldoRestante = totalValor - totalPago

    //FORMATA OS VALORES PARA MOEDA BRASILEIRA
    const formatoMoeda = { style: 'currency', currency: 'BRL'}
    const formatoValor = totalValor.toLocaleString('pt-br', formatoMoeda)
    const formatopago = totalPago.toLocaleString('pt-br', formatoMoeda)
    const formatoRestante = saldoRestante.toLocaleString('pt-br', formatoMoeda)

    // Atualiza o HTML no rodapé (tfoot) com os valores calculados
    document.getElementById('res').innerHTML = `<strong>${formatoValor}</strong>`
    document.getElementById('res2').innerHTML = `<strong>${formatopago}</strong>`
    document.getElementById('res3').innerHTML = `<strong>${formatoRestante}</strong>`
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

        // Remove espaços, troca virgula por ponto
        const textoLimpo = texto.trim().replace(',', '.')
        
        // Converte para número e soma
        const valor = parseFloat(textoLimpo)
        if (!isNaN(valor)) {
            soma += valor
        }
    })
    return soma
}
