import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient
} from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, getAuthToken, setAuthToken, removeAuthToken } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Definir esquemas para validação
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória")
});

const registerSchema = z.object({
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  displayName: z.string().optional(),
  document: z.string().optional(),
  phone: z.string().optional()
});

// Tipos derivados dos esquemas
type LoginData = z.infer<typeof loginSchema>;
// Tipo para registro que pode incluir upload de arquivo
type RegisterData = z.infer<typeof registerSchema> | FormData;
type UpdateProfileData = {
  displayName?: string;
  phone?: string;
  document?: string;
  address?: string;
  photoFile?: File;
};

// Tipo de usuário retornado pela API
type User = {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  phone: string | null;
  document: string | null;
  address: string | null;
  role: 'usuario' | 'colaborador' | 'admin';
  createdAt: string;
  updatedAt: string;
};

// Tipo de resposta de autenticação
type AuthResponse = {
  user: User;
  token: string;
};

// Contexto de autenticação
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isColaborador: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AuthResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<AuthResponse, Error, RegisterData>;
  updateProfileMutation: UseMutationResult<User, Error, UpdateProfileData>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Comentado o efeito que limpava os tokens para manter a sessão do usuário
  // useEffect(() => {
  //   // Apagar token existente para forçar nova autenticação após alteração da chave
  //   console.log("Limpando tokens armazenados para garantir nova autenticação...");
  //   removeAuthToken();
  // }, []);

  // Carregar usuário do token existente
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      // Verificar se existe token
      const token = getAuthToken();
      if (!token) return null;

      // Tentar obter dados do usuário com o token
      try {
        const res = await apiRequest("GET", "/api/user");
        const userData = await res.json();
        // Atualizar o estado do usuário atual quando receber os dados
        setCurrentUser(userData);
        return userData;
      } catch (error) {
        // Token inválido ou expirado, remover
        removeAuthToken();
        return null;
      }
    },
    // O usuário pode não estar logado, isso não é um erro
    retry: false,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData): Promise<AuthResponse> => {
      const res = await apiRequest("POST", "/api/login", credentials, { skipAuth: true });
      return await res.json();
    },
    onSuccess: (data: AuthResponse) => {
      // Salvar token e usuário
      setAuthToken(data.token);
      setCurrentUser(data.user);
      queryClient.setQueryData(["/api/user"], data.user);
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo de volta, ${data.user.displayName || data.user.username}!`,
      });
      
      // Redirecionamento para o novo layout será feito via useEffect em auth-page.tsx
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no login",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para registro (com suporte para upload de fotos)
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData | FormData): Promise<AuthResponse> => {
      // Se os dados são FormData (contém arquivos), use apiRequest com formData: true
      if (data instanceof FormData) {
        const response = await apiRequest('POST', '/api/register', data, {
          formData: true,
          skipAuth: true
        });
        
        return await response.json();
      } else {
        // Caso normal sem arquivos
        const res = await apiRequest("POST", "/api/register", data, { skipAuth: true });
        return await res.json();
      }
    },
    onSuccess: (data: AuthResponse) => {
      // Salvar token e usuário
      setAuthToken(data.token);
      setCurrentUser(data.user);
      queryClient.setQueryData(["/api/user"], data.user);
      
      toast({
        title: "Registro realizado com sucesso",
        description: "Sua conta foi criada e você já está logado!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no registro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      // No JWT, não precisamos fazer uma chamada à API, apenas remover o token local
      removeAuthToken();
    },
    onSuccess: () => {
      // Limpar dados de usuário
      setCurrentUser(null);
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você saiu da sua conta.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha ao sair",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData): Promise<User> => {
      let formData;
      
      if (data.photoFile) {
        // Se tiver upload de foto, usar FormData
        formData = new FormData();
        
        if (data.displayName) formData.append("displayName", data.displayName);
        if (data.phone) formData.append("phone", data.phone);
        if (data.document) formData.append("document", data.document);
        if (data.address) formData.append("address", data.address);
        formData.append("photoFile", data.photoFile);
        
        const res = await apiRequest("POST", "/api/user/profile", formData, { formData: true });
        return await res.json();
      } else {
        // Sem foto, enviar JSON normal
        const res = await apiRequest("POST", "/api/user/profile", data);
        return await res.json();
      }
    },
    onSuccess: (updatedUser: User) => {
      // Atualizar dados do usuário
      setCurrentUser(updatedUser);
      queryClient.setQueryData(["/api/user"], updatedUser);
      
      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Verificar isAdmin e isColaborador
  const isAdmin = !!currentUser && currentUser.role === "admin";
  const isColaborador = !!currentUser && (currentUser.role === "colaborador" || currentUser.role === "admin");

  // Exportar contexto
  const contextValue: AuthContextType = {
    user: currentUser,
    isLoading,
    isAdmin,
    isColaborador,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
    updateProfileMutation,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthJWT() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthJWT deve ser usado dentro de um AuthProvider");
  }
  return context;
}