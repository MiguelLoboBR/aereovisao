import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, Link } from "react-router-dom";
import { useAuthJWT } from "@/hooks/useAuthJWT";
import { AlertCircle, UserCog, FileText, Handshake, Settings, DollarSign, Cpu } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

import PostManager from "@/pages/admin/PostManager";
import AdminUsuarios from "@/pages/admin/AdminUsuarios";
import SponsorManager from "@/pages/admin/SponsorManager";


const AdminPanel: React.FC = () => {
  const { user, isAdmin, isColaborador } = useAuthJWT();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("gerenciar-posts");
  const { toast } = useToast();
  
  // Estados para configurações de doação
  const [donationConfig, setDonationConfig] = useState({
    pixKey: "",
    pixName: "",
    pixBank: "",
    paypalUrl: "",
    cardUrl: "",
    customDonationMethods: "[]"
  });
  
  // Estado para novo método de doação personalizado
  const [newDonationMethod, setNewDonationMethod] = useState({
    name: "",
    description: "",
    url: "",
    icon: "fas fa-money-bill",
    color: "#6366F1"
  });
  
  // Métodos de doação personalizados parseados
  const [customMethods, setCustomMethods] = useState<any[]>([]);

  // Carregar configurações de doação
  const { data: donationData, isLoading: isDonationLoading } = useQuery({
    queryKey: ['/api/donation-info'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/donation-info');
      return res.json();
    },
    enabled: !!user && isAdmin,
  });

  // Atualizar o estado local quando os dados são carregados
  useEffect(() => {
    if (donationData) {
      const config = {
        pixKey: donationData.pixKey || "",
        pixName: donationData.pixName || "",
        pixBank: donationData.pixBank || "",
        paypalUrl: donationData.paypalUrl || "",
        cardUrl: donationData.cardUrl || "",
        customDonationMethods: donationData.customDonationMethods || "[]"
      };
      
      setDonationConfig(config);
      
      // Parse os métodos de doação personalizados
      try {
        const methods = typeof donationData.customDonationMethods === 'string'
          ? JSON.parse(donationData.customDonationMethods)
          : donationData.customDonationMethods || [];
        setCustomMethods(Array.isArray(methods) ? methods : []);
      } catch (err) {
        console.error("Erro ao analisar métodos de doação personalizados:", err);
        setCustomMethods([]);
      }
    }
  }, [donationData]);

  // Mutation para salvar configurações de doação
  const updateDonationMutation = useMutation({
    mutationFn: async (data: typeof donationConfig) => {
      const res = await apiRequest('POST', '/api/donation-info', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações de doação foram atualizadas com sucesso",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/donation-info'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar as configurações",
        variant: "destructive",
      });
    }
  });

  // Manipular mudanças nos campos de configuração
  const handleDonationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDonationConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manipular mudanças nos campos do novo método de doação
  const handleNewMethodChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDonationMethod(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Adicionar novo método de doação
  const handleAddMethod = () => {
    if (!newDonationMethod.name || !newDonationMethod.url) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome do método e URL são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const newMethod = {
      ...newDonationMethod,
      id: Date.now().toString()
    };

    const updatedMethods = [...customMethods, newMethod];
    setCustomMethods(updatedMethods);
    
    // Atualizar o donationConfig com os métodos atualizados
    setDonationConfig(prev => ({
      ...prev,
      customDonationMethods: JSON.stringify(updatedMethods)
    }));

    // Limpar o formulário
    setNewDonationMethod({
      name: "",
      description: "",
      url: "",
      icon: "fas fa-money-bill",
      color: "#6366F1"
    });

    toast({
      title: "Método adicionado",
      description: `O método de doação "${newMethod.name}" foi adicionado com sucesso`,
    });
  };

  // Remover método de doação
  const handleRemoveMethod = (id: string) => {
    const updatedMethods = customMethods.filter(method => method.id !== id);
    setCustomMethods(updatedMethods);
    
    // Atualizar o donationConfig com os métodos atualizados
    setDonationConfig(prev => ({
      ...prev,
      customDonationMethods: JSON.stringify(updatedMethods)
    }));

    toast({
      title: "Método removido",
      description: "O método de doação foi removido com sucesso",
    });
  };

  // Salvar configurações de doação
  const handleSaveDonationConfig = () => {
    updateDonationMutation.mutate(donationConfig);
  };

  // Redirecionar se não tiver permissão
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!isColaborador && !isAdmin) {
      navigate("/app/dashboard");
    }
  }, [user, isAdmin, isColaborador, navigate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Verificar se usuário tem permissão mínima de colaborador
  if (!isColaborador && !isAdmin) {
    return (
      <div className="container mx-auto p-8 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p className="mb-6">Você não tem permissão para acessar esta área.</p>
        <Link 
          to="/app/dashboard" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Voltar para o Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center mb-8">
        <div className="bg-blue-50 p-3 rounded-full mr-4">
          <Settings className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <p className="text-slate-500">
            {isAdmin ? "Acesso de Administrador" : "Acesso de Colaborador"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="border-b w-full justify-start rounded-none px-6 bg-slate-50">
            <TabsTrigger 
              value="gerenciar-posts"
              className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-t-lg py-3"
            >
              <FileText className="h-4 w-4 mr-2" />
              <span>Gerenciar Posts</span>
            </TabsTrigger>

            {isAdmin && (
              <>
                <TabsTrigger 
                  value="gerenciar-usuarios" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-t-lg py-3"
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  <span>Gerenciar Usuários</span>
                </TabsTrigger>

                <TabsTrigger 
                  value="gerenciar-patrocinadores" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-t-lg py-3"
                >
                  <Handshake className="h-4 w-4 mr-2" />
                  <span>Gerenciar Patrocinadores</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="configurar-doacoes" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-t-lg py-3"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span>Config. Doações</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="configurar-ia" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-t-lg py-3"
                >
                  <Cpu className="h-4 w-4 mr-2" />
                  <span>Config. IA</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="gerenciar-posts" className="p-0 border-0">
            <PostManager />
          </TabsContent>

          {isAdmin && (
            <>
              <TabsContent value="gerenciar-usuarios" className="p-0 border-0">
                <AdminUsuarios />
              </TabsContent>

              <TabsContent value="gerenciar-patrocinadores" className="p-0 border-0">
                <SponsorManager />
              </TabsContent>
              
              <TabsContent value="configurar-doacoes" className="p-6 border-0">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-xl font-semibold mb-6">Configurações de Métodos de Doação</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-3">PIX</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="pixKey" className="block text-sm font-medium">Chave PIX</label>
                          <input
                            type="text"
                            id="pixKey"
                            name="pixKey"
                            value={donationConfig.pixKey}
                            onChange={handleDonationInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="pixName" className="block text-sm font-medium">Nome do Destinatário</label>
                          <input
                            type="text"
                            id="pixName"
                            name="pixName"
                            value={donationConfig.pixName}
                            onChange={handleDonationInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="pixBank" className="block text-sm font-medium">Banco</label>
                          <input
                            type="text"
                            id="pixBank"
                            name="pixBank"
                            value={donationConfig.pixBank}
                            onChange={handleDonationInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-3">PayPal</h3>
                      <div className="space-y-2">
                        <label htmlFor="paypalUrl" className="block text-sm font-medium">URL do PayPal</label>
                        <input
                          type="text"
                          id="paypalUrl"
                          name="paypalUrl"
                          value={donationConfig.paypalUrl}
                          onChange={handleDonationInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="https://www.paypal.com/donate/..."
                        />
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-3">Cartão de Crédito</h3>
                      <div className="space-y-2">
                        <label htmlFor="cardUrl" className="block text-sm font-medium">URL para Pagamento</label>
                        <input
                          type="text"
                          id="cardUrl"
                          name="cardUrl"
                          value={donationConfig.cardUrl}
                          onChange={handleDonationInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="https://exemplo.com/pagamento"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-3">Métodos de Doação Personalizados</h3>
                      
                      {/* Lista de métodos personalizados */}
                      {customMethods.length > 0 ? (
                        <div className="mb-6 space-y-3">
                          <p className="text-sm text-gray-500 mb-2">
                            Métodos de doação personalizados atualmente configurados:
                          </p>
                          
                          {customMethods.map((method) => (
                            <div 
                              key={method.id} 
                              className="bg-white rounded-lg p-3 border border-green-100 flex justify-between items-center"
                            >
                              <div className="flex items-center">
                                <i className={`${method.icon} mr-2`} style={{ color: method.color }}></i>
                                <div>
                                  <h4 className="font-medium">{method.name}</h4>
                                  {method.description && <p className="text-sm text-gray-500">{method.description}</p>}
                                </div>
                              </div>
                              <button 
                                onClick={() => handleRemoveMethod(method.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic mb-4">Nenhum método personalizado adicionado.</p>
                      )}
                      
                      {/* Formulário para adicionar novo método */}
                      <div className="border border-green-200 rounded-lg p-4 bg-white">
                        <h4 className="font-medium mb-3">Adicionar Novo Método de Doação</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium">Nome do Método <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={newDonationMethod.name}
                              onChange={handleNewMethodChange}
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                              placeholder="Ex: Mercado Pago"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="url" className="block text-sm font-medium">URL para Doação <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              id="url"
                              name="url"
                              value={newDonationMethod.url}
                              onChange={handleNewMethodChange}
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                              placeholder="https://exemplo.com/link-da-doacao"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="icon" className="block text-sm font-medium">Ícone (Classes do FontAwesome)</label>
                            <input
                              type="text"
                              id="icon"
                              name="icon"
                              value={newDonationMethod.icon}
                              onChange={handleNewMethodChange}
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                              placeholder="fas fa-money-bill"
                            />
                            <p className="text-xs text-gray-500">Ex: fas fa-money-bill, fab fa-bitcoin, etc.</p>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="color" className="block text-sm font-medium">Cor (código hexadecimal)</label>
                            <div className="flex space-x-2">
                              <input
                                type="color"
                                id="color"
                                name="color"
                                value={newDonationMethod.color}
                                onChange={handleNewMethodChange}
                                className="h-10 w-10 p-0 border rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                name="color"
                                value={newDonationMethod.color}
                                onChange={handleNewMethodChange}
                                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder="#6366F1"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium">Descrição</label>
                            <textarea
                              id="description"
                              name="description"
                              value={newDonationMethod.description}
                              onChange={handleNewMethodChange}
                              rows={2}
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
                              placeholder="Breve descrição opcional deste método de pagamento"
                            ></textarea>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            onClick={handleAddMethod}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          >
                            <i className="fas fa-plus mr-1"></i> Adicionar Método
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={handleSaveDonationConfig}
                        disabled={updateDonationMutation.isPending}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updateDonationMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="configurar-ia" className="p-0 border-0">
                <div className="p-4 bg-blue-50 mb-2 rounded-lg mx-4 mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Cpu className="h-5 w-5 text-blue-500 mr-2" />
                    <div>
                      <h3 className="font-medium">Versão alternativa da configuração</h3>
                      <p className="text-sm text-slate-500">Abra a versão sem menu lateral para uma melhor experiência</p>
                    </div>
                  </div>
                  <a 
                    href="/admin/ia-simples"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Abrir versão sem menu lateral
                  </a>
                </div>
                <div className="text-center p-8">
                  <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Configuração de Inteligência Artificial</h3>
                    <p className="text-slate-600 mb-6">
                      Acesse a interface completa de configuração da IA usando o link abaixo
                    </p>
                    <a 
                      href="/app/admin/config-ia" 
                      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition inline-flex items-center mx-auto"
                    >
                      Acessar Configuração da IA
                    </a>
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;