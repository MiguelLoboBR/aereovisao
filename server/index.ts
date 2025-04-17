import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";
import path from "path";
import { initializeInstitucionalAdmin } from "./initialize-institucional";

const app = express();

// CORS padrão Replit
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Arquivos estáticos gerais
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
app.use(
  "/assets",
  express.static(path.join(process.cwd(), "public", "assets"))
);
app.use(
  "/attached_assets",
  express.static(path.join(process.cwd(), "attached_assets"))
);

(async () => {
  // Inicialização institucional (banco, seed, etc.)
  await initializeInstitucionalAdmin();

  // Registrar rotas e obter o servidor HTTP
  const server = await registerRoutes(app);

  // Middleware de log detalhado
  app.use((req, res, next) => {
    const start = Date.now();
    const reqPath = req.path;
    const origin = req.headers.origin || "unknown";

    console.log(
      `[${new Date().toISOString()}] ${req.method} ${reqPath} - Origin: ${origin}`
    );

    const originalJson = res.json.bind(res);
    res.json = (bodyJson: any, ...args: any[]) => {
      const logLine = `${req.method} ${reqPath} ${res.statusCode} :: ${JSON.stringify(
        bodyJson
      )}`;
      log(
        logLine.length > 100
          ? logLine.slice(0, 100) + "…"
          : logLine
      );
      return originalJson(bodyJson, ...args);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (reqPath.startsWith("/api")) {
        log(`${req.method} ${reqPath} ${res.statusCode} em ${duration}ms`);
      }
    });

    next();
  });

  // Global error handler
  app.use(
    (err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("Erro na aplicação:", err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    }
  );

  if (process.env.NODE_ENV === "development") {
    // Modo desenvolvimento com Vite
    await setupVite(app, server);
  } else {
    // Produção

    // Servir assets do site institucional (dist/institucional)
    app.use(
      "/institucional",
      express.static(
        path.join(process.cwd(), "dist", "institucional")
      )
    );
    app.use(
      "/admin-direto",
      express.static(
        path.join(
          process.cwd(),
          "dist",
          "institucional",
          "admin-direto"
        )
      )
    );

    // Rota raiz para o index institucional
    app.get("/", (_req, res) => {
      const institucionalIndexPath = path.join(
        process.cwd(),
        "dist",
        "institucional",
        "index.html"
      );
      console.log(
        `Servindo institucional raiz: ${institucionalIndexPath}`
      );
      res.sendFile(institucionalIndexPath);
    });

    // Servir o React build (SPA) em dist/public
    serveStatic(app);
  }

  // Start do servidor na porta que o Railway fornecer
  const port = Number(process.env.PORT) || 8080;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`✅ Servidor iniciado em http://localhost:${port}`);
    }
  );
})();
