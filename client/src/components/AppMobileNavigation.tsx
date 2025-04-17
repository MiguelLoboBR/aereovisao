import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthJWT } from '@/hooks/useAuthJWT';

const AppMobileNavigation: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin, isColaborador } = useAuthJWT();
  
  const isActive = (path: string) => {
    return location.pathname === path || 
      (path !== "/app" && location.pathname.startsWith(path));
  };
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-aero-slate-200 py-2 px-4 z-20">
      <div className="grid grid-cols-5 gap-1">
        <div>
          <Link to="/app/dashboard" className={`flex flex-col items-center justify-center ${
            isActive("/app/dashboard") ? "text-blue-600" : "text-aero-slate-500"
          }`}>
            <i className="fas fa-tachometer-alt text-lg"></i>
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
        </div>
        <div>
          <Link to="/app/legislacao" className={`flex flex-col items-center justify-center ${
            isActive("/app/legislacao") ? "text-blue-600" : "text-aero-slate-500"
          }`}>
            <i className="fas fa-gavel text-lg"></i>
            <span className="text-xs mt-1">Leis</span>
          </Link>
        </div>
        <div>
          <Link to="/app/firmware" className={`flex flex-col items-center justify-center ${
            isActive("/app/firmware") ? "text-blue-600" : "text-aero-slate-500"
          }`}>
            <i className="fas fa-microchip text-lg"></i>
            <span className="text-xs mt-1">Firmware</span>
          </Link>
        </div>
        <div>
          <Link to="/app/noticias" className={`flex flex-col items-center justify-center ${
            isActive("/app/noticias") ? "text-blue-600" : "text-aero-slate-500"
          }`}>
            <i className="fas fa-newspaper text-lg"></i>
            <span className="text-xs mt-1">Notícias</span>
          </Link>
        </div>
        <div>
          <Link to="/app/dicas" className={`flex flex-col items-center justify-center ${
            isActive("/app/dicas") ? "text-blue-600" : "text-aero-slate-500"
          }`}>
            <i className="fas fa-lightbulb text-lg"></i>
            <span className="text-xs mt-1">Dicas</span>
          </Link>
        </div>
      </div>
      
      {/* Botões flutuantes para administração, download e perfil */}
      <div className="fixed bottom-[80px] right-4 flex flex-col space-y-3">
        {(isAdmin || isColaborador) && (
          <Link to="/app/admin" className={`flex items-center justify-center rounded-full w-12 h-12 shadow-lg ${
            isActive("/app/admin") ? "bg-red-600 text-white" : "bg-white text-red-600"
          }`}>
            <i className="fas fa-shield-alt text-lg"></i>
          </Link>
        )}
        
        <Link to="/app/download" className={`flex items-center justify-center rounded-full w-12 h-12 shadow-lg ${
          isActive("/app/download") ? "bg-blue-600 text-white" : "bg-white text-blue-600"
        }`}>
          <i className="fas fa-mobile-alt text-lg"></i>
        </Link>

        <Link to="/app/perfil" className={`flex items-center justify-center rounded-full w-12 h-12 shadow-lg ${
          isActive("/app/perfil") ? "bg-blue-600 text-white" : "bg-white text-blue-600"
        }`}>
          <i className="fas fa-user text-lg"></i>
        </Link>
      </div>
    </nav>
  );
};

export default AppMobileNavigation;