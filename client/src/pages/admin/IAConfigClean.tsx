import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthJWT } from "@/hooks/useAuthJWT";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CleanLayout from "@/components/CleanLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Cpu, Info, User, Settings, Clock, RefreshCw, Save, CheckCircle, Zap, Play } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ConfigIA } from "@shared/schema";

const IAConfigClean: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthJWT();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("geral");
  const [formState, setFormState] = useState<Partial<ConfigIA>>({});
  const [iaUser, setIaUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Buscar a configuração atual da IA
  const { data: configData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/ia-config'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/ia-config');
      return res.json();
    },
    enabled: !!user && isAdmin,
  });

  // Buscar detalhes do usuário da IA
  const { data: iaUserData } = useQuery({
    queryKey: ['/api/users/find-by-email'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/users/find-by-email?email=ia@aereovisao.com.br');
      return res.json();
    },
    enabled: !!user && isAdmin,
  });

  // Configurar estado do formulário
  useEffect(() => {
    if (configData) {
      // Ajustar os valores para os tipos de dados corretos
      const config = {
        ...configData,
        ativar: configData.ativar || false,
        maxPostsPorDia: Number(configData.maxPostsPorDia || 1),
        frequencia: Number(configData.frequencia || 7),
        temperatura: Number(configData.temperatura || 0.7),
        categoriasAtivas: typeof configData.categoriasAtivas === 'string' 
          ? (configData.categoriasAtivas.includes('[') 
              ? JSON.parse(configData.categoriasAtivas) 
              : configData.categoriasAtivas.split(',').map(c => c.trim()).filter(c => c)
            )
          : configData.categoriasAtivas || []
      };
      
      setFormState(config);
    }
  }, [configData]);

  // Configurar usuário da IA
  useEffect(() => {
    if (iaUserData) {
      setIaUser(iaUserData);
    }
  }, [iaUserData]);

  // Mutation para atualizar a configuração
  const updateConfigMutation = useMutation({
    mutationFn: async (data: Partial<ConfigIA>) => {
      const res = await apiRequest('PUT', '/api/admin/ia-config', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações da IA foram atualizadas com sucesso",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ia-config'] });
      setSaving(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar as configurações",
        variant: "destructive",
      });
      setSaving(false);
    }
  });
  
  // Mutation para gerar conteúdo manualmente
  const generateContentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/ia-generate', {
        model: formState.modelo || 'gpt-4o',
        temperature: formState.temperatura || 0.7,
        topics: formState.topicosPrincipais || 'drones, legislação, firmware, novidades',
        instructions: formState.instrucoes || 'Crie um artigo informativo sobre drones para o portal Aéreo Visão.'
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Conteúdo gerado com sucesso",
        description: "O post foi criado e publicado automaticamente",
        variant: "default",
      });
      setGenerating(false);
      // Atualizar a última execução
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ia-config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao gerar conteúdo",
        description: error.message || "Ocorreu um erro ao gerar o conteúdo",
        variant: "destructive",
      });
      setGenerating(false);
    }
  });
  
  const handleGenerateContent = () => {
    if (!formState.apiKey) {
      toast({
        title: "Chave da API não configurada",
        description: "Você precisa configurar a chave da API OpenAI antes de gerar conteúdo",
        variant: "destructive",
      });
      setActiveTab("geral");
      return;
    }
    
    if (getCategoriasAtivasArray().length === 0) {
      toast({
        title: "Nenhuma categoria selecionada",
        description: "Você precisa selecionar pelo menos uma categoria para gerar conteúdo",
        variant: "destructive",
      });
      setActiveTab("conteudo");
      return;
    }
    
    setGenerating(true);
    generateContentMutation.mutate();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormState(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSliderChange = (name: string, value: number[]) => {
    setFormState(prev => ({
      ...prev,
      [name]: value[0]
    }));
  };

  // Função auxiliar para garantir que categoriasAtivas seja sempre um array
  const getCategoriasAtivasArray = (): string[] => {
    if (Array.isArray(formState.categoriasAtivas)) {
      return formState.categoriasAtivas;
    }
    
    if (typeof formState.categoriasAtivas === 'string') {
      // Se for string JSON (começa com '['), tenta fazer parse
      if (formState.categoriasAtivas.trim().startsWith('[')) {
        try {
          return JSON.parse(formState.categoriasAtivas);
        } catch (e) {
          console.error('Erro ao fazer parse de JSON:', e);
          return [];
        }
      }
      
      // Se for string simples separada por vírgulas
      return formState.categoriasAtivas
        .split(',')
        .map(c => c.trim())
        .filter(c => c);
    }
    
    return [];
  };
  
  const handleCategoryToggle = (category: string) => {
    const currentCategories = getCategoriasAtivasArray();
    
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c: string) => c !== category)
      : [...currentCategories, category];
    
    setFormState(prev => ({
      ...prev,
      categoriasAtivas: newCategories
    }));
  };

  const handleSaveConfig = () => {
    // Preparar os dados para o envio
    const dataToSave = {
      ...formState,
      // Converter o array de categorias para string JSON se necessário
      categoriasAtivas: JSON.stringify(formState.categoriasAtivas),
      // Garantir que os campos numéricos sejam números
      temperatura: String(Number(formState.temperatura)), // Convertendo para string conforme o schema
      frequencia: Number(formState.frequencia),
      maxPostsPorDia: Number(formState.maxPostsPorDia),
    };
    
    // Remover campos que possam causar problemas na serialização
    delete dataToSave.ultimaExecucao;
    delete dataToSave.ultimaAtualizacao; // Removendo esse campo para o backend lidar com isso
    
    setSaving(true);
    updateConfigMutation.mutate(dataToSave);
  };

  // Redirecionar se não tiver permissão
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!isAdmin) {
      navigate("/app/dashboard");
      toast({
        title: "Acesso restrito",
        description: "Esta página é restrita a administradores",
        variant: "destructive",
      });
    }
  }, [user, isAdmin, navigate, toast]);

  if (isLoading) {
    return (
      <CleanLayout title="Configuração da IA" backTo="/app/admin">
        <div className="flex justify-center items-center p-16">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="ml-2">Carregando configurações...</p>
        </div>
      </CleanLayout>
    );
  }

  if (error) {
    return (
      <CleanLayout title="Configuração da IA" backTo="/app/admin">
        <div className="bg-red-50 border border-red-200 p-4 rounded-md my-8">
          <h2 className="text-red-600 text-lg font-semibold flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Erro ao carregar configurações
          </h2>
          <p className="mt-2 text-red-700">
            {error instanceof Error ? error.message : "Ocorreu um erro ao carregar as configurações da IA"}
          </p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/ia-config'] })}
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </CleanLayout>
    );
  }

  return (
    <CleanLayout title="Configuração da IA" backTo="/app/admin">
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-md my-6 flex items-center">
        <User className="text-blue-600 h-12 w-12 mr-4 bg-blue-100 p-2 rounded-full" />
        <div>
          <h3 className="font-semibold text-blue-800">Usuário para postagens da IA</h3>
          <p className="text-blue-600 text-sm">
            {iaUser ? (
              <>
                Posts serão feitos como <strong>{iaUser.displayName || iaUser.email}</strong> (Nível: {iaUser.role})
              </>
            ) : (
              "Carregando informações do usuário da IA..."
            )}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="geral">
            <Settings className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="conteudo">
            <Cpu className="h-4 w-4 mr-2" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="agendamento">
            <Clock className="h-4 w-4 mr-2" />
            Agendamento
          </TabsTrigger>
        </TabsList>

        {/* Aba de Configurações Gerais */}
        <TabsContent value="geral" className="p-4 border rounded-md mt-4">
          <h3 className="text-xl font-semibold mb-4">Configurações Gerais da IA</h3>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="ativar">Ativar Geração de Conteúdo Automático</Label>
              <Switch 
                id="ativar"
                checked={formState.ativar || false}
                onCheckedChange={(checked) => handleSwitchChange('ativar', checked)}
              />
            </div>
            <p className="text-sm text-slate-500">
              Quando ativado, o sistema gerará conteúdo automaticamente conforme a programação
            </p>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="apiKey" className="block mb-2">Chave da API OpenAI</Label>
            <Input 
              id="apiKey"
              name="apiKey"
              type="password"
              placeholder="sk-..."
              value={formState.apiKey || ''}
              onChange={handleInputChange}
              className="w-full"
            />
            <p className="text-sm text-slate-500 mt-1">
              A chave da API da OpenAI é necessária para gerar conteúdo
            </p>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="modelo" className="block mb-2">Modelo da IA</Label>
            <select 
              id="modelo"
              name="modelo"
              value={formState.modelo || 'gpt-4o'}
              onChange={handleInputChange as any}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="gpt-4o">GPT-4o (Recomendado)</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Mais Econômico)</option>
            </select>
            <p className="text-sm text-slate-500 mt-1">
              O modelo determina a qualidade do conteúdo gerado
            </p>
          </div>
          
          <div className="mb-6">
            <div className="mb-2">
              <Label htmlFor="temperatura" className="block">Temperatura: {formState.temperatura || 0.7}</Label>
            </div>
            <Slider 
              id="temperatura"
              defaultValue={[formState.temperatura || 0.7]}
              min={0}
              max={2}
              step={0.1}
              onValueChange={(value) => handleSliderChange('temperatura', value)}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-slate-500 mt-1">
              <span>Mais Estruturado</span>
              <span>Mais Criativo</span>
            </div>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="idioma" className="block mb-2">Idioma Principal</Label>
            <select 
              id="idioma"
              name="idioma"
              value={formState.idioma || 'pt-BR'}
              onChange={handleInputChange as any}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (USA)</option>
            </select>
          </div>
        </TabsContent>

        {/* Aba de Configurações de Conteúdo */}
        <TabsContent value="conteudo" className="p-4 border rounded-md mt-4">
          <h3 className="text-xl font-semibold mb-4">Configurações de Conteúdo</h3>
          
          <div className="mb-6">
            <Label htmlFor="topicosPrincipais" className="block mb-2">Tópicos Principais</Label>
            <textarea 
              id="topicosPrincipais"
              name="topicosPrincipais"
              value={formState.topicosPrincipais || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
              placeholder="drones, legislação, firmware, novidades"
            />
            <p className="text-sm text-slate-500 mt-1">
              Lista de tópicos separados por vírgula que orientarão o conteúdo gerado
            </p>
          </div>
          
          <div className="mb-6">
            <Label className="block mb-2">Categorias Ativas</Label>
            <div className="grid grid-cols-2 gap-2">
              {['dicas', 'firmware', 'legislacao', 'noticia'].map(category => (
                <div 
                  key={category} 
                  className={`border p-3 rounded-md cursor-pointer flex items-center ${
                    getCategoriasAtivasArray().includes(category)
                      ? 'bg-blue-50 border-blue-300' 
                      : 'bg-white border-gray-200'
                  }`}
                  onClick={() => handleCategoryToggle(category)}
                >
                  <div className="mr-2">
                    {getCategoriasAtivasArray().includes(category) && (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    )}
                    {!getCategoriasAtivasArray().includes(category) && (
                      <div className="h-4 w-4 border border-gray-300 rounded-full" />
                    )}
                  </div>
                  <span className="capitalize">
                    {category === 'legislacao' ? 'Legislação' : category}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Selecione as categorias para as quais a IA deve gerar conteúdo
            </p>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="instrucoes" className="block mb-2">Instruções Gerais</Label>
            <textarea 
              id="instrucoes"
              name="instrucoes"
              value={formState.instrucoes || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
              placeholder="Crie um artigo informativo sobre drones para o portal Aéreo Visão."
            />
            <p className="text-sm text-slate-500 mt-1">
              Instruções gerais para o tipo de conteúdo que a IA deve gerar
            </p>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="promptBase" className="block mb-2">Template do Prompt</Label>
            <textarea 
              id="promptBase"
              name="promptBase"
              value={formState.promptBase || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
              placeholder="Crie um conteúdo informativo para pilotos de drone sobre {categoria}. O texto deve ser em formato HTML com headers, parágrafos e listas."
            />
            <p className="text-sm text-slate-500 mt-1">
              Template do prompt usado para gerar o conteúdo. Use {"{categoria}"} como placeholder.
            </p>
          </div>
        </TabsContent>

        {/* Aba de Configurações de Agendamento */}
        <TabsContent value="agendamento" className="p-4 border rounded-md mt-4">
          <h3 className="text-xl font-semibold mb-4">Configurações de Agendamento</h3>
          
          {/* Botão "Criar Agora" no topo da aba de agendamento */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-lg font-medium text-blue-800 mb-2 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-600" />
              Geração Manual de Conteúdo
            </h4>
            <p className="text-sm text-blue-700 mb-4">
              Gere um novo conteúdo imediatamente usando as configurações atuais.
              O conteúdo será publicado automaticamente como post após a geração.
            </p>
            <Button 
              onClick={handleGenerateContent}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Criar Agora
                </>
              )}
            </Button>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="maxPostsPorDia" className="block mb-2">
              Quantidade de Posts por Execução: {formState.maxPostsPorDia || 1}
            </Label>
            <Slider 
              id="maxPostsPorDia"
              defaultValue={[formState.maxPostsPorDia || 1]}
              min={1}
              max={5}
              step={1}
              onValueChange={(value) => handleSliderChange('maxPostsPorDia', value)}
              className="w-full"
            />
            <p className="text-sm text-slate-500 mt-1">
              Número de posts que serão gerados a cada execução
            </p>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="frequencia" className="block mb-2">
              Frequência (dias): {formState.frequencia || 7}
            </Label>
            <Slider 
              id="frequencia"
              defaultValue={[formState.frequencia || 7]}
              min={1}
              max={30}
              step={1}
              onValueChange={(value) => handleSliderChange('frequencia', value)}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-slate-500 mt-1">
              <span>Diariamente</span>
              <span>Mensalmente</span>
            </div>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="horarioExecucao" className="block mb-2">Horário de Execução</Label>
            <Input 
              id="horarioExecucao"
              name="horarioExecucao"
              type="time"
              value={formState.horarioExecucao || '10:00'}
              onChange={handleInputChange}
              className="w-full"
            />
            <p className="text-sm text-slate-500 mt-1">
              Horário aproximado em que o sistema deve gerar o conteúdo
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h4 className="font-medium mb-2">Informações de Execução</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Última execução:</p>
                <p className="font-medium">
                  {formState.ultimaExecucao 
                    ? new Date(formState.ultimaExecucao).toLocaleString() 
                    : "Nunca executado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Última atualização:</p>
                <p className="font-medium">
                  {formState.ultimaAtualizacao 
                    ? new Date(formState.ultimaAtualizacao).toLocaleString() 
                    : "Nunca atualizado"}
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-2">Próxima Execução</h4>
              <p className="text-sm text-slate-500">
                {formState.ativar 
                  ? `A próxima execução está prevista para ocorrer às ${formState.horarioExecucao || '10:00'}`
                  : "A geração automática está desativada"}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8">
        <Button 
          variant="outline" 
          onClick={() => navigate("/app/admin")} 
          className="mr-2"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSaveConfig} 
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </CleanLayout>
  );
};

export default IAConfigClean;