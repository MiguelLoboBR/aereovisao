import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

const Doacoes = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/donation-info'],
    staleTime: Infinity,
  });

  const [copyState, setCopyState] = useState({
    copied: false,
    loading: false
  });

  const pixKey = data?.pixKey || "00112233445566778899";
  const pixName = data?.pixName || "Aéreo Visão";
  const pixBank = data?.pixBank || "AcmePay";
  const paypalUrl = data?.paypalUrl || "#paypal";
  const cardUrl = data?.cardUrl || "#card";
  
  // Métodos de doação personalizados
  const customDonationMethods = data?.customDonationMethods 
    ? (typeof data.customDonationMethods === 'string' 
        ? JSON.parse(data.customDonationMethods)
        : data.customDonationMethods)
    : [];

  const handleCopyPix = async () => {
    setCopyState({ copied: false, loading: true });
    
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopyState({ copied: true, loading: false });
      
      toast({
        title: "Copiado!",
        description: "Chave PIX copiada para a área de transferência",
      });
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopyState({ copied: false, loading: false });
      }, 2000);
    } catch (err) {
      setCopyState({ copied: false, loading: false });
      
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a chave PIX. Tente copiá-la manualmente.",
        variant: "destructive"
      });
    }
  };

  return (
    <section className="py-8 px-4 md:px-8 min-h-screen pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-inter font-bold text-aero-slate-800">Apoie o Portal</h1>
          <p className="text-aero-slate-600 mt-2">Ajude-nos a manter este projeto ativo e gratuito para a comunidade</p>
        </header>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-4">Por que apoiar?</h2>
              
              <p className="text-aero-slate-700 mb-4">
                O Portal do Piloto é um projeto independente, mantido de forma voluntária 
                e sem fins lucrativos. Nosso objetivo é oferecer informações atualizadas e 
                confiáveis para a comunidade de pilotos de drone do Brasil.
              </p>
              
              <p className="text-aero-slate-700 mb-4">
                Sua contribuição ajuda a:
              </p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                  <span className="text-aero-slate-700">Manter o servidor e domínio ativos</span>
                </li>
                <li className="flex">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                  <span className="text-aero-slate-700">Produzir novos tutoriais e conteúdos</span>
                </li>
                <li className="flex">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                  <span className="text-aero-slate-700">Melhorar continuamente o portal</span>
                </li>
                <li className="flex">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                  <span className="text-aero-slate-700">Desenvolver novas funcionalidades</span>
                </li>
              </ul>
              
              <blockquote className="pl-4 border-l-4 border-blue-500 italic text-aero-slate-600">
                "Seu apoio, independente do valor, faz toda a diferença para mantermos este 
                projeto vivo e acessível para todos."
              </blockquote>
            </div>
            
            <div className="bg-aero-slate-50 p-6 md:p-8 flex flex-col">
              <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-4">Faça uma doação</h2>
              
              <div className="mb-6 bg-white rounded-lg border border-aero-slate-200 p-4">
                <h3 className="font-medium text-aero-slate-800 mb-3 flex items-center">
                  <i className="fab fa-pix text-indigo-600 mr-2 text-xl"></i>
                  <span>Via PIX</span>
                </h3>
                
                <div className="bg-aero-slate-100 p-3 rounded-lg mb-4">
                  <p className="text-center text-aero-slate-800 font-mono font-medium">
                    {pixKey}
                  </p>
                </div>
                
                <button 
                  onClick={handleCopyPix}
                  className={`w-full py-2 px-4 rounded-lg flex items-center justify-center transition-colors 
                    ${copyState.copied 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  disabled={copyState.loading}
                >
                  {copyState.loading ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin mr-2"></i>
                      <span>Copiando...</span>
                    </>
                  ) : copyState.copied ? (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <i className="far fa-clipboard mr-2"></i>
                      <span>Copiar chave PIX</span>
                    </>
                  )}
                </button>
                
                <p className="text-center text-aero-slate-500 text-sm mt-2">
                  Nome: {pixName} - Banco: {pixBank}
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-aero-slate-800 mb-3 flex items-center">
                  <i className="fab fa-paypal text-blue-600 mr-2 text-xl"></i>
                  <span>Via PayPal</span>
                </h3>
                
                <a 
                  href={paypalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors"
                >
                  Doar com PayPal
                </a>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-aero-slate-800 mb-3 flex items-center">
                  <i className="fas fa-credit-card text-aero-slate-700 mr-2"></i>
                  <span>Via Cartão de Crédito</span>
                </h3>
                
                <a 
                  href={cardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-2 px-4 bg-aero-slate-700 hover:bg-aero-slate-800 text-white rounded-lg text-center transition-colors"
                >
                  Doar com Cartão
                </a>
              </div>
              
              {/* Métodos de doação personalizados */}
              {customDonationMethods.length > 0 && (
                <div className="mb-6 space-y-3">
                  <h3 className="font-medium text-aero-slate-800 mb-3">Outros métodos de doação</h3>
                  
                  {customDonationMethods.map((method: any) => (
                    <div key={method.id} className="bg-white rounded-lg border border-aero-slate-200 p-4 hover:shadow-sm transition-shadow">
                      <h4 className="font-medium text-aero-slate-800 mb-2 flex items-center" style={{ color: method.color || '#666' }}>
                        <i className={`${method.icon || 'fas fa-money-bill'} mr-2`}></i>
                        <span>{method.name}</span>
                      </h4>
                      
                      {method.description && (
                        <p className="text-aero-slate-600 text-sm mb-3">{method.description}</p>
                      )}
                      
                      <a 
                        href={method.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block py-2 px-4 rounded-lg text-center transition-colors text-white"
                        style={{ backgroundColor: method.color || '#6366F1', borderColor: method.color || '#6366F1' }}
                      >
                        Doar via {method.name}
                      </a>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-auto pt-4 border-t border-aero-slate-200">
                <Link href="/agradecimento" className="text-center block text-blue-600 hover:text-blue-700">
                  <i className="fas fa-heart mr-1"></i>
                  <span>Ver lista de apoiadores</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-aero-slate-200 p-6">
          <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-4">Outras formas de contribuir</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-aero-slate-200 rounded-lg p-5">
              <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-share-alt text-xl"></i>
              </div>
              <h3 className="font-inter font-medium text-aero-slate-800 mb-2">Compartilhe</h3>
              <p className="text-aero-slate-600 text-sm">
                Divulgue o Portal do Piloto em suas redes sociais e grupos de drone.
              </p>
              <div className="mt-4 flex space-x-2">
                <a href="#" className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="h-8 w-8 bg-blue-400 text-white rounded-full flex items-center justify-center">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="h-8 w-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                  <i className="fab fa-whatsapp"></i>
                </a>
              </div>
            </div>
            
            <div className="border border-aero-slate-200 rounded-lg p-5">
              <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-file-alt text-xl"></i>
              </div>
              <h3 className="font-inter font-medium text-aero-slate-800 mb-2">Contribua com conteúdo</h3>
              <p className="text-aero-slate-600 text-sm">
                Envie dicas, tutoriais ou sugestões para enriquecer nosso material.
              </p>
              <a href="#" className="mt-4 inline-flex items-center text-green-600 text-sm font-medium hover:text-green-700">
                Saiba como contribuir <i className="fas fa-arrow-right ml-1 text-xs"></i>
              </a>
            </div>
            
            <div className="border border-aero-slate-200 rounded-lg p-5">
              <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-code text-xl"></i>
              </div>
              <h3 className="font-inter font-medium text-aero-slate-800 mb-2">Contribua com código</h3>
              <p className="text-aero-slate-600 text-sm">
                Desenvolvedores podem contribuir com melhorias no código do portal.
              </p>
              <a href="#" className="mt-4 inline-flex items-center text-purple-600 text-sm font-medium hover:text-purple-700">
                Ver repositório <i className="fab fa-github ml-1"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Doacoes;
