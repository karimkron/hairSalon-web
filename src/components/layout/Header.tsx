import { Bell, User } from 'lucide-react';

const Header = () => {
  const handleLogout = () => {
    // Eliminar el token del localStorage
    localStorage.removeItem('token');
    // Redirigir al login
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b">
      <div className="flex items-center h-16 px-6">
        <h1 className="text-xl font-semibold flex-1">Panel de Administración</h1>

        <div className="flex items-center gap-4">
          {/* Botón de notificaciones */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              0
            </span>
          </button>

          {/* Botón de cierre de sesión */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <User className="w-5 h-5" />
            <span className="hidden md:inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;