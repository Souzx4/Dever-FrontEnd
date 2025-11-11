function contar() {
    let inicio = document.getElementById('conti')
    let fim = document.getElementById('contf')
    let passo = document.getElementById('contp')
    let res = document.getElementById('res')
    
    if (inicio.value.length == 0 || fim.value.length == 0 || passo.value.length == 0){
        res.innerHTML = 'Impossivel contar'
        alert('[ERRO] Faltam dados!')
    } else {
        res.innerHTML = 'Contando: <br>'
        let i = Number(inicio.value)
        let f = Number(fim.value)
        let p = Number(passo.value)
        if (p <= 0) {
            alert('Passo invalido! Considerando passo 1')
            p = 1
        }
        if (i < f) {
            for (let c = i; c <= f; c += p) {
            //contagem crescente
                res.innerHTML += `${c} \u{1F449}`
            }
            
        } else {
            for (let c = i; c >= f; c -= p) {
                // contagem decrecente
                res.innerHTML += `${c} \u{1f449}`
            }
        }
        res.innerHTML += `\u{1f3c1}`
    }           

}