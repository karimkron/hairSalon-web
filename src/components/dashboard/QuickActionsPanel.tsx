import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Users, Package, Scissors, Settings, 
  FileText,
} from 'lucide-react';

const QuickActionsPanel: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-medium mb-4">Acciones Rápidas</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Crear Cita */}
        <Link 
          to="/admin/appointments" 
          className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <span className="p-3 bg-indigo-100 rounded-full">
            <Calendar className="h-6 w-6 text-indigo-600" />
          </span>
          <span className="mt-2 text-sm text-center font-medium text-indigo-700">Gestionar Citas</span>
        </Link>
        
        {/* Nuevo Servicio */}
        <Link 
          to="/admin/services/create" 
          className="flex flex-col items-center justify-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
        >
          <span className="p-3 bg-amber-100 rounded-full">
            <Scissors className="h-6 w-6 text-amber-600" />
          </span>
          <span className="mt-2 text-sm text-center font-medium text-amber-700">Nuevo Servicio</span>
        </Link>
        
        {/* Nuevo Producto */}
        <Link 
          to="/admin/products/create" 
          className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          <span className="p-3 bg-green-100 rounded-full">
            <Package className="h-6 w-6 text-green-600" />
          </span>
          <span className="mt-2 text-sm text-center font-medium text-green-700">Nuevo Producto</span>
        </Link>
        
        {/* Ver Clientes */}
        <Link 
          to="/admin/users" 
          className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <span className="p-3 bg-blue-100 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </span>
          <span className="mt-2 text-sm text-center font-medium text-blue-700">Ver Clientes</span>
        </Link>
        
        {/* Reportes */}
        <Link 
          to="/admin/sales" 
          className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <span className="p-3 bg-purple-100 rounded-full">
            <FileText className="h-6 w-6 text-purple-600" />
          </span>
          <span className="mt-2 text-sm text-center font-medium text-purple-700">Ver Ventas</span>
        </Link>
        
        {/* Configuración */}
        <Link 
          to="/admin/settings" 
          className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="p-3 bg-gray-100 rounded-full">
            <Settings className="h-6 w-6 text-gray-600" />
          </span>
          <span className="mt-2 text-sm text-center font-medium text-gray-700">Configuración</span>
        </Link>
      </div>
    </div>
  );
};

export default QuickActionsPanel;