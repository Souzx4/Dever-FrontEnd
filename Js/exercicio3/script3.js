function Verificar() {
    var data = new Date()
    var ano = data.getFullYear()
    var fano = document.querySelector('#tx')
    var res = document.querySelector('#res')
    if(fano.value.length == 0 || Number(fano.value) > ano) {
        alert('[ERRO] verifique os dados e tente novamente!')
    } else {
        var fsex = document.getElementsByName('sex')
        var idade = ano - Number(fano.value)
        var genero = ''
        var img = document.createElement('img')
        img.setAttribute('id', 'foto')
        if (fsex[0].checked) {
            genero = 'homem'
            if (idade >= 0 && idade < 10) {
                //crianca
                img.setAttribute('src', '../img/criancam.jpg')
            } else if (idade < 21) {
                //Jovem
                img.setAttribute('src', '../img/homemJovem.jpg')
            } else if (idade < 50) {
                //Adulto
                img.setAttribute('src', '../img/adultom.jpg')
            } else {
                //idoso
                img.setAttribute('src', '../img/senhor.png')
            }
        } else if (fsex[1].checked) {
            genero = 'mulher'
            if (idade >= 0 && idade < 10) {
                //crianca
                img.setAttribute('src', '../img/criancaf.jpg')
            } else if (idade < 21) {
                //jovem
                img.setAttribute('src', '../img/mulherJovem.jpg')
            } else if (idade < 50) {
                //adulto
                img.setAttribute('src', '../img/adultof.jpg')
            } else {
                //senhora
                img.setAttribute('src', '../img/senhora.jpg')
            }
        }
        res.innerHTML = `Detectamos ${genero} com ${idade} anos.`
        res.style.textAlign = 'center'
        res.appendChild(img)
    }
}