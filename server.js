// =====================================
// SPORT+ PRO 2.1
// SCRIPT.JS - PARTE 1
// =====================================

// =====================================
// UTILITÁRIOS
// =====================================

function existe(id) {
    return document.getElementById(id);
}

function dinheiro(valor) {
    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}

// =====================================
// TEMA ESCURO
// =====================================

function carregarTema() {

    const tema =
    localStorage.getItem("tema");

    if (tema === "dark") {

        document.body.classList.add(
            "dark"
        );

    }

}

function alternarTema() {

    document.body.classList.toggle(
        "dark"
    );

    const escuro =
    document.body.classList.contains(
        "dark"
    );

    localStorage.setItem(
        "tema",
        escuro ? "dark" : "light"
    );

}

// =====================================
// LOGOUT
// =====================================

async function logout() {

    try {

        await fetch(
            "/logout",
            {
                method: "POST"
            }
        );

    } catch (e) {
        console.error(e);
    }

    location.href =
    "login.html";

}

// =====================================
// VERIFICAR SESSÃO
// =====================================

async function verificarSessao() {

    try {

        const resposta =
        await fetch("/session");

        if (!resposta.ok) {

            location.href =
            "login.html";

            return;

        }

        const usuario =
        await resposta.json();

        if (
            !usuario &&
            !location.pathname.includes("login")
        ) {

            location.href =
            "login.html";

        }

    } catch (erro) {

        console.error(erro);

    }

}

// =====================================
// DASHBOARD
// =====================================

async function carregarDashboard() {

    if (
        !existe("totalClientes")
    ) return;

    try {

        const resposta =
        await fetch("/dashboard");

        const dados =
        await resposta.json();

        if (existe("totalClientes")) {
            existe("totalClientes")
            .textContent =
            dados.clientes || 0;
        }

        if (existe("totalProdutos")) {
            existe("totalProdutos")
            .textContent =
            dados.produtos || 0;
        }

        if (existe("totalVendas")) {
            existe("totalVendas")
            .textContent =
            dados.vendas || 0;
        }

        if (existe("totalFaturamento")) {
            existe("totalFaturamento")
            .textContent =
            dinheiro(
                dados.faturamento
            );
        }

    } catch (erro) {

        console.error(
            "Erro Dashboard:",
            erro
        );

    }

}

// =====================================
// ESTOQUE BAIXO
// =====================================

async function carregarEstoqueBaixo() {

    if (
        !existe("estoqueBaixo")
    ) return;

    try {

        const resposta =
        await fetch("/produtos");

        const produtos =
        await resposta.json();

        const estoqueBaixo =
        produtos.filter(
            produto =>
            Number(produto.estoque) <= 5
        );

        let html = "";

        estoqueBaixo.forEach(
            produto => {

            html += `
            <tr>
                <td>${produto.nome}</td>
                <td>${produto.estoque}</td>
            </tr>
            `;

        });

        existe(
            "estoqueBaixo"
        ).innerHTML = html;

    } catch (erro) {

        console.error(erro);

    }

}

// =====================================
// TOP PRODUTOS
// =====================================

async function carregarTopProdutos() {

    if (
        !existe("topProdutos")
    ) return;

    try {

        const resposta =
        await fetch(
            "/relatorio/top-produtos"
        );

        const produtos =
        await resposta.json();

        let html = "";

        produtos.forEach(
            item => {

            html += `
            <tr>
                <td>${item.nome}</td>
                <td>${item.total}</td>
            </tr>
            `;

        });

        existe(
            "topProdutos"
        ).innerHTML = html;

    } catch (erro) {

        console.error(erro);

    }

}

// =====================================
// EVENTOS GLOBAIS
// =====================================

document.addEventListener(
"DOMContentLoaded",
() => {

    carregarTema();

    verificarSessao();

    carregarDashboard();

    carregarEstoqueBaixo();

    carregarTopProdutos();

    const btnTema =
    existe("btnTema");

    if (btnTema) {

        btnTema.addEventListener(
            "click",
            alternarTema
        );

    }

    const btnLogout =
    existe("btnLogout");

    if (btnLogout) {

        btnLogout.addEventListener(
            "click",
            logout
        );

    }

});// =====================================
// CLIENTES
// PARTE 2
// =====================================

let clientesCache = [];

// =====================================
// CARREGAR CLIENTES
// =====================================

