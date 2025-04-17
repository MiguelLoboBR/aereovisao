import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';

interface Supporter {
  id: string;
  name: string;
  initials: string;
}

const Agradecimento = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/supporters'],
    staleTime: Infinity,
  });

  // Fallback supporters if API fails or is loading
  const fallbackSupporters: Supporter[] = [
    { id: '1', name: 'João D.', initials: 'JD' },
    { id: '2', name: 'Maria S.', initials: 'MS' },
    { id: '3', name: 'Ricardo L.', initials: 'RL' },
    { id: '4', name: 'Ana P.', initials: 'AP' },
    { id: '5', name: 'Carlos F.', initials: 'CF' },
    { id: '6', name: 'Paula T.', initials: 'PT' },
    { id: '7', name: 'Roberto M.', initials: 'RM' },
    { id: '8', name: 'Lucia B.', initials: 'LB' },
  ];

  // Use API data if available, otherwise use fallback
  const supporters = data?.supporters || fallbackSupporters;

  return (
    <section className="py-8 px-4 md:px-8 min-h-screen pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200">
          <div className="h-48 md:h-64 bg-gradient-to-r from-blue-700 to-blue-500 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-20"></div>
            <div className="relative text-center">
              <i className="fas fa-heart text-white text-4xl mb-4"></i>
              <h1 className="text-white text-3xl md:text-4xl font-inter font-bold">Obrigado pelo seu apoio!</h1>
              <p className="text-blue-100 text-lg mt-2">Sua contribuição faz toda a diferença</p>
            </div>
          </div>
          
          <div className="p-6 md:p-8 text-center">
            <p className="text-aero-slate-700 mb-6 max-w-2xl mx-auto">
              Graças a pessoas como você, podemos continuar oferecendo conteúdo de qualidade, 
              atualizado e gratuito para toda a comunidade de pilotos de drone do Brasil. 
              Seu apoio é fundamental para mantermos este projeto vivo.
            </p>
            
            <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-8">Nossos Apoiadores</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <i className="fas fa-circle-notch fa-spin text-blue-500 text-3xl mb-3"></i>
                <p className="text-aero-slate-600">Carregando apoiadores...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 mb-8 max-w-3xl mx-auto">
                {supporters.map((supporter) => (
                  <div key={supporter.id} className="text-center">
                    <div className="h-16 w-16 rounded-full bg-aero-slate-100 flex items-center justify-center mx-auto mb-2">
                      <span className="text-aero-slate-500 text-lg">{supporter.initials}</span>
                    </div>
                    <p className="font-medium text-aero-slate-800">{supporter.name}</p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex flex-col md:flex-row justify-center space-y-3 md:space-y-0 md:space-x-4">
              <Link href="/doacoes">
                <a className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <i className="fas fa-hand-holding-heart mr-2"></i>
                  <span>Fazer uma doação</span>
                </a>
              </Link>
              
              <Link href="/">
                <a className="py-2 px-6 bg-white border border-aero-slate-300 text-aero-slate-700 hover:bg-aero-slate-50 rounded-lg transition-colors">
                  <i className="fas fa-home mr-2"></i>
                  <span>Voltar para Home</span>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Agradecimento;
