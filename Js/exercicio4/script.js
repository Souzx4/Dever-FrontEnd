function contar() {
    var inicio = document.getElementById('conti')
    var fim = document.getElementById('contf')
    var passo = document.getElementById('contp')
    var res = document.getElementById('res')
    
    if (inicio.value.length == 0 || fim.value.length == 0 || passo.value.length == 0){
        alert('[ERRO] Faltam dados!')
    } else {
        res.innerHTML = 'Contando: '
        let i = Number(inicio.value)
        let f = Number(fim.value)
        let p = Number(passo.value)

        if (let c = i; c <= f; c += p) {
            //contagem crescente
        }
    }
            

}