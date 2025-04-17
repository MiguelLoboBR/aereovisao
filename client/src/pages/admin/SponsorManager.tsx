import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuthJWT } from '@/hooks/useAuthJWT';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, Plus, Trash2, Edit, ExternalLink } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Sponsor {
  id?: number;
  name: string;
  description?: string;
  url?: string;
  logo?: string;
  type: 'premium' | 'partner';
}

const SponsorManager: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuthJWT();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState<Sponsor>({
    name: '',
    description: '',
    url: '',
    logo: '',
    type: 'premium'
  });
  
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
  
  // Buscar patrocinadores
  const { 
    data: sponsorsData, 
    isLoading: sponsorsLoading, 
    error: sponsorsError 
  } = useQuery({
    queryKey: ['/api/sponsors'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/sponsors');
      return await res.json();
    },
  });
  
  // Mutation para atualizar patrocinadores
  const updateSponsorsMutation = useMutation({
    mutationFn: async (data: { premium: Sponsor[], partners: Sponsor[] }) => {
      const res = await apiRequest('POST', '/api/admin/sponsors', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Patrocinadores atualizados",
        description: "As informações dos patrocinadores foram atualizadas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sponsors'] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar",
        description: `Ocorreu um erro ao atualizar os patrocinadores: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Função para adicionar ou atualizar um patrocinador
  const handleSaveSponsor = () => {
    if (!formData.name) {
      toast({
        title: "Nome obrigatório",
        description: "O nome do patrocinador é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    
    let updatedSponsors = { ...sponsorsData };
    
    if (isEditing && editingSponsor) {
      if (editingSponsor.type === 'premium') {
        updatedSponsors.premium = updatedSponsors.premium.map((sponsor: Sponsor) => 
          sponsor.name === editingSponsor.name ? formData : sponsor
        );
      } else {
        updatedSponsors.partners = updatedSponsors.partners.map((sponsor: Sponsor) => 
          sponsor.name === editingSponsor.name ? formData : sponsor
        );
      }
    } else {
      if (formData.type === 'premium') {
        updatedSponsors.premium = [...updatedSponsors.premium, formData];
      } else {
        updatedSponsors.partners = [...updatedSponsors.partners, formData];
      }
    }
    
    updateSponsorsMutation.mutate(updatedSponsors);
  };
  
  // Função para remover um patrocinador
  const handleRemoveSponsor = (sponsor: Sponsor) => {
    let updatedSponsors = { ...sponsorsData };
    
    if (sponsor.type === 'premium') {
      updatedSponsors.premium = updatedSponsors.premium.filter((s: Sponsor) => s.name !== sponsor.name);
    } else {
      updatedSponsors.partners = updatedSponsors.partners.filter((s: Sponsor) => s.name !== sponsor.name);
    }
    
    updateSponsorsMutation.mutate(updatedSponsors);
  };
  
  // Função para editar um patrocinador
  const handleEditSponsor = (sponsor: Sponsor) => {
    setIsEditing(true);
    setEditingSponsor(sponsor);
    setFormData(sponsor);
  };
  
  // Função para resetar o formulário
  const resetForm = () => {
    setIsEditing(false);
    setEditingSponsor(null);
    setFormData({
      name: '',
      description: '',
      url: '',
      logo: '',
      type: 'premium'
    });
  };
  
  // Função para lidar com as mudanças no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  if (sponsorsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-aero-slate-700" />
      </div>
    );
  }
  
  if (sponsorsError || !sponsorsData) {
    return (
      <div className="text-center py-8 px-4 bg-red-50">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600">Ocorreu um erro ao carregar os patrocinadores.</p>
        <p className="text-red-500 text-sm mt-1">Por favor, tente novamente mais tarde.</p>
      </div>
    );
  }
  
  return (
    <section className="py-8 px-4 md:px-8 min-h-screen pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-inter font-bold text-aero-slate-800">
              Gerenciamento de Patrocinadores
            </h1>
            <p className="text-aero-slate-600 mt-2">
              Gerencie os patrocinadores e parceiros que aparecem na página de patrocinadores
            </p>
          </div>
          
          <button
            onClick={() => navigate('/app/patrocinadores')}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 inline-flex items-center"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Página de Patrocinadores
          </button>
        </header>
        
        {/* Formulário para adicionar/editar patrocinadores */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200 mb-8">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-6">
              {isEditing ? 'Editar Patrocinador' : 'Adicionar Novo Patrocinador'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-aero-slate-700 mb-2">
                  Nome do Patrocinador *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-aero-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da empresa ou parceiro"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-aero-slate-700 mb-2">
                  Tipo de Patrocinador
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-aero-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="premium">Patrocinador Premium</option>
                  <option value="partner">Parceiro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-aero-slate-700 mb-2">
                  URL do Site
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-aero-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-aero-slate-700 mb-2">
                  URL do Logo (opcional)
                </label>
                <input
                  type="url"
                  name="logo"
                  value={formData.logo || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-aero-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-aero-slate-700 mb-2">
                  Descrição (apenas para Premium)
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-aero-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Breve descrição da empresa patrocinadora"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleSaveSponsor}
                disabled={updateSponsorsMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateSponsorsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    {isEditing ? (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Atualizar Patrocinador
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Patrocinador
                      </>
                    )}
                  </>
                )}
              </button>
              
              {isEditing && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-aero-slate-100 text-aero-slate-700 rounded-lg hover:bg-aero-slate-200"
                  disabled={updateSponsorsMutation.isPending}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Lista de patrocinadores premium */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200 mb-8">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-6">
              Patrocinadores Premium
            </h2>
            
            {sponsorsData.premium.length === 0 ? (
              <div className="text-center py-8 bg-aero-slate-50 rounded-lg">
                <p className="text-aero-slate-600">Nenhum patrocinador premium cadastrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-aero-slate-200">
                  <thead className="bg-aero-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-aero-slate-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-aero-slate-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-aero-slate-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-aero-slate-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-aero-slate-200">
                    {sponsorsData.premium.map((sponsor: Sponsor, index: number) => (
                      <tr key={index} className="hover:bg-aero-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-aero-slate-900">
                            {sponsor.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-aero-slate-600 line-clamp-2">
                            {sponsor.description || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {sponsor.url ? (
                            <a 
                              href={sponsor.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-xs"
                            >
                              {sponsor.url}
                            </a>
                          ) : (
                            <span className="text-aero-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleEditSponsor({ ...sponsor, type: 'premium' })}
                            className="text-blue-600 hover:text-blue-800 mr-4"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleRemoveSponsor({ ...sponsor, type: 'premium' })}
                            className="text-red-600 hover:text-red-800"
                            title="Remover"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Lista de parceiros */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-aero-slate-200">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-inter font-semibold text-aero-slate-800 mb-6">
              Parceiros
            </h2>
            
            {sponsorsData.partners.length === 0 ? (
              <div className="text-center py-8 bg-aero-slate-50 rounded-lg">
                <p className="text-aero-slate-600">Nenhum parceiro cadastrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-aero-slate-200">
                  <thead className="bg-aero-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-aero-slate-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-aero-slate-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-aero-slate-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-aero-slate-200">
                    {sponsorsData.partners.map((partner: Sponsor, index: number) => (
                      <tr key={index} className="hover:bg-aero-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-aero-slate-900">
                            {partner.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {partner.url ? (
                            <a 
                              href={partner.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-xs"
                            >
                              {partner.url}
                            </a>
                          ) : (
                            <span className="text-aero-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleEditSponsor({ ...partner, type: 'partner' })}
                            className="text-blue-600 hover:text-blue-800 mr-4"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleRemoveSponsor({ ...partner, type: 'partner' })}
                            className="text-red-600 hover:text-red-800"
                            title="Remover"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorManager;