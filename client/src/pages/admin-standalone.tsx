import { useState } from "react";
import { Link } from "wouter";

export default function AdminStandalone() {
  const [activeTab, setActiveTab] = useState('dicas');

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Aéreo Visão - Painel Administrativo</h1>
          <Link href="/">
            <a className="px-3 py-1 bg-blue-700 rounded hover:bg-blue-800">
              Voltar ao Portal
            </a>
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4 mt-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'dicas' ? 'bg-blue-50 border-b-2 border-blue-500' : 'hover:bg-gray-50'}`}
              onClick={() => setActiveTab('dicas')}
            >
              Dicas e Tutoriais
            </button>
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'usuarios' ? 'bg-blue-50 border-b-2 border-blue-500' : 'hover:bg-gray-50'}`}
              onClick={() => setActiveTab('usuarios')}
            >
              Usuários
            </button>
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'config' ? 'bg-blue-50 border-b-2 border-blue-500' : 'hover:bg-gray-50'}`}
              onClick={() => setActiveTab('config')}
            >
              Configurações
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'dicas' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Gerenciamento de Dicas</h2>
                
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2 border">Título</th>
                      <th className="text-left p-2 border">Autor</th>
                      <th className="text-left p-2 border">Status</th>
                      <th className="text-center p-2 border">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 border">Como calibrar sua bússola</td>
                      <td className="p-2 border">João Piloto</td>
                      <td className="p-2 border">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          Pendente
                        </span>
                      </td>
                      <td className="p-2 border text-center">
                        <button className="px-2 py-1 bg-green-500 text-white rounded text-xs mr-2">
                          Aprovar
                        </button>
                        <button className="px-2 py-1 bg-red-500 text-white rounded text-xs">
                          Rejeitar
                        </button>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 border">Dicas para fotos aéreas perfeitas</td>
                      <td className="p-2 border">Maria Silva</td>
                      <td className="p-2 border">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Aprovada
                        </span>
                      </td>
                      <td className="p-2 border text-center">
                        <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                          Visualizar
                        </button>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 border">Preparação para voos em dias ventosos</td>
                      <td className="p-2 border">Carlos Drone</td>
                      <td className="p-2 border">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          Rejeitada
                        </span>
                      </td>
                      <td className="p-2 border text-center">
                        <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                          Visualizar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'usuarios' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Gerenciamento de Usuários</h2>
                
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2 border">Nome</th>
                      <th className="text-left p-2 border">Email</th>
                      <th className="text-left p-2 border">Nível</th>
                      <th className="text-center p-2 border">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 border">João Piloto</td>
                      <td className="p-2 border">joao@exemplo.com</td>
                      <td className="p-2 border">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          Usuário
                        </span>
                      </td>
                      <td className="p-2 border text-center">
                        <select className="border rounded p-1 text-sm">
                          <option value="usuario">Usuário</option>
                          <option value="colaborador">Colaborador</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 border">Maria Silva</td>
                      <td className="p-2 border">maria@exemplo.com</td>
                      <td className="p-2 border">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          Colaborador
                        </span>
                      </td>
                      <td className="p-2 border text-center">
                        <select className="border rounded p-1 text-sm">
                          <option value="usuario">Usuário</option>
                          <option value="colaborador" selected>Colaborador</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 border">Carlos Drone</td>
                      <td className="p-2 border">carlos@exemplo.com</td>
                      <td className="p-2 border">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          Administrador
                        </span>
                      </td>
                      <td className="p-2 border text-center">
                        <select className="border rounded p-1 text-sm">
                          <option value="usuario">Usuário</option>
                          <option value="colaborador">Colaborador</option>
                          <option value="admin" selected>Administrador</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'config' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Configurações do Portal</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Configurações de PIX</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm mb-1">Chave PIX</label>
                        <input 
                          type="text" 
                          className="w-full border rounded p-2" 
                          defaultValue="12345678901"
                          placeholder="CPF, CNPJ, Email ou Chave aleatória"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-1">Nome do recebedor</label>
                        <input 
                          type="text" 
                          className="w-full border rounded p-2" 
                          defaultValue="Associação de Pilotos de Drones"
                          placeholder="Nome que aparecerá para o doador"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-1">Banco</label>
                        <input 
                          type="text" 
                          className="w-full border rounded p-2" 
                          defaultValue="Banco do Brasil"
                          placeholder="Nome do banco"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Outras formas de pagamento</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm mb-1">URL do PayPal</label>
                        <input 
                          type="text" 
                          className="w-full border rounded p-2" 
                          defaultValue="https://paypal.me/pilotosdrone"
                          placeholder="https://paypal.me/seuperfil"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-1">URL de pagamento por cartão</label>
                        <input 
                          type="text" 
                          className="w-full border rounded p-2" 
                          defaultValue="https://pagseguro.com.br/pilotosdrone"
                          placeholder="URL para pagamento por cartão"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Ex: link do PagSeguro, Mercado Pago, etc.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-right">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Salvar configurações
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 text-center p-3 mt-8 text-sm text-gray-500">
        Aéreo Visão - Portal do Piloto © 2025 - Versão Administrativa
      </footer>
    </div>
  );
}