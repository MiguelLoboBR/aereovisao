import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthJWT } from '@/hooks/useAuthJWT';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardHome() {
  const { user, isLoading } = useAuthJWT();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <section className="py-8 px-4 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo, {user?.displayName || user?.username}!
        </h1>
        <p className="text-aero-slate-600 mt-2">
          Este é o seu painel de controle do portal Aéreo Visão.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Dicas</CardTitle>
            <CardDescription>Suas contribuições</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Downloads</CardTitle>
            <CardDescription>Firmwares populares</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">25+</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Legislação</CardTitle>
            <CardDescription>Documentos importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">12</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Comunidade</CardTitle>
            <CardDescription>Usuários do portal</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">100+</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Atualizações</CardTitle>
            <CardDescription>Novidades do portal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-sm text-aero-slate-500">14 de abril, 2025</p>
                <h3 className="font-medium">Novo layout do dashboard</h3>
                <p className="text-aero-slate-600 text-sm">
                  Implementamos um novo layout para melhorar a navegação no portal.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="text-sm text-aero-slate-500">10 de abril, 2025</p>
                <h3 className="font-medium">Firmwares atualizados</h3>
                <p className="text-aero-slate-600 text-sm">
                  Novos firmwares para DJI e Autel foram adicionados à biblioteca.
                </p>
              </div>
              <div className="border-l-4 border-amber-500 pl-4 py-2">
                <p className="text-sm text-aero-slate-500">5 de abril, 2025</p>
                <h3 className="font-medium">Atualização da legislação</h3>
                <p className="text-aero-slate-600 text-sm">
                  Novas normas da ANAC para voos com drones foram publicadas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dicas em Destaque</CardTitle>
            <CardDescription>Contribuições populares</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-aero-slate-50 rounded-lg">
                <h3 className="font-medium">Calibração de bússola</h3>
                <p className="text-aero-slate-600 text-sm mt-1">
                  Como calibrar corretamente a bússola do seu drone para evitar problemas de voo.
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-aero-slate-500">Por: </span>
                  <span className="font-medium ml-1">João Silva</span>
                </div>
              </div>
              
              <div className="p-4 bg-aero-slate-50 rounded-lg">
                <h3 className="font-medium">Configurações para vídeo cinematic</h3>
                <p className="text-aero-slate-600 text-sm mt-1">
                  Melhores configurações para capturar vídeos com efeito cinematográfico usando drones.
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-aero-slate-500">Por: </span>
                  <span className="font-medium ml-1">Ana Costa</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Últimas Notícias</CardTitle>
            <CardDescription>Fique por dentro do setor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Nova legislação para voos noturnos</h3>
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">Notícia</span>
                </div>
                <p className="text-aero-slate-600 text-sm mt-1">
                  ANAC publica nova regulamentação sobre voos noturnos para drones com licença específica.
                </p>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-aero-slate-500">15/04/2025</span>
                  <Link to="/app/noticias" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Ler mais
                  </Link>
                </div>
              </div>
              
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">DJI anuncia nova linha Mavic</h3>
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">Notícia</span>
                </div>
                <p className="text-aero-slate-600 text-sm mt-1">
                  Fabricante chinesa apresenta novos modelos com maior autonomia e câmeras aprimoradas.
                </p>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-aero-slate-500">10/04/2025</span>
                  <Link to="/app/noticias" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Ler mais
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}