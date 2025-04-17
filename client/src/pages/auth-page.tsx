import React, { useState, useRef } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthJWT } from "@/hooks/useAuthJWT";
import { DroneIcon } from "@/components/DroneIcons";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Schema para validação de login
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

// Schema para validação de registro
const registerSchema = z.object({
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  displayName: z.string().optional(),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirm: z.string().min(6, "Confirme sua senha"),
  document: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  photoFile: z.instanceof(File).optional(),
}).refine((data) => data.password === data.confirm, {
  message: "As senhas não coincidem",
  path: ["confirm"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  // Determinar a aba inicial com base no URL
  const getInitialTab = () => {
    // Se acessado diretamente pela URL /login, default para "login"
    if (window.location.pathname === '/login') {
      return "login";
    }
    
    // Verificar se há um query parameter tab
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    return tabParam === "register" ? "register" : "login";
  };
  
  const [activeTab, setActiveTab] = useState<string>(getInitialTab());
  const [location, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuthJWT();

  // Redirecionar se já estiver autenticado
  React.useEffect(() => {
    if (user) {
      // Verificar se há parâmetros de redirecionamento na URL
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirect");
      
      // Se houver um parâmetro de redirecionamento e for para o site institucional admin
      if (redirectTo && redirectTo.includes('/institucional/admin')) {
        // Verificar se o usuário é admin antes de redirecionar
        if (user.role === 'admin') {
          window.location.href = redirectTo;
        } else {
          // Se não for admin, redirecionar para o dashboard com uma mensagem de erro
          alert('Acesso restrito: Somente administradores podem acessar o painel administrativo institucional.');
          setLocation("/app/dashboard");
        }
      } else {
        // Redirecionar para o novo layout App (comportamento padrão)
        setLocation("/app/dashboard");
      }
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Lado esquerdo - Formulários */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <DroneIcon className="h-12 w-12 mx-auto text-blue-600 mb-4" />
            <h1 className="text-2xl md:text-3xl font-inter font-bold text-aero-slate-800">
              Aéreo Visão
            </h1>
            <p className="text-aero-slate-600 mt-1">Portal do Piloto</p>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm onSuccess={() => setActiveTab("login")} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Lado direito - Banner/Hero */}
      <div className="hidden md:flex md:flex-1 bg-gradient-to-r from-blue-700 to-blue-500 relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508444845599-5c89863b1c44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative flex flex-col justify-center items-center text-white p-10">
          <h2 className="text-3xl font-bold mb-6">Bem-vindo ao Portal do Piloto</h2>
          <div className="space-y-6 max-w-lg">
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-blue-400 bg-opacity-30 flex items-center justify-center mr-4 mt-1">
                <i className="fas fa-check text-sm"></i>
              </div>
              <div>
                <h3 className="font-medium text-lg">Legislação Atualizada</h3>
                <p className="text-blue-100 mt-1">Acesse as regulamentações mais recentes para voo de drones.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-blue-400 bg-opacity-30 flex items-center justify-center mr-4 mt-1">
                <i className="fas fa-check text-sm"></i>
              </div>
              <div>
                <h3 className="font-medium text-lg">Atualizações de Firmware</h3>
                <p className="text-blue-100 mt-1">Mantenha seu drone atualizado com as últimas versões de firmware.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-blue-400 bg-opacity-30 flex items-center justify-center mr-4 mt-1">
                <i className="fas fa-check text-sm"></i>
              </div>
              <div>
                <h3 className="font-medium text-lg">Compartilhe Experiências</h3>
                <p className="text-blue-100 mt-1">Contribua com dicas e aprenda com outros pilotos da comunidade.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de formulário de login
function LoginForm() {
  const { loginMutation } = useAuthJWT();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Acesse sua conta para colaborar com o portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="seu.email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Componente de formulário de registro
function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const { registerMutation } = useAuthJWT();
  const [location, setLocation] = useLocation();
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      displayName: "",
      password: "",
      confirm: "",
      document: "",
      phone: "",
      address: "",
    },
  });
  
  // Referência para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      form.setValue("photoFile", file);
    }
  }

  function onSubmit(values: RegisterFormValues) {
    const { confirm, photoFile, ...registerData } = values;
    
    // Se houver um arquivo selecionado, usar FormData
    if (selectedFile) {
      // Criar FormData para envio multipart/form-data
      const formData = new FormData();
      
      // Adicionar todos os campos do formulário ao FormData
      Object.entries(registerData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });
      
      // Adicionar o arquivo com o nome esperado pelo servidor
      formData.append('photoFile', selectedFile);
      
      // Enviar formData para o servidor
      // Necessário cast de tipo pois o TypeScript não identifica FormData como parte do tipo RegisterData
      registerMutation.mutate(formData as any, {
        onSuccess
      });
    } else {
      // Não há arquivo, enviar dados normalmente como JSON
      registerMutation.mutate(registerData, {
        onSuccess
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastre-se</CardTitle>
        <CardDescription>
          Crie sua conta para colaborar com o portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de usuário</FormLabel>
                  <FormControl>
                    <Input placeholder="seunome123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="seu.email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone/WhatsApp (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço completo (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, número, complemento, bairro, cidade, estado, CEP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem className="space-y-2">
              <FormLabel>Foto de perfil (opcional)</FormLabel>
              <div className="flex items-center gap-4">
                {selectedFile && (
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-muted">
                    <img 
                      src={URL.createObjectURL(selectedFile)} 
                      alt="Preview da foto de perfil" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9"
                >
                  {selectedFile ? "Alterar foto" : "Selecionar foto"}
                </Button>
                {selectedFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 px-2 text-muted-foreground"
                    onClick={() => {
                      setSelectedFile(null);
                      form.setValue("photoFile", undefined);
                    }}
                  >
                    Remover
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <FormMessage />
            </FormItem>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirme sua senha</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}