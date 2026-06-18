const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = 3000;

// ======================
// MIDDLEWARES
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.db",
      dir: "./"
    }),
    secret: "sportpluspro2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
  })
);

// ======================
// BANCO DE DADOS
// ======================
const db = new sqlite3.Database("./sportplus.db", (err) => {
  if (err) {
    console.error("Erro ao abrir banco:", err.message);
  } else {
    console.log("✅ Banco de dados conectado.");
  }
});

// ======================
// CRIAR TABELAS
// ======================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT UNIQUE,
      senha TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT,
      telefone TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      categoria TEXT,
      preco REAL,
      estoque INTEGER,
      imagem TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vendas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      total REAL,
      data_venda DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS itens_venda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venda_id INTEGER,
      produto_id INTEGER,
      quantidade INTEGER,
      preco REAL
    )
  `);
});

// ======================
// CRIAR ADMIN (melhorado)
// ======================
async function criarAdmin() {
  return new Promise((resolve) => {
    db.get("SELECT * FROM usuarios WHERE usuario = ?", ["admin"], async (err, row) => {
      if (row) return resolve();

      const senhaHash = await bcrypt.hash("admin123", 10);
      db.run("INSERT INTO usuarios(usuario, senha) VALUES (?, ?)", ["admin", senhaHash], () => {
        console.log("👤 Usuário admin criado com sucesso (admin / admin123)");
        resolve();
      });
    });
  });
}

// ======================
// MIDDLEWARE DE AUTENTICAÇÃO
// ======================
function auth(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: "Não autorizado. Faça login." });
  }
  next();
}

// ======================
// UPLOAD DE IMAGENS
// ======================
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) => {
    const nome = Date.now() + "-" + file.originalname.replace(/\s/g, "_");
    cb(null, nome);
  }
});

const upload = multer({ storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ======================
// ROTAS
// ======================

// Login
app.post("/login", (req, res) => {
  const { usuario, senha } = req.body;

  db.get("SELECT * FROM usuarios WHERE usuario = ?", [usuario], async (err, row) => {
    if (err) return res.status(500).json({ success: false, message: "Erro interno" });
    if (!row) return res.json({ success: false, message: "Usuário não encontrado" });

    const senhaValida = await bcrypt.compare(senha, row.senha);
    if (!senhaValida) return res.json({ success: false, message: "Senha incorreta" });

    req.session.usuario = { id: row.id, usuario: row.usuario };
    res.json({ success: true });
  });
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Session
app.get("/session", (req, res) => {
  res.json(req.session.usuario || null);
});

// ======================
// CLIENTES
// ======================
app.get("/clientes", auth, (req, res) => {
  db.all("SELECT * FROM clientes ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.post("/clientes", auth, (req, res) => {
  const { nome, email, telefone } = req.body;
  db.run("INSERT INTO clientes (nome, email, telefone) VALUES (?,?,?)", [nome, email, telefone], function(err) {
    if (err) return res.status(500).json(err);
    res.json({ success: true, id: this.lastID });
  });
});

app.put("/clientes/:id", auth, (req, res) => {
  const { nome, email, telefone } = req.body;
  db.run("UPDATE clientes SET nome=?, email=?, telefone=? WHERE id=?", [nome, email, telefone, req.params.id], function(err) {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

app.delete("/clientes/:id", auth, (req, res) => {
  db.run("DELETE FROM clientes WHERE id=?", [req.params.id], function(err) {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

// ======================
// PRODUTOS
// ======================
app.get("/produtos", auth, (req, res) => {
  db.all("SELECT * FROM produtos ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.post("/produtos", auth, (req, res) => {
  const { nome, categoria, preco, estoque, imagem } = req.body;
  db.run("INSERT INTO produtos (nome, categoria, preco, estoque, imagem) VALUES (?,?,?,?,?)",
    [nome, categoria, preco, estoque, imagem], function(err) {
      if (err) return res.status(500).json(err);
      res.json({ success: true, id: this.lastID });
    });
});

app.put("/produtos/:id", auth, (req, res) => {
  const { nome, categoria, preco, estoque, imagem } = req.body;
  db.run("UPDATE produtos SET nome=?, categoria=?, preco=?, estoque=?, imagem=? WHERE id=?",
    [nome, categoria, preco, estoque, imagem, req.params.id], function(err) {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    });
});

app.delete("/produtos/:id", auth, (req, res) => {
  db.run("DELETE FROM produtos WHERE id=?", [req.params.id], function(err) {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

// ======================
// VENDAS
// ======================
app.post("/vendas", auth, (req, res) => {
  const { cliente_id, itens } = req.body;

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ success: false, message: "Carrinho vazio" });
  }

  let totalVenda = 0;
  itens.forEach(item => {
    totalVenda += Number(item.preco) * Number(item.quantidade);
  });

  db.run("INSERT INTO vendas (cliente_id, total) VALUES (?,?)", [cliente_id, totalVenda], function(err) {
    if (err) return res.status(500).json(err);

    const vendaId = this.lastID;

    itens.forEach(item => {
      db.run("INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco) VALUES (?,?,?,?)",
        [vendaId, item.produto_id, item.quantidade, item.preco]);

      // Baixar estoque
      db.run("UPDATE produtos SET estoque = estoque - ? WHERE id = ?", [item.quantidade, item.produto_id]);
    });

    res.json({ success: true, vendaId });
  });
});

app.get("/vendas", auth, (req, res) => {
  db.all(`
    SELECT v.id, v.total, v.data_venda, c.nome as cliente 
    FROM vendas v 
    LEFT JOIN clientes c ON c.id = v.cliente_id 
    ORDER BY v.id DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// ======================
// DASHBOARD
// ======================
app.get("/dashboard", auth, (req, res) => {
  const dashboard = {};

  db.get("SELECT COUNT(*) as total FROM clientes", [], (err, row) => {
    dashboard.clientes = row?.total || 0;

    db.get("SELECT COUNT(*) as total FROM produtos", [], (err, row) => {
      dashboard.produtos = row?.total || 0;

      db.get("SELECT COUNT(*) as total FROM vendas", [], (err, row) => {
        dashboard.vendas = row?.total || 0;

        db.get("SELECT SUM(total) as total FROM vendas", [], (err, row) => {
          dashboard.faturamento = row?.total || 0;
          res.json(dashboard);
        });
      });
    });
  });
});

// ======================
// UPLOAD
// ======================
app.post("/upload", auth, upload.single("imagem"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "Nenhuma imagem enviada" });
  res.json({ success: true, arquivo: req.file.filename });
});

// ======================
// INICIALIZAÇÃO
// ======================
criarAdmin().then(() => {
  app.listen(PORT, () => {
    console.log("\n=================================");
    console.log("   🏆 SPORT+ PRO 2.0");
    console.log("=================================");
    console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
    console.log("=================================\n");
  });
});
