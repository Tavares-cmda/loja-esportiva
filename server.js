const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

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
      maxAge: 1000 * 60 * 60 * 24
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
    console.log("Banco conectado.");
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
// CRIAR ADMIN
// ======================

async function criarAdmin() {

  db.get(
    "SELECT * FROM usuarios WHERE usuario = ?",
    ["admin"],
    async (err, row) => {

      if (!row) {

        const senhaHash = await bcrypt.hash(
          "admin123",
          10
        );

        db.run(
          "INSERT INTO usuarios(usuario, senha) VALUES (?, ?)",
          ["admin", senhaHash]
        );

        console.log("Usuário admin criado.");
      }

    }
  );

}

criarAdmin();

// ======================
// AUTENTICAÇÃO
// ======================

function auth(req, res, next) {

  if (!req.session.usuario) {
    return res.status(401).json({
      erro: "Não autorizado"
    });
  }

  next();

}

// ======================
// LOGIN
// ======================

app.post("/login", (req, res) => {

  const { usuario, senha } = req.body;

  db.get(
    "SELECT * FROM usuarios WHERE usuario = ?",
    [usuario],
    async (err, row) => {

      if (!row) {
        return res.json({
          success: false,
          message: "Usuário não encontrado"
        });
      }

      const senhaValida =
        await bcrypt.compare(
          senha,
          row.senha
        );

      if (!senhaValida) {
        return res.json({
          success: false,
          message: "Senha incorreta"
        });
      }

      req.session.usuario = {
        id: row.id,
        usuario: row.usuario
      };

      res.json({
        success: true
      });

    }
  );

});

// ======================
// LOGOUT
// ======================

app.post("/logout", (req, res) => {

  req.session.destroy(() => {
    res.json({
      success: true
    });
  });

});

// ======================
// SESSÃO
// ======================

app.get("/session", (req, res) => {

  res.json(
    req.session.usuario || null
  );
});
// ======================
// CLIENTES
// ======================

// LISTAR CLIENTES
app.get("/clientes", auth, (req, res) => {

  db.all(
    "SELECT * FROM clientes ORDER BY id DESC",
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json(rows);

    }
  );

});

// CADASTRAR CLIENTE
app.post("/clientes", auth, (req, res) => {

  const {
    nome,
    email,
    telefone
  } = req.body;

  db.run(
    `
    INSERT INTO clientes
    (nome,email,telefone)
    VALUES (?,?,?)
    `,
    [
      nome,
      email,
      telefone
    ],
    function(err) {

      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        id: this.lastID
      });

    }
  );

});

// EDITAR CLIENTE
app.put("/clientes/:id", auth, (req, res) => {

  const {
    nome,
    email,
    telefone
  } = req.body;

  db.run(
    `
    UPDATE clientes
    SET nome=?,
        email=?,
        telefone=?
    WHERE id=?
    `,
    [
      nome,
      email,
      telefone,
      req.params.id
    ],
    function(err) {

      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        success: true
      });

    }
  );

});

// EXCLUIR CLIENTE
app.delete("/clientes/:id", auth, (req, res) => {

  db.run(
    "DELETE FROM clientes WHERE id=?",
    [req.params.id],
    function(err) {

      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        success: true
      });

    }
  );

});


// ======================
// PRODUTOS
// ======================

// LISTAR PRODUTOS
app.get("/produtos", auth, (req, res) => {

  db.all(
    "SELECT * FROM produtos ORDER BY id DESC",
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json(rows);

    }
  );

});

// CADASTRAR PRODUTO
app.post("/produtos", auth, (req, res) => {

  const {
    nome,
    categoria,
    preco,
    estoque,
    imagem
  } = req.body;

  db.run(
    `
    INSERT INTO produtos
    (
      nome,
      categoria,
      preco,
      estoque,
      imagem
    )
    VALUES
    (
      ?,?,?,?,?
    )
    `,
    [
      nome,
      categoria,
      preco,
      estoque,
      imagem
    ],
    function(err) {

      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        id: this.lastID
      });

    }
  );

});

