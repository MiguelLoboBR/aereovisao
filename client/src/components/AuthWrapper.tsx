import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import { useAuthJWT } from "@/hooks/useAuthJWT";

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthWrapper({ children, requireAdmin = false }: AuthWrapperProps) {
  const { user, isLoading, isAdmin } = useAuthJWT();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-aero-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}