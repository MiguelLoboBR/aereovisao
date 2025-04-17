import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";
import path from "path";
import { initializeInstitucionalAdmin } from "./initialize-institucional";

const app = express();

// CORS padrão Replit
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Arquivos estáticos
app.use('/uploads', express.static('uploads'));
app.use('/assets', express.static('public/assets'));
app.use('/institucional', express.static(path.join(process.cwd(), 'institucional')));
app.use('/admin-direto', express.static(path.join(process.cwd(), 'institucional/admin-direto')));
app.use('/institucional/public', express.static('institucional/public'));
app.use('/attached_assets', express.static('attached_assets'));

// Middleware de log detalhado
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const origin = req.headers.origin || 'unknown';

  console.log(`[${new Date().toISOString()}] ${req.method} ${path} - Origin: ${origin}`);

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    const logLine = `${req.method} ${path} ${res.statusCode} :: ${JSON.stringify(bodyJson)}`;
    log(logLine.length > 100 ? logLine.slice(0, 100) + "…" : logLine);
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  // Inicialização institucional
  await initializeInstitucionalAdmin();

  const server = await registerRoutes(app);

  // Tratamento global de erros
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Erro na aplicação:", err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Vite apenas no modo desenvolvimento
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {

    // ✅ Redirecionar "/" para o site institucional (versão final para produção)
app.get("/", (req, res) => {
  const institucionalIndexPath = path.join(__dirname, "../dist/institucional/index.html");
  console.log("Servindo página institucional raiz:", institucionalIndexPath);
  res.sendFile(institucionalIndexPath);
});


    // Servir arquivos do frontend (modo produção)
    serveStatic(app);
  }

  // Porta padrão no Railway
  const port = process.env.PORT || 8080;
  server.listen(
    {
      port: +port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`✅ Servidor iniciado em http://localhost:${port}`);
    }
  );
})();

