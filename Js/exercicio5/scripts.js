function Tabuada() { 
    let num = document.getElementById('txtn')
    let tab = document.getElementById('seltab')
    if (num.value.length == 0) {
        alert('Por favor, digite um numero!')
    } else {
        tab.innerHTML = '' //para limpar a tabuada antes de gerar uma nova
        let n = Number(num.value)
        let c = 1
        while (c <= 10) {
            let item = document.createElement('option') //cria um elemento option dentro do select no HTML
            item.text = `${n} x ${c} = ${n*c}` // o numero colocado x o contador = resultado
            item.value = `tab${c}` //valor do item (opcional)
            tab.appendChild(item) //adiciona o item na lista
            c++
        }
    }
}