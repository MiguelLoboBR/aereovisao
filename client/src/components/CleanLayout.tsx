import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CleanLayoutProps {
  children: ReactNode;
  title?: string;
  backTo?: string;
  backLabel?: string;
}

/**
 * Layout limpo sem sidebar para páginas administrativas específicas
 */
const CleanLayout = ({ 
  children, 
  title = "Aéreo Visão", 
  backTo = "/admin",
  backLabel = "Voltar ao Painel" 
}: CleanLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/images/aereo-visao-logo.png" 
              alt="Aéreo Visão" 
              className="h-10 mr-2"
            />
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(backTo)}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-6 px-4">
        {children}
      </main>
      
      <footer className="border-t py-4 bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} Aéreo Visão - Portal do Piloto
        </div>
      </footer>
    </div>
  );
};

export default CleanLayout;