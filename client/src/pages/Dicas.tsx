import { useState, FormEvent, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

interface TutorialCardProps {
  image: string;
  title: string;
  description: string;
  link: string;
}

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
          <span className="text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded-full font-medium">
            <i className="fas fa-lightbulb mr-1"></i> Dica
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
            className="inline-flex items-center text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            Ler mais <i className="fas fa-arrow-right ml-1 text-xs"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

const TutorialCard = ({ image, title, description, link }: TutorialCardProps) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200">
    <div className={`h-44 bg-[url('${image}')] bg-cover bg-center relative`}>
      <div className="absolute bottom-0 right-0 bg-blue-600 text-white px-3 py-1 text-xs font-medium">
        <i className="fas fa-book-reader mr-1"></i> Tutorial
      </div>
    </div>
    
    <div className="p-4">
      <h3 className="font-inter font-medium text-aero-slate-800 line-clamp-2">
        {title}
      </h3>
      <p className="text-aero-slate-600 text-sm mt-2 line-clamp-3">
        {description}
      </p>
      <a href={link} className="mt-3 inline-flex items-center text-blue-600 text-sm font-medium hover:text-blue-700">
        Ler tutorial <i className="fas fa-arrow-right ml-1 text-xs"></i>
      </a>
    </div>
  </div>
);

interface TipCardProps {
  icon: string;
  title: string;
  description: string;
}

const TipCard = ({ icon, title, description }: TipCardProps) => (
  <div className="flex">
    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-4">
      <i className={icon}></i>
    </div>
    <div>
      <h3 className="font-inter font-medium text-aero-slate-800">{title}</h3>
      <p className="text-aero-slate-600 text-sm mt-1">
        {description}
      </p>
    </div>
  </div>
);

const Dicas = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Buscar postagens da categoria 'dicas'
  const { 
    data: posts, 
    isLoading: postsLoading, 
    error: postsError 
  } = useQuery<Post[]>({
    queryKey: ['/api/posts', 'dicas'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/posts?categoria=dicas');
      return await res.json();
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest('POST', '/api/contact', { email, message });
      
      toast({
        title: "Mensagem enviada!",
        description: "Obrigado pelo seu contato, responderemos em breve.",
      });
      
      setEmail('');
      setMessage('');
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tutorials = [
    {
      image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      title: "Dicas para fotografia aérea com drones",
      description: "Aprenda técnicas profissionais para capturar imagens incríveis com seu drone. Configurações, composição e melhor hora do dia.",
      link: "#fotografia-aerea"
    },
    {
      image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      title: "Guia para voos seguros em ambientes urbanos",
      description: "Precauções, legislação e dicas práticas para voar com segurança em ambientes urbanos, evitando riscos e problemas legais.",
      link: "#voos-urbanos"
    },
    {
      image: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      title: "Modos de voo inteligentes: como usar",
      description: "Conheça e aprenda a usar os modos de voo automatizados como orbit, dronie, helix e waypoints para criações cinematográficas.",
      link: "#modos-voo"
    }
  ];

  const tips = [
    {
      icon: "fas fa-bolt",
      title: "Antes de decolar, verifique",
      description: "Sempre verifique os parafusos das hélices, calibração da bússola e nível de bateria antes de cada voo."
    },
    {
      icon: "fas fa-wind",
      title: "Condições meteorológicas",
      description: "Não voe com ventos superiores a 30km/h, durante chuvas ou tempestades, mesmo com drones resistentes à água."
    },
    {
      icon: "fas fa-memory",
      title: "Cartões de memória",
      description: "Use apenas cartões de memória classe 10 ou UHS-I para garantir gravação suave de vídeos 4K."
    },
    {
      icon: "fas fa-battery-three-quarters",
      title: "Vida útil das baterias",
      description: "Armazene baterias com 50-60% de carga e em local seco e fresco para prolongar sua vida útil."
    }
  ];

  return (
    <section className="py-8 px-4 md:px-8 min-h-screen pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-inter font-bold text-aero-slate-800">Dicas & Tutoriais</h1>
          <p className="text-aero-slate-600 mt-2">Aprimore suas habilidades com nosso material exclusivo</p>
        </header>
        
        {/* Featured Video */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200 mb-8">
          <div className="aspect-w-16 aspect-h-9 bg-aero-slate-100">
            <div className="flex items-center justify-center bg-aero-slate-800 w-full" style={{ aspectRatio: '16/9' }}>
              <div className="text-center">
                <i className="fas fa-play-circle text-white text-4xl mb-3"></i>
                <p className="text-white">Vídeo: Dicas para melhor autonomia de bateria</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-2">
              Como aumentar a autonomia da bateria do seu drone
            </h2>
            <p className="text-aero-slate-600">
              Neste tutorial, apresentamos técnicas para otimizar o uso da bateria do seu drone, 
              garantindo voos mais longos e seguros. Aprenda sobre configurações, comportamentos 
              de voo e cuidados com a bateria.
            </p>
          </div>
        </div>
        
        <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-4">Postagens Recentes</h2>
        
        {postsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-aero-slate-700" />
          </div>
        ) : postsError ? (
          <div className="text-center py-8 px-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">Ocorreu um erro ao carregar as dicas.</p>
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
            <p className="text-aero-slate-700">Nenhuma dica encontrada.</p>
            <p className="text-aero-slate-600 text-sm mt-1">Novas dicas serão publicadas em breve!</p>
          </div>
        )}
        
        <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-4">Tutoriais Recentes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {tutorials.map((tutorial, index) => (
            <TutorialCard key={index} {...tutorial} />
          ))}
        </div>
        
        <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-4">Dicas Rápidas</h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-aero-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip, index) => (
              <TipCard key={index} {...tip} />
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-4 flex items-center">
            <i className="fas fa-question-circle text-blue-600 mr-2"></i>
            <span>Tem alguma dúvida específica?</span>
          </h2>
          
          <p className="text-aero-slate-700 mb-4">
            Envie suas perguntas ou sugestões de tutoriais que você gostaria de ver aqui 
            no Portal do Piloto. Estamos sempre atualizando nosso conteúdo!
          </p>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-aero-slate-700 mb-1">Seu email</label>
              <input 
                type="email" 
                id="email" 
                className="w-full px-3 py-2 border border-aero-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-aero-slate-700 mb-1">Sua mensagem</label>
              <textarea 
                id="message" 
                rows={3} 
                className="w-full px-3 py-2 border border-aero-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Descreva sua dúvida ou sugestão..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-circle-notch fa-spin mr-2"></i>
                  Enviando...
                </>
              ) : (
                'Enviar mensagem'
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Dicas;
