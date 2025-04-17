document.addEventListener('DOMContentLoaded', function() {
  console.log("Site institucional carregado com sucesso!");

  // Ativar o menu móvel
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', function() {
      navLinks.classList.toggle('show');
    });
  }
  
  // Adicionar tratamento especial para o link de administração
  const adminLink = document.querySelector('.admin-link');
  
  if (adminLink) {
    adminLink.addEventListener('click', function(e) {
      e.preventDefault();
      const tokenJWT = localStorage.getItem('token');
      
      if (!tokenJWT) {
        // Redirecionar para a página de login do Portal se não estiver autenticado
        window.location.href = '/app/login?redirect=' + encodeURIComponent('/institucional/admin/index.html');
      } else {
        try {
          // Verificar se o token é válido e se o usuário tem permissão de admin
          const tokenPayload = JSON.parse(atob(tokenJWT.split('.')[1]));
          
          if (tokenPayload.exp < Date.now() / 1000) {
            // Token expirado
            localStorage.removeItem('token');
            window.location.href = '/app/login?redirect=' + encodeURIComponent('/institucional/admin/index.html');
          } else if (tokenPayload.role !== 'admin') {
            // Usuário não é admin
            alert('Acesso restrito: Somente administradores podem acessar esta área.');
          } else {
            // Usuário é admin e token é válido, permitir acesso
            window.location.href = '/institucional/admin/index.html';
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          localStorage.removeItem('token');
          window.location.href = '/app/login?redirect=' + encodeURIComponent('/institucional/admin/index.html');
        }
      }
    });
  }
  
  // Lidar com o envio do formulário de contato
  const contactForm = document.querySelector('.contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Em uma implementação real, aqui seria enviado para o servidor
      // Por enquanto, apenas mostrar uma mensagem
      
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      
      alert(`Obrigado, ${name}! Sua mensagem foi enviada com sucesso. Entraremos em contato em breve.`);
      contactForm.reset();
    });
  }
});

// Função para submissão do formulário de contato
function submitContactForm(event) {
  event.preventDefault();
  
  const form = event.target;
  const name = form.elements['name'].value;
  
  // Em uma implementação real, aqui seria enviado para o servidor
  // Por enquanto, apenas mostrar uma mensagem
  
  alert(`Obrigado, ${name}! Sua mensagem foi enviada com sucesso. Entraremos em contato em breve.`);
  form.reset();
}