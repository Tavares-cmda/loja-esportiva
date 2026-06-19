// =====================================
// SPORT+ PRO 2.1
// script.js
// PARTE 1
// =====================================

// =====================================
// UTILITÁRIOS
// =====================================

function existe(id){
    return document.getElementById(id);
}

function dinheiro(valor){

    return Number(valor || 0)
    .toLocaleString(
        "pt-BR",
        {
            style:"currency",
            currency:"BRL"
        }
    );

}

// =====================================
// VERIFICAR SESSÃO
// =====================================

async function verificarSessao(){

    try{

        const resposta =
        await fetch("/session");

        if(!resposta.ok){
            location.href = "login.html";
            return;
        }

        const usuario =
        await resposta.json();

        if(!usuario){

            if(
                !location.pathname
                .includes("login")
            ){

                location.href =
                "login.html";

            }

        }

    }catch{

        if(
            !location.pathname
            .includes("login")
        ){

            location.href =
            "login.html";

        }

    }

}

// =====================================
// LOGOUT
// =====================================

async function logout(){

    try{

        await fetch(
            "/logout",
            {
                method:"POST"
            }
        );

    }catch{}

    location.href =
    "login.html";

}

// =====================================
// EVENTO LOGOUT
// =====================================

document.addEventListener(
"DOMContentLoaded",
()=>{

    const btnLogout =
    existe("btnLogout");

    if(btnLogout){

        btnLogout
        .addEventListener(
            "click",
            logout
        );

    }

});

// =====================================
// DARK MODE
// =====================================

function carregarTema(){

    const tema =
    localStorage.getItem(
        "tema"
    );

    if(
        tema === "dark"
    ){

        document.body
        .classList
        .add("dark");

    }

}

function alternarTema(){

    document.body
    .classList
    .toggle("dark");

    const escuro =
    document.body
    .classList
    .contains("dark");

    localStorage.setItem(
        "tema",
        escuro
        ? "dark"
        : "light"
    );

}

document.addEventListener(
"DOMContentLoaded",
()=>{

    carregarTema();

    const btnTema =
    existe("btnTema");

    if(btnTema){

        btnTema
        .addEventListener(
            "click",
            alternarTema
        );

    }

});

// =====================================
// DASHBOARD
// =====================================

async function carregarDashboard(){

    if(
        !existe("totalClientes")
    ) return;

    try{

        const resposta =
        await fetch(
            "/dashboard"
        );

        const dados =
        await resposta.json();

        if(
            existe(
                "totalClientes"
            )
        ){

            document
            .getElementById(
                "totalClientes"
            )
            .textContent =
            dados.clientes || 0;

        }

        if(
            existe(
                "totalProdutos"
            )
        ){

            document
            .getElementById(
                "totalProdutos"
            )
            .textContent =
            dados.produtos || 0;

        }

        if(
            existe(
                "totalVendas"
            )
        ){

            document
            .getElementById(
                "totalVendas"
            )
            .textContent =
            dados.vendas || 0;

        }

        if(
            existe(
                "totalFaturamento"
            )
        ){

            document
            .getElementById(
                "totalFaturamento"
            )
            .textContent =
            dinheiro(
                dados.faturamento
            );

        }

    }catch(err){

        console.error(
            "Erro dashboard:",
            err
        );

    }

}

// =====================================
// ESTOQUE BAIXO
// =====================================

async function carregarEstoqueBaixo(){

    if(
        !existe(
            "estoqueBaixo"
        )
    ) return;

    try{

        const resposta =
        await fetch(
            "/produtos"
        );

        const produtos =
        await resposta.json();

        const baixos =
        produtos.filter(
            p =>
            Number(
                p.estoque
            ) <= 5
        );

        let html = "";

        baixos.forEach(
            produto=>{

            html += `
            <tr>

            <td>
                ${produto.nome}
            </td>

            <td>
                ${produto.estoque}
            </td>

            </tr>
            `;

        });

        document
        .getElementById(
            "estoqueBaixo"
        )
        .innerHTML =
        html;

    }catch(err){

        console.error(err);

    }

}

// =====================================
// TOP PRODUTOS
// =====================================

async function carregarTopProdutos(){

    if(
        !existe(
            "topProdutos"
        )
    ) return;

    try{

        const resposta =
        await fetch(
            "/relatorio/top-produtos"
        );

        const produtos =
        await resposta.json();

        let html = "";

        produtos.forEach(
            item=>{

            html += `
            <tr>

            <td>
                ${item.nome}
            </td>

            <td>
                ${item.total}
            </td>

            </tr>
            `;

        });

        document
        .getElementById(
            "topProdutos"
        )
        .innerHTML =
        html;

    }catch(err){

        console.error(err);

    }

}

