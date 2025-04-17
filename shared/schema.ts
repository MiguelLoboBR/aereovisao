import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, json, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { randomUUID } from "crypto";

// Define o enum para os tipos de usuários
export const userRoleEnum = pgEnum('user_role', ['usuario', 'colaborador', 'admin']);

// Define o enum para os tipos de conteúdo institucional
export const contentTypeEnum = pgEnum('content_type', ['texto', 'imagem', 'video', 'banner']);

// Define o enum para as categorias de postagens
export const postCategoryEnum = pgEnum('post_category', ['dicas', 'firmware', 'legislacao', 'noticia']);

// Tabela de usuários
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull(), // ID único para compatibilidade com Firebase
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Senha hash
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  phone: text("phone"),
  document: text("document"), // CPF/CNPJ
  address: text("address"), // Endereço completo
  role: userRoleEnum("role").notNull().default('usuario'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Status das dicas
export const tipStatusEnum = pgEnum('tip_status', ['pendente', 'aprovada', 'rejeitada']);

// Tabela de dicas
export const tips = pgTable("tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  image: text("image"),
  authorId: integer("author_id").notNull().references(() => users.id),
  status: tipStatusEnum("status").notNull().default('pendente'),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relações de dicas
export const tipsRelations = relations(tips, ({ one }) => ({
  author: one(users, {
    fields: [tips.authorId],
    references: [users.id],
  }),
}));

// Tabela de postagens
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  conteudo: text("conteudo").notNull(), // TEXT é grande o suficiente para conteúdo HTML
  categoria: postCategoryEnum("categoria").notNull(),
  autorId: integer("autor_id").notNull().references(() => users.id),
  autorNome: text("autor_nome"), // Nome do autor para exibir no "Postado por"
  imagemUrl: text("imagem_url"), // URL da imagem destacada/thumbnail
  anexoUrl: text("anexo_url"), // URL do arquivo anexado (PDF, etc)
  anexoNome: text("anexo_nome"), // Nome original do arquivo anexado
  youtubeUrl: text("youtube_url"), // URL do vídeo do YouTube para incorporar
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relações de postagens
export const postsRelations = relations(posts, ({ one }) => ({
  autor: one(users, {
    fields: [posts.autorId],
    references: [users.id],
  }),
}));

// Relações de usuários
export const usersRelations = relations(users, ({ many }) => ({
  tips: many(tips),
  posts: many(posts),
}));

// Tabela de configurações do sistema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  pixKey: text("pix_key"),
  pixName: text("pix_name"),
  pixBank: text("pix_bank"),
  paypalUrl: text("paypal_url"),
  cardUrl: text("card_url"),
  customDonationMethods: json("custom_donation_methods").default('[]'), // Armazena array de objetos em formato JSON
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de configurações da IA
export const configIA = pgTable("config_ia", {
  id: serial("id").primaryKey(),
  apiKey: text("apiKey"), // Corrigido para corresponder ao nome da coluna no banco de dados
  ativar: boolean("ativar").notNull().default(false),
  maxPostsPorDia: integer("maxPostsPorDia").notNull().default(1), // Renomeado de quantidadePosts para maxPostsPorDia
  frequencia: integer("frequencia").notNull().default(7),
  modelo: text("modelo").notNull().default('gpt-4o'),
  temperatura: decimal("temperatura", { precision: 3, scale: 2 }).notNull().default("0.7"),
  topicosPrincipais: text("topicosPrincipais").default('drones, legislação, firmware, novidades'), // Nome da coluna corrigido
  instrucoes: text("instrucoes").notNull().default('Crie um artigo informativo sobre drones para o portal Aéreo Visão.'),
  categoriasAtivas: json("categoriasAtivas").default('["dicas", "noticia"]'), // Nome da coluna corrigido 
  horarioExecucao: text("horarioExecucao").notNull().default('10:00'), // Nome da coluna corrigido
  promptBase: text("promptBase").notNull().default('Crie um conteúdo informativo para pilotos de drone sobre {categoria}. O texto deve ser em formato HTML com headers, parágrafos e listas.'), // Nome da coluna corrigido
  idioma: text("idioma").notNull().default('pt-BR'),
  ultimaExecucao: timestamp("ultimaExecucao"), // Nome da coluna corrigido
  ultimaAtualizacao: timestamp("ultimaAtualizacao"), // Nome da coluna corrigido
  createdAt: timestamp("created_at").defaultNow(), // Adicionando a coluna createdAt
  updatedAt: timestamp("updated_at").defaultNow(),
  executando: boolean("executando").default(false), // Adicionando a coluna executando
});

// Schemas de inserção para validação com Zod
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  uid: z.string().default(() => randomUUID()), // Gera um UUID único para cada usuário
  phone: z.string().optional(),
  document: z.string().optional(), 
  address: z.string().optional(),
});

export const insertTipSchema = createInsertSchema(tips, {
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  content: z.string().min(20, "Conteúdo deve ter pelo menos 20 caracteres"),
});

