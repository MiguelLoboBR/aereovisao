if (window.location.pathname.startsWith('/institucional')) {
  window.location.href = window.location.href;
  throw new Error('Redirecionando para o site institucional');
}
// Verifica se a rota atual pertence ao site institucional
const pathname = window.location.pathname;
const fullUrl = window.location.href;

if (pathname.startsWith('/institucional')) {
  window.location.href = fullUrl;
  throw new Error('Redirecionando para o site institucional');
}

// ...continua com seu App normalmente...
import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider, useAuthJWT } from "@/hooks/useAuthJWT";
import { 
  createBrowserRouter, 
  RouterProvider, 
  Route, 
  createRoutesFromElements,
  Navigate,
  Routes,
  BrowserRouter
} from 'react-router-dom';
import { Route as WouterRoute, Switch, Link } from "wouter";

// Páginas
import AdminPage from "./pages/admin";
import AdminSimples from "./pages/AdminSimples";
import AdminStandalone from "./pages/admin-standalone";
import AdminPanel from "./pages/AdminPanel";
import AuthPage from "./pages/auth-page";
import NotFound from "./pages/not-found";
import Home from "./pages/Home";
import Legislacao from "./pages/Legislacao";
import Firmware from "./pages/Firmware";
import Dicas from "./pages/Dicas";
import Noticias from "./pages/Noticias";
import Doacoes from "./pages/Doacoes";
import Patrocinadores from "./pages/Patrocinadores";
import EnviarDica from "./pages/enviar-dica";
import Perfil from "./pages/perfil";
import DebugPage from "./pages/debug";
import DashboardHome from "@/pages/dashboard-home";
import PostView from "@/pages/PostView";
import DownloadPage from "@/pages/download";

// Carregamento lazy para o componente de configuração da IA
const IAConfigCleanLazy = React.lazy(() => import("./pages/admin/IAConfigClean"));

// Layout para a aplicação
import AppLayout from "@/components/AppLayout";

// Componentes de HOC para rotas protegidas (usando wouter)
import { ProtectedRoute, AdminRoute } from "@/lib/protected-route";

