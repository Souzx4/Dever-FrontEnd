let num = document.querySelector('input#fnum')
let lista = document.querySelector('input#flista')
let res = document.querySelector('div#res')
let valores = []

function isNumero(n) {
    if (Number(n) >= 1 && Number(n) <= 100) {
        return true
    } else {
        return false
    }
}

function isLista(n, l) {
    if (l.indexOf(Number(n)) != -1) { //indica que o numero já está na lista
        return true
    } else {
        return false
    }
}

function adicionar() {
    if (isNumero(num.value) && !isLista(num.value, valores)){ // ele só vai dicionar se for um numero válido e não estiver na lista
        
    alert('Valor inválido ou já encontrado na lista.')
    }
}