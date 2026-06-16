// ===============================
// SPORT+ PRO 2.0 - SERVER.JS COMPLETO
// ===============================

const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

// ===============================
// MIDDLEWARES
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    store: new SQLiteStore(),
    secret: "sportpluspro2secret",
    resave: false,
    saveUninitialized: false,
  })
);

// ===============================
// BANCO
// ===============================
const db = new sqlite3.Database("./sportplus.db");

// ===============================
// TABELAS
// ===============================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT,
      telefone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
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
      data DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vendas_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venda_id INTEGER,
      produto_id INTEGER,
      quantidade INTEGER,
      preco REAL
    )
  `);
});

// ===============================
// ADMIN AUTOMÁTICO
// ===============================
(async () => {
  const senha = await bcrypt.hash("admin123", 10);

  db.run(
    `INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`,
    ["admin", senha]
  );
})();

// ===============================
// LOGIN
// ===============================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err || !user) {
        return res.json({ success: false, message: "Usuário não encontrado" });
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.json({ success: false, message: "Senha inválida" });
      }

      req.session.user = user;
      res.json({ success: true });
    }
  );
});

// ===============================
// PROTEÇÃO
// ===============================
function auth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
}

// ===============================
// SESSÃO
// ===============================
app.get("/session", (req, res) => {
  res.json(req.session.user || null);
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// ===============================
// 👥 CLIENTES
// ===============================
app.get("/clientes", auth, (req, res) => {
  db.all("SELECT * FROM clientes ORDER BY id DESC", [], (err, rows) => {
    res.json(rows);
  });
});

app.post("/clientes", auth, (req, res) => {
  const { nome, email, telefone } = req.body;

  db.run(
    "INSERT INTO clientes (nome,email,telefone) VALUES (?,?,?)",
    [nome, email, telefone],
    function () {
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.put("/clientes/:id", auth, (req, res) => {
  const { nome, email, telefone } = req.body;

  db.run(
    "UPDATE clientes SET nome=?, email=?, telefone=? WHERE id=?",
    [nome, email, telefone, req.params.id],
    () => res.json({ success: true })
  );
});

app.delete("/clientes/:id", auth, (req, res) => {
  db.run("DELETE FROM clientes WHERE id=?", [req.params.id], () =>
    res.json({ success: true })
  );
});

// ===============================
// 📦 PRODUTOS
// ===============================
app.get("/produtos", auth, (req, res) => {
  db.all("SELECT * FROM produtos ORDER BY id DESC", [], (err, rows) => {
    res.json(rows);
  });
});

app.post("/produtos", auth, (req, res) => {
  const { nome, categoria, preco, estoque, imagem } = req.body;

  db.run(
    `INSERT INTO produtos (nome,categoria,preco,estoque,imagem)
     VALUES (?,?,?,?,?)`,
    [nome, categoria, preco, estoque, imagem],
    function () {
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.put("/produtos/:id", auth, (req, res) => {
  const { nome, categoria, preco, estoque, imagem } = req.body;

  db.run(
    `UPDATE produtos SET nome=?, categoria=?, preco=?, estoque=?, imagem=? WHERE id=?`,
    [nome, categoria, preco, estoque, imagem, req.params.id],
    () => res.json({ success: true })
  );
});

app.delete("/produtos/:id", auth, (req, res) => {
  db.run("DELETE FROM produtos WHERE id=?", [req.params.id], () =>
    res.json({ success: true })
  );
});

// ===============================
// 🛒 VENDAS
// ===============================
app.post("/vendas", auth, (req, res) => {
  const { cliente_id, itens, total } = req.body;

  db.run(
    "INSERT INTO vendas (cliente_id,total) VALUES (?,?)",
    [cliente_id, total],
    function () {
      const vendaId = this.lastID;

      itens.forEach((item) => {
        db.run(
          `INSERT INTO vendas_itens (venda_id,produto_id,quantidade,preco)
           VALUES (?,?,?,?)`,
          [vendaId, item.produto_id, item.quantidade, item.preco]
        );

        db.run(
          `UPDATE produtos SET estoque = estoque - ? WHERE id=?`,
          [item.quantidade, item.produto_id]
        );
      });

      res.json({ success: true, vendaId });
    }
  );
});

// ===============================
// 📊 VENDAS CONSULTA
// ===============================
app.get("/vendas", auth, (req, res) => {
  db.all("SELECT * FROM vendas ORDER BY data DESC", [], (err, rows) => {
    res.json(rows);
  });
});

app.get("/vendas/:id", auth, (req, res) => {
  db.all(
    "SELECT * FROM vendas_itens WHERE venda_id=?",
    [req.params.id],
    (err, rows) => res.json(rows)
  );
});

// ===============================
// 📊 DASHBOARD
// ===============================
app.get("/dashboard", auth, (req, res) => {
  const data = {};

  db.get("SELECT COUNT(*) as c FROM clientes", [], (e, r) => {
    data.clientes = r.c;

    db.get("SELECT COUNT(*) as p FROM produtos", [], (e2, r2) => {
      data.produtos = r2.p;

      db.get("SELECT COUNT(*) as v FROM vendas", [], (e3, r3) => {
        data.vendas = r3.v;

        db.get("SELECT SUM(total) as f FROM vendas", [], (e4, r4) => {
          data.faturamento = r4.f || 0;

          res.json(data);
        });
      });
    });
  });
});

// ===============================
// 🔍 FILTRO VENDAS
// ===============================
app.get("/vendas/filtro", auth, (req, res) => {
  const { inicio, fim } = req.query;

  db.all(
    `SELECT * FROM vendas WHERE date(data) BETWEEN date(?) AND date(?)`,
    [inicio, fim],
    (err, rows) => res.json(rows)
  );
});

// ===============================
// 📄 RELATÓRIO RESUMO
// ===============================
app.get("/relatorio/resumo", auth, (req, res) => {
  const r = {};

  db.get("SELECT COUNT(*) c FROM clientes", [], (e, a) => {
    r.clientes = a.c;

    db.get("SELECT COUNT(*) p FROM produtos", [], (e2, b) => {
      r.produtos = b.p;

      db.get("SELECT COUNT(*) v FROM vendas", [], (e3, c) => {
        r.vendas = c.v;

        db.get("SELECT SUM(total) f FROM vendas", [], (e4, d) => {
          r.faturamento = d.f || 0;

          res.json(r);
        });
      });
    });
  });
});

// ===============================
// 🧠 TOP PRODUTOS
// ===============================
app.get("/relatorio/top-produtos", auth, (req, res) => {
  db.all(
    `
    SELECT p.nome, SUM(v.quantidade) as total
    FROM vendas_itens v
    JOIN produtos p ON p.id = v.produto_id
    GROUP BY v.produto_id
    ORDER BY total DESC
    LIMIT 5
    `,
    [],
    (err, rows) => res.json(rows)
  );
});

// ===============================
// SERVER START
// ===============================
app.listen(PORT, () => {
  console.log("SPORT+ PRO 2.0 rodando em http://localhost:" + PORT);
});
