import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, FileText, Plus, ImageIcon, FileIcon, Upload, X, Youtube } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiRequest } from '@/lib/queryClient';
import { useAuthJWT } from '@/hooks/useAuthJWT';
import { toast } from '@/hooks/use-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Componentes UI
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Schema de validação
const postFormSchema = z.object({
  titulo: z.string().min(5, { message: 'O título deve ter no mínimo 5 caracteres' }),
  categoria: z.enum(['dicas', 'firmware', 'legislacao', 'noticia'], {
    required_error: "Selecione uma categoria",
  }),
  conteudo: z.string().min(20, { message: 'O conteúdo deve ter no mínimo 20 caracteres' }),
  youtubeUrl: z.string().url({ message: 'Insira uma URL válida' }).optional().or(z.literal('')),
});

type PostFormValues = z.infer<typeof postFormSchema>;

// Interface para arquivos do formulário
interface PostFormFiles {
  imagemDestacada?: File | null;
  anexo?: File | null;
}

// Interface para Post
interface Post {
  id: number;
  titulo: string;
  categoria: 'dicas' | 'firmware' | 'legislacao' | 'noticia';
  conteudo: string;
  autor: string;
  autorId: number;
  autorNome?: string | null;
  data: string;
  createdAt: string;
  updatedAt: string;
  imagemUrl?: string | null;
  anexoUrl?: string | null;
  anexoNome?: string | null;
  youtubeUrl?: string | null;
}

