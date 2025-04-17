import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuthJWT } from "@/hooks/useAuthJWT";
import { DroneIcon } from "@/components/DroneIcons";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

interface Destaque {
  id: number;
  titulo: string;
  resumo: string;
  categoria: string;
  conteudo: string;
  imagem: string | null;
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

const Home = () => {
  const { user } = useAuthJWT();
  const [destaques, setDestaques] = useState<Destaque[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  useEffect(() => {
    const buscarDestaques = async () => {
      try {
        const response = await apiRequest('GET', '/api/posts/destaques', null, { skipAuth: true });
        
        if (response.ok) {
          const data = await response.json();
          setDestaques(data);
        } else {
          console.error('Erro ao carregar destaques:', response.statusText);
        }
      } catch (error) {
        console.error('Erro na requisição de destaques:', error);
      } finally {
        setCarregando(false);
      }
    };
    
    buscarDestaques();
  }, []);
  
  return (
    <section className="py-8 px-4 md:px-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="relative h-64 md:h-80 bg-gradient-to-r from-blue-700 to-blue-500 flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508444845599-5c89863b1c44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-20"></div>
            {/* Card aplicativo mobile posicionado no canto superior direito da página */}
            <div id="app-mobile" className="absolute top-4 right-4 hidden md:block">
              <div className="bg-white p-3 rounded-lg shadow-md w-[220px] text-left">
                <h3 className="text-sm font-bold text-gray-800 mb-1">📱 Disponível no celular</h3>
                <p className="text-xs text-gray-600 mb-2 leading-snug">
                  Instale como app: <br />
                  Menu → "Adicionar à Tela Inicial"
                </p>
                <div className="flex gap-2">
                  <img
                    src="/assets/google-play-badge.svg"
                    alt="Google Play"
                    className="h-5 opacity-50"
                    title="Em breve na Google Play"
                  />
                  <img
                    src="/assets/app-store-badge.svg"
                    alt="App Store"
                    className="h-5 opacity-50"
                    title="Em breve na App Store"
                  />
                </div>
              </div>
            </div>
            
            <div className="relative text-center px-4">
              <div className="mx-auto h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-lg mb-4">
                <DroneIcon className="h-16 w-auto" />
              </div>
              <h1 className="text-white text-3xl md:text-4xl font-inter font-bold">Aéreo Visão</h1>
              <p className="text-blue-100 text-lg mt-1 mb-4">Portal do Piloto</p>
              {!user ? (
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                  <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border border-transparent">
                    <Link href="/auth?tab=login">
                      Entrar
                    </Link>
                  </Button>
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/auth?tab=register">
                      Criar conta
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                  <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border border-transparent">
                    <Link href="/perfil">
                      Meu Perfil
                    </Link>
                  </Button>
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/enviar-dica">
                      Enviar Dica
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* A seção de Aplicativo Mobile foi movida para o canto superior direito do hero */}
          
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-inter font-bold text-aero-slate-800">Bem-vindo ao Portal do Piloto</h2>
              <p className="text-aero-slate-600 mt-2 max-w-2xl mx-auto">
                O seu centro de comando para tudo que envolve drones no Brasil.
                Aqui você encontra <strong>regulamentações atualizadas</strong>, <strong>firmwares oficiais</strong>, 
                <strong> dicas práticas</strong>, além de conteúdos exclusivos criados por e para pilotos como você.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-aero-slate-50 rounded-xl p-5 text-center">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-gavel text-xl"></i>
                </div>
                <h3 className="font-inter font-semibold text-aero-slate-800 mb-2">Legislação</h3>
                <p className="text-aero-slate-600 text-sm">Tenha acesso às leis e regulamentações da ANAC, DECEA e IBAMA.</p>
              </div>
              
              <div className="bg-aero-slate-50 rounded-xl p-5 text-center">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-microchip text-xl"></i>
                </div>
                <h3 className="font-inter font-semibold text-aero-slate-800 mb-2">Firmware</h3>
                <p className="text-aero-slate-600 text-sm">Atualizações por fabricante: DJI, FIMI, Autel e mais.</p>
              </div>
              
              <div className="bg-aero-slate-50 rounded-xl p-5 text-center">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-lightbulb text-xl"></i>
                </div>
                <h3 className="font-inter font-semibold text-aero-slate-800 mb-2">Dicas e Tutoriais</h3>
                <p className="text-aero-slate-600 text-sm">Melhore suas habilidades com tutoriais, boas práticas e recomendações.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sobre o sistema e benefícios */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <h2 className="text-xl font-inter font-bold text-aero-slate-800 mb-4 flex items-center">
            <i className="fas fa-info-circle text-blue-600 mr-2"></i>
            <span>Sobre o Portal do Piloto</span>
          </h2>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                <i className="fas fa-check-circle text-blue-600 mr-2"></i>
                Benefícios de usar o Portal
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <i className="fas fa-check text-blue-600"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-aero-slate-700">
                      <strong>Informações centralizadas</strong> – Acesse todas as regulamentações e informações sobre drones em um só lugar
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <i className="fas fa-check text-blue-600"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-aero-slate-700">
                      <strong>Atualizações em tempo real</strong> – Receba as mais recentes atualizações de firmware e legislação diretamente
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <i className="fas fa-check text-blue-600"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-aero-slate-700">
                      <strong>Compartilhamento de conhecimento</strong> – Contribua com dicas e aprenda com outros pilotos
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <i className="fas fa-check text-blue-600"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-aero-slate-700">
                      <strong>Compatibilidade multi-dispositivo</strong> – Disponível como aplicativo para Android e iOS, além da versão web
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sistema Colaborativo */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
                <i className="fas fa-users text-green-600 mr-2"></i>
                Sistema Colaborativo
              </h3>
              <p className="text-aero-slate-700 mb-3">
                O Portal do Piloto é um ambiente que valoriza a troca de experiências e o crescimento coletivo. 
                Usuários com permissão de <strong>colaborador</strong> podem publicar conteúdos úteis como:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <i className="fas fa-check text-green-600"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-aero-slate-700">
                      Dicas de operação e boas práticas
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <i className="fas fa-check text-green-600"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-aero-slate-700">
                      Alertas de firmware e novidades sobre legislação
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <i className="fas fa-check text-green-600"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-aero-slate-700">
                      Tutoriais práticos e conteúdos educativos
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded p-3 mt-3 text-center">
                  <p className="text-sm text-green-800">
                    Cada publicação passa por curadoria para garantir a qualidade e utilidade para toda a comunidade.
                  </p>
                  <p className="text-xs mt-2 text-green-700">
                    <i className="fas fa-info-circle mr-1"></i> Quer contribuir? Crie sua conta e solicite acesso como colaborador!
                  </p>
                </div>
              </div>
            </div>
            
            {/* Informações sobre doações */}
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-amber-800 mb-2 flex items-center">
                <i className="fas fa-hand-holding-heart text-amber-600 mr-2"></i>
                Apoie com uma doação
              </h3>
              <p className="text-aero-slate-700 mb-3">
                O Portal do Piloto é mantido por doações da comunidade. Seus recursos nos ajudam a:
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <i className="fas fa-server text-amber-600"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-aero-slate-700">
                      Manter os servidores e infraestrutura online
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <i className="fas fa-code text-amber-600"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-aero-slate-700">
                      Desenvolver novas funcionalidades e melhorar as existentes
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <i className="fas fa-database text-amber-600"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-aero-slate-700">
                      Garantir que as informações estejam sempre atualizadas
                    </p>
                  </div>
                </div>
              </div>
              
              <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                <Link href="/doacoes">
                  <span className="flex items-center justify-center">
                    <i className="fas fa-donate mr-2"></i> Faça uma doação
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Destaques */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-inter font-bold text-aero-slate-800 mb-4 flex items-center">
            <i className="fas fa-star text-amber-400 mr-2"></i>
            <span>Destaques Recentes</span>
          </h2>
          
          {carregando ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-aero-slate-600">Carregando destaques...</p>
            </div>
          ) : destaques.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-aero-slate-200 rounded-lg">
              <i className="fas fa-newspaper text-4xl text-aero-slate-300 mb-3"></i>
              <p className="text-aero-slate-600">Não há destaques disponíveis no momento.</p>
              <p className="text-aero-slate-500 text-sm mt-2">Os conteúdos em destaque aparecerão aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {destaques.map((destaque) => {
                // Determinar a categoria visual para o destaque
                let categoriaVisual = {
                  legislacao: {
                    bg: "bg-amber-100",
                    text: "text-amber-800",
                    label: "Legislação",
                    icon: "gavel"
                  },
                  firmware: {
                    bg: "bg-green-100",
                    text: "text-green-800",
                    label: "Firmware",
                    icon: "microchip"
                  },
                  dicas: {
                    bg: "bg-blue-100",
                    text: "text-blue-800",
                    label: "Dica",
                    icon: "lightbulb"
                  },
                  noticia: {
                    bg: "bg-purple-100",
                    text: "text-purple-800",
                    label: "Notícia",
                    icon: "newspaper"
                  }
                }[destaque.categoria] || {
                  bg: "bg-gray-100",
                  text: "text-gray-800",
                  label: "Conteúdo",
                  icon: "file-alt"
                };
                
                // Imagem padrão para cada categoria se o post não tiver imagem
                const imagensPadrao = {
                  legislacao: "https://images.unsplash.com/photo-1622665279982-e9757bce554c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                  firmware: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                  dicas: "https://images.unsplash.com/photo-1600783245777-080fd7ff6526?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                  noticia: "https://images.unsplash.com/photo-1482061344622-ed21764218e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                };
                
                // Link por categoria
                const links = {
                  legislacao: "/legislacao",
                  firmware: "/firmware",
                  dicas: "/dicas",
                  noticia: "/noticias"
                };
                
                // Texto personalizado por categoria
                const textoLink = {
                  legislacao: "Ver legislação",
                  firmware: "Ver firmware",
                  dicas: "Ver dica completa",
                  noticia: "Ler notícia"
                };
                
                // Data formatada
                const dataFormatada = new Date(destaque.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                });
                
                return (
                  <div key={destaque.id} className="border border-aero-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <img 
                      src={destaque.imagem || imagensPadrao[destaque.categoria]} 
                      alt={destaque.titulo} 
                      className="w-full h-48 object-cover" 
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`inline-block ${categoriaVisual.bg} ${categoriaVisual.text} text-xs px-2 py-1 rounded-md`}>
                          <i className={`fas fa-${categoriaVisual.icon} mr-1`}></i> {categoriaVisual.label}
                        </span>
                        <span className="text-xs text-aero-slate-500">{dataFormatada}</span>
                      </div>
                      <h3 className="font-inter font-medium text-aero-slate-800 mb-1">{destaque.titulo}</h3>
                      {destaque.resumo ? (
                        <p className="text-aero-slate-600 text-sm">{destaque.resumo}</p>
                      ) : (
                        <p className="text-aero-slate-600 text-sm">
                          {destaque.conteudo?.substring(0, 120)}
                          {destaque.conteudo?.length > 120 ? '...' : ''}
                        </p>
                      )}
                      <Link 
                        href={`${links[destaque.categoria]}/${destaque.id}`} 
                        className="mt-3 inline-flex items-center text-blue-600 text-sm font-medium hover:text-blue-700"
                      >
                        {textoLink[destaque.categoria]} <i className="fas fa-arrow-right ml-1 text-xs"></i>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>


      </div>
    </section>
  );
};

export default Home;
