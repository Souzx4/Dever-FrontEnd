var idade = 20
console.log(`Com a idade de ${idade} seu voto é: `)
if (idade < 16 ) {
    console.log('não vota')
} else if (idade < 18 || idade > 65 ) {
    console.log('voto opcional')
} else if (idade >= 18) {
    console.log('voto  obrigatorio')
}