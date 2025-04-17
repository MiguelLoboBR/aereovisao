import React from 'react';
import { useAuthJWT } from '@/hooks/useAuthJWT';

const DownloadPage = () => {
  const { user } = useAuthJWT();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-inter font-bold text-aero-slate-800 mb-2">
            Portal do Piloto no seu Dispositivo Móvel
          </h1>
          <p className="text-aero-slate-600">
            Instale o Portal do Piloto como um aplicativo e tenha acesso rápido às informações onde estiver.
          </p>
        </div>

        <div id="app-mobile-details" className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="bg-blue-50 p-6 border-b border-blue-100">
            <h2 className="text-2xl font-inter font-bold text-blue-700 flex items-center">
              <i className="fas fa-mobile-alt mr-3 text-blue-600"></i>
              Aplicativo Mobile
            </h2>
            <p className="text-blue-800 mt-2">
              Escolha a melhor forma de instalar o Portal do Piloto no seu dispositivo
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Lojas de aplicativos */}
              <div>
                <h3 className="text-xl font-semibold text-aero-slate-800 mb-4">
                  Em breve nas Lojas de Aplicativos
                </h3>
                <p className="text-aero-slate-600 mb-6">
                  Estamos trabalhando para disponibilizar o aplicativo nas lojas oficiais. 
                  Acompanhe as novidades!
                </p>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  <a 
                    href="#" 
                    className="opacity-50 cursor-not-allowed" 
                    onClick={(e) => e.preventDefault()}
                    title="Em breve na Google Play"
                  >
                    <img src="/assets/google-play-badge.svg" alt="Em breve na Google Play" className="h-16" />
                  </a>
                  <a 
                    href="#" 
                    className="opacity-50 cursor-not-allowed" 
                    onClick={(e) => e.preventDefault()}
                    title="Em breve na App Store"
                  >
                    <img src="/assets/app-store-badge.svg" alt="Em breve na App Store" className="h-16" />
                  </a>
                </div>
              </div>

              {/* Instalar via navegador */}
              <div>
                <h3 className="text-xl font-semibold text-aero-slate-800 mb-4">
                  Instalar via Navegador (Recomendado)
                </h3>
                <p className="text-aero-slate-600 mb-4">
                  Você pode instalar o aplicativo agora mesmo através do seu navegador:
                </p>
                
                <div className="bg-aero-slate-50 p-4 rounded-lg mb-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <h4 className="font-semibold text-aero-slate-800 mb-2">No Android (Chrome):</h4>
                      <ol className="list-decimal ml-5 text-aero-slate-700 space-y-1">
                        <li>Abra o site no Chrome</li>
                        <li>Toque no menu (três pontos)</li>
                        <li>Selecione "Adicionar à tela inicial"</li>
                        <li>Confirme a instalação</li>
                      </ol>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-aero-slate-800 mb-2">No iOS (Safari):</h4>
                      <ol className="list-decimal ml-5 text-aero-slate-700 space-y-1">
                        <li>Abra o site no Safari</li>
                        <li>Toque no ícone de compartilhar</li>
                        <li>Selecione "Adicionar à tela de início"</li>
                        <li>Confirme a instalação</li>
                      </ol>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <img 
                    src="/assets/pwa-install-instructions.svg" 
                    alt="Instruções de instalação do PWA" 
                    className="max-w-full h-auto rounded-lg shadow-sm" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="bg-green-50 p-6 border-b border-green-100">
            <h2 className="text-2xl font-inter font-bold text-green-700 flex items-center">
              <i className="fas fa-check-circle mr-3 text-green-600"></i>
              Benefícios da Versão Mobile
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-aero-slate-50 p-4 rounded-lg text-center">
                <i className="fas fa-bolt text-3xl text-blue-500 mb-3"></i>
                <h3 className="font-semibold text-aero-slate-800 mb-2">Acesso Rápido</h3>
                <p className="text-aero-slate-600 text-sm">
                  Abra o aplicativo diretamente da tela inicial do seu dispositivo, sem precisar digitar URLs.
                </p>
              </div>
              
              <div className="bg-aero-slate-50 p-4 rounded-lg text-center">
                <i className="fas fa-wifi-slash text-3xl text-blue-500 mb-3"></i>
                <h3 className="font-semibold text-aero-slate-800 mb-2">Modo Offline</h3>
                <p className="text-aero-slate-600 text-sm">
                  Acesse algumas informações mesmo quando estiver sem conexão com a internet.
                </p>
              </div>
              
              <div className="bg-aero-slate-50 p-4 rounded-lg text-center">
                <i className="fas fa-bell text-3xl text-blue-500 mb-3"></i>
                <h3 className="font-semibold text-aero-slate-800 mb-2">Notificações</h3>
                <p className="text-aero-slate-600 text-sm">
                  Receba alertas sobre novas legislações, firmwares e dicas importantes (em breve).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;