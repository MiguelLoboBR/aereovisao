import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";
import { useLocation } from "wouter";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [location] = useLocation();
  
  // Para PWA - detectar se é instalável
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  
  useEffect(() => {
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

  return (
    <div className="flex min-h-screen bg-aero-slate-50">
      {/* Sidebar para desktop */}
      <Sidebar 
        currentPath={location} 
        showInstallButton={!!installPrompt} 
        onInstallClick={handleInstallClick} 
      />
      
      {/* Conteúdo principal */}
      <main className="flex-1 p-4 md:p-8 ml-0 md:ml-64 mt-0 mb-16 md:mb-0">
        {children}
      </main>
      
      {/* Navegação para mobile */}
      <MobileNavigation currentPath={location} />
    </div>
  );
};

export default DashboardLayout;