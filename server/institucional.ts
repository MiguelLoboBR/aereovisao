import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { authMiddleware, adminMiddleware } from "./jwtAuth";
import { 
  insertInstitucionalPageSchema, 
  insertInstitucionalSectionSchema, 
  insertInstitucionalSettingsSchema 
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Configuração do multer para upload de imagens
const institucionalUploadsDir = path.join(process.cwd(), "uploads", "institucional");
if (!fs.existsSync(institucionalUploadsDir)) {
  fs.mkdirSync(institucionalUploadsDir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, institucionalUploadsDir);
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
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido. Aceitos apenas: JPG, PNG, GIF, WEBP e SVG'));
    }
  }
});

export function setupInstitucionalRoutes(app: Express) {
  // Rotas públicas para o site institucional
  app.get('/api/institucional/pages', async (req: Request, res: Response) => {
    try {
      const pages = await storage.listInstitucionalPages();
      // Filtrar apenas páginas publicadas para o frontend
      const publishedPages = pages.filter(page => page.isPublished);
      res.json(publishedPages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/institucional/pages/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const page = await storage.getInstitucionalPageBySlug(slug);
      
      if (!page) {
        return res.status(404).json({ error: 'Página não encontrada' });
      }
      
      if (!page.isPublished) {
        return res.status(403).json({ error: 'Página não está publicada' });
      }
      
      // Buscar seções relacionadas
      const sections = await storage.listInstitucionalSections(page.id);
      const publishedSections = sections.filter(section => section.isPublished);
      
      res.json({
        page,
        sections: publishedSections
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/institucional/settings', async (req: Request, res: Response) => {
    try {
      const settings = await storage.getInstitucionalSettings();
      res.json(settings || {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Rotas administrativas
  // Gerenciamento de páginas
  app.get('/api/admin/institucional/pages', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const pages = await storage.listInstitucionalPages();
      res.json(pages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/institucional/pages/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const page = await storage.getInstitucionalPage(Number(id));
      
      if (!page) {
        return res.status(404).json({ error: 'Página não encontrada' });
      }
      
      // Buscar seções relacionadas
      const sections = await storage.listInstitucionalSections(page.id);
      
      res.json({
        page,
        sections
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/institucional/pages', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const validation = insertInstitucionalPageSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Dados inválidos',
          details: validation.error.errors 
        });
      }
      
      const newPage = await storage.createInstitucionalPage(validation.data);
      res.status(201).json(newPage);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/institucional/pages/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const page = await storage.getInstitucionalPage(Number(id));
      
      if (!page) {
        return res.status(404).json({ error: 'Página não encontrada' });
      }
      
      const updated = await storage.updateInstitucionalPage(page.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/admin/institucional/pages/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const page = await storage.getInstitucionalPage(Number(id));
      
      if (!page) {
        return res.status(404).json({ error: 'Página não encontrada' });
      }
      
      // Remover as seções relacionadas primeiro
      const sections = await storage.listInstitucionalSections(page.id);
      for (const section of sections) {
        await storage.deleteInstitucionalSection(section.id);
      }
      
      await storage.deleteInstitucionalPage(page.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Gerenciamento de seções
  app.get('/api/admin/institucional/sections', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const { pageId } = req.query;
      const sections = await storage.listInstitucionalSections(Number(pageId) || undefined);
      res.json(sections);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/institucional/sections', authMiddleware, adminMiddleware, upload.single('image'), async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      // Se tiver uma imagem no upload, adicionar a URL
      if (req.file) {
        data.imageUrl = `/uploads/institucional/${req.file.filename}`;
      }
      
      const validation = insertInstitucionalSectionSchema.safeParse(data);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Dados inválidos',
          details: validation.error.errors 
        });
      }
      
      const newSection = await storage.createInstitucionalSection(validation.data);
      res.status(201).json(newSection);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/institucional/sections/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const section = await storage.getInstitucionalSection(Number(id));
      
      if (!section) {
        return res.status(404).json({ error: 'Seção não encontrada' });
      }
      
      const data = req.body;
      
      // Se tiver uma imagem no upload, adicionar a URL
      if (req.file) {
        data.imageUrl = `/uploads/institucional/${req.file.filename}`;
        
        // Remover a imagem antiga se existir
        if (section.imageUrl) {
          const oldImagePath = path.join(process.cwd(), section.imageUrl);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      }
      
      const updated = await storage.updateInstitucionalSection(section.id, data);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/admin/institucional/sections/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const section = await storage.getInstitucionalSection(Number(id));
      
      if (!section) {
        return res.status(404).json({ error: 'Seção não encontrada' });
      }
      
      // Remover a imagem se existir
      if (section.imageUrl) {
        const imagePath = path.join(process.cwd(), section.imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      await storage.deleteInstitucionalSection(section.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Gerenciamento de configurações
  app.get('/api/admin/institucional/settings', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const settings = await storage.getInstitucionalSettings();
      res.json(settings || {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/institucional/settings', authMiddleware, adminMiddleware, upload.single('logo'), async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      // Se tiver um logo no upload, adicionar a URL
      if (req.file) {
        data.logoUrl = `/uploads/institucional/${req.file.filename}`;
        
        // Remover o logo antigo se existir
        const settings = await storage.getInstitucionalSettings();
        if (settings?.logoUrl) {
          const oldLogoPath = path.join(process.cwd(), settings.logoUrl);
          if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath);
          }
        }
      }
      
      const validation = insertInstitucionalSettingsSchema.safeParse(data);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Dados inválidos',
          details: validation.error.errors 
        });
      }
      
      const updated = await storage.updateInstitucionalSettings(validation.data);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}