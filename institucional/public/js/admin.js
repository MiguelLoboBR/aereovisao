// Função para verificar a autenticação do usuário
function verificarAutenticacao() {
  // Verificar se o usuário está autenticado
  // Esta verificação seria normalmente feita no servidor
  const tokenJWT = localStorage.getItem('token');
  
  if (!tokenJWT) {
    // Redirecionar para a página de login se não estiver autenticado
    window.location.href = '/app/login?redirect=' + encodeURIComponent(window.location.href);
    return false;
  }
  
  try {
    // Verificar se o token é válido e se o usuário tem permissão de admin
    const tokenPayload = JSON.parse(atob(tokenJWT.split('.')[1]));
    
    if (tokenPayload.exp < Date.now() / 1000) {
      // Token expirado
      localStorage.removeItem('token');
      window.location.href = '/app/login?redirect=' + encodeURIComponent(window.location.href);
      return false;
    }
    
    if (tokenPayload.role !== 'admin') {
      // Usuário não é admin
      alert('Acesso restrito: Somente administradores podem acessar esta área.');
      window.location.href = '/site';
      return false;
    }
    
    // Atualizar as informações do usuário no painel
    const userNameElement = document.querySelector('.admin-user-name');
    const userAvatarElement = document.querySelector('.admin-user-avatar');
    
    if (userNameElement && tokenPayload.username) {
      userNameElement.textContent = tokenPayload.username;
    }
    
    if (userAvatarElement && tokenPayload.username) {
      userAvatarElement.textContent = tokenPayload.username.charAt(0).toUpperCase();
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    localStorage.removeItem('token');
    window.location.href = '/app/login?redirect=' + encodeURIComponent(window.location.href);
    return false;
  }
}

// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();
  
  // Adicionar classe 'active' ao link de navegação atual
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.admin-nav-link');
  
  navLinks.forEach(link => {
    if (currentPath.includes(link.getAttribute('href'))) {
      link.classList.add('active');
    } else if (link.classList.contains('active') && !currentPath.includes(link.getAttribute('href'))) {
      link.classList.remove('active');
    }
  });
  
  // Inicializar o formulário de criação/edição se existir
  const adminForm = document.getElementById('admin-form');
  if (adminForm) {
    adminForm.addEventListener('submit', handleFormSubmit);
  }
  
  // Inicializar os botões de exclusão se existirem
  const deleteButtons = document.querySelectorAll('.admin-action-btn-delete');
  deleteButtons.forEach(button => {
    button.addEventListener('click', handleDelete);
  });
  
  // Inicializar o upload de imagem se existir
  const imageUploadInput = document.getElementById('image-upload');
  if (imageUploadInput) {
    imageUploadInput.addEventListener('change', handleImageUpload);
  }
  
  // Inicializar o editor WYSIWYG se existir
  const editorTextarea = document.querySelector('.admin-form-textarea[data-wysiwyg="true"]');
  if (editorTextarea && typeof tinymce !== 'undefined') {
    initWysiwygEditor(editorTextarea.id);
  }
});

// Função para lidar com o envio do formulário
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const actionType = form.getAttribute('data-action'); // 'create' ou 'edit'
  const resourceType = form.getAttribute('data-resource'); // 'page', 'service', etc.
  const resourceId = form.getAttribute('data-id'); // ID do recurso em caso de edição
  
  // Desabilitar o botão durante o envio
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
  }
  
  try {
    let endpoint = `/api/admin/institucional/${resourceType}s`;
    let method = 'POST';
    
    if (actionType === 'edit' && resourceId) {
      endpoint += `/${resourceId}`;
      method = 'PUT';
    }
    
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Exibir mensagem de sucesso
    showNotification('Operação realizada com sucesso!', 'success');
    
    // Redirecionar para a lista após um tempo
    setTimeout(() => {
      window.location.href = `/institucional/admin/${resourceType}s/index.html`;
    }, 1500);
    
  } catch (error) {
    console.error('Erro ao enviar formulário:', error);
    showNotification('Erro ao processar a solicitação. Tente novamente.', 'danger');
    
    // Reabilitar o botão
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Salvar';
    }
  }
}

// Função para lidar com a exclusão de itens
async function handleDelete(event) {
  const button = event.currentTarget;
  const resourceType = button.getAttribute('data-resource');
  const resourceId = button.getAttribute('data-id');
  const resourceName = button.getAttribute('data-name') || 'este item';
  
  if (!confirm(`Tem certeza que deseja excluir ${resourceName}? Esta ação não pode ser desfeita.`)) {
    return;
  }
  
  try {
    const response = await fetch(`/api/admin/institucional/${resourceType}s/${resourceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Exibir mensagem de sucesso
    showNotification('Item excluído com sucesso!', 'success');
    
    // Remover o item da tabela
    const tableRow = button.closest('tr');
    if (tableRow) {
      tableRow.remove();
    }
    
  } catch (error) {
    console.error('Erro ao excluir item:', error);
    showNotification('Erro ao excluir o item. Tente novamente.', 'danger');
  }
}

// Função para lidar com o upload de imagem
function handleImageUpload(event) {
  const fileInput = event.target;
  const previewElement = document.getElementById('image-preview');
  
  if (fileInput.files && fileInput.files[0] && previewElement) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      previewElement.src = e.target.result;
      previewElement.style.display = 'block';
    };
    
    reader.readAsDataURL(fileInput.files[0]);
  }
}

// Função para inicializar o editor WYSIWYG
function initWysiwygEditor(elementId) {
  tinymce.init({
    selector: `#${elementId}`,
    height: 400,
    menubar: false,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table paste code help wordcount'
    ],
    toolbar: 'undo redo | formatselect | bold italic backcolor | \
              alignleft aligncenter alignright alignjustify | \
              bullist numlist outdent indent | removeformat | help'
  });
}

// Função para exibir notificações
function showNotification(message, type = 'info') {
  // Verificar se já existe uma notificação
  let notification = document.querySelector('.admin-notification');
  
  if (!notification) {
    // Criar elemento de notificação
    notification = document.createElement('div');
    notification.className = 'admin-notification';
    document.body.appendChild(notification);
  }
  
  // Definir classe baseada no tipo
  notification.className = `admin-notification admin-notification-${type}`;
  notification.innerHTML = message;
  
  // Mostrar a notificação
  notification.style.display = 'block';
  
  // Remover após alguns segundos
  setTimeout(() => {
    notification.style.display = 'none';
  }, 5000);
}

// Adicionar CSS para a notificação diretamente no script
const notificationStyles = `
  .admin-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    display: none;
  }
  
  .admin-notification-success {
    background-color: #10b981;
    color: white;
  }
  
  .admin-notification-danger {
    background-color: #ef4444;
    color: white;
  }
  
  .admin-notification-info {
    background-color: #3b82f6;
    color: white;
  }
  
  .admin-notification-warning {
    background-color: #f59e0b;
    color: white;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

// Adicionar estilos ao cabeçalho
const styleElement = document.createElement('style');
styleElement.textContent = notificationStyles;
document.head.appendChild(styleElement);