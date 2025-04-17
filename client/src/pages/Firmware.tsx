import { useState } from 'react';
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

interface FirmwareCardProps {
  title: string;
  version: string;
  date: string;
  description: string;
  modelName: string;
  downloadLink: string;
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
          <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full font-medium">
            <i className="fas fa-microchip mr-1"></i> Firmware
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
            className="inline-flex items-center text-green-600 text-sm font-medium hover:text-green-700"
          >
            Ler mais <i className="fas fa-arrow-right ml-1 text-xs"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

const FirmwareCard = ({
  title,
  version,
  date,
  description,
  modelName,
  downloadLink
}: FirmwareCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <i className="fas fa-microchip text-green-600 mr-2"></i>
            <h3 className="font-inter font-medium text-aero-slate-800">{title}</h3>
          </div>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">v{version}</span>
        </div>
        
        <div className="flex items-center text-xs text-aero-slate-500 mb-3">
          <span className="mr-3"><i className="fas fa-calendar-alt mr-1"></i> {date}</span>
          <span><i className="fas fa-drone mr-1"></i> {modelName}</span>
        </div>
        
        <p className="text-aero-slate-600 text-sm mb-4">
          {description}
        </p>
        
        <a 
          href={downloadLink} 
          className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors w-full"
        >
          <i className="fas fa-download mr-2"></i> Baixar Firmware
        </a>
      </div>
    </div>
  );
};

