import { eq } from 'drizzle-orm';
import { Pool } from '@neondatabase/serverless';
import { db } from './db';
import { randomUUID } from 'crypto';
import { 
  users, tips, settings, configIA, posts,
  institucionalPages, institucionalSections, institucionalSettings, institucionalAdmins,
  User, InsertUser, 
  Tip, InsertTip, 
  Settings, InsertSettings,
  ConfigIA, InsertConfigIA,
  Post, InsertPost,
  InstitucionalPage, InsertInstitucionalPage,
  InstitucionalSection, InsertInstitucionalSection,
  InstitucionalSettings, InsertInstitucionalSettings,
  InstitucionalAdmin, InsertInstitucionalAdmin
} from '@shared/schema';

export interface IStorage {
  // Métodos de usuário
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  listUsers(): Promise<User[]>;
  
  // Métodos de dicas/tutoriais
  getTip(id: number): Promise<Tip | undefined>;
  createTip(tip: InsertTip): Promise<Tip>;
  updateTip(id: number, data: Partial<Tip>): Promise<Tip | undefined>;
  listTips(filters?: { status?: string, authorId?: number }): Promise<Tip[]>;
  deleteTip(id: number): Promise<boolean>;
  
  // Métodos de posts/conteúdo
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, data: Partial<Post>): Promise<Post | undefined>;
  listPosts(filters?: { categoria?: string, autorId?: number }): Promise<Post[]>;
  deletePost(id: number): Promise<boolean>;
  
  // Configurações do sistema
  getSettings(): Promise<Settings | undefined>;
  updateSettings(data: Partial<InsertSettings>): Promise<Settings>;
  
  // Configurações da IA
  getConfigIA(): Promise<ConfigIA | undefined>;
  updateConfigIA(data: Partial<InsertConfigIA>): Promise<ConfigIA>;
  
  // Métodos específicos da IA
  findOrCreateIAUser(): Promise<User>;
  
  // Métodos do site institucional - Páginas
  getInstitucionalPage(id: number): Promise<InstitucionalPage | undefined>;
  getInstitucionalPageBySlug(slug: string): Promise<InstitucionalPage | undefined>;
  createInstitucionalPage(page: InsertInstitucionalPage): Promise<InstitucionalPage>;
  updateInstitucionalPage(id: number, data: Partial<InstitucionalPage>): Promise<InstitucionalPage | undefined>;
  listInstitucionalPages(): Promise<InstitucionalPage[]>;
  deleteInstitucionalPage(id: number): Promise<boolean>;
  
  // Métodos do site institucional - Seções
  getInstitucionalSection(id: number): Promise<InstitucionalSection | undefined>;
  createInstitucionalSection(section: InsertInstitucionalSection): Promise<InstitucionalSection>;
  updateInstitucionalSection(id: number, data: Partial<InstitucionalSection>): Promise<InstitucionalSection | undefined>;
  listInstitucionalSections(pageId?: number): Promise<InstitucionalSection[]>;
  deleteInstitucionalSection(id: number): Promise<boolean>;
  
  // Métodos do site institucional - Configurações
  getInstitucionalSettings(): Promise<InstitucionalSettings | undefined>;
  updateInstitucionalSettings(data: Partial<InsertInstitucionalSettings>): Promise<InstitucionalSettings>;
  
  // Métodos do site institucional - Administradores
  getInstitucionalAdmin(id: number): Promise<InstitucionalAdmin | undefined>;
  getInstitucionalAdminByEmail(email: string): Promise<InstitucionalAdmin | undefined>;
  createInstitucionalAdmin(admin: InsertInstitucionalAdmin): Promise<InstitucionalAdmin>;
  updateInstitucionalAdmin(id: number, data: Partial<InstitucionalAdmin>): Promise<InstitucionalAdmin | undefined>;
  listInstitucionalAdmins(): Promise<InstitucionalAdmin[]>;
  deleteInstitucionalAdmin(id: number): Promise<boolean>;
  updateInstitucionalAdminLastLogin(id: number): Promise<InstitucionalAdmin | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Inicialização opcional para o database storage
  }

  // Métodos de usuário
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }
  
  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async deleteUser(id: number): Promise<boolean> {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }
  
  // Métodos de dicas/tutoriais
  async getTip(id: number): Promise<Tip | undefined> {
    const [tip] = await db.select().from(tips).where(eq(tips.id, id));
    return tip;
  }
  
  async createTip(tip: InsertTip): Promise<Tip> {
    const [newTip] = await db.insert(tips).values(tip).returning();
    return newTip;
  }
  
  async updateTip(id: number, data: Partial<Tip>): Promise<Tip | undefined> {
    const [updated] = await db.update(tips)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tips.id, id))
      .returning();
    return updated;
  }
  
  async listTips(filters?: { status?: string, authorId?: number }): Promise<Tip[]> {
    let query = db.select().from(tips);
    
    if (filters) {
      if (filters.status) {
        // Usar cast para tipagem correta
        const tipStatus = filters.status as any;
        query = query.where(eq(tips.status, tipStatus));
      }
      
      if (filters.authorId) {
        query = query.where(eq(tips.authorId, filters.authorId));
      }
    }
    
    return await query;
  }
  
  async deleteTip(id: number): Promise<boolean> {
    const result = await db.delete(tips).where(eq(tips.id, id));
    return true;
  }
  
  // Métodos de posts/conteúdo
  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }
  
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }
  
  async updatePost(id: number, data: Partial<Post>): Promise<Post | undefined> {
    const [updated] = await db.update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return updated;
  }
  
  async listPosts(filters?: { categoria?: string, autorId?: number }): Promise<Post[]> {
    let query = db.select().from(posts);
    
    if (filters) {
      if (filters.categoria) {
        // Usar cast para tipagem correta
        const categoria = filters.categoria as any;
        query = query.where(eq(posts.categoria, categoria));
      }
      
      if (filters.autorId) {
        query = query.where(eq(posts.autorId, filters.autorId));
      }
    }
    
    return await query;
  }
  
  async deletePost(id: number): Promise<boolean> {
    await db.delete(posts).where(eq(posts.id, id));
    return true;
  }
  
  // Configurações do sistema
  async getSettings(): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings);
    return setting;
  }
  
  async updateSettings(data: Partial<InsertSettings>): Promise<Settings> {
    const currentSettings = await this.getSettings();
    
    if (currentSettings) {
      const [updated] = await db.update(settings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(settings.id, currentSettings.id))
        .returning();
      return updated;
    } else {
      const [newSettings] = await db.insert(settings)
        .values(data)
        .returning();
      return newSettings;
    }
  }
  
  // Configurações da IA
  async getConfigIA(): Promise<ConfigIA | undefined> {
    // Selecionando explicitamente os campos para evitar problemas com nomes de colunas
    const [config] = await db.select({
      id: configIA.id,
      apiKey: configIA.apiKey,
      ativar: configIA.ativar,
      maxPostsPorDia: configIA.maxPostsPorDia,
      frequencia: configIA.frequencia,
      modelo: configIA.modelo,
      temperatura: configIA.temperatura,
      topicosPrincipais: configIA.topicosPrincipais,
      instrucoes: configIA.instrucoes,
      categoriasAtivas: configIA.categoriasAtivas,
      horarioExecucao: configIA.horarioExecucao,
      promptBase: configIA.promptBase,
      idioma: configIA.idioma,
      ultimaExecucao: configIA.ultimaExecucao,
      ultimaAtualizacao: configIA.ultimaAtualizacao,
      createdAt: configIA.createdAt,
      updatedAt: configIA.updatedAt,
      executando: configIA.executando
    }).from(configIA);
    
    return config;
  }
  
  async updateConfigIA(data: Partial<InsertConfigIA>): Promise<ConfigIA> {
    const currentConfig = await this.getConfigIA();
    
    // Converter tipo de temperatura para string se for número
    let processedData = { ...data };
    if (typeof processedData.temperatura === 'number') {
      processedData.temperatura = String(processedData.temperatura);
    }
    
    // Remover campos problemáticos que causam erros no toISOString
    if (processedData.ultimaExecucao) delete processedData.ultimaExecucao;
    if (processedData.ultimaAtualizacao) delete processedData.ultimaAtualizacao;
    if (processedData.createdAt) delete processedData.createdAt;
    if (processedData.updatedAt) delete processedData.updatedAt;
    
    if (currentConfig) {
      // Especificando os campos para atualização
      const [updated] = await db.update(configIA)
        .set({ 
          ...processedData, 
          updatedAt: new Date() 
        })
        .where(eq(configIA.id, currentConfig.id))
        .returning({
          id: configIA.id,
          apiKey: configIA.apiKey,
          ativar: configIA.ativar,
          maxPostsPorDia: configIA.maxPostsPorDia,
          frequencia: configIA.frequencia,
          modelo: configIA.modelo,
          temperatura: configIA.temperatura,
          topicosPrincipais: configIA.topicosPrincipais,
          instrucoes: configIA.instrucoes,
          categoriasAtivas: configIA.categoriasAtivas,
          horarioExecucao: configIA.horarioExecucao,
          promptBase: configIA.promptBase,
          idioma: configIA.idioma,
          ultimaExecucao: configIA.ultimaExecucao,
          ultimaAtualizacao: configIA.ultimaAtualizacao,
          createdAt: configIA.createdAt,
          updatedAt: configIA.updatedAt,
          executando: configIA.executando
        });
      return updated;
    } else {
      // Inserção de nova configuração
      const [newConfig] = await db.insert(configIA)
        .values(processedData)
        .returning({
          id: configIA.id,
          apiKey: configIA.apiKey,
          ativar: configIA.ativar,
          maxPostsPorDia: configIA.maxPostsPorDia,
          frequencia: configIA.frequencia,
          modelo: configIA.modelo,
          temperatura: configIA.temperatura,
          topicosPrincipais: configIA.topicosPrincipais,
          instrucoes: configIA.instrucoes,
          categoriasAtivas: configIA.categoriasAtivas,
          horarioExecucao: configIA.horarioExecucao,
          promptBase: configIA.promptBase,
          idioma: configIA.idioma,
          ultimaExecucao: configIA.ultimaExecucao,
          ultimaAtualizacao: configIA.ultimaAtualizacao,
          createdAt: configIA.createdAt,
          updatedAt: configIA.updatedAt,
          executando: configIA.executando
        });
      return newConfig;
    }
  }
  
  // Métodos específicos da IA
  async findOrCreateIAUser(): Promise<User> {
    const iaEmail = 'ia@aereovisao.com.br';
    const iaUsername = 'ChatGPT IA';
    
    let iaUser = await this.getUserByEmail(iaEmail);
    
    if (!iaUser) {
      // Gerar senha aleatória que não será usada (já que é um usuário de sistema)
      const randomPassword = Array(32).fill(0)
        .map(() => Math.random().toString(36).charAt(2))
        .join('');
        
      iaUser = await this.createUser({
        email: iaEmail,
        username: iaUsername,
        displayName: 'ChatGPT IA',
        password: randomPassword,
        role: 'colaborador',
        uid: randomUUID()
      });
      
      console.log(`Usuário da IA criado com ID: ${iaUser.id}`);
    }
    
    return iaUser;
  }

  // Métodos do site institucional - Páginas
  async getInstitucionalPage(id: number): Promise<InstitucionalPage | undefined> {
    const [page] = await db.select().from(institucionalPages).where(eq(institucionalPages.id, id));
    return page;
  }

  async getInstitucionalPageBySlug(slug: string): Promise<InstitucionalPage | undefined> {
    const [page] = await db.select().from(institucionalPages).where(eq(institucionalPages.slug, slug));
    return page;
  }

  async createInstitucionalPage(page: InsertInstitucionalPage): Promise<InstitucionalPage> {
    const [newPage] = await db.insert(institucionalPages).values(page).returning();
    return newPage;
  }

  async updateInstitucionalPage(id: number, data: Partial<InstitucionalPage>): Promise<InstitucionalPage | undefined> {
    const [updated] = await db.update(institucionalPages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(institucionalPages.id, id))
      .returning();
    return updated;
  }

  async listInstitucionalPages(): Promise<InstitucionalPage[]> {
    return await db.select().from(institucionalPages).orderBy(institucionalPages.order);
  }

  async deleteInstitucionalPage(id: number): Promise<boolean> {
    await db.delete(institucionalPages).where(eq(institucionalPages.id, id));
    return true;
  }

  // Métodos do site institucional - Seções
  async getInstitucionalSection(id: number): Promise<InstitucionalSection | undefined> {
    const [section] = await db.select().from(institucionalSections).where(eq(institucionalSections.id, id));
    return section;
  }

  async createInstitucionalSection(section: InsertInstitucionalSection): Promise<InstitucionalSection> {
    const [newSection] = await db.insert(institucionalSections).values(section).returning();
    return newSection;
  }

  async updateInstitucionalSection(id: number, data: Partial<InstitucionalSection>): Promise<InstitucionalSection | undefined> {
    const [updated] = await db.update(institucionalSections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(institucionalSections.id, id))
      .returning();
    return updated;
  }

  async listInstitucionalSections(pageId?: number): Promise<InstitucionalSection[]> {
    let query = db.select().from(institucionalSections);
    
    if (pageId) {
      query = query.where(eq(institucionalSections.pageId, pageId));
    }
    
    return await query.orderBy(institucionalSections.order);
  }

  async deleteInstitucionalSection(id: number): Promise<boolean> {
    await db.delete(institucionalSections).where(eq(institucionalSections.id, id));
    return true;
  }

  // Métodos do site institucional - Configurações
  async getInstitucionalSettings(): Promise<InstitucionalSettings | undefined> {
    const [settings] = await db.select().from(institucionalSettings);
    return settings;
  }

  async updateInstitucionalSettings(data: Partial<InsertInstitucionalSettings>): Promise<InstitucionalSettings> {
    const currentSettings = await this.getInstitucionalSettings();
    
    if (currentSettings) {
      const [updated] = await db.update(institucionalSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(institucionalSettings.id, currentSettings.id))
        .returning();
      return updated;
    } else {
      const [newSettings] = await db.insert(institucionalSettings)
        .values(data)
        .returning();
      return newSettings;
    }
  }
  
  // Métodos do site institucional - Administradores
  async getInstitucionalAdmin(id: number): Promise<InstitucionalAdmin | undefined> {
    const [admin] = await db.select().from(institucionalAdmins).where(eq(institucionalAdmins.id, id));
    return admin;
  }
  
  async getInstitucionalAdminByEmail(email: string): Promise<InstitucionalAdmin | undefined> {
    const [admin] = await db.select().from(institucionalAdmins).where(eq(institucionalAdmins.email, email));
    return admin;
  }
  
  async createInstitucionalAdmin(admin: InsertInstitucionalAdmin): Promise<InstitucionalAdmin> {
    const [newAdmin] = await db.insert(institucionalAdmins).values(admin).returning();
    return newAdmin;
  }
  
  async updateInstitucionalAdmin(id: number, data: Partial<InstitucionalAdmin>): Promise<InstitucionalAdmin | undefined> {
    const [updated] = await db.update(institucionalAdmins)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(institucionalAdmins.id, id))
      .returning();
    return updated;
  }
  
  async listInstitucionalAdmins(): Promise<InstitucionalAdmin[]> {
    return await db.select().from(institucionalAdmins);
  }
  
  async deleteInstitucionalAdmin(id: number): Promise<boolean> {
    await db.delete(institucionalAdmins).where(eq(institucionalAdmins.id, id));
    return true;
  }
  
  async updateInstitucionalAdminLastLogin(id: number): Promise<InstitucionalAdmin | undefined> {
    const [updated] = await db.update(institucionalAdmins)
      .set({ 
        lastLogin: new Date(),
        updatedAt: new Date()
      })
      .where(eq(institucionalAdmins.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