// EDITAR PRODUTO
app.put("/produtos/:id", auth, (req, res) => {

  const {
    nome,
    categoria,
    preco,
    estoque,
    imagem
  } = req.body;

  db.run(
    `
    UPDATE produtos
    SET nome=?,
        categoria=?,
        preco=?,
        estoque=?,
        imagem=?
    WHERE id=?
    `,
    [
      nome,
      categoria,
      preco,
      estoque,
      imagem,
      req.params.id
    ],
    function(err) {

      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        success: true
      });

    }
  );

});

// EXCLUIR PRODUTO
app.delete("/produtos/:id", auth, (req, res) => {

  db.run(
    "DELETE FROM produtos WHERE id=?",
    [req.params.id],
    function(err) {

      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        success: true
      });

    }
  );

});

// BUSCAR PRODUTO
app.get("/produtos/:id", auth, (req, res) => {

  db.get(
    "SELECT * FROM produtos WHERE id=?",
    [req.params.id],
    (err, row) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json(row);

    }
  );

});// ======================
// VENDAS
// ======================

// LISTAR VENDAS
app.get("/vendas", auth, (req, res) => {

  db.all(
    `
    SELECT
      v.id,
      v.total,
      v.data_venda,
      c.nome as cliente
    FROM vendas v
    LEFT JOIN clientes c
      ON c.id = v.cliente_id
    ORDER BY v.id DESC
    `,
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json(rows);

    }
  );

});

// DETALHES DA VENDA
app.get("/vendas/:id", auth, (req, res) => {

  db.all(
    `
    SELECT
      i.*,
      p.nome
    FROM itens_venda i
    INNER JOIN produtos p
      ON p.id = i.produto_id
    WHERE i.venda_id = ?
    `,
    [req.params.id],
    (err, rows) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json(rows);

    }
  );

});

// NOVA VENDA
app.post("/vendas", auth, (req, res) => {

  const {
    cliente_id,
    itens
  } = req.body;

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Carrinho vazio"
    });
  }

  let totalVenda = 0;

  itens.forEach(item => {
    totalVenda += (
      Number(item.preco) *
      Number(item.quantidade)
    );
  });

  db.run(
    `
    INSERT INTO vendas
    (
      cliente_id,
      total
    )
    VALUES
    (
      ?,?
    )
    `,
    [
      cliente_id,
      totalVenda
    ],
    function(err) {

      if (err) {
        return res.status(500).json(err);
      }

      const vendaId = this.lastID;

      itens.forEach(item => {

        db.run(
          `
          INSERT INTO itens_venda
          (
            venda_id,
            produto_id,
            quantidade,
            preco
          )
          VALUES
          (
            ?,?,?,?
          )
          `,
          [
            vendaId,
            item.produto_id,
            item.quantidade,
            item.preco
          ]
        );

        // BAIXAR ESTOQUE
        db.run(
          `
          UPDATE produtos
          SET estoque = estoque - ?
          WHERE id = ?
          `,
          [
            item.quantidade,
            item.produto_id
          ]
        );

      });

      res.json({
        success: true,
        vendaId
      });

    }
  );

});


// ======================
// DASHBOARD
// ======================

