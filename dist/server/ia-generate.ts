import { Express, Request, Response } from 'express';
import { storage } from './storage';
import { InsertPost } from '@shared/schema';
import { authMiddleware, adminMiddleware } from './jwtAuth';
import OpenAI from 'openai';

// Extrai o título de um conteúdo HTML
function extractTitleFromHtml(html: string): string {
  // Tenta encontrar a primeira tag h1 ou h2
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const h2Match = html.match(/<h2[^>]*>(.*?)<\/h2>/i);
  
  if (h1Match && h1Match[1]) {
    return h1Match[1].trim();
  } else if (h2Match && h2Match[1]) {
    return h2Match[1].trim();
  }
  
  // Se não encontrar, retorna um título genérico
  return `Artigo sobre Drones - ${new Date().toLocaleDateString()}`;
}

// Função para integrar a rota de geração no Express
export function setupIAGenerateRoutes(app: Express) {
  // Rota para gerar conteúdo manualmente via API da OpenAI
  app.post('/api/admin/ia-generate', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      const { model, temperature, topics, instructions } = req.body;
      
      // Verificar se os parâmetros necessários estão presentes
      if (!model || !topics || !instructions) {
        return res.status(400).json({ error: 'Parâmetros ausentes. Necessário: model, topics, instructions' });
      }
      
      // Obter a configuração da IA para pegar a chave da API
      const configIA = await storage.getConfigIA();
      
      // Verificar se a API key está configurada
      const openaiKey = process.env.OPENAI_API_KEY || configIA?.apiKey;
      if (!openaiKey) {
        return res.status(500).json({ error: 'Chave de API OpenAI não configurada' });
      }
      
      // Determinar a categoria com base nas categorias ativas
      let categoria = 'noticia';
      if (configIA && configIA.categoriasAtivas) {
        try {
          const categoriasAtivas = Array.isArray(configIA.categoriasAtivas) 
            ? configIA.categoriasAtivas 
            : JSON.parse(configIA.categoriasAtivas as string);
          
          if (categoriasAtivas.length > 0) {
            // Escolher aleatoriamente uma das categorias ativas
            const randomIndex = Math.floor(Math.random() * categoriasAtivas.length);
            categoria = categoriasAtivas[randomIndex];
          }
        } catch (error) {
          console.warn('Erro ao processar categorias ativas:', error);
        }
      }
      
      // Preparar o prompt para a OpenAI
      const prompt = `${instructions}\n\nTópicos: ${topics}\n\nCategoria: ${categoria}\n\nFormate o resultado em HTML organizado e bem estruturado com h1, h2, p, ul, li, etc. Inclua um título principal usando a tag <h1> que descreva bem o conteúdo. O título deve ser conciso, atrativo e SEO-friendly.`;
      
      console.log('Gerando conteúdo com o modelo:', model);
      
      // Configurar OpenAI - a nova versão usa uma API diferente
      const openai = new OpenAI({
        apiKey: openaiKey
      });
      
      // Fazer a chamada para a API
      const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: parseFloat(temperature || '0.7'),
      });
      
      // Extrair o conteúdo gerado
      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Resposta inválida da OpenAI');
      }
      
      // Extrair o título do conteúdo HTML gerado
      const titulo = extractTitleFromHtml(content);
      
      // Buscar ou criar usuário da IA
      const iaUser = await storage.findOrCreateIAUser();
      
      // Criar o post no banco de dados
      const postData: InsertPost = {
        titulo: titulo,
        conteudo: content,
        categoria: categoria,
        autorId: iaUser.id,
        autorNome: iaUser.displayName || 'IA Assistant',
        imagemUrl: '',
        anexoUrl: '',
      };
      
      // Salvar no banco de dados
      const result = await storage.createPost(postData);
      
      // Atualizar a configuração da IA com a última execução
      await storage.updateConfigIA({
        ultimaExecucao: new Date()
      });
      
      // Retornar sucesso
      return res.status(201).json({
        success: true,
        message: 'Post gerado e publicado com sucesso',
        post: result
      });
      
    } catch (error: any) {
      console.error('Erro ao gerar conteúdo via IA:', error);
      res.status(500).json({
        error: 'Erro ao gerar conteúdo',
        message: error.message
      });
    }
  });
}