// =====================================
// INICIALIZAÇÃO
// =====================================

document.addEventListener(
"DOMContentLoaded",
()=>{

    verificarSessao();

    carregarDashboard();

    carregarEstoqueBaixo();

    carregarTopProdutos();

});// =====================================
// SPORT+ PRO 2.1
// script.js
// PARTE 1
// =====================================

// =====================================
// UTILITÁRIOS
// =====================================

function existe(id){
    return document.getElementById(id);
}

function dinheiro(valor){

    return Number(valor || 0)
    .toLocaleString(
        "pt-BR",
        {
            style:"currency",
            currency:"BRL"
        }
    );

}

// =====================================
// VERIFICAR SESSÃO
// =====================================

async function verificarSessao(){

    try{

        const resposta =
        await fetch("/session");

        if(!resposta.ok){
            location.href = "login.html";
            return;
        }

        const usuario =
        await resposta.json();

        if(!usuario){

            if(
                !location.pathname
                .includes("login")
            ){

                location.href =
                "login.html";

            }

        }

    }catch{

        if(
            !location.pathname
            .includes("login")
        ){

            location.href =
            "login.html";

        }

    }

}

// =====================================
// LOGOUT
// =====================================

async function logout(){

    try{

        await fetch(
            "/logout",
            {
                method:"POST"
            }
        );

    }catch{}

    location.href =
    "login.html";

}

// =====================================
// EVENTO LOGOUT
// =====================================

document.addEventListener(
"DOMContentLoaded",
()=>{

    const btnLogout =
    existe("btnLogout");

    if(btnLogout){

        btnLogout
        .addEventListener(
            "click",
            logout
        );

    }

});

// =====================================
// DARK MODE
// =====================================

function carregarTema(){

    const tema =
    localStorage.getItem(
        "tema"
    );

    if(
        tema === "dark"
    ){

        document.body
        .classList
        .add("dark");

    }

}

function alternarTema(){

    document.body
    .classList
    .toggle("dark");

    const escuro =
    document.body
    .classList
    .contains("dark");

    localStorage.setItem(
        "tema",
        escuro
        ? "dark"
        : "light"
    );

}

document.addEventListener(
"DOMContentLoaded",
()=>{

    carregarTema();

    const btnTema =
    existe("btnTema");

    if(btnTema){

        btnTema
        .addEventListener(
            "click",
            alternarTema
        );

    }

});

// =====================================
// DASHBOARD
// =====================================

async function carregarDashboard(){

    if(
        !existe("totalClientes")
    ) return;

    try{

        const resposta =
        await fetch(
            "/dashboard"
        );

        const dados =
        await resposta.json();

        if(
            existe(
                "totalClientes"
            )
        ){

            document
            .getElementById(
                "totalClientes"
            )
            .textContent =
            dados.clientes || 0;

        }

        if(
            existe(
                "totalProdutos"
            )
        ){

            document
            .getElementById(
                "totalProdutos"
            )
            .textContent =
            dados.produtos || 0;

        }

        if(
            existe(
                "totalVendas"
            )
        ){

            document
            .getElementById(
                "totalVendas"
            )
            .textContent =
            dados.vendas || 0;

        }

        if(
            existe(
                "totalFaturamento"
            )
        ){

            document
            .getElementById(
                "totalFaturamento"
            )
            .textContent =
            dinheiro(
                dados.faturamento
            );

        }

    }catch(err){

        console.error(
            "Erro dashboard:",
            err
        );

    }

}

// =====================================
// ESTOQUE BAIXO
// =====================================

async function carregarEstoqueBaixo(){

    if(
        !existe(
            "estoqueBaixo"
        )
    ) return;

    try{

        const resposta =
        await fetch(
            "/produtos"
        );

        const produtos =
        await resposta.json();

        const baixos =
        produtos.filter(
            p =>
            Number(
                p.estoque
            ) <= 5
        );

        let html = "";

        baixos.forEach(
            produto=>{

            html += `
            <tr>

            <td>
                ${produto.nome}
            </td>

            <td>
                ${produto.estoque}
            </td>

            </tr>
            `;

        });

        document
        .getElementById(
            "estoqueBaixo"
        )
        .innerHTML =
        html;

    }catch(err){

        console.error(err);

    }

}

