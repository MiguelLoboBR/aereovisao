import { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { storage } from "./storage";
import { insertTipSchema, insertSettingsSchema } from "@shared/schema";
import { authMiddleware, adminMiddleware, colaboradorMiddleware } from "./jwtAuth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Configuração do multer para upload de imagens
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ 
  storage: fileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (ext && mimetype) {
      return cb(null, true);
    }
    
    cb(new Error("Apenas imagens são permitidas (jpg, jpeg, png, gif)"));
  }
});

export function setupApiRoutes(app: Express) {
  // Servir arquivos enviados
  app.use("/uploads", express.static(uploadsDir));

  // ====== ROTAS DE DICAS ======
  
  // Listar todas as dicas públicas (aprovadas)
  app.get("/api/tips", async (req, res, next) => {
    try {
      const tips = await storage.listTips({ status: "aprovada" });
      res.json(tips);
    } catch (error) {
      next(error);
    }
  });
  
  // Buscar uma dica específica
  app.get("/api/tips/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const tip = await storage.getTip(id);
      
      if (!tip) {
        return res.status(404).json({ message: "Dica não encontrada" });
      }
      
      // Se a dica não está aprovada, verificar se é o autor ou admin
      if (tip.status !== 'aprovada') {
        try {
          // Verificar token no header
          const authHeader = req.headers.authorization;
          if (!authHeader) {
            return res.status(401).json({ message: "Acesso negado. Faça login para visualizar dicas não aprovadas." });
          }

          // Middleware authMiddleware processará o token
          authMiddleware(req, res, () => {
            const isAdmin = req.user.role === 'admin';
            const isAuthor = req.user.userId === tip.authorId;
            
            if (!isAdmin && !isAuthor) {
              return res.status(403).json({ message: "Acesso negado" });
            }
            
            res.json(tip);
          });
        } catch (error) {
          return res.status(401).json({ message: "Token inválido ou expirado" });
        }
      } else {
        // Dica aprovada - acesso público
        res.json(tip);
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Listar minhas dicas
  app.get("/api/user/tips", authMiddleware, async (req, res, next) => {
    try {
      const tips = await storage.listTips({ authorId: req.user.userId });
      res.json(tips);
    } catch (error) {
      next(error);
    }
  });
  
  // Enviar uma nova dica
  app.post("/api/tips", authMiddleware, upload.single("image"), async (req, res, next) => {
    try {
      const tipData = {
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        authorId: req.user.userId,
        image: req.file ? `/uploads/${req.file.filename}` : undefined
      };
      
      // Validar dados
      const result = insertTipSchema.safeParse(tipData);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: result.error.errors 
        });
      }
      
      const tip = await storage.createTip(tipData);
      res.status(201).json(tip);
    } catch (error) {
      next(error);
    }
  });
  
  // Deletar uma dica (autor ou admin)
  app.delete("/api/tips/:id", authMiddleware, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const tip = await storage.getTip(id);
      
      if (!tip) {
        return res.status(404).json({ message: "Dica não encontrada" });
      }
      
      const isAdmin = req.user.role === 'admin';
      const isAuthor = req.user.userId === tip.authorId;
      
      if (!isAdmin && !isAuthor) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      await storage.deleteTip(id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });
  
  // ====== ROTAS ADMIN/COLABORADOR ======
  
  // Listar todas as dicas (incluindo pendentes) - para admin/colaborador
  app.get("/api/colaborador/tips", async (req, res, next) => {
    try {
      const status = req.query.status as string;
      const tips = await storage.listTips(status ? { status } : undefined);
      res.json(tips);
    } catch (error) {
      next(error);
    }
  });
  
  // Aprovar ou rejeitar uma dica - para admin/colaborador
  app.patch("/api/colaborador/tips/:id/status", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      
      if (!['aprovada', 'rejeitada'].includes(status)) {
        return res.status(400).json({ message: "Status inválido" });
      }
      
      const updatedTip = await storage.updateTip(id, { status });
      
      if (!updatedTip) {
        return res.status(404).json({ message: "Dica não encontrada" });
      }
      
      res.json(updatedTip);
    } catch (error) {
      next(error);
    }
  });
  
  // ====== ROTAS DE USUÁRIOS (ADMIN) ======
  
  // Aplicar middleware para todas as rotas de admin
  app.use('/api/admin', authMiddleware, adminMiddleware);
  
  // Aplicar middleware para todas as rotas de colaborador
  app.use('/api/colaborador', authMiddleware, colaboradorMiddleware);
  
  // Listar todos os usuários (para página de admin-usuarios)
  app.get("/api/usuarios", authMiddleware, adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });
  
  // Atualizar um usuário específico (role, etc.) - usado na página admin-usuarios
  app.patch("/api/usuarios/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      // Verificar se o admin não está tentando alterar o próprio nível
      if (id === req.user.userId && req.body.role) {
        return res.status(403).json({ 
          message: "Não é permitido alterar seu próprio nível de acesso"
        });
      }
      
      // Validar o role se estiver sendo alterado
      if (req.body.role && !['usuario', 'colaborador', 'admin'].includes(req.body.role)) {
        return res.status(400).json({ 
          message: "Nível de acesso inválido"
        });
      }
      
      const updatedUser = await storage.updateUser(id, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });
  
  // Listar todos os usuários (somente admin) - para compatibilidade com código existente
  app.get("/api/admin/users", async (req, res, next) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });
  
  // Alterar nível de usuário (somente admin) - para compatibilidade com código existente
  app.post("/api/admin/users/:id/role", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { role } = req.body;
      
      if (!['usuario', 'colaborador', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Nível de usuário inválido" });
      }
      
      const user = await storage.updateUser(id, { role });
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  });
  
  // ====== ROTAS DE CONFIGURAÇÕES ======
  
  // Obter configurações
  app.get("/api/settings", async (req, res, next) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings || {});
    } catch (error) {
      next(error);
    }
  });
  
  // Buscar usuário por email (somente admin)
  app.get("/api/users/find-by-email", authMiddleware, adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  });
  
  // Atualizar configurações (somente admin)
  app.post("/api/admin/settings", async (req, res, next) => {
    try {
      const settingsData = {
        pixKey: req.body.pixKey,
        pixName: req.body.pixName,
        pixBank: req.body.pixBank,
        paypalUrl: req.body.paypalUrl,
        cardUrl: req.body.cardUrl
      };
      
      // Validar dados
      const result = insertSettingsSchema.safeParse(settingsData);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: result.error.errors 
        });
      }
      
      const settings = await storage.updateSettings(settingsData);
      res.json(settings);
    } catch (error) {
      next(error);
    }
  });
}