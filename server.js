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
