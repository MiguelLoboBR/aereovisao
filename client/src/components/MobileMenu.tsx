import { Link } from "wouter";
import { DroneIcon } from "./DroneIcons";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  showInstallButton?: boolean;
  onInstallClick?: () => void;
}

const MobileMenu = ({ 
  isOpen, 
  onClose, 
  currentPath,
  showInstallButton = false,
  onInstallClick = () => {}
}: MobileMenuProps) => {
  const isActive = (path: string) => {
    return currentPath === path || 
      (path !== "/" && currentPath.startsWith(path));
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-aero-slate-800 bg-opacity-90 z-50 md:hidden">
      <div className="bg-white h-full w-3/4 max-w-xs p-4 flex flex-col">
        <div className="flex items-center justify-between border-b border-aero-slate-200 pb-4">
          <div className="flex items-center">
            <DroneIcon className="h-10 w-auto" />
            <h1 className="ml-2 font-inter font-bold text-blue-700 text-lg">Portal do Piloto</h1>
          </div>
          <button onClick={onClose} className="text-aero-slate-600">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <nav className="mt-6 flex-grow">
          <ul className="space-y-2">
            <li>
              <Link href="/" onClick={onClose} className={`block px-4 py-2 rounded-lg font-medium ${
                isActive("/") 
                  ? "text-blue-700 bg-blue-50" 
                  : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
              } transition-colors`}>
                <i className="fas fa-home mr-3"></i>
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link href="/legislacao" onClick={onClose} className={`block px-4 py-2 rounded-lg font-medium ${
                isActive("/legislacao") 
                  ? "text-blue-700 bg-blue-50" 
                  : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
              } transition-colors`}>
                <i className="fas fa-gavel mr-3"></i>
                <span>Legislação</span>
              </Link>
            </li>
            <li>
              <Link href="/firmware" onClick={onClose} className={`block px-4 py-2 rounded-lg font-medium ${
                isActive("/firmware") 
                  ? "text-blue-700 bg-blue-50" 
                  : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
              } transition-colors`}>
                <i className="fas fa-microchip mr-3"></i>
                <span>Firmware</span>
              </Link>
            </li>
            <li>
              <Link href="/dicas" onClick={onClose} className={`block px-4 py-2 rounded-lg font-medium ${
                isActive("/dicas") 
                  ? "text-blue-700 bg-blue-50" 
                  : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
              } transition-colors`}>
                <i className="fas fa-lightbulb mr-3"></i>
                <span>Dicas</span>
              </Link>
            </li>
            <li>
              <Link href="/doacoes" onClick={onClose} className={`block px-4 py-2 rounded-lg font-medium ${
                isActive("/doacoes") 
                  ? "text-blue-700 bg-blue-50" 
                  : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
              } transition-colors`}>
                <i className="fas fa-hand-holding-heart mr-3"></i>
                <span>Doações</span>
              </Link>
            </li>
            <li>
              <Link href="/patrocinadores" onClick={onClose} className={`block px-4 py-2 rounded-lg font-medium ${
                isActive("/patrocinadores") 
                  ? "text-blue-700 bg-blue-50" 
                  : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
              } transition-colors`}>
                <i className="fas fa-handshake mr-3"></i>
                <span>Patrocinadores</span>
              </Link>
            </li>
            <li>
              <Link href="/download" onClick={onClose} className={`block px-4 py-2 rounded-lg font-medium ${
                isActive("/download") 
                  ? "text-blue-700 bg-blue-50" 
                  : "text-aero-slate-600 hover:text-blue-700 hover:bg-blue-50"
              } transition-colors`}>
                <i className="fas fa-mobile-alt mr-3"></i>
                <span>📲 Baixar Versão Mobile</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="mt-auto border-t border-aero-slate-200 pt-4">
          {showInstallButton ? (
            <button 
              onClick={onInstallClick}
              className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <i className="fas fa-mobile-alt mr-2"></i>
              <span>Instalar App</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
