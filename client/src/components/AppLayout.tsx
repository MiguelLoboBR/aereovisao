import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthJWT } from '@/hooks/useAuthJWT';
import { Loader2 } from 'lucide-react';
import { default as Header } from '@/components/Header';
import { default as AppSidebar } from '@/components/AppSidebar';
import { default as AppMobileNavigation } from '@/components/AppMobileNavigation';

const AppLayout: React.FC = () => {
  const { user, isLoading } = useAuthJWT();
  
  // Para PWA - detectar se é instalável
  const [installPrompt, setInstallPrompt] = React.useState<any>(null);
  
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (event: any) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("Usuário aceitou a instalação do PWA");
        } else {
          console.log("Usuário recusou a instalação do PWA");
        }
        setInstallPrompt(null);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    // Redirecionar para a página de login se não estiver autenticado
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen bg-aero-slate-50">
      {/* Sidebar para desktop */}
      <AppSidebar 
        showInstallButton={!!installPrompt} 
        onInstallClick={handleInstallClick} 
      />
      
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        {/* Header */}
        <Header user={{ 
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: user.role,
          phone: user.phone,
          document: user.document
        }} />
        
        {/* Conteúdo principal - aqui é onde as rotas filhas serão renderizadas */}
        <main className="flex-1 p-4 md:p-8 mb-16 md:mb-0 mt-16">
          <Outlet />
        </main>
      </div>
      
      {/* Navegação para mobile */}
      <AppMobileNavigation />
    </div>
  );
};

export default AppLayout;