import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { Request } from 'express';

// Configuração do multer para salvar arquivos
const storage = multer.diskStorage({
  destination: (_req: Request, _file, cb) => {
    // Pasta onde os arquivos serão salvos
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Garantir que a pasta uploads existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req: Request, file, cb) => {
    // Gerar um nome de arquivo único baseado no timestamp atual e no nome original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    
    // Verificar o campo do formulário para determinar o prefixo do arquivo
    const { fieldname } = file;
    let prefix = 'file';
    
    if (fieldname === 'photoFile') {
      prefix = 'profile';
    } else if (fieldname === 'imageFile') {
      prefix = 'post';
    } else if (fieldname === 'attachmentFile') {
      prefix = 'attachment';
    }
    
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  },
});

// Filtro para imagens
const imageFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Verificar se o arquivo é uma imagem
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Filtro para documentos e imagens
const documentFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Permitir imagens e tipos comuns de documentos
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/zip',
    'text/plain',
    'text/csv'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Configuração básica do multer
const baseUpload = (fileFilter: multer.Options['fileFilter']) => multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de 10MB
  },
});

// Upload para perfil (somente imagens)
export const upload = baseUpload(imageFilter);

// Upload para imagens de post
export const postImageUpload = baseUpload(imageFilter);

// Upload para anexos (documentos e imagens)
export const attachmentUpload = baseUpload(documentFilter);

// Função para obter a URL do arquivo
export function getFileUrl(filename: string): string {
  // Retorna a URL relativa para acessar o arquivo
  return `/uploads/${filename}`;
}

// Função para excluir um arquivo
export function deleteFile(filename: string): void {
  try {
    if (!filename) return;
    
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    // Verificar se o arquivo existe
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
  }
}

// Funções para compatibilidade com código existente
export const getImageUrl = getFileUrl;
export const deleteImage = deleteFile;

// Exportando os filtros para uso no middleware de campos múltiplos
export { imageFilter, documentFilter };