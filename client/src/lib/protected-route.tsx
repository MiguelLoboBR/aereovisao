import { useAuthJWT } from "@/hooks/useAuthJWT";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";

// Proteção básica (só usuários logados)
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => JSX.Element | null;
}) {
  const { user, isLoading } = useAuthJWT();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        return (
          <DashboardLayout>
            <Component />
          </DashboardLayout>
        );
      }}
    </Route>
  );
}

// Proteção para administradores
export function AdminRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => JSX.Element | null;
}) {
  const { user, isLoading, isAdmin } = useAuthJWT();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }

        if (!user || !isAdmin) {
          return <Redirect to="/" />;
        }

        return (
          <DashboardLayout>
            <Component />
          </DashboardLayout>
        );
      }}
    </Route>
  );
}

// Proteção para colaboradores e administradores
export function ColaboradorRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => JSX.Element | null;
}) {
  const { user, isLoading, isColaborador } = useAuthJWT();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }

        if (!user || !isColaborador) {
          return <Redirect to="/" />;
        }

        return (
          <DashboardLayout>
            <Component />
          </DashboardLayout>
        );
      }}
    </Route>
  );
}