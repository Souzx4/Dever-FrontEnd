function searchDocs() {
    // 1. Pega o valor digitado
    let input = document.getElementById('searchInput').value.toLowerCase();
    
    // 2. Pega todas as categorias (seções maiores)
    let categorias = document.querySelectorAll('.categoria');

    // Variável para saber se achou ALGO em toda a página
    let encontrouAlgoGeral = false;

    categorias.forEach(categoria => {
        // Pega os itens DESTA categoria específica
        let items = categoria.querySelectorAll('.item');
        let temItemVisivelNessaCategoria = false;

        items.forEach(item => {
            let text = item.textContent.toLowerCase();
            
            // Verifica se o texto digitado existe no item
            if (text.includes(input)) {
                item.classList.remove('hide');
                temItemVisivelNessaCategoria = true;
                encontrouAlgoGeral = true;
            } else {
                item.classList.add('hide');
            }
        });

        // 3. Lógica para esconder a CATEGORIA (o título) se não tiver itens visíveis nela
        if (temItemVisivelNessaCategoria) {
            categoria.classList.remove('hide');
        } else {
            categoria.classList.add('hide');
        }
    });

    // Opcional: Aqui você poderia mostrar uma mensagem de "Nenhum resultado"
    // se 'encontrouAlgoGeral' for falso.
}