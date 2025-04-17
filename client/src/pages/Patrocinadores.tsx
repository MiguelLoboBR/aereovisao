import { useQuery } from '@tanstack/react-query';
import SponsorCard from '../components/SponsorCard';

interface Sponsor {
  name: string;
  description?: string;
  url?: string;
  logo?: string;
}

const Patrocinadores = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/sponsors'],
    staleTime: Infinity,
  });

  // Fallback data if API fails or is loading
  const fallbackPremiumSponsors: Sponsor[] = [
    { name: "Nome da Empresa 1", description: "Especialista em Drones Profissionais", url: "#" },
    { name: "Nome da Empresa 2", description: "Acessórios e Peças para Drones", url: "#" },
    { name: "Nome da Empresa 3", description: "Escola de Pilotagem de Drones", url: "#" }
  ];

  const fallbackPartners: Sponsor[] = [
    { name: "Parceiro 1" },
    { name: "Parceiro 2" },
    { name: "Parceiro 3" },
    { name: "Parceiro 4" }
  ];

  // Use API data if available, otherwise use fallback
  const premiumSponsors = data?.premium || fallbackPremiumSponsors;
  const partners = data?.partners || fallbackPartners;

  return (
    <section className="py-8 px-4 md:px-8 min-h-screen pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-inter font-bold text-aero-slate-800">Patrocinadores</h1>
          <p className="text-aero-slate-600 mt-2">Empresas e parceiros que apoiam o Portal do Piloto</p>
        </header>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200 mb-8">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-6">Patrocinadores Premium</h2>
            
            {isLoading ? (
              <div className="text-center py-12">
                <i className="fas fa-circle-notch fa-spin text-blue-500 text-3xl mb-3"></i>
                <p className="text-aero-slate-600">Carregando patrocinadores...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                {premiumSponsors.map((sponsor, index) => (
                  <SponsorCard 
                    key={index} 
                    name={sponsor.name} 
                    description={sponsor.description} 
                    url={sponsor.url} 
                    type="premium" 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200 mb-8">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-6">Parceiros</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <i className="fas fa-circle-notch fa-spin text-blue-500 text-2xl mb-3"></i>
                <p className="text-aero-slate-600">Carregando parceiros...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {partners.map((partner, index) => (
                  <SponsorCard 
                    key={index} 
                    name={partner.name} 
                    type="partner" 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-4">Seja um Patrocinador</h2>
          
          <p className="text-aero-slate-700 mb-4">
            Ter sua marca no Portal do Piloto significa visibilidade para uma comunidade engajada e 
            em constante crescimento de pilotos de drone. Entre em contato para conhecer nossas opções 
            de patrocínio e parcerias.
          </p>
          
          <div className="flex flex-col md:flex-row md:space-x-4">
            <a 
              href="mailto:contato@aereovisao.com.br" 
              className="mb-3 md:mb-0 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors"
            >
              <i className="fas fa-envelope mr-2"></i>
              <span>Enviar email</span>
            </a>
            
            <a 
              href="#" 
              className="py-2 px-4 bg-white border border-aero-slate-300 text-aero-slate-700 hover:bg-aero-slate-50 rounded-lg text-center transition-colors"
            >
              <i className="fas fa-file-download mr-2"></i>
              <span>Ver mídia kit</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Patrocinadores;