// =====================================
// TOP PRODUTOS
// =====================================

async function carregarTopProdutos(){

    if(
        !existe(
            "topProdutos"
        )
    ) return;

    try{

        const resposta =
        await fetch(
            "/relatorio/top-produtos"
        );

        const produtos =
        await resposta.json();

        let html = "";

        produtos.forEach(
            item=>{

            html += `
            <tr>

            <td>
                ${item.nome}
            </td>

            <td>
                ${item.total}
            </td>

            </tr>
            `;

        });

        document
        .getElementById(
            "topProdutos"
        )
        .innerHTML =
        html;

    }catch(err){

        console.error(err);

    }

}

// =====================================
// INICIALIZAÇÃO
// =====================================

document.addEventListener(
"DOMContentLoaded",
()=>{

    verificarSessao();

    carregarDashboard();

    carregarEstoqueBaixo();

    carregarTopProdutos();

});// =====================================
// PRODUTOS
// PARTE 3
// =====================================

let produtosCache = [];

// =====================================
// CARREGAR PRODUTOS
// =====================================

async function carregarProdutos(){

    if(!existe("tabelaProdutos")) return;

    try{

        const resposta =
        await fetch("/produtos");

        produtosCache =
        await resposta.json();

        renderizarProdutos(
            produtosCache
        );

        atualizarEstatisticasProdutos();

        atualizarTabelaEstoqueBaixo();

    }catch(err){

        console.error(
            "Erro produtos:",
            err
        );

    }

}

// =====================================
// RENDERIZAR PRODUTOS
// =====================================

function renderizarProdutos(lista){

    let html = "";

    lista.forEach(produto=>{

        html += `
        <tr>

            <td>
                <img
                src="${
                    produto.imagem ||
                    'https://via.placeholder.com/70'
                }"
                class="produto-img"
                onerror="this.src='https://via.placeholder.com/70'">
            </td>

            <td>${produto.nome}</td>

            <td>${produto.categoria}</td>

            <td>
                ${dinheiro(produto.preco)}
            </td>

            <td>
                ${produto.estoque}
            </td>

            <td>

                <button
                class="btn-warning"
                onclick="editarProduto(${produto.id})">
                Editar
                </button>

                <button
                class="btn-danger"
                onclick="excluirProduto(${produto.id})">
                Excluir
                </button>

            </td>

        </tr>
        `;

    });

    document
    .getElementById(
        "tabelaProdutos"
    )
    .innerHTML = html;

}

// =====================================
// SALVAR PRODUTO
// =====================================

async function salvarProduto(){

    const id =
    existe("produtoId").value;

    const dados = {

        nome:
        existe("produtoNome")
        .value.trim(),

        categoria:
        existe("produtoCategoria")
        .value,

        preco:
        Number(
            existe("produtoPreco")
            .value
        ),

        estoque:
        Number(
            existe("produtoEstoque")
            .value
        ),

        imagem:
        existe("produtoImagem")
        .value.trim()

    };

    if(!dados.nome){

        alert(
            "Informe o nome do produto."
        );

        return;

    }

    try{

        if(id){

            await fetch(
                "/produtos/" + id,
                {
                    method:"PUT",
                    headers:{
                        "Content-Type":
                        "application/json"
                    },
                    body:
                    JSON.stringify(
                        dados
                    )
                }
            );

        }else{

            await fetch(
                "/produtos",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":
                        "application/json"
                    },
                    body:
                    JSON.stringify(
                        dados
                    )
                }
            );

        }

        limparProduto();

        carregarProdutos();

    }catch(err){

        console.error(err);

        alert(
            "Erro ao salvar produto."
        );

    }

}

// =====================================
// EDITAR PRODUTO
// =====================================

function editarProduto(id){

    const produto =
    produtosCache.find(
        p => p.id == id
    );

    if(!produto) return;

    existe(
        "produtoId"
    ).value =
    produto.id;

    existe(
        "produtoNome"
    ).value =
    produto.nome;

    existe(
        "produtoCategoria"
    ).value =
    produto.categoria;

    existe(
        "produtoPreco"
    ).value =
    produto.preco;

    existe(
        "produtoEstoque"
    ).value =
    produto.estoque;

    existe(
        "produtoImagem"
    ).value =
    produto.imagem || "";

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}

// =====================================
// EXCLUIR PRODUTO
// =====================================