export const insertPostSchema = createInsertSchema(posts, {
  titulo: z.string().min(3, "Título obrigatório"),
  conteudo: z.string()
    .min(5, "Conteúdo deve ter pelo menos 5 caracteres")
    .max(50000, "Conteúdo muito longo"), // Aceita conteúdo HTML longo
  autorNome: z.string().optional(),
  imagemUrl: z.string().optional(),
  anexoUrl: z.string().optional(),
  anexoNome: z.string().optional(),
  youtubeUrl: z.string().url("URL inválida").optional().nullable(),
});

export const insertSettingsSchema = createInsertSchema(settings);

export const insertConfigIASchema = createInsertSchema(configIA, {
  apiKey: z.string().optional(),
  frequencia: z.number().min(1, "A frequência deve ser um número maior ou igual a 1").default(7),
  modelo: z.string().min(1, "O modelo é obrigatório").default('gpt-4o'),
  temperatura: z.number().min(0, "A temperatura deve ser maior ou igual a 0").max(2, "A temperatura deve ser menor ou igual a 2").default(0.7),
  topicosPrincipais: z.string().default('drones, legislação, firmware, novidades'),
  instrucoes: z.string().min(10, "As instruções devem ter pelo menos 10 caracteres").default('Crie um artigo informativo sobre drones para o portal Aéreo Visão.'),
  categoriasAtivas: z.array(z.enum(['dicas', 'firmware', 'legislacao', 'noticia']))
    .default(['dicas', 'noticia'])
    .transform(val => JSON.stringify(val)),
  promptBase: z.string()
    .min(10, "O prompt base deve ter pelo menos 10 caracteres")
    .default('Crie um conteúdo informativo para pilotos de drone sobre {categoria}. O texto deve ser em formato HTML com headers, parágrafos e listas.'),
  idioma: z.enum(['pt-BR', 'en-US']).default('pt-BR'),
});

// Tipos para TypeScript
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTip = z.infer<typeof insertTipSchema>;
export type Tip = typeof tips.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

export type InsertConfigIA = z.infer<typeof insertConfigIASchema>;
export type ConfigIA = typeof configIA.$inferSelect;

// Tabela para o site institucional - Páginas
export const institucionalPages = pgTable("institucional_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // Identificador único para URL
  title: text("title").notNull(),
  description: text("description"), // Descrição/meta para SEO
  content: text("content").notNull(), // Conteúdo HTML
  metaTitle: text("meta_title"), // Título para SEO
  metaDescription: text("meta_description"), // Descrição para SEO
  isPublished: boolean("is_published").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para o site institucional - Seções
export const institucionalSections = pgTable("institucional_sections", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id").references(() => institucionalPages.id).notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  content: text("content").notNull(),
  contentType: contentTypeEnum("content_type").notNull().default('texto'),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  order: integer("order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para o site institucional - Configurações
export const institucionalSettings = pgTable("institucional_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default('Aéreo Visão'),
  logoUrl: text("logo_url"),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  youtube: text("youtube"),
  address: text("address"),
  googleMapsUrl: text("google_maps_url"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relações institucional
export const institucionalSectionsRelations = relations(institucionalSections, ({ one }) => ({
  page: one(institucionalPages, {
    fields: [institucionalSections.pageId],
    references: [institucionalPages.id],
  }),
}));

export const institucionalPagesRelations = relations(institucionalPages, ({ many }) => ({
  sections: many(institucionalSections),
}));

// Schema de inserção
export const insertInstitucionalPageSchema = createInsertSchema(institucionalPages, {
  title: z.string().min(3, "Título obrigatório"),
  slug: z.string().min(2, "Slug obrigatório"),
  content: z.string().min(5, "Conteúdo obrigatório"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const insertInstitucionalSectionSchema = createInsertSchema(institucionalSections, {
  title: z.string().min(3, "Título obrigatório"),
  content: z.string().min(5, "Conteúdo obrigatório"),
  subtitle: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

export const insertInstitucionalSettingsSchema = createInsertSchema(institucionalSettings, {
  siteName: z.string().min(3, "Nome do site obrigatório"),
  email: z.string().email("Email inválido").optional(),
});

// Tipos para TypeScript
export type InstitucionalPage = typeof institucionalPages.$inferSelect;
export type InsertInstitucionalPage = z.infer<typeof insertInstitucionalPageSchema>;

export type InstitucionalSection = typeof institucionalSections.$inferSelect;
export type InsertInstitucionalSection = z.infer<typeof insertInstitucionalSectionSchema>;

export type InstitucionalSettings = typeof institucionalSettings.$inferSelect;
export type InsertInstitucionalSettings = z.infer<typeof insertInstitucionalSettingsSchema>;

// Tabela de administradores para o site institucional (separado do Portal)
export const institucionalAdmins = pgTable("institucional_admins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema de inserção para administradores do site institucional
export const insertInstitucionalAdminSchema = createInsertSchema(institucionalAdmins, {
  name: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

// Tipos para TypeScript
export type InstitucionalAdmin = typeof institucionalAdmins.$inferSelect;
export type InsertInstitucionalAdmin = z.infer<typeof insertInstitucionalAdminSchema>;
