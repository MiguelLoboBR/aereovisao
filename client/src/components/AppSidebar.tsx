import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthJWT } from '@/hooks/useAuthJWT';
import { Button } from '@/components/ui/button';
import { DroneIcon } from './DroneIcons';

interface AppSidebarProps {
  showInstallButton?: boolean;
  onInstallClick?: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ 
  showInstallButton = false, 
  onInstallClick = () => {} 
}) => {
  const location = useLocation();
  const { user, isAdmin, isColaborador } = useAuthJWT();
  
  const isActive = (path: string) => {
    return location.pathname === path || 
      (path !== "/app" && location.pathname.startsWith(path));
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-aero-slate-200 p-5 hidden md:flex flex-col z-20">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center bg-transparent p-3 rounded-2xl">
          <DroneIcon className="h-16 w-auto" />
        </div>
        <p className="text-center text-sm text-aero-slate-500">Portal do Piloto</p>
      </div>
      
      <nav className="mt-6 px-2 flex-grow">
        <ul className="space-y-2">
          <li>
            <Link to="/app/dashboard" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
              isActive("/app/dashboard") 
                ? "text-blue-700 bg-blue-50" 
                : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
            } transition-colors`}>
              <i className="fas fa-tachometer-alt w-5 h-5 mr-3"></i>
              <span>Dashboard</span>
            </Link>
          </li>

          <li>
            <Link to="/app/legislacao" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
              isActive("/app/legislacao") 
                ? "text-blue-700 bg-blue-50" 
                : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
            } transition-colors`}>
              <i className="fas fa-gavel w-5 h-5 mr-3"></i>
              <span>Legislação</span>
            </Link>
          </li>
          <li>
            <Link to="/app/firmware" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
              isActive("/app/firmware") 
                ? "text-blue-700 bg-blue-50" 
                : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
            } transition-colors`}>
              <i className="fas fa-microchip w-5 h-5 mr-3"></i>
              <span>Firmware</span>
            </Link>
          </li>
          <li>
            <Link to="/app/dicas" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
              isActive("/app/dicas") 
                ? "text-blue-700 bg-blue-50" 
                : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
            } transition-colors`}>
              <i className="fas fa-lightbulb w-5 h-5 mr-3"></i>
              <span>Dicas</span>
            </Link>
          </li>
          
          <li>
            <Link to="/app/noticias" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
              isActive("/app/noticias") 
                ? "text-blue-700 bg-blue-50" 
                : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
            } transition-colors`}>
              <i className="fas fa-newspaper w-5 h-5 mr-3"></i>
              <span>Notícias</span>
            </Link>
          </li>

          <li>
            <Link to="/app/doacoes" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
              isActive("/app/doacoes") 
                ? "text-blue-700 bg-blue-50" 
                : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
            } transition-colors`}>
              <i className="fas fa-hand-holding-heart w-5 h-5 mr-3"></i>
              <span>Doações</span>
            </Link>
          </li>
          <li>
            <Link to="/app/patrocinadores" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
              isActive("/app/patrocinadores") 
                ? "text-blue-700 bg-blue-50" 
                : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
            } transition-colors`}>
              <i className="fas fa-handshake w-5 h-5 mr-3"></i>
              <span>Patrocinadores</span>
            </Link>
          </li>
          
          <li>
            <Link 
              to="/app/download"
              className={`flex items-center px-4 py-3 rounded-lg font-medium ${
                isActive("/app/download") 
                  ? "text-blue-700 bg-blue-50" 
                  : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
              } transition-colors`}
            >
              <i className="fas fa-mobile-alt w-5 h-5 mr-3"></i>
              <span>📲 Baixar Versão Mobile</span>
            </Link>
          </li>
          
          {(isAdmin || isColaborador) && (
            <li className="mt-6">
              <Link to="/app/admin" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
                isActive("/app/admin") 
                  ? "text-white bg-red-600" 
                  : "text-red-600 hover:text-white hover:bg-red-600"
              } transition-colors`}>
                <i className="fas fa-shield-alt w-5 h-5 mr-3"></i>
                <span>Painel Administrativo</span>
              </Link>
            </li>
          )}
          
          <li className="mt-4">
            <Link to="/app/perfil" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
              isActive("/app/perfil") 
                ? "text-blue-700 bg-blue-50" 
                : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
            } transition-colors`}>
              <i className="fas fa-user w-5 h-5 mr-3"></i>
              <span>Meu Perfil</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-aero-slate-200">
        {showInstallButton ? (
          <Button 
            onClick={onInstallClick}
            className="flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <i className="fas fa-mobile-alt mr-2"></i>
            <span>Instalar App</span>
          </Button>
        ) : null}
      </div>
    </aside>
  );
};

export default AppSidebar;