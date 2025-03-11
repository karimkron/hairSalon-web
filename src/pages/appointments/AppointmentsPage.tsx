import { useState } from 'react';
import { Calendar, List } from 'lucide-react';

type ViewMode = 'calendar' | 'list';

const AppointmentsPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  return (
    <div className="-mx-6 -mt-6"> {/* Eliminamos márgenes */}
      {/* Header con estadísticas */}
      <div className="bg-white border-b">
        <div className="px-4 py-6 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
              <p className="text-gray-600">Administra las citas y reservas</p>
            </div>
            
            {/* Toggles de vista */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'calendar'
                    ? 'bg-amber-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:bg-white hover:text-amber-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="hidden md:inline">Calendario</span>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-amber-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:bg-white hover:text-amber-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <List className="w-5 h-5" />
                  <span className="hidden md:inline">Lista</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;