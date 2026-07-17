import { Navigate, useLocation } from 'react-router-dom';
import { getUserId } from '../lib/auth';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!getUserId()) {
    return <Navigate to="/onboarding" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
