import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Mail, Phone } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useUserStore();
  
  // Función para obtener la primera letra del nombre para el avatar
  const getInitial = () => {
    if (currentUser?.name && currentUser.name.length > 0) {
      return currentUser.name.charAt(0).toUpperCase();
    }
    return 'U'; // Default si no hay nombre
  };

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar/Botón de perfil */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
      >
        <span className="text-lg font-medium">{getInitial()}</span>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-700">Perfil de Usuario</p>
          </div>
          
          <div className="p-4 text-center">
            <div className="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <span className="text-3xl font-bold">{getInitial()}</span>
            </div>
            <p className="font-medium text-gray-800">{currentUser?.name || 'Usuario'}</p>
            <p className="text-sm text-gray-500">{currentUser?.role === 'admin' ? 'Administrador' : 
              currentUser?.role === 'superadmin' ? 'Super Administrador' : 'Usuario'}</p>
          </div>
          
          <div className="px-4 py-2 border-t border-gray-200">
            <div className="space-y-2 mt-2">
              <div className="flex items-center px-2 py-1 text-sm text-gray-700">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span className="truncate">{currentUser?.email || 'No disponible'}</span>
              </div>
              <div className="flex items-center px-2 py-1 text-sm text-gray-700">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span>{currentUser?.phone || 'No disponible'}</span>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-2 border-t border-gray-200">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;