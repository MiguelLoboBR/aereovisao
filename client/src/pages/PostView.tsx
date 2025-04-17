import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronLeft, AlertTriangle, Clock, UserCircle, Tag, Download, FileText, Youtube } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAuthJWT } from '@/hooks/useAuthJWT';
import { apiRequest } from '@/lib/queryClient';

interface Author {
  id: number;
  nome?: string;
  username?: string;
  displayName?: string;
}

interface Post {
  id: number;
  titulo: string;
  conteudo: string;
  categoria: 'dicas' | 'firmware' | 'legislacao' | 'noticia';
  autorId: number;
  autorNome: string | null;
  author?: Author;
  createdAt: string;
  updatedAt: string;
  imagemUrl?: string | null;
  anexoUrl?: string | null;
  anexoNome?: string | null;
  youtubeUrl?: string | null;
}

const getCategoryLabel = (categoria: string): string => {
  const categorias: Record<string, string> = {
    'dicas': 'Dicas',
    'firmware': 'Firmware',
    'legislacao': 'Legislação',
    'noticia': 'Notícias'
  };
  
  return categorias[categoria] || categoria;
};

const getCategoryColor = (categoria: string): string => {
  const cores: Record<string, { bg: string, text: string, border: string }> = {
    'dicas': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
    'firmware': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
    'legislacao': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    'noticia': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' }
  };
  
  return cores[categoria] ? `${cores[categoria].bg} ${cores[categoria].text} ${cores[categoria].border}` : 
    'bg-gray-50 text-gray-700 border-gray-200';
};

const PostView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthJWT();
  
  const { 
    data: post, 
    isLoading, 
    error,
    isError
  } = useQuery<Post>({
    queryKey: [`/api/posts/${id}`],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', `/api/posts/${id}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Post não encontrado');
          } else {
            throw new Error('Erro ao carregar o post');
          }
        }
        
        return await res.json();
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Erro ao carregar o post');
      }
    },
    retry: 1,
  });
  
  useEffect(() => {
    if (isError) {
      toast({
        title: "Erro ao carregar post",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao carregar o post",
        variant: "destructive",
      });
      
      // Redirecionar para página adequada após erro
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 3000);
    }
  }, [isError, error, navigate, toast]);
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  // Função para extrair o ID do vídeo do YouTube a partir da URL
  const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;

    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[7].length === 11) ? match[7] : null;
  };
  
  // Mostrar mensagem de carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-aero-slate-600 text-lg">Carregando post...</p>
      </div>
    );
  }
  
  // Mostrar mensagem de erro
  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-red-700 mb-2">Post não encontrado</h1>
          <p className="text-red-600 mb-6">
            {error instanceof Error ? error.message : "Não foi possível carregar as informações deste post."}
          </p>
          <Link 
            to="/app/dashboard" 
            className="inline-flex items-center px-4 py-2 bg-aero-slate-100 text-aero-slate-800 rounded-lg hover:bg-aero-slate-200 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  // Renderizar o post
  return (
    <section className="py-8 px-4 md:px-8 pb-20 md:pb-12 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Navegação de volta */}
        <div className="mb-6">
          <Link 
            to={post.categoria === 'dicas' ? "/app/dicas" : 
                post.categoria === 'firmware' ? "/app/firmware" : 
                post.categoria === 'legislacao' ? "/app/legislacao" : 
                "/app/dashboard"} 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Voltar para {getCategoryLabel(post.categoria)}</span>
          </Link>
        </div>
        
        {/* Cabeçalho */}
        <header className="mb-8">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${getCategoryColor(post.categoria)}`}>
            <Tag className="h-4 w-4 mr-1" />
            <span>{getCategoryLabel(post.categoria)}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-inter font-bold text-aero-slate-800 mb-3">
            {post.titulo}
          </h1>
          
          <div className="flex flex-wrap items-center text-aero-slate-500 text-sm">
            <div className="flex items-center mr-4 mb-2">
              <UserCircle className="h-4 w-4 mr-1" />
              <span>
                {post.author?.nome || post.author?.displayName || post.autorNome || 'Colaborador'}
              </span>
            </div>
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 mr-1" />
              <span>Publicado em {formatDate(post.createdAt)}</span>
            </div>
          </div>
        </header>
        
        {/* Imagem principal */}
        {post.imagemUrl && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-sm border border-aero-slate-200">
            <img 
              src={post.imagemUrl} 
              alt={post.titulo} 
              className="w-full h-auto object-cover max-h-[400px]" 
            />
          </div>
        )}
        
        {/* Conteúdo */}
        <article className="prose prose-blue max-w-none prose-img:rounded-xl prose-headings:font-inter prose-headings:text-aero-slate-800">
          <div dangerouslySetInnerHTML={{ __html: post.conteudo }} />
        </article>
        
        {/* Vídeo do YouTube (se houver) */}
        {post.youtubeUrl && getYoutubeVideoId(post.youtubeUrl) && (
          <div className="mt-8 mb-8">
            <h3 className="text-lg font-medium text-aero-slate-800 mb-3 flex items-center">
              <Youtube className="h-5 w-5 mr-2 text-red-600" />
              Vídeo Relacionado
            </h3>
            <div className="relative rounded-xl overflow-hidden aspect-video shadow-sm border border-aero-slate-200">
              <iframe 
                width="100%" 
                height="100%"
                src={`https://www.youtube.com/embed/${getYoutubeVideoId(post.youtubeUrl)}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0"
              ></iframe>
            </div>
          </div>
        )}
        
        {/* Anexo para download (se houver) */}
        {post.anexoUrl && post.anexoNome && (
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-800 mb-2 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Arquivo Disponível para Download
            </h3>
            <p className="text-blue-700 mb-3">
              {post.anexoNome}
            </p>
            <a 
              href={post.anexoUrl} 
              download={post.anexoNome}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Arquivo
            </a>
          </div>
        )}
        
        {/* Rodapé e ações */}
        <div className="mt-12 pt-6 border-t border-aero-slate-200">
          <div className="flex justify-between flex-wrap">
            <Link 
              to={post.categoria === 'dicas' ? "/app/dicas" : 
                  post.categoria === 'firmware' ? "/app/firmware" : 
                  post.categoria === 'legislacao' ? "/app/legislacao" : 
                  "/app/dashboard"} 
              className="inline-flex items-center px-4 py-2 bg-aero-slate-100 text-aero-slate-800 rounded-lg hover:bg-aero-slate-200 transition-colors mb-2"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Ver outros posts
            </Link>
            
            {(user?.role === 'admin' || user?.role === 'colaborador') && (
              <Link 
                to={`/app/gerenciar-posts?edit=${post.id}`} 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-2"
              >
                <i className="fas fa-edit mr-2"></i>
                Editar Post
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostView;