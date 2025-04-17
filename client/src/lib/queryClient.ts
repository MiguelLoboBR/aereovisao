import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Função auxiliar para obter o token JWT do localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Função auxiliar para salvar o token JWT no localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Função auxiliar para remover o token JWT do localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorText;
    try {
      // Tentar analisar como JSON primeiro
      const errorData = await res.json();
      errorText = errorData.message || JSON.stringify(errorData);
    } catch (e) {
      // Se não for JSON, usar o texto bruto
      errorText = await res.text() || res.statusText;
    }
    
    console.error(`Erro na requisição ${res.url}: ${res.status} - ${errorText}`);
    throw new Error(`${res.status}: ${errorText}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: {
    formData?: boolean;
    headers?: Record<string, string>;
    skipAuth?: boolean;
  }
): Promise<Response> {
  const isFormData = options?.formData || data instanceof FormData;
  
  const headers: Record<string, string> = {
    "Accept": "application/json",
    ...(options?.headers || {}),
  };
  
  // Não definir Content-Type para FormData, o navegador cuida disso com o boundary correto
  if (!isFormData && data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Adicionar token JWT no header Authorization se disponível e não estiver explicitamente ignorando autenticação
  const token = getAuthToken();
  if (token && !options?.skipAuth) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const body = isFormData 
    ? data as FormData 
    : data 
      ? JSON.stringify(data) 
      : undefined;
  
  // Usar window.location.origin para obter a URL base
  const baseUrl = window.location.origin;
  const fullUrl = url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  
  console.log(`Enviando ${method} para ${fullUrl} com token: ${token ? 'Presente' : 'Ausente'}`);
  console.log(`Headers: ${JSON.stringify(headers)}`);
  
  try {
    const res = await fetch(fullUrl, {
      method,
      headers,
      body,
      credentials: 'include', // Use credentials: include para permitir cookies e auth entre domínios
      cache: 'no-cache', // Evitar problemas de cache
      mode: 'cors' // Garantir modo CORS
    });

    // Se for um erro 401 e estamos em uma operação de login/registro, não precisamos remover o token
    if (res.status === 401 && !url.includes('/login') && !url.includes('/register')) {
      console.warn('Recebeu 401 em uma rota autenticada, possível token expirado');
    }

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`Erro na operação ${method} para ${fullUrl}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {
      "Accept": "application/json",
      "Content-Type": "application/json"
    };
    
    // Adicionar token JWT no header Authorization se disponível
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  
    try {
      // Usar window.location.origin para obter a URL base
      const baseUrl = window.location.origin;
      const url = queryKey[0] as string;
      const fullUrl = url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
      
      console.log(`Fazendo requisição para ${fullUrl} com token: ${token ? 'Presente' : 'Ausente'}`);
      
      const res = await fetch(fullUrl, {
        headers,
        credentials: 'include', // Use credentials: include para permitir cookies e auth entre domínios
        cache: 'no-cache', // Evitar problemas de cache
        mode: 'cors' // Garantir modo CORS
      });
  
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log("Status 401 recebido, retornando null conforme configurado");
        return null;
      }
  
      await throwIfResNotOk(res);
      const data = await res.json();
      return data;
    } catch (error) {
      const baseUrl = window.location.origin;
      const url = queryKey[0] as string;
      const errorUrl = url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
      console.error(`Erro na requisição para ${errorUrl}:`, error);
      if (error instanceof Error && error.message.includes("401") && unauthorizedBehavior === "returnNull") {
        console.log("Erro 401 capturado, retornando null");
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
