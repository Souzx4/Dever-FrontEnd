let num = document.querySelector('input#fnum')
let lista = document.querySelector('select#flista')
let res = document.querySelector('div#res')
let valores = []

function isNumero(n) {
    if (Number(n) >= 1 && Number(n) <= 100) {
        return true
    } else {
        return false
    }
}

function inLista(n, l) {
    if (l.indexOf(Number(n)) != -1) { //indica que o numero já está na lista
        return true
    } else {
        return false
    }
}

function adicionar() {
    if (isNumero(num.value) && !inLista(num.value, valores)){ // ele só vai dicionar se for um numero válido e não estiver na lista
        valores.push(Number(num.value)) //adiciona o valor na lista
        let item = document.createElement('option') //cria um elemento option
        item.text = `Valor ${num.value} adicionado.` //adiciona o texto ao elemento option
        lista.appendChild(item) //adiciona o elemento option na lista
        res.innerHTML = '' //limpa a res toda vez que adicionar um novo valor
    } else {
        alert('Valor inválido ou já encontrado na lista.')
    }
    num.value = '' //limpa o campo
    num.focus() //deixa o cursor piscando no campo
}

function finalizar() {
    if (valores.length == 0) {
        alert('Adicione valores antes de finalizar!')
    } else {
        let total = valores.length //quantidade de elementos na lista
        let maior = valores[0] //maior valor da lista
        let menor = valores[0] //menor valor da lista
        let soma = 0 //soma dos valores da lista
        let media = 0 //média dos valores da lista
        for (let pos in valores) {
            if (valores[pos] > maior) 
                maior = valores[pos]
            if (valores[pos] < menor)
                menor = valores[pos]
            soma += valores[pos]
            media = soma / total
        }
        res.innerHTML = ''
        res.innerHTML += `<p>Ao todo, temos ${total} números cadastrados.</p>`
        res.innerHTML += `<p>O maior valor informado foi ${maior}.</p>`
        res.innerHTML += `<p>O menor valor informado foi ${menor}.</p>`
        res.innerHTML += `<p>Somando todos os valores temos ${soma}.</p>`
        res.innerHTML += `<p>A media dos valores digitados é ${media}.</p>`
    }
}
