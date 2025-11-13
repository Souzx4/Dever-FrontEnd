let numero = document.getElementById('num')
let select = document.getElementById('sele')
let res = document.getElementById('res')
let valores = [] // Array para armazenar os valores adicionados
    
function isNumero(n) {
    if (Number(n) >= 1 && Number(n) <= 100) {
        return true
    } else {
        return false
    }
}

function inLista(n, l) {
    if (l.indexOf(Number(n)) != -1) {
        return true
    } else {
        return false
    }
}

function Adicionar() {
    if (isNumero(numero.value) && !inLista(numero.value, valores)) {
        valores.push(Number(numero.value))
        let option = document.createElement('option')
        option.text = `Valor ${numero.value} adicionado.`
        select.appendChild(option)
    } else {
        alert('Valor invalido ou já encontrado na lista.')
    }
    numero.value = ''
    numero.focus()
}

function Analisar() {
    if (valores.length == 0) {
        alert('Adicione valores antes de finalizar!')
        return
    } else {
        // ao todo, temos X números cadastrados
        let total = valores.length
        // o maior valor informado foi X
        let maior = Math.max(...valores)
        // o menor valor informado foi X
        let menor = Math.min(...valores)
        // a soma entre os valores foi X
        let soma = valores.reduce((a, b) => a + b, 0)
        // a média dos valores digitados foi X
        let media = soma / total
        res.innerHTML = ''
        res.innerHTML += `<p>Ao todo, temos ${total} números cadastrados.</p>`
        res.innerHTML += `<p> O maior valor informado foi ${maior}.</p>`
        res.innerHTML += `<p> O menor valor informado foi ${menor}.</p>`
        res.innerHTML += `<p> A soma entre os valores foi ${soma}.</p>`
        res.innerHTML += `<p> A média dos valores digitados foi ${media}.</p>`

    }
}