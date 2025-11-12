let num = [5, 8, 2, 7, 3]
num[6] = 4
num.push(9)
num.sort()
console.log(`Nosso vetor e o ${num} posições`)
console.log(`O primeiro valor do vetor é ${num[0]}`)
console.log(num.length)
let pos = num.indexOf(8)
if (pos == -1){
    console.log('valor não encontrado')
} else {
    console.log(`O valor 8 está na posição ${pos}`)
}
