import { Router, Request, Response } from 'express';
import { posts, Post, postCategoryEnum, users } from '@shared/schema';
import { db } from './db';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware, colaboradorMiddleware } from './jwtAuth';
import { notifyAllUsersAboutNewPost } from './email';
import { storage } from './storage';
import { getFileUrl, deleteFile } from './upload';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Rota para obter todos os posts
router.get('/', async (req: Request, res: Response) => {
  try {
    // Verifica se há filtro por categoria
    const categoria = req.query.categoria as string;
    let query = db.select().from(posts);
    
    // Aplica filtro de categoria se fornecido
    if (categoria && postCategoryEnum.enumValues.includes(categoria as any)) {
      query = query.where(eq(posts.categoria, categoria as any));
    }
    
    // Executa a consulta com ordenação
    const result = await query.orderBy(desc(posts.createdAt));
    
    // Busca de informações do autor para cada post, se necessário
    const postsWithAuthor = await Promise.all(
      result.map(async (post: Post) => {
        // Cria uma cópia modificável do post
        const postWithAuthor: any = { ...post };
        
        // Se já temos o nome do autor no post, não precisamos buscar no banco
        if (post.autorNome) {
          postWithAuthor.author = {
            id: post.autorId,
            nome: post.autorNome
          };
          return postWithAuthor;
        }
        
        // Caso contrário, busca o autor no banco
        const [author] = await db
          .select({
            id: users.id,
            username: users.username,
            displayName: users.displayName
          })
          .from(users)
          .where(eq(users.id, post.autorId))
          .limit(1);
        
        if (author) {
          postWithAuthor.author = author;
          
          // Atualiza o post com o nome do autor para uso futuro
          const autorNome = author.displayName || author.username || 'Colaborador';
          await db
            .update(posts)
            .set({ autorNome })
            .where(eq(posts.id, post.id));
        }
        
        return postWithAuthor;
      })
    );
    
    res.json(postsWithAuthor);
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    res.status(500).json({ message: 'Erro ao buscar posts' });
  }
});

// Rota para obter os destaques (últimos posts de cada categoria)
router.get('/destaques', async (req: Request, res: Response) => {
  try {
    // Array para armazenar os resultados
    const destaques = [];
    
    // Buscar o post mais recente de cada categoria
    for (const categoria of postCategoryEnum.enumValues) {
      try {
        const [post] = await db
          .select()
          .from(posts)
          .where(eq(posts.categoria, categoria))
          .orderBy(desc(posts.createdAt))
          .limit(1);
        
        if (post) {
          // Adiciona informações do autor
          const postWithAuthor: any = { ...post };
          
          if (post.autorNome) {
            postWithAuthor.author = {
              id: post.autorId,
              nome: post.autorNome
            };
          } else {
            // Busca o autor no banco
            const [author] = await db
              .select({
                id: users.id,
                username: users.username,
                displayName: users.displayName
              })
              .from(users)
              .where(eq(users.id, post.autorId))
              .limit(1);
              
            if (author) {
              postWithAuthor.author = author;
              
              // Atualiza o post com o nome do autor para uso futuro
              const autorNome = author.displayName || author.username || 'Colaborador';
              await db
                .update(posts)
                .set({ autorNome })
                .where(eq(posts.id, post.id));
            }
          }
          
          destaques.push(postWithAuthor);
        }
      } catch (err) {
        console.error(`Erro ao buscar postagem: ${err}`);
      }
    }
    
    res.json(destaques);
  } catch (error) {
    console.error('Erro ao buscar destaques:', error);
    res.status(500).json({ error: 'Erro ao buscar destaques' });
  }
});

// Rota para obter um post específico
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    
    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }
    
    // Adiciona informações do autor se ainda não tiver o nome do autor no post
    let postWithAuthor: any = { ...post };
    
    if (post.autorNome) {
      postWithAuthor.author = {
        id: post.autorId,
        nome: post.autorNome
      };
    } else {
      // Busca o autor no banco
      const [author] = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName
        })
        .from(users)
        .where(eq(users.id, post.autorId))
        .limit(1);
      
      if (author) {
        postWithAuthor.author = author;
        
        // Atualiza o post com o nome do autor para uso futuro
        const autorNome = author.displayName || author.username || 'Colaborador';
        await db
          .update(posts)
          .set({ autorNome })
          .where(eq(posts.id, id));
      }
    }
    
    res.json(postWithAuthor);
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    res.status(500).json({ message: 'Erro ao buscar post' });
  }
});

