import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { can, type Permission } from '@/lib/permissions';
import { PageLoader } from '@/components/ui/Spinner';
import { AccountStatusNotice } from '@/components/common/AccountStatusNotice';

/** Protège les espaces privés : redirige vers la connexion si nécessaire. */
export function RequireAuth() {
  const { loading, profile } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!profile) return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Restreint l'accès à une permission. La base applique la même règle (RLS). */
export function RequirePermission({ permission }: { permission: Permission }) {
  const { loading, profile } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!profile) return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  if (profile.status !== 'active') return <AccountStatusNotice status={profile.status} />;
  if (!can(profile, permission)) return <Navigate to="/acces-refuse" replace />;
  return <Outlet />;
}

export function RedirectIfAuthenticated() {
  const { profile, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (profile) return <Navigate to="/espace" replace />;
  return <Outlet />;
}
