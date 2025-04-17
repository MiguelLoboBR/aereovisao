/**
 * MOCK DE FIREBASE - NÃO UTILIZADO
 * 
 * Este arquivo foi mantido apenas para compatibilidade com código existente
 * enquanto a migração para o sistema JWT foi realizada.
 * 
 * Todos os métodos são simulados e não se conectam ao Firebase.
 */

// Mock de tipos do Firebase para evitar dependências
export type FirebaseUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

// Mock do objeto auth para compatibilidade
export const auth = {
  currentUser: null as FirebaseUser | null,
};

// Mock do objeto storage para compatibilidade
export const storage = {};

// Funções simuladas para manter compatibilidade com código existente

// Função para registrar um usuário - não utilizada mais (substituída por JWT)
export const registerWithEmailAndPassword = async (email: string, password: string) => {
  console.warn('Firebase desativado: usando sistema JWT');
  return { user: { uid: 'mock-uid', email, displayName: null, photoURL: null } };
};

// Função para fazer login - não utilizada mais (substituída por JWT)
export const loginWithEmailAndPassword = async (email: string, password: string) => {
  console.warn('Firebase desativado: usando sistema JWT');
  return { uid: 'mock-uid', email, displayName: null, photoURL: null };
};

// Função para fazer logout - não utilizada mais (substituída por JWT)
export const logoutUser = async (): Promise<void> => {
  console.warn('Firebase desativado: usando sistema JWT');
};

// Função para atualizar o perfil do usuário - não utilizada mais (substituída por JWT)
export const updateUserProfile = async (
  displayName?: string | null, 
  photoURL?: string | null
): Promise<void> => {
  console.warn('Firebase desativado: usando sistema JWT');
};

// Função para upload de imagem de perfil - não utilizada mais (substituída por upload direto)
export const uploadProfilePicture = async (
  file: File, 
  userId: string
): Promise<string> => {
  console.warn('Firebase desativado: usando upload direto no servidor');
  return '/uploads/mock-image.jpg';
};

// Função para monitorar mudanças no estado de autenticação
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  console.warn('Firebase desativado: usando sistema JWT');
  // Retorna uma função de desinscrição simulada
  return () => {};
};