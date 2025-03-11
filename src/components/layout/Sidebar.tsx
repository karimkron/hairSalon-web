import { Home, Users, Calendar, Scissors, DollarSign, Settings, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';

const Sidebar = () => {
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  const menuItems = [
    { icon: Home, name: 'Dashboard', path: '/admin' },
    { icon: Calendar, name: 'Citas', path: '/admin/appointments' },
    { icon: Scissors, name: 'Servicios', path: '/admin/services' },
    { icon: Users, name: 'Barberos', path: '/admin/barbers' },
    { icon: Users, name: 'Clientes', path: '/admin/clients' },
    { icon: DollarSign, name: 'Ventas', path: '/admin/sales' },
    { icon: Settings, name: 'Configuración', path: '/admin/settings' },
  ];

  return (
    <>
      {/* Sidebar para tablets y desktop */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-white border-r transition-all duration-300 z-40
          hidden md:block
          ${isSidebarOpen ? 'w-64' : 'w-20'}`}
      >
        {/* Logo y botón de toggle */}
        <div className="flex items-center h-16 px-4 border-b">
          {isSidebarOpen ? (
            <div className="flex justify-between items-center w-full">
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
              className="p-2 hover:bg-gray-100 rounded-lg mx-auto"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Menú */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
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
          {menuItems.slice(0, 5).map((item) => (
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