import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { useAuthJWT } from '@/hooks/useAuthJWT';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Loader2, User, Settings, Camera, KeyRound, Trash2, LogOut, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';

const Perfil: React.FC = () => {
  const { user, isAdmin, updateProfileMutation, logoutMutation } = useAuthJWT();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("perfil");

  // Estado para armazenar os dados de perfil e o formulário
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    document: '',
    address: '',
    photoFile: null as File | null,
    photoPreview: '',
  });

  // Estado para formulário de alteração de senha
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Estado para controlar a exclusão de conta
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Carregar dados do usuário ao iniciar
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Preencher o formulário com os dados atuais do usuário
    setProfileForm({
      displayName: user.displayName || '',
      email: user.email || '',
      phone: user.phone || '',
      document: user.document || '',
      address: user.address || '',
      photoFile: null,
      photoPreview: user.photoURL || '',
    });
  }, [user, navigate]);

  // Mutation para alterar senha
  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordForm) => {
      const res = await apiRequest('POST', '/api/change-password', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Senha alterada com sucesso",
        description: "Sua senha foi alterada. Para sua segurança, você será redirecionado para o login.",
        variant: "default",
      });
      
      // Logout após alterar a senha
      setTimeout(() => {
        logoutMutation.mutate();
      }, 3000);
      
      // Limpar formulário
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Verifique se a senha atual está correta",
        variant: "destructive",
      });
    }
  });

  // Mutation para excluir conta
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', '/api/user');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso. Você será redirecionado para a página inicial.",
        variant: "default",
      });
      
      // Logout após excluir a conta
      setTimeout(() => {
        logoutMutation.mutate();
        navigate('/');
      }, 3000);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir conta",
        description: error.message || "Não foi possível excluir sua conta. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });

  // Manipuladores de mudança nos formulários
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileForm((prev) => ({
        ...prev,
        photoFile: file,
        photoPreview: URL.createObjectURL(file),
      }));
    }
  };

  // Manipuladores de envio dos formulários
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('displayName', profileForm.displayName);
    formData.append('phone', profileForm.phone || '');
    formData.append('document', profileForm.document || '');
    formData.append('address', profileForm.address || '');
    
    if (profileForm.photoFile) {
      formData.append('photoFile', profileForm.photoFile);
    }
    
    updateProfileMutation.mutate(formData as any);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }
    
    changePasswordMutation.mutate(passwordForm);
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deleteConfirmation !== user?.email) {
      toast({
        title: "Confirmação incorreta",
        description: "Digite seu email corretamente para confirmar a exclusão",
        variant: "destructive",
      });
      return;
    }
    
    deleteAccountMutation.mutate();
  };

  // Verificação de carregamento
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="relative w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden mr-4 border-2 border-white">
                {profileForm.photoPreview ? (
                  <img 
                    src={profileForm.photoPreview} 
                    alt={user.displayName || user.username} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.displayName || user.username}</h1>
                <p className="text-blue-100">{user.email}</p>
                <div className="mt-1 inline-flex items-center bg-blue-700/40 px-2 py-1 rounded text-xs">
                  {isAdmin ? (
                    <><Shield className="h-3 w-3 mr-1" /> Administrador</>
                  ) : user.role === 'colaborador' ? (
                    <><Shield className="h-3 w-3 mr-1" /> Colaborador</>
                  ) : (
                    <><User className="h-3 w-3 mr-1" /> Usuário</>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="border-b w-full justify-start rounded-none px-6 bg-slate-50">
            <TabsTrigger 
              value="perfil"
              className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-t-lg py-3"
            >
              <User className="h-4 w-4 mr-2" />
              <span>Meu Perfil</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="configuracoes"
              className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-t-lg py-3"
            >
              <Settings className="h-4 w-4 mr-2" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="perfil" className="p-6">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label htmlFor="photoFile" className="block text-sm font-medium mb-2">
                    Foto de Perfil
                  </label>
                  <div className="flex items-start space-x-4">
                    <div className="relative h-32 w-32 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                      {profileForm.photoPreview ? (
                        <img 
                          src={profileForm.photoPreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User className="h-12 w-12 text-slate-400" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <label 
                        htmlFor="photoFile" 
                        className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Alterar Foto
                      </label>
                      <input 
                        id="photoFile" 
                        name="photoFile" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handlePhotoChange}
                      />
                      <p className="text-xs text-slate-500">
                        JPG, PNG ou GIF. Tamanho máximo de 2MB.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium mb-1">
                      Nome Completo
                    </label>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      value={profileForm.displayName}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-slate-50 text-slate-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">O email não pode ser alterado.</p>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Telefone/WhatsApp
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                <div>
                  <label htmlFor="document" className="block text-sm font-medium mb-1">
                    CPF/CNPJ
                  </label>
                  <input
                    id="document"
                    name="document"
                    type="text"
                    value={profileForm.document}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1">
                  Endereço
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={profileForm.address}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  placeholder="Rua, número, bairro, cidade, estado, CEP"
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="configuracoes" className="p-6">
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg border border-slate-200">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <KeyRound className="h-5 w-5 mr-2 text-blue-600" />
                  Alterar Senha
                </h3>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                      Senha Atual
                    </label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                        Nova Senha
                      </label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                        minLength={6}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                        Confirmar Nova Senha
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : "Alterar Senha"}
                    </Button>
                  </div>
                </form>
              </div>
              
              <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                <h3 className="text-lg font-medium mb-4 text-red-700 flex items-center">
                  <Trash2 className="h-5 w-5 mr-2" />
                  Excluir Conta
                </h3>
                
                <p className="text-red-600 mb-4">
                  Atenção: Esta ação é irreversível. Ao excluir sua conta, todos os seus dados serão 
                  permanentemente removidos de nosso sistema.
                </p>
                
                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <div>
                    <label htmlFor="deleteConfirmation" className="block text-sm font-medium mb-1 text-red-700">
                      Para confirmar, digite seu email: {user.email}
                    </label>
                    <input
                      id="deleteConfirmation"
                      name="deleteConfirmation"
                      type="email"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className="w-full px-3 py-2 border border-red-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <Button 
                      type="submit" 
                      variant="destructive"
                      disabled={deleteAccountMutation.isPending || deleteConfirmation !== user.email}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deleteAccountMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : "Excluir Minha Conta"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Outlet />
    </div>
  );
};

export default Perfil;