async function excluirProduto(id){

    const confirmar =
    confirm(
        "Deseja excluir este produto?"
    );

    if(!confirmar) return;

    try{

        await fetch(
            "/produtos/" + id,
            {
                method:"DELETE"
            }
        );

        carregarProdutos();

    }catch(err){

        console.error(err);

    }

}

// =====================================
// LIMPAR FORM
// =====================================

function limparProduto(){

    existe(
        "produtoId"
    ).value = "";

    existe(
        "produtoNome"
    ).value = "";

    existe(
        "produtoCategoria"
    ).value = "";

    existe(
        "produtoPreco"
    ).value = "";

    existe(
        "produtoEstoque"
    ).value = "";

    existe(
        "produtoImagem"
    ).value = "";

}

// =====================================
// PESQUISA
// =====================================

function pesquisarProduto(){

    const texto =
    existe(
        "pesquisaProduto"
    )
    .value
    .toLowerCase();

    const filtrado =
    produtosCache.filter(
        produto =>

        (produto.nome || "")
        .toLowerCase()
        .includes(texto)

        ||

        (produto.categoria || "")
        .toLowerCase()
        .includes(texto)

    );

    renderizarProdutos(
        filtrado
    );

}

// =====================================
// ESTOQUE BAIXO
// =====================================

function atualizarTabelaEstoqueBaixo(){

    if(
        !existe(
            "tabelaEstoqueBaixo"
        )
    ) return;

    const baixos =
    produtosCache.filter(
        produto =>
        Number(
            produto.estoque
        ) <= 5
    );

    let html = "";

    baixos.forEach(produto=>{

        html += `
        <tr>

            <td>
                ${produto.nome}
            </td>

            <td>
                ${produto.estoque}
            </td>

        </tr>
        `;

    });

    document
    .getElementById(
        "tabelaEstoqueBaixo"
    )
    .innerHTML = html;

}

// =====================================
// ESTATÍSTICAS
// =====================================

function atualizarEstatisticasProdutos(){

    if(
        existe(
            "estatisticaProdutos"
        )
    ){

        document
        .getElementById(
            "estatisticaProdutos"
        )
        .textContent =
        produtosCache.length;

    }

    if(
        existe(
            "estatisticaEstoqueBaixo"
        )
    ){

        const totalBaixo =
        produtosCache.filter(
            produto =>
            Number(
                produto.estoque
            ) <= 5
        ).length;

        document
        .getElementById(
            "estatisticaEstoqueBaixo"
        )
        .textContent =
        totalBaixo;

    }

}

// =====================================
// EVENTOS PRODUTOS
// =====================================

document.addEventListener(
"DOMContentLoaded",
()=>{

    if(
        existe(
            "btnSalvarProduto"
        )
    ){

        existe(
            "btnSalvarProduto"
        )
        .addEventListener(
            "click",
            salvarProduto
        );

    }

    if(
        existe(
            "btnCancelarProduto"
        )
    ){

        existe(
            "btnCancelarProduto"
        )
        .addEventListener(
            "click",
            limparProduto
        );

    }

    if(
        existe(
            "pesquisaProduto"
        )
    ){

        existe(
            "pesquisaProduto"
        )
        .addEventListener(
            "keyup",
            pesquisarProduto
        );

    }

    carregarProdutos();

});// =====================================
// VENDAS E CARRINHO
// PARTE 4
// =====================================

let carrinho = [];
let clientesVenda = [];
let produtosVenda = [];

// =====================================
// CARREGAR DADOS DOS SELECTS
// =====================================

async function carregarDadosVenda(){

    if(!existe("vendaCliente")) return;

    try{

        const clientesResp =
        await fetch("/clientes");

        clientesVenda =
        await clientesResp.json();

        const produtosResp =
        await fetch("/produtos");

        produtosVenda =
        await produtosResp.json();

        preencherClientesVenda();

        preencherProdutosVenda();

    }catch(err){

        console.error(
            "Erro ao carregar venda:",
            err
        );

    }

}

// =====================================
// CLIENTES
// =====================================

function preencherClientesVenda(){

    const select =
    existe("vendaCliente");

    if(!select) return;

    let html =
    `<option value="">Selecione um cliente</option>`;

    clientesVenda.forEach(cliente=>{

        html += `
        <option value="${cliente.id}">
            ${cliente.nome}
        </option>
        `;

    });

    select.innerHTML = html;

}

// =====================================
// PRODUTOS
// =====================================