async function carregarClientes() {

    if (!existe("tabelaClientes"))
        return;

    try {

        const resposta =
        await fetch("/clientes");

        clientesCache =
        await resposta.json();

        renderizarClientes(
            clientesCache
        );

        atualizarEstatisticasClientes();

    } catch (erro) {

        console.error(
            "Erro clientes:",
            erro
        );

    }

}

// =====================================
// RENDERIZAR CLIENTES
// =====================================

function renderizarClientes(lista) {

    let html = "";

    lista.forEach(cliente => {

        html += `
        <tr>

            <td>${cliente.id}</td>

            <td>${cliente.nome}</td>

            <td>${cliente.email}</td>

            <td>${cliente.telefone}</td>

            <td>

                <button
                class="btn-warning"
                onclick="editarCliente(${cliente.id})">
                Editar
                </button>

                <button
                class="btn-danger"
                onclick="excluirCliente(${cliente.id})">
                Excluir
                </button>

            </td>

        </tr>
        `;

    });

    existe(
        "tabelaClientes"
    ).innerHTML = html;

}

// =====================================
// SALVAR CLIENTE
// =====================================

async function salvarCliente() {

    const id =
    existe("clienteId").value;

    const dados = {

        nome:
        existe("clienteNome")
        .value.trim(),

        email:
        existe("clienteEmail")
        .value.trim(),

        telefone:
        existe("clienteTelefone")
        .value.trim()

    };

    if (!dados.nome) {

        alert(
            "Informe o nome."
        );

        return;

    }

    try {

        if (id) {

            await fetch(
                "/clientes/" + id,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                        "application/json"
                    },
                    body:
                    JSON.stringify(
                        dados
                    )
                }
            );

        } else {

            await fetch(
                "/clientes",
                {
                    method: "POST",
                    headers: {
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

        limparCliente();

        carregarClientes();

    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao salvar cliente."
        );

    }

}

// =====================================
// EDITAR CLIENTE
// =====================================

function editarCliente(id) {

    const cliente =
    clientesCache.find(
        c => c.id == id
    );

    if (!cliente) return;

    existe("clienteId")
    .value = cliente.id;

    existe("clienteNome")
    .value = cliente.nome;

    existe("clienteEmail")
    .value = cliente.email;

    existe("clienteTelefone")
    .value = cliente.telefone;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

// =====================================
// EXCLUIR CLIENTE
// =====================================

async function excluirCliente(id) {

    const confirmar =
    confirm(
        "Deseja excluir este cliente?"
    );

    if (!confirmar)
        return;

    try {

        await fetch(
            "/clientes/" + id,
            {
                method: "DELETE"
            }
        );

        carregarClientes();

    } catch (erro) {

        console.error(erro);

    }

}

// =====================================
// LIMPAR FORM
// =====================================

function limparCliente() {

    existe(
        "clienteId"
    ).value = "";

    existe(
        "clienteNome"
    ).value = "";

    existe(
        "clienteEmail"
    ).value = "";

    existe(
        "clienteTelefone"
    ).value = "";

}

// =====================================
// PESQUISA
// =====================================

function pesquisarCliente() {

    const texto =
    existe(
        "pesquisaCliente"
    )
    .value
    .toLowerCase();

    const filtrado =
    clientesCache.filter(
        cliente =>

        (cliente.nome || "")
        .toLowerCase()
        .includes(texto)

        ||

        (cliente.email || "")
        .toLowerCase()
        .includes(texto)

        ||

        (cliente.telefone || "")
        .toLowerCase()
        .includes(texto)

    );

    renderizarClientes(
        filtrado
    );

}

// =====================================
// ESTATÍSTICAS
// =====================================

function atualizarEstatisticasClientes() {

    if (
        existe(
            "estatisticaClientes"
        )
    ) {

        existe(
            "estatisticaClientes"
        ).textContent =
        clientesCache.length;

    }

}

// =====================================
// EVENTOS CLIENTES
// =====================================

document.addEventListener(
"DOMContentLoaded",
() => {

    if (
        existe(
            "btnSalvarCliente"
        )
    ) {

        existe(
            "btnSalvarCliente"
        )
        .addEventListener(
            "click",
            salvarCliente
        );

    }

    if (
        existe(
            "btnCancelarCliente"
        )
    ) {

        existe(
            "btnCancelarCliente"
        )
        .addEventListener(
            "click",
            limparCliente
        );

    }

    if (
        existe(
            "pesquisaCliente"
        )
    ) {

        existe(
            "pesquisaCliente"
        )
        .addEventListener(
            "keyup",
            pesquisarCliente
        );

    }

    carregarClientes();

});// =====================================
// PRODUTOS
// PARTE 3
// =====================================

let produtosCache = [];

// =====================================
// CARREGAR PRODUTOS
// =====================================

async function carregarProdutos() {

    if (!existe("tabelaProdutos"))
        return;

    try {

        const resposta =
        await fetch("/produtos");

        produtosCache =
        await resposta.json();

        renderizarProdutos(
            produtosCache
        );

        atualizarEstatisticasProdutos();

        atualizarTabelaEstoqueBaixo();

    } catch (erro) {

        console.error(
            "Erro produtos:",
            erro
        );

    }

}

// =====================================
// RENDERIZAR PRODUTOS
// =====================================

function renderizarProdutos(lista) {

    let html = "";

    lista.forEach(produto => {

        html += `
        <tr>

            <td>
                <img
                src="${produto.imagem || 'https://via.placeholder.com/70'}"
                class="produto-img"
                onerror="this.src='https://via.placeholder.com/70'">
            </td>

            <td>${produto.nome}</td>

            <td>${produto.categoria}</td>

            <td>${dinheiro(produto.preco)}</td>

            <td>${produto.estoque}</td>

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

    existe(
        "tabelaProdutos"
    ).innerHTML = html;

}

// =====================================
// SALVAR PRODUTO
// =====================================

async function salvarProduto() {

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

    if (!dados.nome) {

        alert(
            "Informe o nome do produto."
        );

        return;

    }

    try {

        if (id) {

            await fetch(
                "/produtos/" + id,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                        "application/json"
                    },
                    body:
                    JSON.stringify(
                        dados
                    )
                }
            );

        } else {

            await fetch(
                "/produtos",
                {
                    method: "POST",
                    headers: {
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

    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao salvar produto."
        );

    }

}

// =====================================
// EDITAR PRODUTO
// =====================================

function editarProduto(id) {

    const produto =
    produtosCache.find(
        p => p.id == id
    );

    if (!produto) return;

    existe("produtoId")
    .value = produto.id;

    existe("produtoNome")
    .value = produto.nome;

    existe("produtoCategoria")
    .value = produto.categoria;

    existe("produtoPreco")
    .value = produto.preco;

    existe("produtoEstoque")
    .value = produto.estoque;

    existe("produtoImagem")
    .value = produto.imagem || "";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

// =====================================
// EXCLUIR PRODUTO
// =====================================

async function excluirProduto(id) {

    const confirmar =
    confirm(
        "Deseja excluir este produto?"
    );

    if (!confirmar)
        return;

    try {

        await fetch(
            "/produtos/" + id,
            {
                method: "DELETE"
            }
        );

        carregarProdutos();

    } catch (erro) {

        console.error(erro);

    }

}

// =====================================
// LIMPAR FORM
// =====================================

function limparProduto() {

    existe("produtoId").value = "";
    existe("produtoNome").value = "";
    existe("produtoCategoria").value = "";
    existe("produtoPreco").value = "";
    existe("produtoEstoque").value = "";
    existe("produtoImagem").value = "";

}

// =====================================
// PESQUISA
// =====================================

function pesquisarProduto() {

    const texto =
    existe("pesquisaProduto")
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

function atualizarTabelaEstoqueBaixo() {

    if (
        !existe(
            "tabelaEstoqueBaixo"
        )
    ) return;

    const baixos =
    produtosCache.filter(
        produto =>
        Number(produto.estoque) <= 5
    );

    let html = "";

    baixos.forEach(produto => {

        html += `
        <tr>
            <td>${produto.nome}</td>
            <td>${produto.estoque}</td>
        </tr>
        `;

    });

    existe(
        "tabelaEstoqueBaixo"
    ).innerHTML = html;

}

// =====================================
// ESTATÍSTICAS
// =====================================

function atualizarEstatisticasProdutos() {

    if (
        existe(
            "estatisticaProdutos"
        )
    ) {

        existe(
            "estatisticaProdutos"
        ).textContent =
        produtosCache.length;

    }

    if (
        existe(
            "estatisticaEstoqueBaixo"
        )
    ) {

        const total =
        produtosCache.filter(
            produto =>
            Number(produto.estoque) <= 5
        ).length;

        existe(
            "estatisticaEstoqueBaixo"
        ).textContent =
        total;

    }

}

// =====================================
// EVENTOS PRODUTOS
// =====================================

document.addEventListener(
"DOMContentLoaded",
() => {

    if (existe("btnSalvarProduto")) {

        existe("btnSalvarProduto")
        .addEventListener(
            "click",
            salvarProduto
        );

    }

    if (existe("btnCancelarProduto")) {

        existe("btnCancelarProduto")
        .addEventListener(
            "click",
            limparProduto
        );

    }

    if (existe("pesquisaProduto")) {

        existe("pesquisaProduto")
        .addEventListener(
            "keyup",
            pesquisarProduto
        );

    }

    carregarProdutos();

});// =====================================
// VENDAS
// PARTE 4
// =====================================

let carrinho = [];
let clientesVenda = [];
let produtosVenda = [];

// =====================================
// CARREGAR DADOS
// =====================================

async function carregarDadosVenda() {

    if (!existe("vendaCliente"))
        return;

    try {

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

    } catch (erro) {

        console.error(
            "Erro venda:",
            erro
        );

    }

}

// =====================================
// CLIENTES SELECT
// =====================================

function preencherClientesVenda() {

    const select =
    existe("vendaCliente");

    if (!select) return;

    let html =
    `<option value="">Selecione um cliente</option>`;

    clientesVenda.forEach(cliente => {

        html += `
        <option value="${cliente.id}">
            ${cliente.nome}
        </option>
        `;

    });

    select.innerHTML = html;

}

// =====================================
// PRODUTOS SELECT
// =====================================

function preencherProdutosVenda() {

    const select =
    existe("vendaProduto");

    if (!select) return;

    let html =
    `<option value="">Selecione um produto</option>`;

    produtosVenda.forEach(produto => {

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
// ADICIONAR CARRINHO
// =====================================

function adicionarCarrinho() {

    const produtoId =
    Number(
        existe("vendaProduto").value
    );

    const quantidade =
    Number(
        existe("vendaQuantidade").value
    );

    if (!produtoId) {

        alert(
            "Selecione um produto."
        );

        return;

    }

    if (quantidade <= 0) {

        alert(
            "Quantidade inválida."
        );

        return;

    }

    const produto =
    produtosVenda.find(
        p => p.id === produtoId
    );

    if (!produto) return;

    if (
        quantidade >
        Number(produto.estoque)
    ) {

        alert(
            "Estoque insuficiente."
        );

        return;

    }

    const existente =
    carrinho.find(
        item =>
        item.produto_id === produto.id
    );

    if (existente) {

        existente.quantidade +=
        quantidade;

    } else {

        carrinho.push({

            produto_id:
            produto.id,

            nome:
            produto.nome,

            preco:
            Number(produto.preco),

            quantidade

        });

    }

    renderizarCarrinho();

}

// =====================================
// REMOVER ITEM
// =====================================

function removerCarrinho(id) {

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

function limparCarrinho() {

    carrinho = [];

    renderizarCarrinho();

}

// =====================================
// TOTAL
// =====================================

function calcularTotal() {

    return carrinho.reduce(
        (soma, item) =>

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

function renderizarCarrinho() {

    const tabela =
    existe("tabelaCarrinho");

    if (!tabela) return;

    let html = "";

    carrinho.forEach(item => {

        html += `
        <tr>

            <td>${item.nome}</td>

            <td>
                ${dinheiro(item.preco)}
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
                onclick="removerCarrinho(${item.produto_id})">
                Remover
                </button>

            </td>

        </tr>
        `;

    });

    tabela.innerHTML = html;

    const total =
    calcularTotal();

    if (
        existe("totalCarrinho")
    ) {

        existe(
            "totalCarrinho"
        ).textContent =
        "Total: " +
        dinheiro(total);

    }

    if (
        existe(
            "estatisticaItensCarrinho"
        )
    ) {

        existe(
            "estatisticaItensCarrinho"
        ).textContent =
        carrinho.length;

    }

    if (
        existe(
            "estatisticaValorCarrinho"
        )
    ) {

        existe(
            "estatisticaValorCarrinho"
        ).textContent =
        dinheiro(total);

    }

}

// =====================================
// FINALIZAR VENDA
// =====================================

async function finalizarVenda() {

    const cliente_id =
    Number(
        existe("vendaCliente").value
    );

    if (!cliente_id) {

        alert(
            "Selecione um cliente."
        );

        return;

    }

    if (
        carrinho.length === 0
    ) {

        alert(
            "Carrinho vazio."
        );

        return;

    }

    try {

        const resposta =
        await fetch(
            "/vendas",
            {
                method: "POST",

                headers: {
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

        if (dados.success) {

            alert(
                "Venda realizada com sucesso!"
            );

            carrinho = [];

            renderizarCarrinho();

            carregarDadosVenda();

        } else {

            alert(
                "Erro ao registrar venda."
            );

        }

    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao finalizar venda."
        );

    }

}

// =====================================
// EVENTOS VENDAS
// =====================================

document.addEventListener(
"DOMContentLoaded",
() => {

    if (
        existe(
            "btnAdicionarCarrinho"
        )
    ) {

        existe(
            "btnAdicionarCarrinho"
        )
        .addEventListener(
            "click",
            adicionarCarrinho
        );

    }

    if (
        existe(
            "btnLimparCarrinho"
        )
    ) {

        existe(
            "btnLimparCarrinho"
        )
        .addEventListener(
            "click",
            limparCarrinho
        );

    }

    if (
        existe(
            "btnFinalizarVenda"
        )
    ) {

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
// CONSULTAS E HISTÓRICO
// PARTE 5
// =====================================

let vendasCache = [];

// =====================================
// CARREGAR VENDAS
// =====================================

async function carregarConsultas() {

    if (!existe("tabelaConsultas"))
        return;

    try {

        const resposta =
        await fetch("/vendas");

        vendasCache =
        await resposta.json();

        renderizarConsultas(
            vendasCache
        );

        atualizarEstatisticasConsultas();

    } catch (erro) {

        console.error(
            "Erro consultas:",
            erro
        );

    }

}

// =====================================
// RENDERIZAR CONSULTAS
// =====================================

function renderizarConsultas(lista) {

    const tabela =
    existe("tabelaConsultas");

    if (!tabela) return;

    let html = "";

    lista.forEach(venda => {

        html += `
        <tr>

            <td>${venda.id}</td>

            <td>
                ${dinheiro(venda.total)}
            </td>

            <td>
                ${new Date(
                    venda.data
                ).toLocaleString("pt-BR")}
            </td>

            <td>

                <button
                class="btn-primary"
                onclick="verDetalhesVenda(${venda.id})">
                Ver Detalhes
                </button>

            </td>

        </tr>
        `;

    });

    tabela.innerHTML = html;

}

// =====================================
// DETALHES DA VENDA
// =====================================

async function verDetalhesVenda(id) {

    try {

        const resposta =
        await fetch(
            "/vendas/" + id
        );

        const itens =
        await resposta.json();

        let texto =
        `Venda #${id}\n\n`;

        itens.forEach(item => {

            texto +=
            `${item.quantidade}x - Produto ${item.produto_id}\n`;

        });

        alert(texto);

    } catch (erro) {

        console.error(erro);

    }

}

// =====================================
// FILTRO POR DATA
// =====================================

async function filtrarVendas() {

    const inicio =
    existe("dataInicio")?.value;

    const fim =
    existe("dataFim")?.value;

    if (!inicio || !fim) {

        carregarConsultas();

        return;

    }

    try {

        const resposta =
        await fetch(
            `/vendas/filtro?inicio=${inicio}&fim=${fim}`
        );

        const dados =
        await resposta.json();

        renderizarConsultas(
            dados
        );

    } catch (erro) {

        console.error(erro);

    }

}

// =====================================
// ESTATÍSTICAS
// =====================================

function atualizarEstatisticasConsultas() {

    if (
        existe(
            "estatisticaTotalVendas"
        )
    ) {

        existe(
            "estatisticaTotalVendas"
        ).textContent =
        vendasCache.length;

    }

    if (
        existe(
            "estatisticaFaturamento"
        )
    ) {

        const total =
        vendasCache.reduce(
            (soma, venda) =>
            soma + Number(venda.total),
            0
        );

        existe(
            "estatisticaFaturamento"
        ).textContent =
        dinheiro(total);

    }

}

// =====================================
// EVENTOS CONSULTAS
// =====================================

document.addEventListener(
"DOMContentLoaded",
() => {

    if (
        existe(
            "btnFiltrar"
        )
    ) {

        existe(
            "btnFiltrar"
        )
        .addEventListener(
            "click",
            filtrarVendas
        );

    }

    carregarConsultas();

});

// =====================================
// FIM DO SCRIPT
// SPORT+ PRO 2.1
// =====================================
