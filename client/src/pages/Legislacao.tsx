import { useState, FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

// Interface para Post vindo da API
interface Post {
  id: number;
  titulo: string;
  conteudo: string;
  categoria: 'dicas' | 'firmware' | 'legislacao' | 'noticia';
  autor: string;
  createdAt: string;
  updatedAt: string;
}

// Componente de card para postagens vindas da API
const PostCard = ({ post }: { post: Post }) => {
  // Função para formatar a data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  // Função para gerar um trecho do conteúdo
  const getExcerpt = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200">
      <div className="p-6">
        <div className="flex items-center mb-3">
          <span className="text-indigo-600 text-xs bg-indigo-50 px-2 py-1 rounded-full font-medium">
            <i className="fas fa-gavel mr-1"></i> Legislação
          </span>
          <span className="text-xs text-aero-slate-500 ml-2">
            {formatDate(post.createdAt)}
          </span>
        </div>
        
        <h3 className="font-inter font-medium text-aero-slate-800 line-clamp-2 text-lg">
          {post.titulo}
        </h3>
        
        <p className="text-aero-slate-600 text-sm mt-2 line-clamp-3">
          {getExcerpt(post.conteudo)}
        </p>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-aero-slate-500 italic">
            Por {post.autor}
          </span>
          
          <Link 
            to={`/post/${post.id}`} 
            className="inline-flex items-center text-indigo-600 text-sm font-medium hover:text-indigo-700"
          >
            Ler mais <i className="fas fa-arrow-right ml-1 text-xs"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

const Legislacao = () => {
  const { toast } = useToast();
  
  // Buscar postagens da categoria 'legislacao'
  const { 
    data: posts, 
    isLoading: postsLoading, 
    error: postsError 
  } = useQuery<Post[]>({
    queryKey: ['/api/posts', 'legislacao'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/posts?categoria=legislacao');
      return await res.json();
    },
  });

  return (
    <section className="py-8 px-4 md:px-8 min-h-screen pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-inter font-bold text-aero-slate-800">Legislação para Drones</h1>
          <p className="text-aero-slate-600 mt-2">Fique atualizado com as principais leis e regulamentos</p>
        </header>
        
        {/* Destaque Legislação */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200 mb-8">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-indigo-100 p-3 mr-4">
                <i className="fas fa-balance-scale text-indigo-600 text-xl"></i>
              </div>
              <h2 className="text-xl font-inter font-semibold text-aero-slate-800">
                ANAC - Regulamentos para Drones no Brasil
              </h2>
            </div>
            
            <p className="text-aero-slate-600 mb-4">
              A ANAC (Agência Nacional de Aviação Civil) estabelece regras específicas para a operação de drones no Brasil. 
              Estas regulamentações visam garantir a segurança do espaço aéreo brasileiro e proteger pessoas e propriedades em solo.
            </p>
            
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
              <h3 className="font-medium text-indigo-800 mb-2">Regulamentos principais:</h3>
              <ul className="list-disc pl-5 space-y-1 text-aero-slate-700">
                <li>RBAC-E nº 94 - Regras gerais para aeronaves não tripuladas</li>
                <li>ICA 100-40 - Requisitos para operações em espaço aéreo brasileiro</li>
                <li>Resolução ANAC nº 419 - Operações com aeronaves não tripuladas</li>
              </ul>
              
              <a href="https://www.gov.br/anac/pt-br/assuntos/drones" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center text-indigo-600 hover:text-indigo-700">
                Consultar site oficial <i className="fas fa-external-link-alt ml-1 text-xs"></i>
              </a>
            </div>
          </div>
        </div>
        
        {/* Postagens da API */}
        <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-4">Atualizações Legislativas</h2>
        
        {postsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-aero-slate-700" />
          </div>
        ) : postsError ? (
          <div className="text-center py-8 px-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">Ocorreu um erro ao carregar as informações legislativas.</p>
            <p className="text-red-500 text-sm mt-1">Por favor, tente novamente mais tarde.</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-indigo-50 border border-indigo-200 rounded-lg mb-8">
            <p className="text-aero-slate-700">Nenhuma atualização legislativa encontrada.</p>
            <p className="text-aero-slate-600 text-sm mt-1">Novas informações serão publicadas em breve!</p>
          </div>
        )}
        
        {/* Cartões informativos */}
        <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-4">Informações Importantes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200">
            <div className="p-6">
              <div className="flex items-center mb-3">
                <i className="fas fa-id-card text-indigo-600 mr-3 text-lg"></i>
                <h3 className="font-medium text-aero-slate-800">Cadastro e Registro</h3>
              </div>
              <p className="text-aero-slate-600 text-sm">
                Drones com peso superior a 250g devem ser registrados no SISANT (Sistema de Aeronaves Não Tripuladas) da ANAC.
                O cadastro é obrigatório e deve ser realizado pelo proprietário da aeronave.
              </p>
              <a href="https://sistemas.anac.gov.br/sisant" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center text-indigo-600 text-sm font-medium hover:text-indigo-700">
                Acessar SISANT <i className="fas fa-external-link-alt ml-1 text-xs"></i>
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200">
            <div className="p-6">
              <div className="flex items-center mb-3">
                <i className="fas fa-broadcast-tower text-indigo-600 mr-3 text-lg"></i>
                <h3 className="font-medium text-aero-slate-800">DECEA e Espaço Aéreo</h3>
              </div>
              <p className="text-aero-slate-600 text-sm">
                O DECEA (Departamento de Controle do Espaço Aéreo) regulamenta o acesso ao espaço aéreo.
                Para voos acima de 120 metros, próximos a aeródromos ou em áreas restritas, é necessária autorização prévia.
              </p>
              <a href="https://www.decea.mil.br/drone" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center text-indigo-600 text-sm font-medium hover:text-indigo-700">
                Consultar DECEA <i className="fas fa-external-link-alt ml-1 text-xs"></i>
              </a>
            </div>
          </div>
        </div>
        
        {/* FAQ */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-4 flex items-center">
            <i className="fas fa-question-circle text-indigo-600 mr-2"></i>
            <span>Perguntas Frequentes</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-aero-slate-800">Preciso de licença para pilotar drones?</h3>
              <p className="text-aero-slate-600 text-sm mt-1">
                Para drones recreativos com peso inferior a 25kg, não é necessária licença de piloto.
                Para operações comerciais ou drones acima de 25kg, é necessário obter habilitação específica junto à ANAC.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-aero-slate-800">Posso voar em qualquer lugar?</h3>
              <p className="text-aero-slate-600 text-sm mt-1">
                Não. É proibido voar sobre pessoas, perto de aeroportos (num raio de 9km), em áreas de segurança
                nacional, e em áreas densamente povoadas sem autorização específica. Consulte sempre o app DECEA Mobile
                antes de planejar seu voo.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-aero-slate-800">Quais são as penalidades por não cumprir as regras?</h3>
              <p className="text-aero-slate-600 text-sm mt-1">
                As infrações podem resultar em multas de R$ 2.000 a R$ 200.000, apreensão do equipamento e até processos
                criminais em casos graves que envolvam riscos à segurança pública ou violação de privacidade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Legislacao;