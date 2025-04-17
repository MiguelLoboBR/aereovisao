import { storage } from "./storage";
import bcrypt from 'bcryptjs';
import { db } from './db';
import { institucionalAdmins } from "@shared/schema";

/**
 * Inicializa o sistema de administração do site institucional
 * Cria um administrador padrão se não existir nenhum
 */
export async function initializeInstitucionalAdmin() {
  try {
    console.log('Verificando se existe algum administrador institucional...');
    
    // Verifica se a tabela existe usando o método sql da drizzle
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "institucional_admins" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "avatar" TEXT,
        "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
        "last_login" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now()
      )
    `);
    
    // Verifica se existe pelo menos um administrador
    const admins = await storage.listInstitucionalAdmins();
    
    if (admins.length === 0) {
      console.log('Nenhum administrador encontrado. Criando administrador padrão...');
      
      // Dados do administrador padrão
      const defaultAdmin = {
        name: 'Administrador',
        email: 'admin@aereovisao.com.br',
        password: await bcrypt.hash('admin123', 10), // Senha temporária que deve ser alterada
      };
      
      // Criar administrador padrão
      const newAdmin = await storage.createInstitucionalAdmin(defaultAdmin);
      
      console.log(`Administrador padrão criado com ID: ${newAdmin.id}`);
      console.log('Email: admin@aereovisao.com.br');
      console.log('Senha: admin123');
      console.log('ATENÇÃO: Altere a senha do administrador padrão assim que possível!');
    } else {
      console.log(`Encontrado(s) ${admins.length} administrador(es) institucional(is).`);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar administrador institucional:', error);
    return false;
  }
}