function preencherProdutosVenda(){

    const select =
    existe("vendaProduto");

    if(!select) return;

    let html =
    `<option value="">Selecione um produto</option>`;

    produtosVenda.forEach(produto=>{

        html += `
        <option value="${produto.id}">
            ${produto.nome}
            (${produto.estoque} un.)
        </option>
        `;

    });

    select.innerHTML = html;

}

// =====================================
// ADICIONAR AO CARRINHO
// =====================================

function adicionarCarrinho(){

    const produtoId =
    Number(
        existe("vendaProduto").value
    );

    const quantidade =
    Number(
        existe("vendaQuantidade").value
    );

    if(!produtoId){

        alert(
            "Selecione um produto."
        );

        return;

    }

    if(
        quantidade <= 0
    ){

        alert(
            "Quantidade inválida."
        );

        return;

    }

    const produto =
    produtosVenda.find(
        p => p.id === produtoId
    );

    if(!produto) return;

    const existente =
    carrinho.find(
        item =>
        item.produto_id === produto.id
    );

    if(existente){

        existente.quantidade +=
        quantidade;

    }else{

        carrinho.push({

            produto_id:
            produto.id,

            nome:
            produto.nome,

            preco:
            Number(
                produto.preco
            ),

            quantidade

        });

    }

    renderizarCarrinho();

}

// =====================================
// REMOVER ITEM
// =====================================

function removerCarrinho(id){

    carrinho =
    carrinho.filter(
        item =>
        item.produto_id !== id
    );

    renderizarCarrinho();

}

// =====================================
// LIMPAR CARRINHO
// =====================================

function limparCarrinho(){

    carrinho = [];

    renderizarCarrinho();

}

// =====================================
// TOTAL
// =====================================

function calcularTotal(){

    return carrinho.reduce(
        (soma,item)=>

        soma +

        (
            item.preco *
            item.quantidade
        ),

        0
    );

}

// =====================================
// RENDERIZAR
// =====================================

function renderizarCarrinho(){

    const tabela =
    existe(
        "tabelaCarrinho"
    );

    if(!tabela) return;

    let html = "";

    carrinho.forEach(item=>{

        html += `
        <tr>

            <td>
                ${item.nome}
            </td>

            <td>
                ${dinheiro(
                    item.preco
                )}
            </td>

            <td>
                ${item.quantidade}
            </td>

            <td>
                ${dinheiro(
                    item.preco *
                    item.quantidade
                )}
            </td>

            <td>

                <button
                class="btn-danger"
                onclick="
                removerCarrinho(
                ${item.produto_id}
                )">

                Remover

                </button>

            </td>

        </tr>
        `;

    });

    tabela.innerHTML = html;

    const total =
    calcularTotal();

    if(
        existe(
            "totalCarrinho"
        )
    ){

        existe(
            "totalCarrinho"
        ).textContent =
        "Total: " +
        dinheiro(total);

    }

    if(
        existe(
            "estatisticaItensCarrinho"
        )
    ){

        existe(
            "estatisticaItensCarrinho"
        ).textContent =
        carrinho.length;

    }

    if(
        existe(
            "estatisticaValorCarrinho"
        )
    ){

        existe(
            "estatisticaValorCarrinho"
        ).textContent =
        dinheiro(total);

    }

}

// =====================================
// FINALIZAR VENDA
// =====================================

async function finalizarVenda(){

    const cliente_id =
    Number(
        existe(
            "vendaCliente"
        ).value
    );

    if(!cliente_id){

        alert(
            "Selecione um cliente."
        );

        return;

    }

    if(
        carrinho.length === 0
    ){

        alert(
            "Carrinho vazio."
        );

        return;

    }

    try{

        const resposta =
        await fetch(
            "/vendas",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:
                JSON.stringify({

                    cliente_id,

                    itens:
                    carrinho,

                    total:
                    calcularTotal()

                })

            }
        );

        const dados =
        await resposta.json();

        if(dados.success){

            alert(
                "Venda realizada com sucesso!"
            );

            carrinho = [];

            renderizarCarrinho();

            carregarDadosVenda();

        }

    }catch(err){

        console.error(err);

        alert(
            "Erro ao finalizar venda."
        );

    }

}

// =====================================
// EVENTOS
// =====================================