// Configuração do multer para upload de arquivos
const multerStorage = multer.diskStorage({
  destination: function(_req, _file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    
    let prefix = 'file';
    if (file.fieldname === 'imagemDestacada') {
      prefix = 'post';
    } else if (file.fieldname === 'anexo') {
      prefix = 'attachment';
    }
    
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

// Middleware de upload com suporte para múltiplos campos
const postUpload = multer({
  storage: multerStorage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // limite de 10MB para arquivos
    fieldSize: 50 * 1024 * 1024 // limite de 50MB para campos de texto (para conteúdo HTML)
  }
}).fields([
  { name: 'imagemDestacada', maxCount: 1 },
  { name: 'anexo', maxCount: 1 }
]);

// Rota para criar um novo post com imagem e anexo (requer autenticação e permissão de colaborador)
router.post(
  '/',
  authMiddleware,
  colaboradorMiddleware,
  postUpload,
  async (req: Request, res: Response) => {
    try {
      const { titulo, conteudo, categoria } = req.body;
      const autorId = req.user.userId;
      
      // Obtém dados do autor para a notificação e para salvar no post
      const autor = await storage.getUser(autorId);
      const autorNome = autor?.displayName || autor?.username || 'Colaborador';
      
      // Captura as URLs dos arquivos enviados (se houver)
      let imagemUrl = null;
      let anexoUrl = null;
      let anexoNome = null;
      
      // Processa os arquivos enviados (usando fields)
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Processando a imagem destacada
      if (files?.imagemDestacada?.[0]) {
        imagemUrl = getFileUrl(files.imagemDestacada[0].filename);
      }
      
      // Processando o anexo
      if (files?.anexo?.[0]) {
        anexoUrl = getFileUrl(files.anexo[0].filename);
        anexoNome = files.anexo[0].originalname;
      }
      
      const [newPost] = await db
        .insert(posts)
        .values({
          titulo,
          conteudo,
          categoria,
          autorId,
          autorNome, // Salva o nome do autor para exibir em "Postado por"
          imagemUrl, // URL da imagem destacada (se enviada)
          anexoUrl,  // URL do anexo (se enviado)
          anexoNome  // Nome original do anexo
        })
        .returning();
      
      // Envio de notificações por email (assíncrono - não bloqueamos a resposta)
      notifyAllUsersAboutNewPost(titulo, newPost.id, autorNome)
        .then(count => {
          console.log(`Notificações enviadas com sucesso: ${count} usuários notificados`);
        })
        .catch(err => {
          console.error('Erro ao enviar notificações:', err);
        });
      
      res.status(201).json(newPost);
    } catch (error) {
      console.error('Erro ao criar post:', error);
      res.status(500).json({ message: 'Erro ao criar post' });
    }
  }
);

// Rota para atualizar um post (requer autenticação e permissão de colaborador)
router.put(
  '/:id',
  authMiddleware,
  colaboradorMiddleware,
  postUpload,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
      }
      
      const { titulo, conteudo, categoria } = req.body;
      
      // Verificar se o post existe e se pertence ao usuário (ou é admin)
      const [post] = await db.select().from(posts).where(eq(posts.id, id));
      
      if (!post) {
        return res.status(404).json({ message: 'Post não encontrado' });
      }
      
      // Verifica se o usuário é o autor do post ou é admin
      if (post.autorId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Sem permissão para editar este post' });
      }
      
      // Obtém dados do autor para a notificação e para salvar no post (caso ainda não exista)
      const autorId = post.autorId;
      let autorNome = post.autorNome;
      
      if (!autorNome) {
        const autor = await storage.getUser(autorId);
        autorNome = autor?.displayName || autor?.username || 'Colaborador';
      }
      
      // Inicializa valores com o conteúdo atual do post
      let imagemUrl = post.imagemUrl;
      let anexoUrl = post.anexoUrl;
      let anexoNome = post.anexoNome;
      
      // Processa os arquivos enviados (usando fields)
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Processando a imagem destacada
      if (files?.imagemDestacada?.[0]) {
        // Se já existia uma imagem, exclui a anterior
        if (post.imagemUrl) {
          const oldFilename = post.imagemUrl.split('/').pop();
          if (oldFilename) deleteFile(oldFilename);
        }
        imagemUrl = getFileUrl(files.imagemDestacada[0].filename);
      }
      
      // Processando o anexo
      if (files?.anexo?.[0]) {
        // Se já existia um anexo, exclui o anterior
        if (post.anexoUrl) {
          const oldFilename = post.anexoUrl.split('/').pop();
          if (oldFilename) deleteFile(oldFilename);
        }
        anexoUrl = getFileUrl(files.anexo[0].filename);
        anexoNome = files.anexo[0].originalname;
      }
      
      // Suporte a remoção de imagem ou anexo
      if (req.body.removerImagem === 'true' && post.imagemUrl) {
        const oldFilename = post.imagemUrl.split('/').pop();
        if (oldFilename) deleteFile(oldFilename);
        imagemUrl = null;
      }
      
      if (req.body.removerAnexo === 'true' && post.anexoUrl) {
        const oldFilename = post.anexoUrl.split('/').pop();
        if (oldFilename) deleteFile(oldFilename);
        anexoUrl = null;
        anexoNome = null;
      }
      
      const [updatedPost] = await db
        .update(posts)
        .set({
          titulo,
          conteudo,
          categoria,
          autorNome,
          imagemUrl,
          anexoUrl,
          anexoNome,
          updatedAt: new Date()
        })
        .where(eq(posts.id, id))
        .returning();
      
      res.json(updatedPost);
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      res.status(500).json({ message: 'Erro ao atualizar post' });
    }
  }
);

// Rota para excluir um post (requer autenticação e permissão de colaborador)
router.delete('/:id', authMiddleware, colaboradorMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    
    // Verificar se o post existe e se pertence ao usuário (ou é admin)
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    
    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }
    
    // Verifica se o usuário é o autor do post ou é admin
    if (post.autorId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Sem permissão para excluir este post' });
    }
    
    // Exclui arquivos associados ao post
    if (post.imagemUrl) {
      const imageFilename = post.imagemUrl.split('/').pop();
      if (imageFilename) deleteFile(imageFilename);
    }
    
    if (post.anexoUrl) {
      const attachmentFilename = post.anexoUrl.split('/').pop();
      if (attachmentFilename) deleteFile(attachmentFilename);
    }
    
    // Exclui o post do banco de dados
    await db.delete(posts).where(eq(posts.id, id));
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir post:', error);
    res.status(500).json({ message: 'Erro ao excluir post' });
  }
});

export default router;