const Firmware = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const { toast } = useToast();
  
  // Buscar postagens da categoria 'firmware'
  const { 
    data: posts, 
    isLoading: postsLoading, 
    error: postsError 
  } = useQuery<Post[]>({
    queryKey: ['/api/posts', 'firmware'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/posts?categoria=firmware');
      return await res.json();
    },
  });

  const firmwareList = [
    {
      title: "DJI Mini 3 Pro Firmware",
      version: "01.00.0500",
      date: "15/03/2025",
      description: "Melhoria na estabilidade do gimbal, correção de bugs no modo de voo esportivo e adição de suporte para novos tipos de cartão de memória.",
      modelName: "DJI Mini 3 Pro",
      downloadLink: "#download-mini3pro",
      brand: "DJI"
    },
    {
      title: "DJI Air 2S Firmware",
      version: "01.02.0600",
      date: "05/03/2025",
      description: "Atualização com novos modos de voo panorâmico, melhoria no sistema de detecção de obstáculos e otimizações na transmissão de vídeo.",
      modelName: "DJI Air 2S",
      downloadLink: "#download-air2s",
      brand: "DJI"
    },
    {
      title: "Autel Evo Lite+ Firmware",
      version: "01.03.0056",
      date: "01/04/2025",
      description: "Correção na calibração do magnetômetro, melhoria na conectividade Wi-Fi e atualizações nos algoritmos de captura em condições de baixa luz.",
      modelName: "Autel Evo Lite+",
      downloadLink: "#download-evolite",
      brand: "Autel"
    },
    {
      title: "Parrot Anafi Firmware",
      version: "01.08.0210",
      date: "20/02/2025",
      description: "Novos recursos de seguimento de objetos, melhorias na autonomia da bateria e correções na exposição automática em vídeos 4K.",
      modelName: "Parrot Anafi",
      downloadLink: "#download-anafi",
      brand: "Parrot"
    }
  ];

  const filteredFirmware = selectedBrand === 'all' 
    ? firmwareList 
    : firmwareList.filter(fw => fw.brand === selectedBrand);

  return (
    <section className="py-8 px-4 md:px-8 min-h-screen pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-inter font-bold text-aero-slate-800">Atualizações de Firmware</h1>
          <p className="text-aero-slate-600 mt-2">Mantenha seu drone atualizado com as últimas versões de firmware</p>
        </header>
        
        {/* Destaque Informativo */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200 mb-8">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <i className="fas fa-info-circle text-green-600 text-xl"></i>
              </div>
              <h2 className="text-xl font-inter font-semibold text-aero-slate-800">
                Importante: Atualize seu drone com segurança
              </h2>
            </div>
            
            <p className="text-aero-slate-600 mb-4">
              Atualizações de firmware melhoram a performance do seu drone, adicionam novos recursos e corrigem problemas de segurança.
              Siga sempre as instruções do fabricante e certifique-se de que seu drone está com bateria suficiente antes de iniciar a atualização.
            </p>
            
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <h3 className="font-medium text-amber-800 mb-2 flex items-center">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                <span>Atenção</span>
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-aero-slate-700">
                <li>Nunca interrompa uma atualização de firmware em andamento</li>
                <li>Verifique se a bateria está com pelo menos 50% de carga</li>
                <li>Mantenha o controle remoto e o drone próximos durante a atualização</li>
                <li>Sempre faça backup de suas configurações personalizadas</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Filtro de marcas */}
        <div className="mb-6">
          <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-3">Firmwares Disponíveis</h2>
          
          <div className="bg-white p-4 rounded-lg border border-aero-slate-200 flex flex-wrap gap-2">
            <button 
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedBrand === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-aero-slate-100 text-aero-slate-700 hover:bg-aero-slate-200'
              }`}
              onClick={() => setSelectedBrand('all')}
            >
              Todas as Marcas
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedBrand === 'DJI'
                  ? 'bg-green-600 text-white'
                  : 'bg-aero-slate-100 text-aero-slate-700 hover:bg-aero-slate-200'
              }`}
              onClick={() => setSelectedBrand('DJI')}
            >
              DJI
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedBrand === 'Autel'
                  ? 'bg-green-600 text-white'
                  : 'bg-aero-slate-100 text-aero-slate-700 hover:bg-aero-slate-200'
              }`}
              onClick={() => setSelectedBrand('Autel')}
            >
              Autel
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedBrand === 'Parrot'
                  ? 'bg-green-600 text-white'
                  : 'bg-aero-slate-100 text-aero-slate-700 hover:bg-aero-slate-200'
              }`}
              onClick={() => setSelectedBrand('Parrot')}
            >
              Parrot
            </button>
          </div>
        </div>
        
        {/* Lista de Firmwares */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredFirmware.map((firmware, index) => (
            <FirmwareCard key={index} {...firmware} />
          ))}
        </div>
        
        {/* Postagens da API */}
        <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-4">Notícias sobre Firmware</h2>
        
        {postsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-aero-slate-700" />
          </div>
        ) : postsError ? (
          <div className="text-center py-8 px-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">Ocorreu um erro ao carregar as notícias de firmware.</p>
            <p className="text-red-500 text-sm mt-1">Por favor, tente novamente mais tarde.</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-green-50 border border-green-200 rounded-lg mb-8">
            <p className="text-aero-slate-700">Nenhuma notícia de firmware encontrada.</p>
            <p className="text-aero-slate-600 text-sm mt-1">Novas informações serão publicadas em breve!</p>
          </div>
        )}
        
        {/* Guia de Atualização */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-4 flex items-center">
              <i className="fas fa-book-open text-green-600 mr-2"></i>
              <span>Guia de Atualização de Firmware</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 mt-1">
                  <span className="font-medium">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-aero-slate-800">Verificação Inicial</h3>
                  <p className="text-aero-slate-600 text-sm mt-1">
                    Verifique qual é a versão atual do firmware do seu drone através do aplicativo oficial.
                    Compare com a versão mais recente disponível.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 mt-1">
                  <span className="font-medium">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-aero-slate-800">Preparação</h3>
                  <p className="text-aero-slate-600 text-sm mt-1">
                    Carregue o drone e controle remoto a pelo menos 50%. Certifique-se de ter uma
                    conexão Wi-Fi estável e espaço suficiente no dispositivo móvel para o download.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 mt-1">
                  <span className="font-medium">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-aero-slate-800">Processo de Atualização</h3>
                  <p className="text-aero-slate-600 text-sm mt-1">
                    Siga as instruções no aplicativo para iniciar o download e a instalação do firmware.
                    Não desligue o drone ou o controle remoto durante o processo. A atualização pode levar
                    de 5 a 15 minutos dependendo do modelo.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 mt-1">
                  <span className="font-medium">4</span>
                </div>
                <div>
                  <h3 className="font-medium text-aero-slate-800">Verificação Final</h3>
                  <p className="text-aero-slate-600 text-sm mt-1">
                    Após a atualização, verifique se todas as funcionalidades estão operando normalmente.
                    Recalibre sensores se necessário e faça um voo de teste em área segura.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Firmware;