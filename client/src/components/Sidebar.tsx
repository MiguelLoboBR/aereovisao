import { Link } from "wouter";
import { DroneIcon } from "./DroneIcons";
import { useAuthJWT as useAuth } from "@/hooks/useAuthJWT";

interface SidebarProps {
  currentPath: string;
  showInstallButton?: boolean;
  onInstallClick?: () => void;
}

const Sidebar = ({ currentPath, showInstallButton = false, onInstallClick = () => {} }: SidebarProps) => {
  const { isAdmin } = useAuth();
  
  const isActive = (path: string) => {
    return currentPath === path || 
      (path !== "/" && currentPath.startsWith(path));
  };
  
  return (
    <aside className="hidden md:flex md:flex-col w-64 h-screen bg-white border-r border-aero-slate-200 shadow-sm">
      <div className="p-4 border-b border-aero-slate-200">
        <div className="flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <DroneIcon className="text-white text-xl" />
          </div>
          <h1 className="ml-3 font-inter font-bold text-blue-700 text-xl">Aéreo Visão</h1>
        </div>
        <p className="text-center text-sm text-aero-slate-500 mt-2">Portal do Piloto</p>
      </div>
      
      <nav className="mt-6 px-2 flex-grow">
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
              isActive("/dashboard") 
                ? "text-blue-700 bg-blue-50" 
                : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
            } transition-colors`}>
              <i className="fas fa-tachometer-alt w-5 h-5 mr-3"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
              isActive("/") 
                ? "text-blue-700 bg-blue-50" 
                : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
            } transition-colors`}>
              <i className="fas fa-home w-5 h-5 mr-3"></i>
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link href="/legislacao" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
              isActive("/legislacao") 
                ? "text-blue-700 bg-blue-50" 
                : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
            } transition-colors`}>
              <i className="fas fa-gavel w-5 h-5 mr-3"></i>
              <span>Legislação</span>
            </Link>
          </li>
          <li>
            <Link href="/firmware" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
              isActive("/firmware") 
                ? "text-blue-700 bg-blue-50" 
                : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
            } transition-colors`}>
              <i className="fas fa-microchip w-5 h-5 mr-3"></i>
              <span>Firmware</span>
            </Link>
          </li>
          <li>
            <Link href="/dicas" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
              isActive("/dicas") 
                ? "text-blue-700 bg-blue-50" 
                : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
            } transition-colors`}>
              <i className="fas fa-lightbulb w-5 h-5 mr-3"></i>
              <span>Dicas</span>
            </Link>
          </li>
          <li>
            <Link href="/doacoes" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
              isActive("/doacoes") 
                ? "text-blue-700 bg-blue-50" 
                : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
            } transition-colors`}>
              <i className="fas fa-hand-holding-heart w-5 h-5 mr-3"></i>
              <span>Doações</span>
            </Link>
          </li>
          <li>
            <Link href="/patrocinadores" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
              isActive("/patrocinadores") 
                ? "text-blue-700 bg-blue-50" 
                : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
            } transition-colors`}>
              <i className="fas fa-handshake w-5 h-5 mr-3"></i>
              <span>Patrocinadores</span>
            </Link>
          </li>
          <li>
            <Link href="/download" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
              isActive("/download") 
                ? "text-blue-700 bg-blue-50" 
                : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
            } transition-colors`}>
              <i className="fas fa-mobile-alt w-5 h-5 mr-3"></i>
              <span>Baixar Versão Mobile</span>
            </Link>
          </li>
          
          {isAdmin && (
            <>
              <li className="mt-8">
                <Link href="/admin" className={`flex items-center px-4 py-3 rounded-lg font-medium ${
                  isActive("/admin") 
                    ? "text-white bg-red-600" 
                    : "text-red-600 hover:text-white hover:bg-red-600"
                } transition-colors`}>
                  <i className="fas fa-shield-alt w-5 h-5 mr-3"></i>
                  <span>Painel Admin</span>
                </Link>
              </li>
              <li>
                <a 
                  href="/institucional/admin/index.html" 
                  className="flex items-center px-4 py-3 rounded-lg font-medium text-blue-600 hover:text-white hover:bg-blue-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-globe-americas w-5 h-5 mr-3"></i>
                  <span>Admin Site Institucional</span>
                </a>
              </li>
            </>
          )}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-aero-slate-200">
        <a 
          href={window.location.origin + "/institucional/index.html"}
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            window.open(window.location.origin + "/institucional/index.html", "_blank");
          }}
          className="flex items-center justify-center w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors mb-2"
        >
          <i className="fas fa-building mr-2"></i>
          <span>Site Institucional</span>
        </a>
        
        {isAdmin && (
          <a 
            href={window.location.origin + "/institucional/admin-direto/index.html"}
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              window.open(window.location.origin + "/institucional/admin-direto/index.html", "_blank");
            }}
            className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mb-2"
          >
            <i className="fas fa-cog mr-2"></i>
            <span>Admin Institucional</span>
          </a>
        )}
        
        {showInstallButton ? (
          <button 
            onClick={onInstallClick}
            className="flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <i className="fas fa-mobile-alt mr-2"></i>
            <span>Instalar App</span>
          </button>
        ) : null}
      </div>
    </aside>
  );
};

export default Sidebar;
