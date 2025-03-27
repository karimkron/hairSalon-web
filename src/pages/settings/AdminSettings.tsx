import { useEffect, useState } from 'react';
import ScheduleModal from './components/ScheduleModal';
import { useScheduleStore } from '../../store/scheduleStore';

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

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getClosedDays = () => {
    return daysOfWeek.filter(day => 
      schedule?.regularHours?.[day]?.closed
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 relative min-h-[300px]">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Horario Actual</h2>
        
        {/* Horario Regular */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Horario Regular</h3>
          <div className="grid gap-4">
            {daysOfWeek.map(day => {
              const scheduleDay = schedule?.regularHours?.[day];
              return (
                <div key={day} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{day}</span>
                    {scheduleDay?.closed ? (
                      <span className="text-red-600">Cerrado</span>
                    ) : (
                      <div className="flex gap-4">
                        <div>
                          <span className="text-gray-600">Mañana: </span>
                          {scheduleDay?.openingAM} - {scheduleDay?.closingAM}
                        </div>
                        {scheduleDay?.openingPM && (
                          <div>
                            <span className="text-gray-600">Tarde: </span>
                            {scheduleDay?.openingPM} - {scheduleDay?.closingPM}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Días de cierre regular */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Días de cierre semanal</h3>
          <div className="flex flex-wrap gap-2">
            {getClosedDays().length > 0 ? (
              getClosedDays().map(day => (
                <span 
                  key={day}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                >
                  {day}
                </span>
              ))
            ) : (
              <p className="text-gray-400">No hay días de cierre regular</p>
            )}
          </div>
        </div>

        {/* Días especiales */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Días especiales</h3>
          <div className="space-y-3">
            {schedule?.specialDays?.length > 0 ? (
              schedule.specialDays.map((day, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium">{formatDate(day.date)}</span>
                      <span className="text-gray-600 ml-2">- {day.reason}</span>
                    </div>
                    <span className={`px-2 py-1 rounded ${day.schedule.closed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {day.schedule.closed ? 'Cerrado' : 'Horario especial'}
                    </span>
                  </div>
                  {!day.schedule.closed && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Mañana: </span>
                        {day.schedule.openingAM} - {day.schedule.closingAM}
                      </div>
                      {day.schedule.openingPM && (
                        <div>
                          <span className="text-gray-600">Tarde: </span>
                          {day.schedule.openingPM} - {day.schedule.closingPM}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400">No hay días especiales registrados</p>
            )}
          </div>
        </div>

        {/* Botón flotante */}
        <div className="absolute bottom-6 right-6">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2"
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