import { Home, Users, Calendar, Scissors, DollarSign, Settings, Menu, X, ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { useUserStore } from '../../store/userStore'; // Importar el store de usuario

const Sidebar = () => {
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { currentUser } = useUserStore(); // Obtener el usuario actual

  // Definir los elementos del menú
  const menuItems = [
    { icon: Home, name: 'Dashboard', path: '/admin' },
    { icon: Calendar, name: 'Calendario', path: '/admin/appointments' },
    { icon: Scissors, name: 'Servicios', path: '/admin/services' },
    { icon: ShoppingBag, name: 'Productos', path: '/admin/products' },
    { icon: Users, name: 'Usuarios', path: '/admin/users', role: 'superadmin' }, // Solo para superadmin
    { icon: DollarSign, name: 'Ventas', path: '/admin/sales' },
    { icon: Settings, name: 'Configuración', path: '/admin/settings' },
  ];

  // Filtrar los elementos del menú según el rol del usuario
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.role) {
      return currentUser?.role === item.role; // Mostrar solo si el rol del usuario coincide
    }
    return true; // Mostrar siempre si no tiene restricción de rol
  });

  return (
    <>
      {/* Sidebar para tablets y desktop */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-white border-r transition-all duration-300 z-40
          hidden md:block
          ${isSidebarOpen ? 'w-64' : 'w-16'}`}
      >
        {/* Logo y botón de toggle */}
        <div className="flex items-center h-16 px-2 border-b">
          {isSidebarOpen ? (
            <div className="flex justify-around items-center w-full">
              <span className="text-xl font-bold">BARBERSHOP</span>
              <button 
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={toggleSidebar}
              className="p-4 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Menú */}
        <nav className="p-1 space-y-2">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                ${location.pathname === item.path
                  ? 'bg-amber-100 text-amber-600'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Navegación móvil inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-40">
        <div className="grid grid-cols-5 gap-1">
          {filteredMenuItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-1
                ${location.pathname === item.path
                  ? 'text-amber-600'
                  : 'text-gray-600'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;