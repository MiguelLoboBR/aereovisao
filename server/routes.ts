import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";
import express from "express";
import fetch from "node-fetch";
import { setupAuth } from "./auth";
import { setupApiRoutes } from "./api";
import { setupIARoutes } from "./ai";
import { setupIAGenerateRoutes } from "./ia-generate";
import { setupInstitucionalRoutes } from "./institucional";
// Removida importação de autenticação institucional
import postsRouter from "./posts";
import { authMiddleware, adminMiddleware } from "./jwtAuth";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

export async function registerRoutes(app: Express): Promise<Server> {
  // Pasta de uploads para imagens de dicas
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Servir arquivos estáticos da pasta uploads
  app.use("/uploads", express.static(uploadsDir));
  
  // Servir arquivos estáticos da pasta institucional
  const institucionalDir = path.join(process.cwd(), "institucional");
  app.use("/institucional", express.static(institucionalDir));



// Serve o site institucional diretamente na raiz do domínio
app.use("/", express.static(path.join(process.cwd(), "institucional")));

// Também garante que "/site" continue funcionando (opcional)
app.use("/site", express.static(path.join(process.cwd(), "institucional")));
 
  // Rota explícita para acessar o painel administrativo do site institucional diretamente
  app.get("/site/admin", (req, res) => {
    console.log("Redirecionando para admin institucional diretamente");
    res.redirect("/institucional/admin/index.html");
  });
  
  // Rota para acesso direto ao admin institucional
  app.get("/institucional/admin", (req, res) => {
    console.log("Redirecionando para admin institucional sem autenticação");
    res.redirect("/institucional/admin/index.html");
  });
  
  // Rota para acesso ao admin direto (sem autenticação)
  app.get("/institucional/admin-direto", (req, res) => {
    console.log("Acessando admin institucional versão sem autenticação");
    res.sendFile(path.join(institucionalDir, "admin-direto/index.html"));
  });
  
  // Rota para a página central de acesso
  app.get("/admin-direto", (req, res) => {
    console.log("Redirecionando para a página central de acesso");
    res.sendFile(path.join(institucionalDir, "acesso-direto.html"));
  });
  
  // Rota explícita para acesso ao admin-direto com o path completo
  app.get("/institucional/admin-direto/index.html", (req, res) => {
    console.log("Acessando arquivo index.html do admin-direto");
    res.sendFile(path.join(institucionalDir, "admin-direto/index.html"));
  });
  
  // Rota para todos os arquivos dentro de admin-direto
  app.get("/institucional/admin-direto/*", (req, res) => {
    const relativePath = req.path.replace('/institucional/admin-direto/', '');
    const filePath = path.join(institucionalDir, "admin-direto", relativePath);
    console.log("Servindo arquivo do admin-direto:", filePath);
    res.sendFile(filePath);
  });
  
  // Rota explícita para todos os outros arquivos do admin institucional
  app.get("/institucional/admin/*", (req, res) => {
    const relativePath = req.path.replace('/institucional/admin/', '');
    const filePath = path.join(institucionalDir, "admin", relativePath);
    console.log("Servindo arquivo do admin institucional:", filePath);
    res.sendFile(filePath);
  });

  // Rota explícita para todos os outros arquivos do admin institucional
app.get("/institucional/admin/*", (req, res) => {
  const relativePath = req.path.replace('/institucional/admin/', '');
  const filePath = path.join(institucionalDir, "admin", relativePath);
  console.log("Servindo arquivo do admin institucional:", filePath);
  res.sendFile(filePath);
});
  
  // Configurar autenticação
  setupAuth(app);
  
  // Configurar rotas da API para dicas e configurações
  setupApiRoutes(app);
  
  // Configurar rotas da IA
  setupIARoutes(app);
  
  // Configurar rotas de geração manual da IA
  setupIAGenerateRoutes(app);
  
  // Configurar rotas para postagens
  app.use('/api/posts', postsRouter);
  
  // Rota de status para teste de conectividade
  app.get("/api/status", (req, res) => {
    res.json({ 
      status: "online", 
      message: "API funcionando normalmente",
      timestamp: new Date().toISOString(),
      origin: req.headers.origin || 'desconhecido'
    });
  });
  
  // Load config data
  const configPath = path.join(import.meta.dirname, "config.json");
  const configData = fs.existsSync(configPath) 
    ? JSON.parse(fs.readFileSync(configPath, 'utf8')) 
    : {
        donation: {
          pixKey: "00112233445566778899",
          pixName: "Aéreo Visão",
          pixBank: "AcmePay",
          paypalUrl: "https://paypal.me/example",
          cardUrl: "https://example.com/donate"
        },
        sponsors: {
          premium: [
            { name: "Nome da Empresa 1", description: "Especialista em Drones Profissionais", url: "#" },
            { name: "Nome da Empresa 2", description: "Acessórios e Peças para Drones", url: "#" },
            { name: "Nome da Empresa 3", description: "Escola de Pilotagem de Drones", url: "#" }
          ],
          partners: [
            { name: "Parceiro 1" },
            { name: "Parceiro 2" },
            { name: "Parceiro 3" },
            { name: "Parceiro 4" }
          ]
        },
        supporters: [
          { id: '1', name: 'João D.', initials: 'JD' },
          { id: '2', name: 'Maria S.', initials: 'MS' },
          { id: '3', name: 'Ricardo L.', initials: 'RL' },
          { id: '4', name: 'Ana P.', initials: 'AP' },
          { id: '5', name: 'Carlos F.', initials: 'CF' },
          { id: '6', name: 'Paula T.', initials: 'PT' },
          { id: '7', name: 'Roberto M.', initials: 'RM' },
          { id: '8', name: 'Lucia B.', initials: 'LB' }
        ],
        firmwares: {
          manufacturers: [
            {
              name: "DJI",
              logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/DJI_logo.svg",
              bgImage: "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
              firmwares: [
                {
                  model: "DJI Mini 3 Pro",
                  version: "v01.12.0140",
                  date: "24/06/2023",
                  downloadUrl: "https://www.dji.com/downloads/products/mini-3-pro"
                },
                {
                  model: "DJI Air 2S",
                  version: "v01.04.0602",
                  date: "15/06/2023",
                  downloadUrl: "https://www.dji.com/downloads/products/air-2s"
                },
                {
                  model: "DJI FPV",
                  version: "v01.02.0000",
                  date: "05/05/2023",
                  downloadUrl: "https://www.dji.com/downloads/products/fpv"
                }
              ],
              siteUrl: "https://www.dji.com"
            },
            {
              name: "Autel Robotics",
              bgImage: "https://images.unsplash.com/photo-1572618252869-3b644e2294ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
              firmwares: [
                {
                  model: "Autel EVO II",
                  version: "v2.3.56",
                  date: "12/06/2023",
                  downloadUrl: "https://www.autelrobotics.com/downloads"
                },
                {
                  model: "Autel EVO Nano+",
                  version: "v1.4.28",
                  date: "08/05/2023",
                  downloadUrl: "https://www.autelrobotics.com/downloads"
                },
                {
                  model: "Autel EVO Lite+",
                  version: "v1.2.26",
                  date: "30/04/2023",
                  downloadUrl: "https://www.autelrobotics.com/downloads"
                }
              ],
              siteUrl: "https://www.autelrobotics.com"
            },
            {
              name: "FIMI",
              bgImage: "https://images.unsplash.com/photo-1578034487139-55524a960209?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
              firmwares: [
                {
                  model: "FIMI X8 Mini",
                  version: "v1.0.6.1",
                  date: "05/06/2023",
                  downloadUrl: "https://www.fimi.com/fimi-x8-mini/downloads"
                },
                {
                  model: "FIMI X8 SE 2022",
                  version: "v2.2.1.2",
                  date: "28/05/2023",
                  downloadUrl: "https://www.fimi.com/fimi-x8-se-2022/downloads"
                },
                {
                  model: "FIMI X8 SE 2020",
                  version: "v01.00.0600",
                  date: "15/04/2023",
                  downloadUrl: "https://www.fimi.com/fimi-x8-se-2020/downloads"
                }
              ],
              siteUrl: "https://www.fimi.com"
            }
          ]
        },
        apps: [
          {
            name: "DJI Fly",
            icon: "fas fa-mobile-alt",
            androidUrl: "https://play.google.com/store/apps/details?id=dji.go.v5",
            iosUrl: "https://apps.apple.com/app/dji-fly/id1474512741"
          },
          {
            name: "Autel Explorer",
            icon: "fas fa-mobile-alt",
            androidUrl: "https://play.google.com/store/apps/details?id=com.autel.explorer",
            iosUrl: "https://apps.apple.com/app/autel-explorer/id1448215982"
          },
          {
            name: "FIMI Navi App",
            icon: "fas fa-mobile-alt",
            androidUrl: "https://play.google.com/store/apps/details?id=com.fimi.app",
            iosUrl: "https://apps.apple.com/app/mi-drone/id1425765517"
          },
          {
            name: "Drone Assist (NATS)",
            icon: "fas fa-map-marked-alt",
            androidUrl: "https://play.google.com/store/apps/details?id=com.nats.droneassist",
            iosUrl: "https://apps.apple.com/app/drone-assist-uk/id1174152316"
          }
        ]
      };

  // API endpoint for firmware data
  app.get("/api/firmwares", (req, res) => {
    res.json(configData.firmwares);
  });

  // API endpoint for app data
  app.get("/api/apps", (req, res) => {
    res.json({ apps: configData.apps });
  });

  // API endpoint for donation info
  app.get("/api/donation-info", async (req, res) => {
    try {
      // Tentar obter configurações do banco de dados
      const settings = await storage.getSettings();
      
      if (settings) {
        // Retornar configurações do banco de dados
        res.json({
          pixKey: settings.pixKey || '',
          pixName: settings.pixName || '',
          pixBank: settings.pixBank || '',
          paypalUrl: settings.paypalUrl || '',
          cardUrl: settings.cardUrl || '',
          customDonationMethods: settings.customDonationMethods ? JSON.parse(settings.customDonationMethods) : []
        });
      } else {
        // Se não houver configurações no banco de dados, retorna dados estáticos
        res.json(configData.donation);
      }
    } catch (error) {
      console.error("Erro ao obter configurações de doação:", error);
      // Fallback para dados estáticos em caso de erro
      res.json(configData.donation);
    }
  });
  
  // API endpoint para atualizar configurações de doação
  app.post("/api/donation-info", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { pixKey, pixName, pixBank, paypalUrl, cardUrl, customDonationMethods } = req.body;
      
      // Verificar se configurações já existem
      let settings = await storage.getSettings();
      
      // Transformar customDonationMethods em string JSON
      const customDonationMethodsStr = customDonationMethods ? JSON.stringify(customDonationMethods) : "[]";
      
      if (settings) {
        // Atualizar configurações existentes
        settings = await storage.updateSettings({
          pixKey,
          pixName,
          pixBank,
          paypalUrl,
          cardUrl,
          customDonationMethods: customDonationMethodsStr,
          updatedAt: new Date()
        });
      } else {
        // Criar novas configurações
        settings = await storage.updateSettings({
          pixKey,
          pixName,
          pixBank,
          paypalUrl,
          cardUrl,
          customDonationMethods: customDonationMethodsStr
        });
      }
      
      res.json({
        success: true,
        message: "Configurações de doação atualizadas com sucesso",
        data: settings
      });
    } catch (error) {
      console.error("Erro ao atualizar configurações de doação:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro ao atualizar configurações de doação",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // API endpoint para adicionar novo método de doação personalizado
  app.post("/api/donation-info/custom", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { name, description, url, icon, color } = req.body;
      
      if (!name || !url) {
        return res.status(400).json({
          success: false,
          message: "Nome e URL são obrigatórios para o método de doação"
        });
      }
      
      // Verificar se configurações já existem
      let settings = await storage.getSettings();
      
      if (!settings) {
        // Criar configurações básicas se não existirem
        settings = await storage.updateSettings({
          pixKey: "",
          pixName: "",
          pixBank: "",
          paypalUrl: "",
          cardUrl: "",
          customDonationMethods: "[]"
        });
      }
      
      // Criar novo método de doação
      const newMethod = {
        id: Date.now().toString(), // ID único simples baseado em timestamp
        name,
        description: description || "",
        url,
        icon: icon || "fas fa-money-bill",
        color: color || "#6366F1",
        createdAt: new Date().toISOString()
      };
      
      // Adicionar novo método à lista
      const currentMethods = settings.customDonationMethods ? JSON.parse(settings.customDonationMethods) : [];
      const updatedMethods = [...currentMethods, newMethod];
      
      // Atualizar configurações
      settings = await storage.updateSettings({
        ...settings,
        customDonationMethods: JSON.stringify(updatedMethods),
        updatedAt: new Date()
      });
      
      res.json({
        success: true,
        message: "Método de doação adicionado com sucesso",
        data: {
          newMethod,
          settings
        }
      });
    } catch (error) {
      console.error("Erro ao adicionar método de doação:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro ao adicionar método de doação",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // API endpoint para remover método de doação personalizado
  app.delete("/api/donation-info/custom/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se configurações existem
      let settings = await storage.getSettings();
      
      if (!settings || !settings.customDonationMethods) {
        return res.status(404).json({
          success: false,
          message: "Nenhuma configuração de doação encontrada"
        });
      }
      
      // Filtrar o método a ser removido
      const currentMethods = settings.customDonationMethods ? JSON.parse(settings.customDonationMethods) : [];
      const updatedMethods = currentMethods.filter(
        method => method.id !== id
      );
      
      // Se o tamanho não mudou, significa que o ID não foi encontrado
      if (updatedMethods.length === currentMethods.length) {
        return res.status(404).json({
          success: false,
          message: "Método de doação não encontrado"
        });
      }
      
      // Atualizar configurações
      settings = await storage.updateSettings({
        ...settings,
        customDonationMethods: JSON.stringify(updatedMethods),
        updatedAt: new Date()
      });
      
      res.json({
        success: true,
        message: "Método de doação removido com sucesso",
        data: settings
      });
    } catch (error) {
      console.error("Erro ao remover método de doação:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro ao remover método de doação",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // API específica para o painel administrativo HTML
  app.get("/api/admin-html/tips", async (req, res) => {
    try {
      const tips = await storage.listTips();
      res.json(tips);
    } catch (error) {
      console.error("Erro ao listar dicas:", error);
      
      // Fornecer dados de fallback para desenvolvimento
      res.json([
        {
          id: 1,
          title: "Como calibrar sua bússola",
          authorId: 1,
          author: { username: "joaopiloto", displayName: "João Piloto" },
          category: "Manutenção",
          content: "Conteúdo da dica sobre calibração de bússola...",
          createdAt: new Date("2025-04-01").toISOString(),
          updatedAt: new Date("2025-04-01").toISOString(),
          status: "pendente"
        },
        {
          id: 2,
          title: "Dicas para fotos aéreas perfeitas",
          authorId: 2,
          author: { username: "mariafotografa", displayName: "Maria Silva" },
          category: "Fotografia",
          content: "Conteúdo da dica sobre fotografia aérea...",
          createdAt: new Date("2025-03-28").toISOString(),
          updatedAt: new Date("2025-03-28").toISOString(),
          status: "aprovada"
        },
        {
          id: 3,
          title: "Preparação para voos em dias ventosos",
          authorId: 3,
          author: { username: "carlospro", displayName: "Carlos Drone" },
          category: "Segurança",
          content: "Conteúdo da dica sobre voo em dias ventosos...",
          createdAt: new Date("2025-04-03").toISOString(),
          updatedAt: new Date("2025-04-03").toISOString(),
          status: "rejeitada"
        }
      ]);
    }
  });
  
  app.get("/api/admin-html/users", async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      
      // Fornecer dados de fallback para desenvolvimento
      res.json([
        {
          id: 1,
          username: "joaopiloto",
          email: "joao@exemplo.com.br",
          displayName: "João Piloto",
          role: "usuario",
          createdAt: new Date("2025-01-15").toISOString(),
          updatedAt: new Date("2025-01-15").toISOString()
        },
        {
          id: 2,
          username: "mariafotografa",
          email: "maria@exemplo.com.br",
          displayName: "Maria Silva",
          role: "colaborador",
          createdAt: new Date("2025-02-10").toISOString(),
          updatedAt: new Date("2025-02-10").toISOString()
        },
        {
          id: 3,
          username: "carlospro",
          email: "carlos@exemplo.com.br",
          displayName: "Carlos Drone",
          role: "admin",
          createdAt: new Date("2025-01-05").toISOString(),
          updatedAt: new Date("2025-01-05").toISOString()
        }
      ]);
    }
  });
  
  app.post("/api/admin-html/tips/:id/status", async (req, res) => {
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
      console.error("Erro ao atualizar status da dica:", error);
      
      // Fornecer resposta de simulação para desenvolvimento
      res.json({
        id: parseInt(req.params.id, 10),
        title: "Título da dica simulada",
        authorId: 1,
        author: { username: "autor", displayName: "Autor" },
        category: "Categoria",
        content: "Conteúdo simulado...",
        status: req.body.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  });
  
  app.post("/api/admin-html/users/:id/role", async (req, res) => {
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
      console.error("Erro ao atualizar nível do usuário:", error);
      
      // Fornecer resposta de simulação para desenvolvimento
      res.json({
        id: parseInt(req.params.id, 10),
        username: "usuario" + req.params.id,
        email: `usuario${req.params.id}@exemplo.com.br`,
        displayName: "Nome do Usuário " + req.params.id,
        role: req.body.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  });
  
  app.post("/api/admin-html/settings", async (req, res) => {
    try {
      const settingsData = {
        pixKey: req.body.pixKey,
        pixName: req.body.pixName,
        pixBank: req.body.pixBank,
        paypalUrl: req.body.paypalUrl,
        cardUrl: req.body.cardUrl
      };
      
      const settings = await storage.updateSettings(settingsData);
      res.json(settings);
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
      
      // Fornecer resposta de simulação para desenvolvimento
      res.json({
        id: 1,
        pixKey: req.body.pixKey || '',
        pixName: req.body.pixName || '',
        pixBank: req.body.pixBank || '',
        paypalUrl: req.body.paypalUrl || '',
        cardUrl: req.body.cardUrl || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  });

  // API endpoint for sponsors
  app.get("/api/sponsors", (req, res) => {
    res.json({
      premium: configData.sponsors.premium,
      partners: configData.sponsors.partners
    });
  });
  
  // API endpoint for updating sponsors (admin only)
  app.post("/api/admin/sponsors", authMiddleware, adminMiddleware, (req, res) => {
    try {
      const { premium, partners } = req.body;
      
      if (!Array.isArray(premium) || !Array.isArray(partners)) {
        return res.status(400).json({ 
          message: "Formato inválido. 'premium' e 'partners' devem ser arrays." 
        });
      }
      
      // Atualizar os dados no objeto configData
      configData.sponsors.premium = premium;
      configData.sponsors.partners = partners;
      
      // Salvar os dados no arquivo config.json
      const configPath = path.join(import.meta.dirname, "config.json");
      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf8');
      
      res.json({
        success: true, 
        message: "Patrocinadores atualizados com sucesso",
        data: {
          premium,
          partners
        }
      });
    } catch (error) {
      console.error("Erro ao atualizar patrocinadores:", error);
      res.status(500).json({ 
        message: "Erro ao atualizar patrocinadores", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // API endpoint for supporters
  app.get("/api/supporters", (req, res) => {
    res.json({ supporters: configData.supporters });
  });

  // API endpoint for contact form
  app.post("/api/contact", (req, res) => {
    const { email, message } = req.body;
    
    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message are required' });
    }
    
    // In a real app, you would save this to a database or send an email
    // For now we'll just return a success response
    
    console.log('Contact form submission:', { email, message });
    
    res.json({ success: true, message: 'Message received' });
  });
  
  // API de status para o painel administrativo HTML
  app.get("/api/status", (req, res) => {
    const origin = req.headers.origin || req.headers.referer || "desconhecido";
    // Adicionar headers específicos para CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    res.json({
      status: "online",
      message: "API funcionando normalmente",
      timestamp: new Date().toISOString(),
      origin,
      debug: true
    });
  });
  
  // Rota para o painel administrativo independente (HTML puro)
  app.get("/admin-html", (req, res) => {
    const adminHtmlPath = path.join(process.cwd(), "client/public/admin-page.html");
    console.log("Servindo arquivo admin HTML:", adminHtmlPath);
    
    if (fs.existsSync(adminHtmlPath)) {
      res.sendFile(adminHtmlPath);
    } else {
      res.status(404).send("Página administrativa não encontrada");
    }
  });
  
  // Rota para o site institucional
  app.get("/site", (req, res) => {
    const institucionalIndexPath = path.join(process.cwd(), "institucional/index.html");
    console.log("Servindo site institucional:", institucionalIndexPath);
    
    if (fs.existsSync(institucionalIndexPath)) {
      res.sendFile(institucionalIndexPath);
    } else {
      res.status(404).send("Site institucional não encontrado");
    }
  });
  
  // Alias para o site institucional (rota /institucional)
  app.get("/institucional", (req, res) => {
    res.redirect("/site");
  });
  
  // Rotas de autenticação institucional removidas para acesso direto
  
  // Redirecionar a raiz para o site institucional (ou para o portal se for especificado)
  app.get("/", (req, res) => {
    // Se houver um parâmetro 'portal=true', redireciona para o portal
    if (req.query.portal === 'true') {
      res.redirect("/app/dashboard");
    } else {
      res.redirect("/site");
    }
  });
  
  // Redirecionar /auth diretamente para a página inicial do portal quando acessada diretamente
  app.get("/auth", (req, res) => {
    // Se houver parâmetros de redirecionamento, manter o comportamento padrão 
    if (Object.keys(req.query).length > 0) {
      // Deixar a página de autenticação tratar o redirecionamento
      return res.sendFile(path.join(process.cwd(), "public", "index.html"));
    }
    
    // Caso contrário, redirecionar para página Home do portal
    res.redirect("/");
  });

  // Configurar rotas do site institucional
  setupInstitucionalRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
