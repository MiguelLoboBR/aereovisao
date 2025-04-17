import { Express, Request, Response } from 'express';
import { storage } from './storage';
import { 
  generateToken, 
  hashPassword, 
  comparePasswords, 
  authMiddleware,
  adminMiddleware,
  colaboradorMiddleware
} from './jwtAuth';
import { insertUserSchema } from '@shared/schema';
import { z } from 'zod';
import { upload, getImageUrl } from './upload';

// Esquema para validar login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

// Esquema para criar usuário admin
const registerAdminSchema = insertUserSchema.extend({
  role: z.enum(['usuario', 'colaborador', 'admin'])
});

export function setupAuth(app: Express) {
  // Rota de registro (pública) com suporte para upload de foto
  app.post('/api/register', upload.single('photoFile'), async (req: Request, res: Response) => {
    try {
      // Extrair dados do formulário
      const userData = {
        ...req.body,
        // Se houver uma foto, salvar o caminho no banco de dados
        photoURL: req.file ? getImageUrl(req.file.filename) : undefined
      };
      
      // Validar dados de entrada
      const validatedData = insertUserSchema.parse(userData);
      
      // Verificar se email já existe
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }
      
      // Verificar se username já existe
      const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Nome de usuário já cadastrado' });
      }
      
      // Hash da senha
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Criar usuário
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        role: 'usuario' // Todos os registros públicos são como usuário comum
      });
      
      // Gerar token JWT
      const token = generateToken(user);
      
      // Remover a senha do objeto de resposta
      const { password, ...userWithoutPassword } = user;
      
      // Retornar usuário e token
      return res.status(201).json({ 
        user: userWithoutPassword, 
        token 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      
      console.error('Erro ao registrar usuário:', error);
      return res.status(500).json({ message: 'Erro ao processar solicitação' });
    }
  });
  
  // Rota de login (pública)
  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      // Validar dados de entrada
      const loginData = loginSchema.parse(req.body);
      
      // Buscar usuário pelo email
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      
      // Verificar senha
      const isPasswordValid = await comparePasswords(loginData.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      
      // Gerar token JWT
      const token = generateToken(user);
      
      // Remover a senha do objeto de resposta
      const { password, ...userWithoutPassword } = user;
      
      // Retornar usuário e token
      return res.status(200).json({ 
        user: userWithoutPassword, 
        token 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      
      console.error('Erro ao fazer login:', error);
      return res.status(500).json({ message: 'Erro ao processar solicitação' });
    }
  });
  
  // Rota para verificar usuário autenticado
  app.get('/api/user', authMiddleware, async (req: Request, res: Response) => {
    try {
      // Buscar usuário atualizado pelo ID
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Remover a senha do objeto de resposta
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({ message: 'Erro ao processar solicitação' });
    }
  });
  
  // Rota para atualizar o perfil do usuário
  app.post('/api/user/profile', authMiddleware, upload.single('photoFile'), async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const { displayName, phone, document, address } = req.body;
      
      let photoURL = undefined;
      
      // Se foi enviado um arquivo, salvar e gerar URL
      if (req.file) {
        photoURL = getImageUrl(req.file.filename);
      }
      
      // Atualizar dados do usuário
      const updatedUser = await storage.updateUser(userId, {
        displayName,
        phone,
        document,
        address,
        ...(photoURL && { photoURL }),
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Removendo a senha antes de enviar
      const { password, ...userData } = updatedUser;
      
      return res.json(userData);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
  });
  
  // Rota para alterar senha
  app.post('/api/change-password', authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;
      
      // Verificar se o usuário existe
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Verificar se a senha atual está correta
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Senha atual incorreta' });
      }
      
      // Atualizar a senha
      const hashedNewPassword = await hashPassword(newPassword);
      await storage.updateUser(userId, { password: hashedNewPassword });
      
      return res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return res.status(500).json({ message: 'Erro ao alterar senha' });
    }
  });
  
  // Rota para excluir conta
  app.delete('/api/user', authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      
      // Verificar se o usuário existe
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Excluir o usuário
      const deleted = await storage.deleteUser(userId);
      if (!deleted) {
        return res.status(500).json({ message: 'Não foi possível excluir o usuário' });
      }
      
      return res.json({ message: 'Conta excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      return res.status(500).json({ message: 'Erro ao excluir conta' });
    }
  });
  
  // Rota para registro de usuários pelo admin
  app.post('/api/admin/users', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      // Validar dados de entrada com schema que permite definir papel
      const userData = registerAdminSchema.parse(req.body);
      
      // Verificar se email já existe
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }
      
      // Verificar se username já existe
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Nome de usuário já cadastrado' });
      }
      
      // Hash da senha
      const hashedPassword = await hashPassword(userData.password);
      
      // Criar usuário
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Remover a senha do objeto de resposta
      const { password, ...userWithoutPassword } = user;
      
      // Retornar usuário criado
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ message: 'Erro ao processar solicitação' });
    }
  });
  
  // Exportar middlewares para uso em outras rotas
  return {
    authMiddleware,
    adminMiddleware,
    colaboradorMiddleware
  };
}