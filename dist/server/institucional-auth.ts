import { Request, Response, NextFunction, Express } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import { InstitucionalAdmin } from '@shared/schema';
import 'dotenv/config';

// Chave secreta para assinar o token JWT
const JWT_SECRET = process.env.JWT_SECRET || 'institucional-secret-key-for-jwt';

// Interface para garantir tipagem forte
interface TokenPayload {
  id: number;
  email: string;
  name: string;
}

/**
 * Middleware para verificar a autenticação institucional
 */
export async function institucionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Verificar se há token no header da requisição
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Extrair o token do header Bearer
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    // Verificar e decodificar o token
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      
      // Buscar admin pelo ID
      const admin = await storage.getInstitucionalAdmin(decoded.id);
      if (!admin) {
        return res.status(401).json({ message: 'Administrador não encontrado' });
      }
      
      if (!admin.isActive) {
        return res.status(403).json({ message: 'Conta de administrador desativada' });
      }
      
      // Adicionar dados do admin ao req para uso nos controladores
      req.institucionalAdmin = admin;
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação institucional:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
}

/**
 * Configura as rotas de autenticação para o sistema institucional
 */
export function setupInstitucionalAuth(app: Express) {
  // Rota para autenticar administrador institucional
  app.post('/api/institucional/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
      }
      
      // Buscar admin pelo email
      const admin = await storage.getInstitucionalAdminByEmail(email);
      if (!admin) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      
      // Verificar se a conta está ativa
      if (!admin.isActive) {
        return res.status(403).json({ message: 'Conta de administrador desativada' });
      }
      
      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      
      // Gerar token JWT
      const token = jwt.sign(
        { id: admin.id, email: admin.email, name: admin.name },
        JWT_SECRET,
        { expiresIn: '24h' } // Token expira em 24 horas
      );
      
      // Atualizar data do último login
      await storage.updateInstitucionalAdminLastLogin(admin.id);
      
      // Retornar token e dados do admin (sem a senha)
      const { password: _, ...adminData } = admin;
      res.status(200).json({
        token,
        admin: adminData
      });
    } catch (error) {
      console.error('Erro no login institucional:', error);
      res.status(500).json({ message: 'Erro interno no servidor' });
    }
  });
  
  // Rota para verificar token
  app.get('/api/institucional/verify-token', institucionalAuthMiddleware, (req: Request, res: Response) => {
    // Se chegou aqui, o token é válido
    if (!req.institucionalAdmin) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    
    const { password: _, ...adminData } = req.institucionalAdmin;
    res.status(200).json({ admin: adminData });
  });
  
  // Rota para obter o perfil do administrador
  app.get('/api/institucional/profile', institucionalAuthMiddleware, (req: Request, res: Response) => {
    if (!req.institucionalAdmin) {
      return res.status(401).json({ message: 'Não autorizado' });
    }
    
    const { password: _, ...adminData } = req.institucionalAdmin;
    res.status(200).json(adminData);
  });
  
  // Rota para administradores criarem novos administradores (exige autenticação)
  app.post('/api/institucional/register', institucionalAuthMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.institucionalAdmin) {
        return res.status(401).json({ message: 'Não autorizado' });
      }
      
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
      }
      
      // Verificar se já existe um admin com este email
      const existingAdmin = await storage.getInstitucionalAdminByEmail(email);
      if (existingAdmin) {
        return res.status(400).json({ message: 'Este email já está em uso' });
      }
      
      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Criar novo administrador
      const newAdmin = await storage.createInstitucionalAdmin({
        name,
        email,
        password: hashedPassword,
      });
      
      // Remover a senha do objeto antes de retornar
      const { password: _, ...adminData } = newAdmin;
      
      res.status(201).json(adminData);
    } catch (error) {
      console.error('Erro ao criar administrador institucional:', error);
      res.status(500).json({ message: 'Erro interno no servidor' });
    }
  });
  
  // Rota pública para registro de novos administradores (sem autenticação prévia)
  app.post('/api/institucional/admin/register', async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
      }
      
      // Verificar se já existe um admin com este email
      const existingAdmin = await storage.getInstitucionalAdminByEmail(email);
      if (existingAdmin) {
        return res.status(400).json({ message: 'Este email já está em uso' });
      }
      
      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Criar novo administrador
      const newAdmin = await storage.createInstitucionalAdmin({
        name,
        email,
        password: hashedPassword,
        isActive: true,
      });
      
      // Remover a senha do objeto antes de retornar
      const { password: _, ...adminData } = newAdmin;
      
      res.status(201).json({
        message: 'Administrador cadastrado com sucesso',
        admin: adminData
      });
    } catch (error) {
      console.error('Erro ao criar administrador institucional:', error);
      res.status(500).json({ message: 'Erro interno no servidor' });
    }
  });
}

// Estender a interface Request para incluir o administrador institucional
declare global {
  namespace Express {
    interface Request {
      institucionalAdmin?: InstitucionalAdmin;
    }
  }
}