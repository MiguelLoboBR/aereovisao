import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { User } from '@shared/schema';

// Definindo uma chave secreta com variável de ambiente ou valor padrão fixo
const JWT_SECRET = process.env.JWT_SECRET || 'aereo_visao_jwt_secret_2025';
const JWT_EXPIRES_IN = '30d'; // Token expira em 30 dias para desenvolvimento

// Interface para os dados do token
export interface TokenPayload {
  userId: number;
  username: string;
  email: string;
  role: string;
}

// Gerar hash de senha
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

// Verificar senha
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Gerar token JWT
export function generateToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verificar token JWT
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

// Middleware de autenticação
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Formato do header: Bearer <token>
    const authHeader = req.headers.authorization;
    
    console.log(`Verificando autenticação para ${req.method} ${req.path}`);
    console.log(`Headers recebidos: ${JSON.stringify(req.headers)}`);
    
    if (!authHeader) {
      console.log('Token não fornecido no header Authorization');
      return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      console.log(`Formato de token inválido: ${authHeader}`);
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      console.log(`Scheme inválido: ${scheme}`);
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    try {
      const payload = verifyToken(token);
      
      // Adiciona as informações do usuário no objeto req
      req.user = payload;
      
      console.log(`Usuário autenticado: ID ${payload.userId}, ${payload.username}, role: ${payload.role}`);
      next();
    } catch (error) {
      const tokenError = error as Error;
      console.error('Erro ao verificar token:', tokenError.message);
      return res.status(401).json({ message: 'Token inválido ou expirado', error: tokenError.message });
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

// Middleware para verificar permissões de administrador
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores' });
  }
  
  next();
}

// Middleware para verificar permissões de colaborador ou administrador
export function colaboradorMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.user.role !== 'colaborador' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito a colaboradores' });
  }
  
  next();
}

// Adicionando a propriedade user ao Request do Express
declare global {
  namespace Express {
    interface Request {
      user: TokenPayload;
    }
  }
}