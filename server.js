const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('.'));

const db = new sqlite3.Database('./sisport.db');

db.serialize(() => {
  // Tabelas
  db.run(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf TEXT,
    telefone TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    preco REAL NOT NULL,
    estoque INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    data TEXT,
    total REAL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS itens_venda (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venda_id INTEGER,
    produto_id INTEGER,
    quantidade INTEGER,
    preco_unitario REAL,
    FOREIGN KEY (venda_id) REFERENCES vendas(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
  )`);
});

// ===================== ROTAS =====================

// Clientes
app.post('/salvar-cliente', (req, res) => {
  const { nome, cpf, telefone } = req.body;
  db.run(`INSERT INTO clientes (nome, cpf, telefone) VALUES (?, ?, ?)`, 
    [nome, cpf, telefone], (err) => {
    if (err) return res.status(500).send("Erro ao salvar cliente");
    res.redirect('/clientes.html');
  });
});

app.get('/listar-clientes', (req, res) => {
  db.all("SELECT * FROM clientes ORDER BY nome", [], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

// Produtos
app.post('/salvar-produto', (req, res) => {
  const { descricao, preco, estoque } = req.body;
  db.run(`INSERT INTO produtos (descricao, preco, estoque) VALUES (?, ?, ?)`, 
    [descricao, parseFloat(preco), parseInt(estoque)], (err) => {
    if (err) return res.status(500).send("Erro ao salvar produto");
    res.redirect('/produtos.html');
  });
});

app.get('/listar-produtos', (req, res) => {
  db.all("SELECT * FROM produtos ORDER BY descricao", [], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

// Vendas
app.post('/finalizar-venda', (req, res) => {
  const { cliente_id, total, itens } = req.body;
  const data = new Date().toLocaleString('pt-BR');

  db.run(`INSERT INTO vendas (cliente_id, data, total) VALUES (?, ?, ?)`, 
    [cliente_id, data, total], function(err) {
    if (err) return res.status(500).json({success: false});

    const vendaId = this.lastID;
    const stmt = db.prepare(`INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)`);

    itens.forEach(item => {
      stmt.run(vendaId, item.id, item.qtd, item.preco);
      // Baixa estoque
      db.run(`UPDATE produtos SET estoque = estoque - ? WHERE id = ?`, [item.qtd, item.id]);
    });

    stmt.finalize();
    res.json({ success: true });
  });
});

app.get('/listar-vendas', (req, res) => {
  const sql = `SELECT v.id, v.data, v.total, c.nome as nome_cliente 
               FROM vendas v 
               LEFT JOIN clientes c ON v.cliente_id = c.id 
               ORDER BY v.id DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

app.get('/detalhes-venda/:id', (req, res) => {
  const sql = `SELECT i.*, p.descricao 
               FROM itens_venda i 
               JOIN produtos p ON i.produto_id = p.id 
               WHERE i.venda_id = ?`;
  db.all(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

app.listen(3000, () => {
  console.log('🚀 SisSport - Loja de Esportes rodando em http://localhost:3000');
});
