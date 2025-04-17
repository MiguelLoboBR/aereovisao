import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '@shared/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Bell, ChevronDown, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useAuthJWT } from '@/hooks/useAuthJWT';
import { DroneIcon } from './DroneIcons';

interface HeaderProps {
  user: {
    id: number;
    username: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    role?: 'usuario' | 'colaborador' | 'admin';
    phone?: string | null;
    document?: string | null;
  };
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const { logoutMutation } = useAuthJWT();
  const [notifications, setNotifications] = useState<number>(0);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="fixed z-20 top-0 right-0 left-0 md:left-64 h-16 bg-white border-b border-aero-slate-200 flex items-center px-4 shadow-sm">
      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center">
          <div className="hidden md:flex items-center">
            <DroneIcon className="h-8 w-auto mr-3" />
            <h1 className="text-xl font-semibold text-aero-slate-800">
              Portal do Piloto
            </h1>
          </div>
          {/* Logo para mobile */}
          <div className="flex md:hidden items-center">
            <DroneIcon className="h-6 w-auto mr-2" />
            <h1 className="text-lg font-semibold text-aero-slate-800">
              Portal
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Botão "Quero ser colaborador" - mostrado apenas para usuários que não são colaboradores nem admin */}
          {user.role === 'usuario' && (
            <Button 
              variant="outline" 
              className="hidden md:flex items-center text-blue-600 border-blue-600 hover:bg-blue-50 mr-2"
              size="sm"
              asChild
            >
              <Link to="/doacoes" className="flex items-center">
                <i className="fas fa-hand-holding-heart mr-1.5"></i>
                <span>Quero ser colaborador</span>
              </Link>
            </Button>
          )}
          
          {/* Notificações */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications === 0 ? (
                <div className="p-2 text-sm text-aero-slate-500">
                  Não há notificações no momento
                </div>
              ) : (
                <>
                  <DropdownMenuItem>Nova atualização disponível</DropdownMenuItem>
                  <DropdownMenuItem>Sua dica foi aprovada</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Avatar e menu do usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-aero-slate-100">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || user?.username} />
                  <AvatarFallback>{user?.displayName?.[0] || user?.username?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline-block">
                  {user?.displayName || user?.username}
                </span>
                <ChevronDown className="h-4 w-4 text-aero-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/app/perfil" className="cursor-pointer flex items-center">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/configuracoes" className="cursor-pointer flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;