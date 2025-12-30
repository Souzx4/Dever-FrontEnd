function searchDocs() {
     // Pega o valor digitado e converte para minúsculo
    let input = document.getElementById('searchInput').value.toLowerCase();
    
    // Seleciona todos os blocos de conteúdo que você quer filtrar
    // Aqui pegamos as divs e parágrafos dentro das seções
    let items = document.querySelectorAll('.geral div, .geral p, .geral h2');

    items.forEach(item => {
        let text = item.textContent.toLowerCase();
        
        // Se o texto existir no item, mostra, senão esconde
        if (text.includes(input)) {
            item.classList.remove('hide');
        } else {
            item.classList.add('hide');
        }
    });
}