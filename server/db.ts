import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configuração necessária para o Neon Database funcionar no ambiente Node.js
neonConfig.webSocketConstructor = ws;
// Configurar outras opções necessárias para estabilidade em ambiente Replit
// (Usando apenas as opções suportadas pelo pacote @neondatabase/serverless)

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não está definido no ambiente");
}

// Adicionar logs para debug
console.log('Inicializando conexão com o banco de dados...');
console.log(`DATABASE_URL presente: ${!!process.env.DATABASE_URL}`);

// Configurar o pool com opções que melhoram a estabilidade para ambiente Replit
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Máximo de conexões
  min: 1, // Mínimo de conexões
  idleTimeoutMillis: 30000, // Tempo de inatividade para fechar conexões (30 segundos)
  connectionTimeoutMillis: 10000, // Tempo limite para conectar (10 segundos)
  allowExitOnIdle: false // Impedir que o pool feche quando fica ocioso
});

// Teste de conectividade
pool.on('connect', () => {
  console.log('Conexão com o banco de dados estabelecida com sucesso!');
});

pool.on('error', (err) => {
  console.error('Erro na conexão com o banco de dados:', err);
});

export const db = drizzle(pool, { schema });