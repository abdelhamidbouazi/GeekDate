import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex flex-col items-center justify-center p-4">
      <div className="mb-6 flex items-center gap-2 text-primary">
        <Heart className="w-10 h-10 fill-primary" />
        <span className="text-3xl font-bold">Matcha</span>
      </div>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <Outlet />
      </div>
      <p className="mt-4 text-text-light text-sm">Find your perfect match</p>
    </div>
  );
}