function ConnectionTest() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  
  const testConnection = async () => {
    try {
      setStatus('loading');
      setMessage('Testando conexão...');
      
      // Usar window.location.origin para URL base
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/api/status`;
      
      console.log(`Tentando conexão com: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        credentials: 'include',
        cache: 'no-cache',
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus('success');
        setMessage(`Conexão estabelecida! Resposta: ${JSON.stringify(data)}`);
      } else {
        setStatus('error');
        setMessage(`Erro ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Erro no teste de conexão:', err);
      setStatus('error');
      setMessage(`Erro: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  return (
    <div className="mt-6 p-4 bg-slate-100 rounded-lg">
      <h2 className="text-xl font-semibold mb-3">Teste de Conectividade</h2>
      <p className="text-green-600 mb-2">✅ Aplicação inicializada com sucesso</p>
      <p className="text-slate-600 mb-2">URL atual: {window.location.href}</p>
      
      <div className="mt-4">
        <button 
          onClick={testConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Testando...' : 'Testar Conexão com Backend'}
        </button>
        
        {message && (
          <div className={`mt-3 p-3 rounded ${
            status === 'success' ? 'bg-green-100 text-green-700' : 
            status === 'error' ? 'bg-red-100 text-red-700' : 
            'bg-blue-100 text-blue-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

// Definição do router para o novo layout com React Router
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* Layout da aplicação autenticada */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="legislacao" element={<Legislacao />} />
        <Route path="firmware" element={<Firmware />} />
        <Route path="dicas" element={<Dicas />} />
        <Route path="noticias" element={<Noticias />} />
        <Route path="enviar-dica" element={<EnviarDica />} />
        <Route path="doacoes" element={<Doacoes />} />
        <Route path="patrocinadores" element={<Patrocinadores />} />
        <Route path="download" element={<DownloadPage />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="admin" element={<AdminPanel />} />
        <Route path="post/:id" element={<PostView />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      
      {/* Rotas independentes com layout próprio para configuração da IA */}
      <Route 
        path="/app/admin/config-ia" 
        element={<React.Suspense fallback={<div>Carregando...</div>}>
          <IAConfigCleanLazy />
        </React.Suspense>}
      />
      <Route 
        path="/admin/ia-simples" 
        element={<React.Suspense fallback={<div>Carregando...</div>}>
          <IAConfigCleanLazy />
        </React.Suspense>}
      />
      
      {/* Rotas públicas que usam o antigo sistema */}
      <Route path="post/:id" element={<PostView />} />
      <Route path="/site/admin" element={null} />
      <Route path="/institucional/admin/login.html" element={null} />
      <Route path="*" element={<PublicRoutes />} />
    </Route>
  )
);

// Componente principal
function App() {
  console.log("Renderizando App.tsx");
  
  // Impede completamente que o React Router interfira no site institucional
  // Verifica se a URL contém /institucional/ em qualquer parte (incluindo query params)
  if (window.location.pathname.startsWith('/institucional') || 
      window.location.href.includes('/institucional/') ||
      window.location.search.includes('/institucional/')) {
    console.log('Detectada rota institucional, encaminhando diretamente:', window.location.href);
    
    // Trata acesso direto ao painel admin-direto para não exigir autenticação
    if (window.location.pathname.includes('/institucional/admin-direto') ||
        window.location.href.includes('/institucional/admin-direto/')) {
      console.log('Acesso direto ao painel admin-direto detectado');
      // Redireciona diretamente para o painel admin-direto
      window.location.href = window.location.origin + '/institucional/admin-direto/index.html';
      return null;
    }
    
    // Extrai o caminho institucional da URL completa se estiver nos parâmetros
    if (window.location.search.includes('redirect=')) {
      const redirectParam = new URLSearchParams(window.location.search).get('redirect');
      if (redirectParam) {
        if (redirectParam.includes('/institucional/admin-direto/')) {
          // Se for redirecionamento para o admin-direto, vai direto sem autenticação
          console.log('Redirecionando diretamente para o admin-direto');
          window.location.href = window.location.origin + '/institucional/admin-direto/index.html';
          return null;
        } else if (redirectParam.includes('/institucional/')) {
          // Decodifica a URL e redireciona diretamente
          window.location.href = decodeURIComponent(redirectParam);
          return null;
        }
      }
    }
    
    // Caso seja um caminho direto, apenas retorna null para que o React não interfira
    return null;
  }
  
  useEffect(() => {
    // Se a página carregar diretamente em /auth sem um redirecionamento explícito, 
    // redirecionar para a home page
    if (window.location.pathname === '/auth' && !window.location.search.includes('redirect')) {
      console.log('Redirecionando de /auth para a página inicial do portal');
      window.location.href = '/';
    }
  }, []);

  // Este bloco, fora de AuthProvider, garante que a rota standalone funcione independente de problemas na autenticação
  if (window.location.pathname === '/admin-standalone') {
    return (
      <QueryClientProvider client={queryClient}>
        <AdminStandalone />
        <Toaster />
      </QueryClientProvider>
    );
  }
  
  // Verificar se estamos tentando acessar páginas do site institucional
  const isInstitucionalPath = 
    window.location.pathname.startsWith('/institucional/') || 
    window.location.pathname.startsWith('/site/admin') ||
    window.location.pathname === '/site';
  
  if (isInstitucionalPath) {
    // Para rotas institucionais, redirecionar via JavaScript diretamente
    console.log("Detectada rota institucional:", window.location.pathname);
    
    // Redirecionar para o caminho correto, mantendo o caminho institucional original
    if (window.location.pathname.startsWith('/site/admin')) {
      window.location.href = '/institucional/admin/index.html'; // Acesso direto sem login
    } else if (window.location.pathname === '/site') {
      window.location.href = '/institucional/index.html';
    } else {
      // Manter o caminho original para outras páginas do institucional
      // Isso garante que o React não interfira com as páginas do site institucional
      console.log("Mantendo caminho institucional original");
    }
    
    return null; // Não renderizar nada enquanto aguardamos o redirecionamento
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <RouterProvider router={router} />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Componente para as rotas públicas que ainda usam Wouter
function PublicRoutes() {
  const { user } = useAuthJWT();
  
  // Redirecionar para /app se o usuário estiver autenticado
  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }
  
  return (
    <Switch>
      <WouterRoute path="/">
        <Home />
      </WouterRoute>
      <WouterRoute path="/auth">
        <AuthPage />
      </WouterRoute>
      <WouterRoute path="/login">
        <AuthPage />
      </WouterRoute>
      <WouterRoute path="/legislacao">
        <Legislacao />
      </WouterRoute>
      <WouterRoute path="/firmware">
        <Firmware />
      </WouterRoute>
      <WouterRoute path="/dicas">
        <Dicas />
      </WouterRoute>
      <WouterRoute path="/noticias">
        <Noticias />
      </WouterRoute>
      <WouterRoute path="/doacoes">
        <Doacoes />
      </WouterRoute>
      <WouterRoute path="/patrocinadores">
        <Patrocinadores />
      </WouterRoute>
      <WouterRoute path="/download">
        <DownloadPage />
      </WouterRoute>
      
      {/* Rotas de desenvolvimento/debug */}
      <WouterRoute path="/admin-simples">
        <AdminSimples />
      </WouterRoute>
      <WouterRoute path="/debug">
        <DebugPage />
      </WouterRoute>
      
      {/* Rota 404 */}
      <WouterRoute>
        <NotFound />
      </WouterRoute>
    </Switch>
  );
}

// Componente temporário para debug
function DebugComponent() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-5">Modo de Debug</h1>
      <p className="mb-4">Página para testes de conectividade.</p>
      <ConnectionTest />
      <div className="mt-6">
        <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block">
          Voltar para o Portal
        </Link>
      </div>
    </div>
  );
}

export default App;