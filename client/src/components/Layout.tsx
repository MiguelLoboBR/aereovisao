import { useState, ReactNode } from "react";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import MobileMenu from "./MobileMenu";
import MobileNavigation from "./MobileNavigation";

interface LayoutProps {
  children: ReactNode;
  showInstallButton?: boolean;
  onInstallClick?: () => void;
}

const Layout = ({ children, showInstallButton = false, onInstallClick = () => {} }: LayoutProps) => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden font-roboto bg-aero-slate-50 text-aero-slate-800">
      {/* Sidebar for desktop */}
      <Sidebar 
        currentPath={location} 
        showInstallButton={showInstallButton}
        onInstallClick={onInstallClick}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile header */}
        <header className="bg-white border-b border-aero-slate-200 py-3 px-4 flex items-center md:hidden">
          <button 
            className="text-aero-slate-600 focus:outline-none" 
            onClick={toggleMobileMenu}
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <div className="mx-auto flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <i className="fas fa-plane text-white"></i>
            </div>
            <h1 className="ml-2 font-inter font-bold text-blue-700 text-lg">Aéreo Visão</h1>
          </div>
        </header>

        {/* Mobile menu (hidden by default) */}
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={closeMobileMenu} 
          currentPath={location}
          showInstallButton={showInstallButton}
          onInstallClick={onInstallClick}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-aero-slate-50">
          {children}
        </main>

        {/* Mobile navigation */}
        <MobileNavigation currentPath={location} />
      </div>
    </div>
  );
};

export default Layout;
