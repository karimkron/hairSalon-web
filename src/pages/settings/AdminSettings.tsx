import { useEffect, useState } from 'react';
import ScheduleModal from './components/ScheduleModal';
import { useScheduleStore } from '../../store/scheduleStore';
import { Clock, Calendar, X } from 'lucide-react';

const daysOfWeek = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const AdminSettings = () => {
  const [showModal, setShowModal] = useState(false);
  const { schedule, fetchSchedule } = useScheduleStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true);
      try {
        await fetchSchedule();
      } catch (error) {
        console.error("Error al cargar el horario:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSchedule();
  }, [fetchSchedule]);

  const formatDate = (dateString: string | number | Date) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getClosedDays = () => {
    if (!schedule?.regularHours) return [];
    return daysOfWeek.filter(day => {
      const normalizedDay = day.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return schedule.regularHours[normalizedDay]?.closed;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Configuración del Horario</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Horario semanal */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-amber-600" />
                Horario Semanal
              </h2>
              <div className="text-sm text-gray-500">
                Última actualización: {new Date().toLocaleDateString()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Días laborables */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-700 border-b pb-2">Días laborables</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Día</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {daysOfWeek.map((day) => {
                        const normalizedDay = day.toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "");
                        const daySchedule = schedule?.regularHours?.[normalizedDay];
                        
                        return (
                          <tr key={day} className={`${daySchedule?.closed ? 'bg-gray-50' : ''}`}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="font-medium">{day}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {daySchedule?.closed ? (
                                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
                                  <X className="h-3 w-3 mr-1" />
                                  Cerrado
                                </span>
                              ) : (
                                <div className="text-sm text-gray-700">
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1 text-amber-600" />
                                    <span>Mañana: {daySchedule?.openingAM || '09:00'} - {daySchedule?.closingAM || '13:00'}</span>
                                  </div>
                                  {daySchedule?.openingPM && (
                                    <div className="flex items-center mt-1">
                                      <Clock className="h-3 w-3 mr-1 text-amber-600" />
                                      <span>Tarde: {daySchedule?.openingPM} - {daySchedule?.closingPM}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Días cerrados y especiales */}
              <div className="space-y-4">
                {/* Días cerrados semanales */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 border-b pb-2 mb-4">Días de cierre semanal</h3>
                  <div className="flex flex-wrap gap-2">
                    {getClosedDays().length > 0 ? (
                      getClosedDays().map(day => (
                        <span 
                          key={day}
                          className="inline-flex items-center rounded-full bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800"
                        >
                          <X className="h-4 w-4 mr-1" />
                          {day}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No hay días de cierre semanal configurados.</p>
                    )}
                  </div>
                </div>
                
                {/* Resumen de horario */}
                <div className="mt-8 bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <h3 className="text-sm font-medium text-amber-800 mb-2">Resumen de horario</h3>
                  <p className="text-sm text-amber-700">
                    El establecimiento está abierto de lunes a viernes en horario de mañana y tarde, los sábados solo por la mañana y cerrado los domingos.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Días especiales */}
          <div className="bg-white rounded-xl shadow-md p-6 h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-amber-600" />
                Días Especiales
              </h2>
            </div>
            
            <div className="space-y-4">
              {schedule?.specialDays?.length > 0 ? (
                schedule.specialDays.map((day, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{formatDate(day.date)}</span>
                        <span className="text-sm text-gray-600">{day.reason}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        day.schedule.closed 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {day.schedule.closed ? 'Cerrado' : 'Horario especial'}
                      </span>
                    </div>
                    
                    {!day.schedule.closed && (
                      <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center text-gray-700">
                          <Clock className="h-3 w-3 mr-1 text-amber-600" />
                          <span>Mañana: {day.schedule.openingAM} - {day.schedule.closingAM}</span>
                        </div>
                        {day.schedule.openingPM && (
                          <div className="flex items-center text-gray-700">
                            <Clock className="h-3 w-3 mr-1 text-amber-600" />
                            <span>Tarde: {day.schedule.openingPM} - {day.schedule.closingPM}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">No hay días especiales configurados</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Botón flotante */}
        <div className="fixed bottom-6 right-6">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all flex items-center gap-2 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Configurar Horario
          </button>
        </div>
      </div>

      {showModal && <ScheduleModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default AdminSettings;