// Componente principal
export default function PostManager() {
  const { user, isAdmin, isColaborador } = useAuthJWT();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('criar');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  
  // Referências para os inputs de arquivo
  const imagemInputRef = useRef<HTMLInputElement>(null);
  const anexoInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para armazenar os arquivos selecionados
  const [imagemDestacada, setImagemDestacada] = useState<File | null>(null);
  const [anexo, setAnexo] = useState<File | null>(null);
  
  // Previews dos arquivos
  const [imagemPreview, setImagemPreview] = useState<string | null>(editingPost?.imagemUrl || null);
  const [anexoInfo, setAnexoInfo] = useState<{nome: string, url: string} | null>(
    editingPost?.anexoNome && editingPost?.anexoUrl 
      ? { nome: editingPost.anexoNome, url: editingPost.anexoUrl } 
      : null
  );

  // Verificação de permissão
  if (!isAdmin && !isColaborador) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-semibold text-aero-slate-800 mb-2">Acesso Restrito</h2>
        <p className="text-aero-slate-600">
          Você não tem permissão para acessar este recurso.
        </p>
      </div>
    );
  }

  // Consultar lista de posts
  const {
    data: posts,
    isLoading: isLoadingPosts,
    isError: isPostsError,
  } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/posts');
      return await res.json();
    },
  });

  // Formulário para criação/edição de posts
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      titulo: editingPost?.titulo || '',
      categoria: editingPost?.categoria || 'dicas',
      conteudo: editingPost?.conteudo || '',
      youtubeUrl: editingPost?.youtubeUrl || '',
    },
  });

  // Efeito para atualizar o formulário quando editingPost muda
  React.useEffect(() => {
    if (editingPost) {
      form.reset({
        titulo: editingPost.titulo,
        categoria: editingPost.categoria,
        conteudo: editingPost.conteudo,
        youtubeUrl: editingPost.youtubeUrl || '',
      });
      
      // Atualizar previews de imagem e anexo
      setImagemPreview(editingPost.imagemUrl || null);
      if (editingPost.anexoNome && editingPost.anexoUrl) {
        setAnexoInfo({
          nome: editingPost.anexoNome,
          url: editingPost.anexoUrl
        });
      } else {
        setAnexoInfo(null);
      }
    }
  }, [editingPost, form]);
  
  // Manipuladores para seleção de arquivos
  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImagemDestacada(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagemPreview(editingPost?.imagemUrl || null);
    }
  };
  
  const handleAnexoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAnexo(file);
    
    if (file) {
      setAnexoInfo({
        nome: file.name,
        url: URL.createObjectURL(file)
      });
    } else {
      setAnexoInfo(
        editingPost?.anexoNome && editingPost?.anexoUrl 
          ? { nome: editingPost.anexoNome, url: editingPost.anexoUrl } 
          : null
      );
    }
  };
  
  const limparImagem = () => {
    setImagemDestacada(null);
    setImagemPreview(null);
    if (imagemInputRef.current) {
      imagemInputRef.current.value = '';
    }
  };
  
  const limparAnexo = () => {
    setAnexo(null);
    setAnexoInfo(null);
    if (anexoInputRef.current) {
      anexoInputRef.current.value = '';
    }
  };

  // Mutation para criar post
  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormValues) => {
      // Criar FormData para envio com arquivos
      const formData = new FormData();
      formData.append('titulo', data.titulo);
      formData.append('categoria', data.categoria);
      formData.append('conteudo', data.conteudo);
      
      // Adicionar URL do YouTube se existir
      if (data.youtubeUrl) {
        formData.append('youtubeUrl', data.youtubeUrl);
      }
      
      // Adicionar arquivos, se existirem
      if (imagemDestacada) {
        formData.append('imagemDestacada', imagemDestacada);
      }
      
      if (anexo) {
        formData.append('anexo', anexo);
      }
      
      // Usar a função apiRequest que já inclui o token JWT
      const res = await apiRequest('POST', '/api/posts', formData, {
        formData: true
      });
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Post criado com sucesso',
        description: 'O post foi adicionado ao sistema.',
      });
      
      // Limpar formulário e arquivos
      form.reset({
        titulo: '',
        categoria: 'dicas',
        conteudo: '',
        youtubeUrl: '',
      });
      limparImagem();
      limparAnexo();
      
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setActiveTab('listar');
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar post',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation para atualizar post
  const updatePostMutation = useMutation({
    mutationFn: async (data: PostFormValues & { id: number }) => {
      const { id, ...postData } = data;
      
      // Criar FormData para envio com arquivos
      const formData = new FormData();
      formData.append('titulo', postData.titulo);
      formData.append('categoria', postData.categoria);
      formData.append('conteudo', postData.conteudo);
      
      // Adicionar URL do YouTube se existir
      if (postData.youtubeUrl) {
        formData.append('youtubeUrl', postData.youtubeUrl);
      }
      
      // Adicionar arquivos, se existirem
      if (imagemDestacada) {
        formData.append('imagemDestacada', imagemDestacada);
      }
      
      if (anexo) {
        formData.append('anexo', anexo);
      }
      
      // Usar a função apiRequest que já inclui o token JWT
      const res = await apiRequest('PUT', `/api/posts/${id}`, formData, {
        formData: true
      });
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Post atualizado com sucesso',
        description: 'As alterações foram salvas.',
      });
      
      // Limpar estado de edição e arquivos
      setEditingPost(null);
      limparImagem();
      limparAnexo();
      
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setActiveTab('listar');
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar post',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation para excluir post
  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/posts/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Post excluído com sucesso',
        description: 'O post foi removido do sistema.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir post',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Função para lidar com o envio do formulário
  function onSubmit(values: PostFormValues) {
    if (editingPost) {
      updatePostMutation.mutate({ ...values, id: editingPost.id });
    } else {
      createPostMutation.mutate(values);
    }
  }
  
  // Função para resetar o formulário e limpar arquivos
  const resetForm = () => {
    form.reset({
      titulo: '',
      categoria: 'dicas',
      conteudo: '',
      youtubeUrl: '',
    });
    limparImagem();
    limparAnexo();
    setEditingPost(null);
  }

  // Funções auxiliares
  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setActiveTab('criar');
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDeleteClick = (id: number) => {
    setPostToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deletePostMutation.mutate(postToDelete);
    }
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
  };

  // Função para traduzir categoria
  const getCategoriaLabel = (categoria: string) => {
    const categorias: Record<string, string> = {
      dicas: 'Dicas',
      firmware: 'Firmware',
      legislacao: 'Legislação',
      noticia: 'Notícia',
    };
    return categorias[categoria] || categoria;
  };

  // Renderização condicional do formulário ou tabela
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Gerenciamento de Postagens</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="criar">
            {editingPost ? 'Editar Postagem' : 'Criar Postagem'}
          </TabsTrigger>
          <TabsTrigger value="listar">Listar Postagens</TabsTrigger>
        </TabsList>
        
        <TabsContent value="criar">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingPost ? 'Editar Postagem' : 'Nova Postagem'}
              </CardTitle>
              <CardDescription>
                {editingPost 
                  ? 'Edite os dados da postagem existente.' 
                  : 'Crie uma nova postagem para o Portal do Piloto.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o título da postagem" {...field} />
                        </FormControl>
                        <FormDescription>
                          Título da postagem que será exibido para os usuários.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dicas">Dicas</SelectItem>
                            <SelectItem value="firmware">Firmware</SelectItem>
                            <SelectItem value="legislacao">Legislação</SelectItem>
                            <SelectItem value="noticia">Notícia</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          A categoria determinará em qual seção do portal a postagem será exibida.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="youtubeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do YouTube (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://youtube.com/watch?v=..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          URL de um vídeo do YouTube para incorporar na postagem.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="conteudo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conteúdo</FormLabel>
                        <FormControl>
                          <div className="border rounded-md">
                            <ReactQuill 
                              theme="snow"
                              placeholder="Digite o conteúdo da postagem" 
                              className="min-h-[200px]" 
                              modules={{
                                toolbar: [
                                  [{ 'header': [1, 2, 3, false] }],
                                  ['bold', 'italic', 'underline', 'strike'],
                                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                  ['link', 'image'],
                                  ['clean']
                                ],
                              }}
                              formats={[
                                'header',
                                'bold', 'italic', 'underline', 'strike',
                                'list', 'bullet',
                                'link', 'image'
                              ]}
                              value={field.value} 
                              onChange={field.onChange}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Conteúdo completo da postagem. Use o editor para formatação.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Campo de upload de imagem destacada */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Imagem Destacada
                      </label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Imagem principal que será exibida no topo da postagem e nos cards de listagem.
                      </p>
                      
                      <div className="grid gap-4">
                        {imagemPreview ? (
                          <div className="relative w-full h-[200px] rounded-lg overflow-hidden border">
                            <img
                              src={imagemPreview}
                              alt="Preview da imagem destacada"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 rounded-full"
                              onClick={limparImagem}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => imagemInputRef.current?.click()}
                            className="cursor-pointer border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-[200px] bg-muted hover:bg-muted/80 transition-colors"
                          >
                            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground font-medium">
                              Clique aqui para escolher uma imagem
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Formatos aceitos: JPG, PNG, WEBP, GIF
                            </p>
                          </div>
                        )}
                        
                        <input
                          ref={imagemInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImagemChange}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>
                    
                    {/* Campo de upload de anexo */}
                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Arquivo Anexo (opcional)
                      </label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Arquivos para download, como documentos PDF, firmwares, etc.
                      </p>
                      
                      <div className="grid gap-4">
                        {anexoInfo ? (
                          <div className="flex items-center p-4 border rounded-lg bg-muted/30">
                            <FileIcon className="h-8 w-8 text-muted-foreground mr-4" />
                            <div className="flex-1">
                              <p className="text-sm font-medium truncate">{anexoInfo.nome}</p>
                              <a 
                                href={anexoInfo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline"
                              >
                                Visualizar anexo
                              </a>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={limparAnexo}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => anexoInputRef.current?.click()}
                            className="cursor-pointer border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-[100px] bg-muted hover:bg-muted/80 transition-colors"
                          >
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground font-medium">
                              Clique aqui para adicionar um arquivo
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Formatos recomendados: PDF, ZIP, RAR, etc.
                            </p>
                          </div>
                        )}
                        
                        <input
                          ref={anexoInputRef}
                          type="file"
                          onChange={handleAnexoChange}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={createPostMutation.isPending || updatePostMutation.isPending}
                    >
                      {(createPostMutation.isPending || updatePostMutation.isPending) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingPost ? 'Salvando...' : 'Criando...'}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {editingPost ? 'Salvar Alterações' : 'Criar Postagem'}
                        </>
                      )}
                    </Button>
                    
                    {editingPost && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Cancelar Edição
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="listar">
          <Card>
            <CardHeader>
              <CardTitle>Postagens Cadastradas</CardTitle>
              <CardDescription>
                Gerencie todas as postagens do Portal do Piloto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPosts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-aero-slate-700" />
                </div>
              ) : isPostsError ? (
                <div className="py-4 text-center text-red-500">
                  Erro ao carregar postagens. Tente novamente mais tarde.
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableCaption>Lista de postagens cadastradas no sistema.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Título</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.titulo}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 rounded text-xs ${
                              post.categoria === 'dicas' ? 'bg-blue-100 text-blue-800' :
                              post.categoria === 'firmware' ? 'bg-purple-100 text-purple-800' :
                              post.categoria === 'legislacao' ? 'bg-green-100 text-green-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {getCategoriaLabel(post.categoria)}
                            </span>
                          </TableCell>
                          <TableCell>{post.autor}</TableCell>
                          <TableCell>{formatDate(post.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditPost(post)}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(post.id)}
                              >
                                Excluir
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center text-aero-slate-600">
                  <FileText className="h-16 w-16 mx-auto text-aero-slate-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma postagem encontrada</h3>
                  <p className="mb-4">Não há postagens cadastradas no sistema.</p>
                  <Button onClick={() => setActiveTab('criar')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeira Postagem
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta postagem? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deletePostMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deletePostMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Sim, excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}