import { useState } from "react";
import Layout from "@/components/Layout";
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
import { Loader2, Eye, Check, X, UserCheck, Edit, User } from "lucide-react";

// Dados de exemplo
const exemploTips = [
  {
    id: 1,
    title: "Como calibrar sua bússola",
    author: { username: "joaopiloto" },
    category: "Manutenção",
    createdAt: "2025-04-01",
    status: "pendente",
    content: "Para garantir voos precisos, a calibração da bússola é essencial. Siga estes passos:\n\n1. Encontre uma área livre de interferência magnética\n2. Inicie a calibração no aplicativo\n3. Gire o drone horizontalmente 360°\n4. Gire o drone verticalmente 360°\n5. Aguarde a confirmação de calibração bem-sucedida",
    image: "https://i.imgur.com/example1.jpg",
  },
  {
    id: 2,
    title: "Dicas para fotos aéreas perfeitas",
    author: { username: "mariafotografa" },
    category: "Fotografia",
    createdAt: "2025-03-28",
    status: "aprovada",
    content: "Para conseguir fotos aéreas impressionantes:\n\n• Fotografe durante a hora dourada (nascer/pôr do sol)\n• Use configurações de ISO baixo para reduzir ruído\n• Fotografe no formato RAW para maior flexibilidade na edição\n• Utilize o modo AEB (Auto Exposure Bracketing) para cenas de alto contraste\n• Considere usar filtros ND para controlar a velocidade do obturador",
    image: "https://i.imgur.com/example2.jpg",
  },
  {
    id: 3,
    title: "Preparação para voos em dias ventosos",
    author: { username: "carlospro" },
    category: "Segurança",
    createdAt: "2025-04-03",
    status: "rejeitada",
    content: "Voar em dias ventosos requer cuidados extras:\n\n1. Verifique a previsão do tempo antes de sair\n2. Não voe se a velocidade do vento exceder 70% do limite máximo do seu drone\n3. Tenha mais bateria do que o normal, pois o vento aumenta o consumo\n4. Mantenha o drone contra o vento ao retornar para o ponto inicial\n5. Use o modo esporte para maior estabilidade em ventos fortes",
  },
];

const exemploUsers = [
  {
    id: 1,
    username: "joaopiloto",
    displayName: "João Piloto",
    email: "joao@exemplo.com.br",
    role: "usuario",
  },
  {
    id: 2,
    username: "mariafotografa",
    displayName: "Maria Silva",
    email: "maria@exemplo.com.br",
    role: "colaborador",
  },
  {
    id: 3,
    username: "carlospro",
    displayName: "Carlos Drone",
    email: "carlos@exemplo.com.br",
    role: "admin",
  },
];

const exemploSettings = {
  pixKey: "12345678901",
  pixName: "Associação de Pilotos de Drones",
  pixBank: "Banco do Brasil",
  paypalUrl: "https://paypal.me/pilotosdrone",
  cardUrl: "https://pagseguro.com.br/pilotosdrone",
};

// Componente TipsManagement para gerenciar dicas
function TipsManagement() {
  const [selectedTip, setSelectedTip] = useState<any>(null);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [tips, setTips] = useState(exemploTips);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filtrar dicas conforme status selecionado
  const filteredTips = filter 
    ? tips.filter(tip => tip.status === filter) 
    : tips;
  
  // Simulação da mutação para aprovar/rejeitar dicas
  const updateTipStatus = ({ id, status }: { id: number, status: string }) => {
    setIsLoading(true);
    
    // Simular tempo de processamento
    setTimeout(() => {
      const updatedTips = tips.map(tip => 
        tip.id === id ? { ...tip, status } : tip
      );
      setTips(updatedTips);
      setSelectedTip(null);
      setIsLoading(false);
    }, 800);
  };
  
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
        
        <select 
          className="border p-2 rounded" 
          value={filter || ''} 
          onChange={(e) => setFilter(e.target.value || undefined)}
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendentes</option>
          <option value="aprovada">Aprovadas</option>
          <option value="rejeitada">Rejeitadas</option>
        </select>
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
                    {filteredTips.length === 0 
                      ? "Nenhuma dica encontrada" 
                      : `Total de ${filteredTips.length} dicas`}
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
                    {filteredTips.map((tip: any) => (
                      <TableRow key={tip.id}>
                        <TableCell className="font-medium">{tip.title}</TableCell>
                        <TableCell>{tip.author?.username || "Usuário"}</TableCell>
                        <TableCell>{tip.category || "-"}</TableCell>
                        <TableCell>{formatDate(tip.createdAt)}</TableCell>
                        <TableCell>
                          <Badge className={statusInfo[tip.status as keyof typeof statusInfo]?.color}>
                            {statusInfo[tip.status as keyof typeof statusInfo]?.text}
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
                      Status: <Badge className={statusInfo[selectedTip.status as keyof typeof statusInfo]?.color}>
                        {statusInfo[selectedTip.status as keyof typeof statusInfo]?.text}
                      </Badge>
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTip.image && (
                    <div className="rounded-md overflow-hidden">
                      <div 
                        className="w-full h-40 bg-gray-200 flex items-center justify-center"
                      >
                        <span className="text-gray-500">[Imagem do tip]</span>
                      </div>
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
                        onClick={() => updateTipStatus({ 
                          id: selectedTip.id, 
                          status: 'rejeitada' 
                        })}
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                      <Button 
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => updateTipStatus({ 
                          id: selectedTip.id, 
                          status: 'aprovada' 
                        })}
                        disabled={isLoading}
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
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState(exemploUsers);
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulação da mutação para alterar o nível de usuário
  const updateUserRole = ({ id, role }: { id: number, role: string }) => {
    setIsLoading(true);
    
    // Simular tempo de processamento
    setTimeout(() => {
      const updatedUsers = users.map(user => 
        user.id === id ? { ...user, role } : user
      );
      setUsers(updatedUsers);
      setSelectedUser(null);
      setIsLoading(false);
    }, 800);
  };
  
  // Cores e ícones para cada nível de usuário
  const roleInfo = {
    usuario: { color: "bg-blue-500", icon: <User className="w-4 h-4 mr-2" />, text: "Usuário" },
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
                    {users.length === 0 
                      ? "Nenhum usuário encontrado" 
                      : `Total de ${users.length} usuários`}
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
                    {users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.displayName || user.username}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={roleInfo[user.role as keyof typeof roleInfo]?.color}>
                            {roleInfo[user.role as keyof typeof roleInfo]?.text}
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
                      <Badge className={roleInfo[selectedUser.role as keyof typeof roleInfo]?.color}>
                        {roleInfo[selectedUser.role as keyof typeof roleInfo]?.text}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Novo nível</label>
                    <select
                      className="w-full border p-2 rounded"
                      defaultValue={selectedUser.role}
                      onChange={(e) => updateUserRole({
                        id: selectedUser.id,
                        role: e.target.value
                      })}
                    >
                      <option value="usuario">Usuário</option>
                      <option value="colaborador">Colaborador</option>
                      <option value="admin">Administrador</option>
                    </select>
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
  const [formData, setFormData] = useState<any>(exemploSettings);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular tempo de processamento
    setTimeout(() => {
      setIsLoading(false);
      alert("Configurações atualizadas com sucesso!");
    }, 800);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium">Configurações do Portal</h2>
      
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
                disabled={isLoading}
              >
                {isLoading ? (
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
    </div>
  );
}

// Página principal de administração
export default function AdminSimples() {
  return (
    <Layout>
      <section className="py-8 px-4 md:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-aero-slate-800">
              Painel de Administração (Demonstração)
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