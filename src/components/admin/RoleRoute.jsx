import { useAuth } from '@/lib/AuthContext';
import { Outlet } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function RoleRoute({ roles = [] }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return (
      <div className="container-tbl py-32 text-center">
        <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500">You don't have permission to view this page.</p>
      </div>
    );
  }

  return <Outlet />;
}