import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore } from '../../store/uiStore';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className={`transition-all duration-300 
        ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>  {/* Aquí está el cambio clave */}
        <Header />
        <main className="p-0 pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
