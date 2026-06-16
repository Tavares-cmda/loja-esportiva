const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('.'));

/* ============================
   BANCO DE DADOS
============================ */

const db = new sqlite3.Database('./lojaesportiva.db');

db.serialize(() => {

    // CLIENTES
    db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cpf TEXT NOT NULL,
            telefone TEXT NOT NULL
        )
    `);

    // PRODUTOS
    db.run(`
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            categoria TEXT NOT NULL,
            preco REAL NOT NULL,
            estoque INTEGER NOT NULL
        )
    `);

    // VENDAS
    db.run(`
        CREATE TABLE IF NOT EXISTS vendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id INTEGER,
            data TEXT,
            total REAL,
            FOREIGN KEY(cliente_id)
            REFERENCES clientes(id)
        )
    `);

    // ITENS DA VENDA
    db.run(`
        CREATE TABLE IF NOT EXISTS itens_venda (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            venda_id INTEGER,
            produto_id INTEGER,
            quantidade INTEGER,
            preco_unitario REAL,
            FOREIGN KEY(venda_id)
            REFERENCES vendas(id),
            FOREIGN KEY(produto_id)
            REFERENCES produtos(id)
        )
    `);

});

/* ============================
   CLIENTES
============================ */

// CADASTRAR CLIENTE

app.post('/salvar-cliente', (req, res) => {

    const {
        nome,
        cpf,
        telefone
    } = req.body;

    db.run(
        `
        INSERT INTO clientes
        (nome, cpf, telefone)
        VALUES (?, ?, ?)
        `,
        [nome, cpf, telefone],
        (err) => {

            if (err) {
                return res
                .status(500)
                .send(err.message);
            }

            res.redirect('/clientes.html');

        }
    );

});

// LISTAR CLIENTES

app.get('/listar-clientes', (req, res) => {

    db.all(
        `
        SELECT *
        FROM clientes
        ORDER BY nome
        `,
        [],
        (err, rows) => {

            if (err) {
                return res
                .status(500)
                .json(err);
            }

            res.json(rows);

        }
    );

});

// BUSCAR CLIENTES

app.get('/buscar-clientes/:nome', (req, res) => {

    const nome = req.params.nome;

    db.all(
        `
        SELECT *
        FROM clientes
        WHERE nome LIKE ?
        `,
        [`%${nome}%`],
        (err, rows) => {

            if (err) {
                return res
                .status(500)
                .json(err);
            }

            res.json(rows);

        }
    );

});
/* ============================
   PRODUTOS
============================ */

// CADASTRAR PRODUTO

app.post('/salvar-produto', (req, res) => {

    const {
        nome,
        categoria,
        preco,
        estoque
    } = req.body;

    db.run(
        `
        INSERT INTO produtos
        (nome, categoria, preco, estoque)
        VALUES (?, ?, ?, ?)
        `,
        [
            nome,
            categoria,
            preco,
            estoque
        ],
        (err) => {

            if (err) {
                return res
                .status(500)
                .send(err.message);
            }

            res.redirect('/produtos.html');

        }
    );

});

// LISTAR PRODUTOS

app.get('/listar-produtos', (req, res) => {

    db.all(
        `
        SELECT *
        FROM produtos
        ORDER BY nome
        `,
        [],
        (err, rows) => {

            if (err) {
                return res
                .status(500)
                .json(err);
            }

            res.json(rows);

        }
    );

});

// BUSCAR PRODUTOS

app.get('/buscar-produtos/:nome', (req, res) => {

    const nome = req.params.nome;

    db.all(
        `
        SELECT *
        FROM produtos
        WHERE nome LIKE ?
        `,
        [`%${nome}%`],
        (err, rows) => {

            if (err) {
                return res
                .status(500)
                .json(err);
            }

            res.json(rows);

        }
    );

});

// EDITAR PRODUTO

app.put('/editar-produto/:id', (req, res) => {

    const id = req.params.id;

    const {
        nome,
        categoria,
        preco,
        estoque
    } = req.body;

    db.run(
        `
        UPDATE produtos
        SET
        nome = ?,
        categoria = ?,
        preco = ?,
        estoque = ?
        WHERE id = ?
        `,
        [
            nome,
            categoria,
            preco,
            estoque,
            id
        ],
        function(err) {

            if (err) {
                return res
                .status(500)
                .json(err);
            }

            res.json({
                success: true
            });

        }
    );

});

// EXCLUIR PRODUTO

app.delete('/excluir-produto/:id', (req, res) => {

    const id = req.params.id;

    db.run(
        `
        DELETE FROM produtos
        WHERE id = ?
        `,
        [id],
        function(err) {

            if (err) {
                return res
                .status(500)
                .json(err);
            }

            res.json({
                success: true
            });

        }
    );

});

// REABASTECER ESTOQUE

app.put('/adicionar-estoque/:id', (req, res) => {

    const id = req.params.id;

    const {
        quantidade
    } = req.body;

    db.run(
        `
        UPDATE produtos
        SET estoque = estoque + ?
        WHERE id = ?
        `,
        [
            quantidade,
            id
        ],
        function(err) {

            if (err) {
                return res
                .status(500)
                .json(err);
            }

            res.json({
                success: true
            });

        }
    );

});

// PRODUTOS COM ESTOQUE BAIXO

app.get('/estoque-baixo', (req, res) => {

    db.all(
        `
        SELECT *
        FROM produtos
        WHERE estoque <= 5
        ORDER BY estoque ASC
        `,
        [],
        (err, rows) => {

            if (err) {
                return res
                .status(500)
                .json(err);
            }

            res.json(rows);

        }
    );

});
/* ============================
   VENDAS
============================ */

// FINALIZAR VENDA

app.post('/finalizar-venda', (req, res) => {

    const {
        cliente_id,
        total,
        itens
    } = req.body;

    const data =
    new Date().toLocaleString('pt-BR');

    // VALIDAR ESTOQUE

    const verificarEstoque = (index = 0) => {

        if (index >= itens.length) {
            return registrarVenda();
        }

        const item = itens[index];

        db.get(
            `
            SELECT estoque
            FROM produtos
            WHERE id = ?
            `,
            [item.id],
            (err, produto) => {

                if (err) {
                    return res
                    .status(500)
                    .json(err);
                }

                if (!produto) {
                    return res
                    .status(404)
                    .json({
                        erro: 'Produto não encontrado.'
                    });
                }

                if (produto.estoque < item.qtd) {

                    return res
                    .status(400)
                    .json({
                        erro:
                        'Estoque insuficiente para um dos produtos.'
                    });

                }

                verificarEstoque(index + 1);

            }
        );

    };

    // REGISTRAR VENDA

    const registrarVenda = () => {

        db.run(
            `
            INSERT INTO vendas
            (
                cliente_id,
                data,
                total
            )
            VALUES (?, ?, ?)
            `,
            [
                cliente_id,
                data,
                total
            ],
            function(err) {

                if (err) {
                    return res
                    .status(500)
                    .json(err);
                }

                const vendaId =
                this.lastID;

                const stmt =
                db.prepare(`
                    INSERT INTO itens_venda
                    (
                        venda_id,
                        produto_id,
                        quantidade,
                        preco_unitario
                    )
                    VALUES (?, ?, ?, ?)
                `);

                itens.forEach(item => {

                    // ITEM DA VENDA

                    stmt.run(
                        vendaId,
                        item.id,
                        item.qtd,
                        item.preco
                    );

                    // BAIXA ESTOQUE

                    db.run(
                        `
                        UPDATE produtos
                        SET estoque =
                        estoque - ?
                        WHERE id = ?
                        `,
                        [
                            item.qtd,
                            item.id
                        ]
                    );

                });

                stmt.finalize();

                res.json({
                    success: true
                });

            }
        );

    };

    verificarEstoque();

});

// LISTAR VENDAS

app.get('/listar-vendas', (req, res) => {

    const sql = `
    SELECT
        v.id,
        v.data,
        v.total,
        c.nome AS nome_cliente
    FROM vendas v
    INNER JOIN clientes c
    ON c.id = v.cliente_id
    ORDER BY v.id DESC
    `;

    db.all(
        sql,
        [],
        (err, rows) => {

            if (err) {
                return res
                .status(500)
                .json(err);
            }

            res.json(rows);

        }
    );

});

// DETALHES DA VENDA

app.get('/detalhes-venda/:id', (req, res) => {

    const id =
    req.params.id;

    const sql = `
    SELECT
        p.nome,
        i.quantidade,
        i.preco_unitario
    FROM itens_venda i
    INNER JOIN produtos p
    ON p.id = i.produto_id
    WHERE i.venda_id = ?
    `;

    db.all(
        sql,
        [id],
        (err, rows) => {

            if (err) {
                return res
                .status(500)
                .json(err);
            }

            res.json(rows);

        }
    );

});

// BUSCAR VENDA POR CLIENTE

app.get('/buscar-vendas/:nome', (req, res) => {

    const nome =
    req.params.nome;

    const sql = `
    SELECT
        v.id,
        v.data,
        v.total,
        c.nome AS nome_cliente
    FROM vendas v
    INNER JOIN clientes c
    ON c.id = v.cliente_id
    WHERE c.nome LIKE ?
    ORDER BY v.id DESC
    `;

    db.all(
        sql,
        [`%${nome}%`],
        (err, rows) => {

            if (err) {
                return res
                .status(500)
                .json(err);
            }

            res.json(rows);

        }
    );

});
/* ============================
   DASHBOARD
============================ */

// ESTATÍSTICAS GERAIS

app.get('/dashboard', (req, res) => {

    const dashboard = {
        clientes: 0,
        produtos: 0,
        vendas: 0,
        faturamento: 0,
        produtoMaisVendido: 'Nenhum'
    };

    // TOTAL CLIENTES

    db.get(
        `
        SELECT COUNT(*) AS total
        FROM clientes
        `,
        [],
        (err, clientes) => {

            if (err) {
                return res.status(500).json(err);
            }

            dashboard.clientes =
            clientes.total;

            // TOTAL PRODUTOS

            db.get(
                `
                SELECT COUNT(*) AS total
                FROM produtos
                `,
                [],
                (err, produtos) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    dashboard.produtos =
                    produtos.total;

                    // TOTAL VENDAS

                    db.get(
                        `
                        SELECT COUNT(*) AS total
                        FROM vendas
                        `,
                        [],
                        (err, vendas) => {

                            if (err) {
                                return res.status(500).json(err);
                            }

                            dashboard.vendas =
                            vendas.total;

                            // FATURAMENTO

                            db.get(
                                `
                                SELECT
                                IFNULL(SUM(total),0)
                                AS faturamento
                                FROM vendas
                                `,
                                [],
                                (err, total) => {

                                    if (err) {
                                        return res.status(500).json(err);
                                    }

                                    dashboard.faturamento =
                                    total.faturamento;

                                    // PRODUTO MAIS VENDIDO

                                    db.get(
                                        `
                                        SELECT
                                            p.nome,
                                            SUM(i.quantidade)
                                            AS total_vendido
                                        FROM itens_venda i
                                        INNER JOIN produtos p
                                        ON p.id = i.produto_id
                                        GROUP BY p.id
                                        ORDER BY total_vendido DESC
                                        LIMIT 1
                                        `,
                                        [],
                                        (err, produto) => {

                                            if (err) {
                                                return res.status(500).json(err);
                                            }

                                            if (produto) {

                                                dashboard.produtoMaisVendido =
                                                produto.nome;

                                            }

                                            res.json(dashboard);

                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});

// PRODUTOS MAIS VENDIDOS

app.get('/ranking-produtos', (req, res) => {

    const sql = `
    SELECT
        p.nome,
        SUM(i.quantidade) AS vendidos
    FROM itens_venda i
    INNER JOIN produtos p
    ON p.id = i.produto_id
    GROUP BY p.id
    ORDER BY vendidos DESC
    LIMIT 10
    `;

    db.all(
        sql,
        [],
        (err, rows) => {

            if (err) {
                return res
                .status(500)
                .json(err);
            }

            res.json(rows);

        }
    );

});

// CLIENTES QUE MAIS COMPRARAM

app.get('/ranking-clientes', (req, res) => {

    const sql = `
    SELECT
        c.nome,
        COUNT(v.id) AS compras
    FROM vendas v
    INNER JOIN clientes c
    ON c.id = v.cliente_id
    GROUP BY c.id
    ORDER BY compras DESC
    LIMIT 10
    `;

    db.all(
        sql,
        [],
        (err, rows) => {

            if (err) {
                return res
                .status(500)
                .json(err);
            }

            res.json(rows);

        }
    );

});

/* ============================
   SERVIDOR
============================ */

const PORT = 3000;

app.listen(PORT, () => {

    console.log('====================================');
    console.log('🏆 SPORT+ LOJA ESPORTIVA');
    console.log(`🚀 Servidor: http://localhost:${PORT}`);
    console.log('💾 Banco: lojaesportiva.db');
    console.log('====================================');

});
