import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuthJWT } from '@/hooks/useAuthJWT';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Interface para User vindo da API
interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'usuario' | 'colaborador' | 'admin';
  createdAt: string;
  updatedAt: string;
  phone: string | null;
  document: string | null;
}

const UserItem = ({ 
  user,
  onRoleChange,
  isLoading,
  currentUserId
}: { 
  user: User;
  onRoleChange: (userId: number, newRole: 'usuario' | 'colaborador' | 'admin') => void;
  isLoading: boolean;
  currentUserId: number;
}) => {
  const [selectedRole, setSelectedRole] = useState<'usuario' | 'colaborador' | 'admin'>(user.role);
  
  // Função para formatar a data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  // Handler para mudança de papel do usuário
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as 'usuario' | 'colaborador' | 'admin';
    setSelectedRole(newRole);
    onRoleChange(user.id, newRole);
  };
  
  // Verificar se o usuário é o próprio usuário logado
  const isSelf = user.id === currentUserId;

  return (
    <tr className="border-b border-aero-slate-200 hover:bg-aero-slate-50">
      <td className="py-4 px-3 md:px-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-aero-slate-200 overflow-hidden">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || user.username} 
                className="h-full w-full object-cover" 
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-aero-slate-500">
                <i className="fas fa-user"></i>
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-aero-slate-800 font-medium">
              {user.displayName || user.username}
            </p>
            <p className="text-aero-slate-500 text-xs">
              {user.email}
            </p>
          </div>
        </div>
      </td>
      <td className="py-4 px-3 md:px-6 text-aero-slate-700 text-sm">
        {user.document || '-'}
      </td>
      <td className="py-4 px-3 md:px-6 text-aero-slate-700 text-sm">
        {formatDate(user.createdAt)}
      </td>
      <td className="py-4 px-3 md:px-6">
        <div className="relative">
          <select
            value={selectedRole}
            onChange={handleRoleChange}
            disabled={isLoading || isSelf}
            className={`p-2 border rounded-md w-full text-sm ${
              isSelf 
                ? 'bg-aero-slate-100 cursor-not-allowed opacity-70' 
                : 'bg-white'
            }`}
          >
            <option value="usuario">Usuário</option>
            <option value="colaborador">Colaborador</option>
            <option value="admin">Administrador</option>
          </select>
          {isSelf && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-aero-slate-400">
              <i className="fas fa-lock text-xs"></i>
            </div>
          )}
          {isLoading && selectedRole !== user.role && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-blue-500">
              <i className="fas fa-circle-notch fa-spin text-xs"></i>
            </div>
          )}
        </div>
        {isSelf && (
          <p className="text-xs text-aero-slate-500 mt-1">
            Não é possível alterar seu próprio nível
          </p>
        )}
      </td>
    </tr>
  );
};

const AdminUsuarios = () => {
  const { user, isAdmin } = useAuthJWT();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // ID do usuário atualmente logado
  const currentUserId = user?.id ?? 0;
  
  // Verificar se o usuário é admin, senão redirecionar
  useEffect(() => {
    if (!isAdmin && user) {
      toast({
        title: "Acesso restrito",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      navigate('/app/dashboard');
    }
  }, [isAdmin, user, navigate, toast]);
  
  // Buscar todos os usuários
  const { 
    data: users, 
    isLoading: usersLoading, 
    error: usersError 
  } = useQuery<User[]>({
    queryKey: ['/api/usuarios'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/usuarios');
      return await res.json();
    },
    enabled: !!isAdmin,
  });
  
  // Mutation para atualizar o papel de um usuário
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: number; newRole: 'usuario' | 'colaborador' | 'admin' }) => {
      const res = await apiRequest('PATCH', `/api/usuarios/${userId}`, { role: newRole });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Nível de acesso atualizado",
        description: "O nível de acesso do usuário foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/usuarios'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar",
        description: `Ocorreu um erro ao atualizar o nível de acesso: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handler para mudança de papel
  const handleRoleChange = (userId: number, newRole: 'usuario' | 'colaborador' | 'admin') => {
    updateRoleMutation.mutate({ userId, newRole });
  };
  
  if (!isAdmin) {
    return null;
  }

  return (
    <section className="py-8 px-4 md:px-8 min-h-screen pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-inter font-bold text-aero-slate-800">
            Gerenciamento de Usuários
          </h1>
          <p className="text-aero-slate-600 mt-2">
            Controle os níveis de acesso e gerencie usuários da plataforma
          </p>
        </header>
        
        {/* Explicação de níveis */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-4">
              Níveis de Acesso
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg border border-green-100 p-4">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                    <i className="fas fa-user"></i>
                  </div>
                  <h3 className="font-medium text-aero-slate-800">Usuário</h3>
                </div>
                <p className="text-aero-slate-600 text-sm">
                  Pode visualizar todos os conteúdos da plataforma, mas não pode criar ou editar publicações.
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <i className="fas fa-pen"></i>
                  </div>
                  <h3 className="font-medium text-aero-slate-800">Colaborador</h3>
                </div>
                <p className="text-aero-slate-600 text-sm">
                  Pode criar e editar publicações através do painel de gerenciamento de posts, mas não pode gerenciar outros usuários.
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg border border-purple-100 p-4">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <h3 className="font-medium text-aero-slate-800">Administrador</h3>
                </div>
                <p className="text-aero-slate-600 text-sm">
                  Acesso completo à plataforma. Pode gerenciar publicações e controlar os níveis de acesso de outros usuários.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Alertas de importância */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex">
          <div className="flex-shrink-0 mr-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-medium text-amber-800">Atenção ao modificar níveis de acesso</h3>
            <p className="text-amber-700 text-sm">
              Ao conceder o nível de Administrador, o usuário terá acesso completo à plataforma, incluindo o gerenciamento de 
              outros usuários. Utilize com responsabilidade.
            </p>
          </div>
        </div>
        
        {/* Tabela de usuários */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200">
          {usersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-aero-slate-700" />
            </div>
          ) : usersError ? (
            <div className="text-center py-8 px-4 bg-red-50">
              <p className="text-red-600">Ocorreu um erro ao carregar os usuários.</p>
              <p className="text-red-500 text-sm mt-1">Por favor, tente novamente mais tarde.</p>
            </div>
          ) : users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-aero-slate-200">
                <thead className="bg-aero-slate-50">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-aero-slate-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-aero-slate-500 uppercase tracking-wider">
                      CPF/CNPJ
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-aero-slate-500 uppercase tracking-wider">
                      Data de Cadastro
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-aero-slate-500 uppercase tracking-wider">
                      Nível de Acesso
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-aero-slate-200">
                  {users.map((user) => (
                    <UserItem 
                      key={user.id} 
                      user={user} 
                      onRoleChange={handleRoleChange} 
                      isLoading={updateRoleMutation.isPending} 
                      currentUserId={currentUserId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 px-4">
              <p className="text-aero-slate-600">Nenhum usuário encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminUsuarios;