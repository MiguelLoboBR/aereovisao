import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient
} from "@tanstack/react-query";
import { User as DbUser } from "@shared/schema";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  auth,
  loginWithEmailAndPassword,
  logoutUser,
  registerWithEmailAndPassword,
  onAuthStateChange,
  updateUserProfile,
  uploadProfilePicture
} from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";

// Tipos
type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
  username: string;
  displayName?: string;
  document?: string;
  phone?: string;
};

type UpdateProfileData = {
  displayName?: string;
  phone?: string;
  document?: string;
  photoFile?: File;
};

type AuthContextType = {
  firebaseUser: FirebaseUser | null;
  user: DbUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  isColaborador: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<DbUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<DbUser, Error, RegisterData>;
  updateProfileMutation: UseMutationResult<DbUser, Error, UpdateProfileData>;
};

// Criando o contexto com valor padrão
const AuthContext = createContext<AuthContextType | null>(null);

// Provider Component
function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loadingFirebase, setLoadingFirebase] = useState(true);

  // Monitorar estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setFirebaseUser(user);
      setLoadingFirebase(false);
    });

    return () => unsubscribe();
  }, []);

  // Buscar dados do usuário no backend
  const {
    data: user = null,
    error,
    isLoading: isLoadingUser,
  } = useQuery<DbUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !loadingFirebase,
  });

  // Controle de permissões
  const isLoading = loadingFirebase || isLoadingUser;
  const isAdmin = user?.role === 'admin';
  const isColaborador = user?.role === 'colaborador' || isAdmin;

  // Mutação para login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // 1. Login com Firebase
      await loginWithEmailAndPassword(credentials.email, credentials.password);
      
      // 2. Buscar dados do usuário no backend
      const res = await apiRequest("POST", "/api/login");
      return await res.json();
    },
    onSuccess: (dbUser: DbUser) => {
      queryClient.setQueryData(["/api/user"], dbUser);
      toast({
        title: "Login realizado",
        description: `Bem-vindo, ${dbUser.displayName || dbUser.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no login",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para registro
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      // 1. Registrar no Firebase
      const userCredential = await registerWithEmailAndPassword(
        data.email, 
        data.password
      );
      
      // 2. Atualizar perfil no Firebase se tiver displayName
      if (data.displayName) {
        await updateUserProfile(data.displayName, null);
      }
      
      // 3. Persistir no nosso banco de dados
      const userData = {
        uid: userCredential.user.uid,
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        document: data.document,
        phone: data.phone
      };
      
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (dbUser: DbUser) => {
      queryClient.setQueryData(["/api/user"], dbUser);
      toast({
        title: "Cadastro realizado!",
        description: "Sua conta foi criada com sucesso.",
      });
    },
    onError: (error: Error) => {
      // Fazer logout do Firebase se a sincronização com o backend falhar
      logoutUser().catch(console.error);
      
      toast({
        title: "Falha no cadastro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // 1. Logout no Firebase
      await logoutUser();
      // 2. Logout no backend
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logout realizado",
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

  // Mutação para atualização de perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      if (!firebaseUser) throw new Error("Usuário não autenticado");
      
      let photoURL: string | undefined;
      
      // 1. Fazer upload da foto se existir
      if (data.photoFile) {
        photoURL = await uploadProfilePicture(data.photoFile, firebaseUser.uid);
        // Atualizar foto no Firebase
        await updateUserProfile(undefined, photoURL);
      }
      
      // 2. Atualizar nome de exibição no Firebase
      if (data.displayName) {
        await updateUserProfile(data.displayName, undefined);
      }
      
      // 3. Atualizar no backend
      const updateData = {
        ...data,
        photoURL,
      };
      
      const res = await apiRequest("POST", "/api/user/profile", updateData);
      return await res.json();
    },
    onSuccess: (updatedUser: DbUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha na atualização",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Construir o valor do contexto
  const contextValue: AuthContextType = {
    firebaseUser,
    user,
    isLoading,
    isAdmin,
    isColaborador,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
    updateProfileMutation,
  };

  // Retornar o provider com o valor do contexto
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para utilizar o contexto
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}

// Exportar provider e hook
export { AuthProvider, useAuth, AuthContext };