// DADOS GERAIS
app.get("/dashboard", auth, (req, res) => {

  const dashboard = {};

  db.get(
    `
    SELECT COUNT(*) total
    FROM clientes
    `,
    [],
    (err, clientes) => {

      dashboard.clientes =
        clientes.total || 0;

      db.get(
        `
        SELECT COUNT(*) total
        FROM produtos
        `,
        [],
        (err, produtos) => {

          dashboard.produtos =
            produtos.total || 0;

          db.get(
            `
            SELECT COUNT(*) total
            FROM vendas
            `,
            [],
            (err, vendas) => {

              dashboard.vendas =
                vendas.total || 0;

              db.get(
                `
                SELECT SUM(total) total
                FROM vendas
                `,
                [],
                (err, faturamento) => {

                  dashboard.faturamento =
                    faturamento.total || 0;

                  res.json(
                    dashboard
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


// ======================
// PRODUTOS SEM ESTOQUE
// ======================

app.get(
  "/dashboard/estoque-baixo",
  auth,
  (req, res) => {

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
          return res.status(500).json(err);
        }

        res.json(rows);

      }
    );

  }
);


// ======================
// PRODUTOS MAIS VENDIDOS
// ======================

app.get(
  "/dashboard/top-produtos",
  auth,
  (req, res) => {

    db.all(
      `
      SELECT
        p.nome,
        SUM(i.quantidade)
          AS vendidos
      FROM itens_venda i
      INNER JOIN produtos p
        ON p.id = i.produto_id
      GROUP BY p.nome
      ORDER BY vendidos DESC
      LIMIT 10
      `,
      [],
      (err, rows) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json(rows);

      }
    );

  }
);// ======================
// UPLOAD DE IMAGENS
// ======================

const multer = require("multer");

if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },

  filename: (req, file, cb) => {
    const nome =
      Date.now() +
      "-" +
      file.originalname.replace(/\s/g, "_");

    cb(null, nome);
  }
});

const upload = multer({ storage });

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// ENVIAR FOTO
app.post(
  "/upload",
  auth,
  upload.single("imagem"),
  (req, res) => {

    if (!req.file) {
      return res.status(400).json({
        success: false
      });
    }

    res.json({
      success: true,
      arquivo: req.file.filename
    });

  }
);


// ======================
// PESQUISA DE CLIENTES
// ======================

app.get(
  "/clientes/busca/:texto",
  auth,
  (req, res) => {

    const texto =
      `%${req.params.texto}%`;

    db.all(
      `
      SELECT *
      FROM clientes
      WHERE nome LIKE ?
      ORDER BY nome
      `,
      [texto],
      (err, rows) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json(rows);

      }
    );

  }
);


// ======================
// PESQUISA DE PRODUTOS
// ======================

app.get(
  "/produtos/busca/:texto",
  auth,
  (req, res) => {

    const texto =
      `%${req.params.texto}%`;

    db.all(
      `
      SELECT *
      FROM produtos
      WHERE nome LIKE ?
      ORDER BY nome
      `,
      [texto],
      (err, rows) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json(rows);

      }
    );

  }
);


// ======================
// RELATÓRIO RESUMO
// ======================

app.get(
  "/relatorio/resumo",
  auth,
  (req, res) => {

    const resumo = {};

    db.get(
      "SELECT COUNT(*) total FROM clientes",
      [],
      (e1, clientes) => {

        resumo.clientes =
          clientes.total || 0;

        db.get(
          "SELECT COUNT(*) total FROM produtos",
          [],
          (e2, produtos) => {

            resumo.produtos =
              produtos.total || 0;

            db.get(
              "SELECT COUNT(*) total FROM vendas",
              [],
              (e3, vendas) => {

                resumo.vendas =
                  vendas.total || 0;

                db.get(
                  "SELECT SUM(total) total FROM vendas",
                  [],
                  (e4, faturamento) => {

                    resumo.faturamento =
                      faturamento.total || 0;

                    res.json(resumo);

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


// ======================
// TRATAMENTO DE ERROS
// ======================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {

    console.error(err);

    res.status(500).json({
      success: false,
      message:
        "Erro interno do servidor"
    });

  }
);


// ======================
// SERVIDOR
// ======================

app.listen(PORT, () => {

  console.log("");
  console.log("=================================");
  console.log(" SPORT+ PRO 2.0 ");
  console.log("=================================");
  console.log(
    `Servidor iniciado em:`
  );
  console.log(
    `http://localhost:${PORT}`
  );
  console.log("=================================");
  console.log("");

});
