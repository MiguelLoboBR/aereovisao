import { useState, FormEvent, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, Newspaper, Calendar, User } from 'lucide-react';

// Interface para Post vindo da API
interface Post {
  id: number;
  titulo: string;
  conteudo: string;
  categoria: 'dicas' | 'firmware' | 'legislacao' | 'noticia';
  autor: string;
  createdAt: string;
  updatedAt: string;
  imagemUrl?: string;
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
    const textContent = content.replace(/<[^>]*>/g, '');
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200">
      {post.imagemUrl && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={post.imagemUrl} 
            alt={post.titulo}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center mb-3">
          <span className="text-indigo-600 text-xs bg-indigo-50 px-2 py-1 rounded-full font-medium">
            <Newspaper className="inline-block w-3 h-3 mr-1" /> Notícia
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
          <span className="text-xs text-aero-slate-500 italic flex items-center">
            <User className="w-3 h-3 mr-1" /> {post.autor}
          </span>
          
          <Link 
            to={`/app/post/${post.id}`} 
            className="inline-flex items-center text-indigo-600 text-sm font-medium hover:text-indigo-700"
          >
            Ler mais <i className="fas fa-arrow-right ml-1 text-xs"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

const Noticias = () => {
  const { toast } = useToast();
  
  // Buscar postagens da categoria 'noticia'
  const { 
    data: posts, 
    isLoading: postsLoading, 
    error: postsError 
  } = useQuery<Post[]>({
    queryKey: ['/api/posts', 'noticia'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/posts?categoria=noticia');
      return await res.json();
    },
  });

  return (
    <section className="py-8 px-4 md:px-8 min-h-screen pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-inter font-bold text-aero-slate-800">Notícias do Setor</h1>
          <p className="text-aero-slate-600 mt-2">Fique por dentro das últimas atualizações e notícias do mundo dos drones</p>
        </header>
        
        {/* Seção de Posts Recentes */}
        <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-4">Notícias Recentes</h2>
        
        {postsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-aero-slate-700" />
          </div>
        ) : postsError ? (
          <div className="text-center py-8 px-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">Ocorreu um erro ao carregar as notícias.</p>
            <p className="text-red-500 text-sm mt-1">Por favor, tente novamente mais tarde.</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-blue-50 border border-blue-200 rounded-lg mb-8">
            <p className="text-aero-slate-700">Nenhuma notícia encontrada.</p>
            <p className="text-aero-slate-600 text-sm mt-1">Novas notícias serão publicadas em breve!</p>
          </div>
        )}
        
        {/* Destaque informativo */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mt-8">
          <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-4 flex items-center">
            <Newspaper className="text-indigo-600 mr-2 h-5 w-5" />
            <span>Mantenha-se informado</span>
          </h2>
          
          <p className="text-aero-slate-700 mb-4">
            Nosso portal reúne as principais notícias e atualizações do mundo dos drones. 
            Acompanhe regularmente para ficar por dentro das novidades tecnológicas, 
            mudanças na legislação e eventos importantes do setor.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg border border-indigo-100">
              <h3 className="font-medium text-indigo-700 mb-2">Novas Tecnologias</h3>
              <p className="text-sm text-aero-slate-600">
                Acompanhe o lançamento das mais recentes tecnologias e equipamentos para drones.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-indigo-100">
              <h3 className="font-medium text-indigo-700 mb-2">Regulamentações</h3>
              <p className="text-sm text-aero-slate-600">
                Fique por dentro das atualizações nas leis e regulamentos que afetam operadores de drones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Noticias;