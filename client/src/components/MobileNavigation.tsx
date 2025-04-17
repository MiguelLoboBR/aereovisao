import { Link } from "wouter";
import { useAuthJWT } from "@/hooks/useAuthJWT";

interface MobileNavigationProps {
  currentPath: string;
}

const MobileNavigation = ({ currentPath }: MobileNavigationProps) => {
  const { user } = useAuthJWT();
  const isActive = (path: string) => {
    return currentPath === path || 
      (path !== "/" && currentPath.startsWith(path));
  };
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-aero-slate-200 py-2 px-4 z-10">
      <div className="grid grid-cols-5 gap-1">
        {user ? (
        <div>
          <Link href="/dashboard" className={`flex flex-col items-center justify-center ${
            isActive("/dashboard") ? "text-blue-600" : "text-aero-slate-500"
          }`}>
            <i className="fas fa-tachometer-alt text-lg"></i>
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
        </div>
        ) : (
        <div>
          <Link href="/" className={`flex flex-col items-center justify-center ${
            isActive("/") ? "text-blue-600" : "text-aero-slate-500"
          }`}>
            <i className="fas fa-home text-lg"></i>
            <span className="text-xs mt-1">Home</span>
          </Link>
        </div>
        )}
        <div>
          <Link href="/legislacao" className={`flex flex-col items-center justify-center ${
            isActive("/legislacao") ? "text-blue-600" : "text-aero-slate-500"
          }`}>
            <i className="fas fa-gavel text-lg"></i>
            <span className="text-xs mt-1">Leis</span>
          </Link>
        </div>
        <div>
          <Link href="/firmware" className={`flex flex-col items-center justify-center ${
            isActive("/firmware") ? "text-blue-600" : "text-aero-slate-500"
          }`}>
            <i className="fas fa-microchip text-lg"></i>
            <span className="text-xs mt-1">Firmware</span>
          </Link>
        </div>
        <div>
          <Link href="/dicas" className={`flex flex-col items-center justify-center ${
            isActive("/dicas") ? "text-blue-600" : "text-aero-slate-500"
          }`}>
            <i className="fas fa-lightbulb text-lg"></i>
            <span className="text-xs mt-1">Dicas</span>
          </Link>
        </div>
        <div>
          <Link href="/doacoes" className={`flex flex-col items-center justify-center ${
            isActive("/doacoes") ? "text-blue-600" : "text-aero-slate-500"
          }`}>
            <i className="fas fa-hand-holding-heart text-lg"></i>
            <span className="text-xs mt-1">Apoie</span>
          </Link>
        </div>
        
        {/* Ícone de perfil aparece apenas quando logado */}
        {user && (
        <div className="fixed bottom-[80px] right-4">
          <Link href="/perfil" className={`flex items-center justify-center rounded-full w-12 h-12 shadow-lg ${
            isActive("/perfil") ? "bg-blue-600 text-white" : "bg-white text-blue-600"
          }`}>
            <i className="fas fa-user text-lg"></i>
          </Link>
        </div>
        )}
      </div>
    </nav>
  );
};

export default MobileNavigation;
