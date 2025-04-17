/**
 * Script simplificado para o site institucional
 * Autenticação removida - acesso direto ao painel admin
 */

// Função para fazer login - agora sempre retorna sucesso
async function login(email, password) {
  // Simulação de login bem-sucedido
  window.location.replace(window.location.origin + '/institucional/admin/index.html');
  return { success: true };
}

// Função para verificar autenticação - agora sempre retorna verdadeiro
async function isAuthenticated() {
  return true;
}

// Função para obter dados do admin
function getAdminData() {
  // Retorna um admin padrão
  return {
    name: 'Administrador',
    avatar: '/institucional/public/images/default-avatar.png'
  };
}

// Função para configurar o ambiente administrativo
function setupAdminEnvironment() {
  // Configurar nome de admin padrão
  const adminNameElements = document.querySelectorAll('.admin-name');
  adminNameElements.forEach(element => {
    element.textContent = 'Administrador';
  });
  
  // Configurar avatar padrão
  const adminAvatarElements = document.querySelectorAll('.admin-avatar');
  adminAvatarElements.forEach(element => {
    element.src = '/institucional/public/images/default-avatar.png';
  });
}

// Função para proteger rotas administrativas - agora não faz nada
async function protectAdminRoute() {
  setupAdminEnvironment();
  return true;
}

// Função para redirecionar usuários autenticados - agora redireciona diretamente
async function redirectIfAuthenticated() {
  window.location.replace(window.location.origin + '/institucional/admin/index.html');
  return true;
}

// API para fazer requisições não autenticadas
async function authFetch(url, options = {}) {
  return fetch(url, options);
}