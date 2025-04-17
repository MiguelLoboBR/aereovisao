import { Express, Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { posts, Post, InsertPost } from '@shared/schema';
import { z } from 'zod';
import { authMiddleware, adminMiddleware } from './jwtAuth';

// Adicionar declaração da propriedade openAIKey ao Request
declare global {
  namespace Express {
    interface Request {
      openAIKey?: string;
    }
  }
}

// Middleware para verificar a chave de API da IA
export async function iaApiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  // Se for uma chamada manual via API, usa o JWT auth normal
  if (req.body && req.body.manual === true) {
    // Verificar autenticação via JWT em chamadas manuais
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Autenticação necessária para geração manual' });
    }
    
    try {
      // Importar verifyToken dinamicamente para evitar dependência circular
      const { verifyToken } = await import('./jwtAuth');
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      
      // Verificar se o usuário é administrador
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Permissão negada. Apenas administradores podem gerar conteúdo manualmente.' });
      }
      
      // Se chegou aqui, é um admin autenticado - agora verifica a chave da API
      const configIA = await storage.getConfigIA();
      if (!configIA || !configIA.apiKey) {
        // Tentar usar a chave do ambiente como fallback
        if (process.env.OPENAI_API_KEY) {
          req.openAIKey = process.env.OPENAI_API_KEY;
          return next();
        }
        return res.status(500).json({ error: 'Chave da API OpenAI não configurada nas configurações ou no ambiente' });
      }
      
      // Adiciona a chave ao request para uso posterior
      req.openAIKey = configIA.apiKey;
      return next();
    } catch (error) {
      console.error('Erro ao verificar token JWT:', error);
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  }
  
  // Caso contrário, verifica a chave de API fornecida nos headers (para chamadas agendadas)
  const apiKey = req.headers['x-api-key'];
  
  // Definir uma chave padrão de desenvolvimento se não estiver no ambiente
  // Isso é apenas para facilitar o desenvolvimento e testes; em produção, a chave deve ser configurada
  const iaSecretKey = process.env.IA_SECRET_KEY || 'dev-aereo-visao-secret-key';
  
  // Chamadas agendadas devem fornecer a chave nos headers
  if (apiKey !== iaSecretKey) {
    return res.status(401).json({ error: 'Chave de API inválida' });
  }
  
  // Para chamadas agendadas, buscar a chave da API OpenAI
  const configIA = await storage.getConfigIA();
  if (configIA && configIA.apiKey) {
    req.openAIKey = configIA.apiKey;
  } else if (process.env.OPENAI_API_KEY) {
    req.openAIKey = process.env.OPENAI_API_KEY;
  } else {
    return res.status(500).json({ error: 'Chave da API OpenAI não configurada nas configurações ou no ambiente' });
  }
  
  next();
}

// Schema para validação das postagens da IA
const iaPostSchema = z.object({
  titulo: z.string().min(3, "Título obrigatório").optional(),
  resumo: z.string().optional(),
  conteudo: z.string().min(5, "Conteúdo obrigatório").max(50000, "Conteúdo muito longo").optional(),
  categoria: z.enum(['dicas', 'firmware', 'legislacao', 'noticia']).optional(),
  imagem: z.string().url("URL de imagem inválida").optional(),
  anexo: z.string().url("URL de anexo inválida").optional(),
  manual: z.boolean().optional(),
  configId: z.number().optional(),
});

type IAPostRequest = z.infer<typeof iaPostSchema>;

export function setupIARoutes(app: Express) {
  // Rota para criar postagens via IA
  app.post('/api/posts/ia', iaApiKeyMiddleware, async (req: Request, res: Response) => {
    try {
      // Validar dados da requisição
      const validation = iaPostSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: validation.error.format() 
        });
      }
      
      const data = validation.data;
      
      // Se for uma solicitação manual via interface do usuário
      if (data.manual) {
        console.log('Gerando conteúdo manualmente via API');
        // TODO: Implementar a chamada para a OpenAI e geração de conteúdo
        
        // Simulando a criação de um post para teste
        // Buscar ou criar usuário da IA
        const iaUser = await storage.findOrCreateIAUser();
        
        // Pegar a configuração da IA
        const configIA = await storage.getConfigIA();
        
        if (!configIA) {
          return res.status(500).json({ error: 'Configuração da IA não encontrada' });
        }
        
        // Em uma implementação real, este conteúdo seria gerado pela API do OpenAI
        const postData: InsertPost = {
          titulo: "Conteúdo gerado manualmente via API",
          conteudo: "<h2>Conteúdo de exemplo</h2><p>Este é um conteúdo gerado manualmente através do botão 'Criar Agora'.</p>",
          categoria: "dicas", // Usando uma categoria padrão para testes
          autorId: iaUser.id,
          autorNome: iaUser.displayName || 'IA Assistant',
          imagemUrl: "",
          anexoUrl: "",
        };
        
        // Salvar no banco
        const result = await storage.createPost(postData);
        
        // Atualizar a configuração da IA com a última execução
        await storage.updateConfigIA({
          ultimaExecucao: new Date()
        });
        
        // Retornar sucesso
        return res.status(201).json({ 
          success: true, 
          message: 'Postagem criada manualmente com sucesso',
          post: result 
        });
      }
      
      // Caso padrão: solicitação automática via serviço agendado
      // Buscar ou criar usuário da IA
      const iaUser = await storage.findOrCreateIAUser();
      
      // Criar a postagem
      const postData: InsertPost = {
        titulo: data.titulo || "Postagem automática da IA",
        conteudo: data.conteudo || "<p>Conteúdo automático gerado pelo sistema</p>",
        categoria: data.categoria || "dicas",
        autorId: iaUser.id,
        autorNome: iaUser.displayName || 'ChatGPT IA',
        imagemUrl: data.imagem || "",
        anexoUrl: data.anexo || "",
        anexoNome: data.anexo ? 'anexo-ia.pdf' : "", // Nome genérico para anexo
      };
      
      // Salvar no banco
      const result = await storage.createPost(postData);
      
      // Atualizar a configuração da IA com a última execução
      await storage.updateConfigIA({
        ultimaExecucao: new Date()
      });
      
      // Retornar sucesso
      res.status(201).json({ 
        success: true, 
        message: 'Postagem criada com sucesso',
        post: result 
      });
      
    } catch (error: any) {
      console.error('Erro ao criar postagem via IA:', error);
      res.status(500).json({ 
        error: 'Erro ao processar requisição', 
        message: error.message 
      });
    }
  });
  
  // Rota para obter configuração da IA
  app.get('/api/config/ia', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const config = await storage.getConfigIA();
      res.json(config || {});
    } catch (error: any) {
      console.error('Erro ao obter configuração da IA:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Rota para atualizar configuração da IA
  app.put('/api/config/ia', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const config = await storage.updateConfigIA(req.body);
      res.json(config);
    } catch (error: any) {
      console.error('Erro ao atualizar configuração da IA:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Nova rota para /api/admin/ia-config que aponta para o mesmo endpoint
  app.get('/api/admin/ia-config', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const config = await storage.getConfigIA();
      res.json(config || {});
    } catch (error: any) {
      console.error('Erro ao obter configuração da IA:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.put('/api/admin/ia-config', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const config = await storage.updateConfigIA(req.body);
      res.json(config);
    } catch (error: any) {
      console.error('Erro ao atualizar configuração da IA:', error);
      res.status(500).json({ error: error.message });
    }
  });
}