document.addEventListener(
"DOMContentLoaded",
()=>{

    if(
        existe(
            "btnAdicionarCarrinho"
        )
    ){

        existe(
            "btnAdicionarCarrinho"
        )
        .addEventListener(
            "click",
            adicionarCarrinho
        );

    }

    if(
        existe(
            "btnLimparCarrinho"
        )
    ){

        existe(
            "btnLimparCarrinho"
        )
        .addEventListener(
            "click",
            limparCarrinho
        );

    }

    if(
        existe(
            "btnFinalizarVenda"
        )
    ){

        existe(
            "btnFinalizarVenda"
        )
        .addEventListener(
            "click",
            finalizarVenda
        );

    }

    carregarDadosVenda();

});// =====================================
// CONSULTAS E RELATÓRIOS
// PARTE 5
// =====================================

let vendasCache = [];

// =====================================
// CARREGAR VENDAS
// =====================================

async function carregarConsultas(){

    if(!existe("tabelaConsultas"))
        return;

    try{

        const resposta =
        await fetch("/vendas");

        vendasCache =
        await resposta.json();

        renderizarConsultas(
            vendasCache
        );

        atualizarEstatisticasVendas();

    }catch(err){

        console.error(
            "Erro consultas:",
            err
        );

    }

}

// =====================================
// RENDERIZAR TABELA
// =====================================

function renderizarConsultas(lista){

    let html = "";

    lista.forEach(venda=>{

        html += `
        <tr>

            <td>${venda.id}</td>

            <td>
                ${venda.cliente_id || "-"}
            </td>

            <td>
                ${dinheiro(venda.total)}
            </td>

            <td>
                ${new Date(venda.data)
                .toLocaleString("pt-BR")}
            </td>

            <td>

                <button
                class="btn-primary"
                onclick="verDetalhesVenda(${venda.id})">
                Detalhes
                </button>

            </td>

        </tr>
        `;

    });

    existe(
        "tabelaConsultas"
    ).innerHTML = html;

}

// =====================================
// ESTATÍSTICAS
// =====================================

function atualizarEstatisticasVendas(){

    if(
        existe(
            "estatisticaVendas"
        )
    ){

        existe(
            "estatisticaVendas"
        ).textContent =
        vendasCache.length;

    }

    if(
        existe(
            "estatisticaFaturamento"
        )
    ){

        const total =
        vendasCache.reduce(
            (soma,venda)=>

            soma +
            Number(
                venda.total
            ),

            0
        );

        existe(
            "estatisticaFaturamento"
        ).textContent =
        dinheiro(total);

    }

}

// =====================================
// FILTRO
// =====================================

function filtrarVendas(){

    const inicio =
    existe(
        "filtroInicio"
    ).value;

    const fim =
    existe(
        "filtroFim"
    ).value;

    if(!inicio || !fim){

        renderizarConsultas(
            vendasCache
        );

        return;

    }

    const filtrado =
    vendasCache.filter(
        venda=>{

        const data =
        venda.data
        .substring(0,10);

        return (
            data >= inicio &&
            data <= fim
        );

    });

    renderizarConsultas(
        filtrado
    );

}

// =====================================
// DETALHES
// =====================================

async function verDetalhesVenda(id){

    try{

        const resposta =
        await fetch(
            "/vendas/" + id
        );

        const itens =
        await resposta.json();

        let html =
        `
        <table>

        <thead>

        <tr>

        <th>Produto</th>
        <th>Qtd</th>
        <th>Preço</th>

        </tr>

        </thead>

        <tbody>
        `;

        itens.forEach(item=>{

            html += `
            <tr>

            <td>
            ${item.produto_id}
            </td>

            <td>
            ${item.quantidade}
            </td>

            <td>
            ${dinheiro(
                item.preco
            )}
            </td>

            </tr>
            `;

        });

        html += `
        </tbody>
        </table>
        `;

        existe(
            "detalhesVenda"
        ).innerHTML =
        html;

        existe(
            "modalVenda"
        ).style.display =
        "flex";

    }catch(err){

        console.error(err);

    }

}

// =====================================
// FECHAR MODAL
// =====================================

function fecharModal(){

    if(
        existe(
            "modalVenda"
        )
    ){

        existe(
            "modalVenda"
        ).style.display =
        "none";

    }

}

// =====================================
// EVENTOS CONSULTAS
// =====================================

document.addEventListener(
"DOMContentLoaded",
()=>{

    if(
        existe(
            "btnFiltrarVendas"
        )
    ){

        existe(
            "btnFiltrarVendas"
        )
        .addEventListener(
            "click",
            filtrarVendas
        );

    }

    if(
        existe(
            "fecharModal"
        )
    ){

        existe(
            "fecharModal"
        )
        .addEventListener(
            "click",
            fecharModal
        );

    }

    carregarConsultas();

});
