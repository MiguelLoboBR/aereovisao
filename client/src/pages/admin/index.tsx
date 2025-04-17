import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthJWT as useAuth } from "@/hooks/useAuthJWT";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Tip, User as UserType, Settings } from "@shared/schema";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Eye, Check, X, UserCheck, Edit, User as UserIcon } from "lucide-react";

// Componente TipsManagement para gerenciar dicas
function TipsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTip, setSelectedTip] = useState<any>(null);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  
  // Buscar todas as dicas como colaborador/admin
  const { data: tips = [], isLoading } = useQuery({
    queryKey: ["/api/colaborador/tips", filter],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Mutação para aprovar/rejeitar dicas
  const updateTipStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/colaborador/tips/${id}/status`,
        { status }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/colaborador/tips"] });
      toast({
        title: "Status atualizado",
        description: "O status da dica foi atualizado com sucesso.",
      });
      setSelectedTip(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Cores e textos para cada status
  const statusInfo = {
    pendente: { color: "bg-yellow-500", text: "Pendente" },
    aprovada: { color: "bg-green-500", text: "Aprovada" },
    rejeitada: { color: "bg-red-500", text: "Rejeitada" },
  };
  
  // Formatação da data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Gerenciamento de Dicas</h2>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={undefined}>Todos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="aprovada">Aprovadas</SelectItem>
            <SelectItem value="rejeitada">Rejeitadas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-aero-slate-400" />
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Lista de dicas */}
          <div className="flex-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Dicas e tutoriais</CardTitle>
                <CardDescription>
                  Gerencie as dicas enviadas pelos usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>
                    {tips?.length === 0 
                      ? "Nenhuma dica encontrada" 
                      : `Total de ${tips?.length} dicas`}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Autor</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tips?.map((tip: any) => (
                      <TableRow key={tip.id}>
                        <TableCell className="font-medium">{tip.title}</TableCell>
                        <TableCell>{tip.author?.username || "Usuário"}</TableCell>
                        <TableCell>{tip.category || "-"}</TableCell>
                        <TableCell>{formatDate(tip.createdAt)}</TableCell>
                        <TableCell>
                          <Badge className={statusInfo[tip.status]?.color}>
                            {statusInfo[tip.status]?.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedTip(tip)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          {/* Detalhe da dica selecionada */}
          {selectedTip && (
            <div className="w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedTip.title}</CardTitle>
                  <CardDescription className="flex flex-col gap-1">
                    <span>
                      Enviado por <strong>{selectedTip.author?.username}</strong>
                    </span>
                    <span>
                      Status: <Badge className={statusInfo[selectedTip.status]?.color}>
                        {statusInfo[selectedTip.status]?.text}
                      </Badge>
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTip.image && (
                    <div className="rounded-md overflow-hidden">
                      <img 
                        src={selectedTip.image} 
                        alt={selectedTip.title} 
                        className="w-full object-cover h-40"
                      />
                    </div>
                  )}
                  
                  <div className="rounded-md bg-aero-slate-50 p-4">
                    <p className="whitespace-pre-wrap">{selectedTip.content}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 justify-end">
                  {selectedTip.status === 'pendente' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => updateTipStatusMutation.mutate({ 
                          id: selectedTip.id, 
                          status: 'rejeitada' 
                        })}
                        disabled={updateTipStatusMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                      <Button 
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => updateTipStatusMutation.mutate({ 
                          id: selectedTip.id, 
                          status: 'aprovada' 
                        })}
                        disabled={updateTipStatusMutation.isPending}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                    </>
                  )}
                  {(selectedTip.status === 'aprovada' || selectedTip.status === 'rejeitada') && (
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedTip(null)}
                    >
                      Fechar
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente UsersManagement para gerenciar usuários
function UsersManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Buscar todos os usuários
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Mutação para alterar o nível de usuário
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number, role: string }) => {
      const res = await apiRequest(
        "POST",
        `/api/admin/users/${id}/role`,
        { role }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Nível de usuário atualizado",
        description: "O nível do usuário foi alterado com sucesso.",
      });
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar nível",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Cores e ícones para cada nível de usuário
  const roleInfo = {
    usuario: { color: "bg-blue-500", icon: <UserIcon className="w-4 h-4 mr-2" />, text: "Usuário" },
    colaborador: { color: "bg-amber-500", icon: <UserCheck className="w-4 h-4 mr-2" />, text: "Colaborador" },
    admin: { color: "bg-red-500", icon: <Edit className="w-4 h-4 mr-2" />, text: "Administrador" },
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium">Gerenciamento de Usuários</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-aero-slate-400" />
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Lista de usuários */}
          <div className="flex-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Usuários</CardTitle>
                <CardDescription>
                  Gerencie os níveis de acesso dos usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>
                    {users?.length === 0 
                      ? "Nenhum usuário encontrado" 
                      : `Total de ${users?.length} usuários`}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.displayName || user.username}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={roleInfo[user.role]?.color}>
                            {roleInfo[user.role]?.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          {/* Edição do usuário selecionado */}
          {selectedUser && (
            <div className="w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>Editar Nível de Acesso</CardTitle>
                  <CardDescription>
                    {selectedUser.displayName || selectedUser.username}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Email</label>
                    <Input value={selectedUser.email} disabled />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Nível atual</label>
                    <div>
                      <Badge className={roleInfo[selectedUser.role]?.color}>
                        {roleInfo[selectedUser.role]?.text}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Novo nível</label>
                    <Select 
                      defaultValue={selectedUser.role}
                      onValueChange={(value) => updateUserRoleMutation.mutate({
                        id: selectedUser.id,
                        role: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usuario">Usuário</SelectItem>
                        <SelectItem value="colaborador">Colaborador</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedUser(null)}
                  >
                    Cancelar
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente SettingsManagement para gerenciar configurações
function SettingsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Buscar configurações
  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Mutação para atualizar configurações
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest(
        "POST",
        "/api/admin/settings",
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Configurações atualizadas",
        description: "As configurações do portal foram atualizadas com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar configurações",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Formulário de configurações
  const [formData, setFormData] = useState<any>({
    pixKey: "",
    pixName: "",
    pixBank: "",
    paypalUrl: "",
    cardUrl: "",
  });
  
  // Atualizar formulário quando as configurações forem carregadas
  useEffect(() => {
    if (settings) {
      setFormData({
        pixKey: settings.pixKey || "",
        pixName: settings.pixName || "",
        pixBank: settings.pixBank || "",
        paypalUrl: settings.paypalUrl || "",
        cardUrl: settings.cardUrl || "",
      });
    }
  }, [settings]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium">Configurações do Portal</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-aero-slate-400" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Doação</CardTitle>
            <CardDescription>
              Configure as informações para recebimento de doações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Configurações de PIX */}
                <fieldset className="space-y-4 border rounded-lg p-4">
                  <legend className="text-sm font-medium px-2">Configurações de PIX</legend>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chave PIX</label>
                    <Input 
                      name="pixKey" 
                      value={formData.pixKey}
                      onChange={handleChange}
                      placeholder="CPF, CNPJ, Email ou Chave aleatória"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome do recebedor</label>
                    <Input 
                      name="pixName" 
                      value={formData.pixName}
                      onChange={handleChange}
                      placeholder="Nome que aparecerá para o doador"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Banco</label>
                    <Input 
                      name="pixBank" 
                      value={formData.pixBank}
                      onChange={handleChange}
                      placeholder="Nome do banco"
                    />
                  </div>
                </fieldset>
                
                {/* Outras formas de pagamento */}
                <fieldset className="space-y-4 border rounded-lg p-4">
                  <legend className="text-sm font-medium px-2">Outras formas de pagamento</legend>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL do PayPal</label>
                    <Input 
                      name="paypalUrl" 
                      value={formData.paypalUrl}
                      onChange={handleChange}
                      placeholder="https://paypal.me/seuperfil"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL de pagamento por cartão</label>
                    <Input 
                      name="cardUrl" 
                      value={formData.cardUrl}
                      onChange={handleChange}
                      placeholder="URL para pagamento por cartão"
                    />
                    <p className="text-xs text-aero-slate-500">
                      Ex: link do PagSeguro, Mercado Pago, etc.
                    </p>
                  </div>
                </fieldset>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button 
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar configurações"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Página principal de administração
export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  
  return (
    <Layout>
      <section className="py-8 px-4 md:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-aero-slate-800">
              Painel de Administração
            </h1>
            <p className="text-aero-slate-600 mt-2">
              Gerencie o conteúdo e usuários do Portal do Piloto
            </p>
          </header>
          
          <Tabs defaultValue="dicas" className="bg-white rounded-lg shadow-md">
            <TabsList className="w-full p-1 bg-aero-slate-100 rounded-t-lg">
              <TabsTrigger value="dicas" className="text-base">
                Dicas e Tutoriais
              </TabsTrigger>
              <TabsTrigger value="usuarios" className="text-base">
                Usuários
              </TabsTrigger>
              <TabsTrigger value="config" className="text-base">
                Configurações
              </TabsTrigger>
            </TabsList>
            
            <div className="p-6">
              <TabsContent value="dicas" className="mt-0">
                <TipsManagement />
              </TabsContent>
              
              <TabsContent value="usuarios" className="mt-0">
                <UsersManagement />
              </TabsContent>
              
              <TabsContent value="config" className="mt-0">
                <SettingsManagement />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}