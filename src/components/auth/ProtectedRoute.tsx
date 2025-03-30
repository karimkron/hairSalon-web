import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';

const ProtectedRoute = () => {
  const { isInitializing } = useAuth();
  const token = localStorage.getItem('token');

  // Mostrar un indicador de carga si la autenticación aún se está inicializando
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-600"></div>
      </div>
    );
  }

  // Redirigir al login si no hay token
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token y la autenticación está inicializada, permitir acceso a las rutas protegidas
  return <Outlet />;
};

export default ProtectedRoute;