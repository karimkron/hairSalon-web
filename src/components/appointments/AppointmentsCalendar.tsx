import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, User, Scissors, Clock, List, Calendar as CalendarIcon, Grid, ShoppingBag } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, isBefore, addMonths, subMonths, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

// Definición de tipos
interface CartProduct {
  product: {
    _id: string;
    name: string;
    price: number;
    description?: string;
  };
  quantity: number;
  status: 'pending' | 'confirmed';
}

interface Appointment {
  _id: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'needsRescheduling';
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  services: {
    _id: string;
    name: string;
    duration: number;
    price: number;
    category: string;
  }[];
  totalDuration: number;
  notes?: string;
  cartItems?: CartProduct[];
}

// Definir tipos de vistas
type ViewType = 'day' | 'week' | 'month';

const AppointmentsCalendar: React.FC = () => {
  // Estados
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  
  // Cargar datos de citas
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Calcular rango de fechas según la vista actual
        let startDate, endDate;
        
        if (viewType === 'day') {
          startDate = format(currentDate, 'yyyy-MM-dd');
          endDate = format(currentDate, 'yyyy-MM-dd');
        } else if (viewType === 'week') {
          const start = startOfWeek(currentDate, { locale: es });
          const end = endOfWeek(currentDate, { locale: es });
          startDate = format(start, 'yyyy-MM-dd');
          endDate = format(end, 'yyyy-MM-dd');
        } else {
          const start = startOfMonth(currentDate);
          const end = endOfMonth(currentDate);
          startDate = format(start, 'yyyy-MM-dd');
          endDate = format(end, 'yyyy-MM-dd');
        }
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No hay token de autenticación');
        }
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/appointments?from=${startDate}&to=${endDate}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener las citas');
        }
        
        const data = await response.json();
        // Filtrar citas canceladas
        const filteredData = data.filter((appointment: Appointment) => appointment.status !== 'cancelled');
        setAppointments(filteredData);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppointments();
  }, [currentDate, viewType]);
  
  // Función para navegar por las fechas
  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewType === 'day') {
      setCurrentDate(prevDate => {
        return direction === 'prev' 
          ? addDays(prevDate, -1) 
          : addDays(prevDate, 1);
      });
    } else if (viewType === 'week') {
      setCurrentDate(prevDate => {
        return direction === 'prev' 
          ? subWeeks(prevDate, 1) 
          : addWeeks(prevDate, 1);
      });
    } else {
      setCurrentDate(prevDate => {
        return direction === 'prev' 
          ? subMonths(prevDate, 1) 
          : addMonths(prevDate, 1);
      });
    }
  };
  
  // Función para mostrar detalles de una cita
  const showAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };
  
  // Obtener los horarios de trabajo (de 9:00 a 20:00 cada 30 minutos)
  const workingHours = Array.from({ length: 22 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${hour}:${minutes}`;
  });
  
  // Convertir hora en formato "HH:MM" a minutos desde las 00:00
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  // Calcular posición y altura para citas en vista día/semana
  const getAppointmentStyle = (appointment: Appointment) => {
    const startMinutes = timeToMinutes(appointment.time);
    const startHour = 9 * 60; // 9:00 AM en minutos
    
    // Calcular la hora de finalización basada en la hora de inicio + duración
    const endMinutes = startMinutes + appointment.totalDuration;
    
    const topPosition = ((startMinutes - startHour) / 30) * 50; // 50px por cada slot de 30 minutos
    const height = ((endMinutes - startMinutes) / 30) * 50; // Altura basada en la duración real
    
    return {
      top: `${topPosition}px`,
      height: `${height}px`,
    };
  };
  
  // Obtener color según estado de la cita
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 border-blue-400 text-blue-700';
      case 'confirmed':
        return 'bg-green-100 border-green-400 text-green-700';
      case 'completed':
        return 'bg-gray-100 border-gray-400 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'needsRescheduling':
        return 'bg-amber-100 border-amber-400 text-amber-700';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };
  
  // Renderizado de vista diaria
  const renderDayView = () => {
    const formattedDate = format(currentDate, 'EEEE, d MMMM yyyy', { locale: es });
    const dayAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isSameDay(appointmentDate, currentDate);
    });
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold capitalize">{formattedDate}</h3>
          {dayAppointments.length > 0 ? (
            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
              {dayAppointments.length} {dayAppointments.length === 1 ? 'cita' : 'citas'}
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              Sin citas
            </span>
          )}
        </div>
        
        <div className="relative h-[1100px] overflow-y-auto">
          {/* Lineas de hora */}
          <div className="absolute left-0 top-0 w-16 h-full border-r bg-gray-50">
            {workingHours.map((time, _index) => (
              <div 
                key={time} 
                className="flex items-center justify-center h-[50px] text-xs text-gray-500 border-b"
              >
                {time}
              </div>
            ))}
          </div>
          
          {/* Área principal */}
          <div className="ml-16 relative h-full">
            {/* Líneas horizontales para cada hora */}
            {workingHours.map((time, index) => (
              <div 
                key={time}
                className="absolute w-full h-[50px] border-b border-gray-100"
                style={{ top: `${index * 50}px` }}
              ></div>
            ))}
            
            {/* Renderizar citas */}
            {dayAppointments.map(appointment => {
              const style = getAppointmentStyle(appointment);
              const statusColor = getStatusColor(appointment.status);
              
              return (
                <div
                  key={appointment._id}
                  onClick={() => showAppointmentDetails(appointment)}
                  className={`absolute left-2 right-2 p-2 rounded-md border ${statusColor} cursor-pointer hover:shadow-md transition-shadow duration-200`}
                  style={style}
                >
                  <div className="text-sm font-medium truncate">
                    {appointment.time} - {appointment.user.name}
                  </div>
                  <div className="text-xs truncate">
                    {appointment.services.map(s => s.name).join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  // Renderizado de vista semanal
  const renderWeekView = () => {
    const startDay = startOfWeek(currentDate, { locale: es });
    const endDay = endOfWeek(currentDate, { locale: es });
    const days = eachDayOfInterval({ start: startDay, end: endDay });
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">
            {format(startDay, 'd MMM', { locale: es })} - {format(endDay, 'd MMM yyyy', { locale: es })}
          </h3>
        </div>
        
        <div className="flex">
          {/* Columna de horas */}
          <div className="w-16 border-r">
            <div className="h-10 border-b"></div> {/* Espacio para encabezados */}
            {workingHours.map(time => (
              <div key={time} className="h-[50px] flex items-center justify-center text-xs text-gray-500 border-b">
                {time}
              </div>
            ))}
          </div>
          
          {/* Columnas para cada día */}
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-[700px] flex">
              {days.map(day => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div key={day.toString()} className="flex-1 min-w-[100px]">
                    {/* Encabezado del día */}
                    <div 
                      className={`h-10 border-b px-2 flex flex-col justify-center items-center
                        ${isToday ? 'bg-amber-50' : ''}
                        ${!isCurrentMonth ? 'text-gray-400' : ''}`}
                    >
                      <div className="text-xs uppercase">{format(day, 'EEE', { locale: es })}</div>
                      <div className={`text-sm font-semibold ${isToday ? 'bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                    
                    {/* Contenido del día */}
                    <div className="relative" style={{ height: `${workingHours.length * 50}px` }}>
                      {/* Líneas de hora */}
                      {workingHours.map((_, index) => (
                        <div 
                          key={index}
                          className="absolute w-full h-[50px] border-b border-r border-gray-100"
                          style={{ top: `${index * 50}px` }}
                        ></div>
                      ))}
                      
                      {/* Citas del día */}
                      {appointments
                        .filter(appointment => isSameDay(new Date(appointment.date), day))
                        .map(appointment => {
                          const style = getAppointmentStyle(appointment);
                          const statusColor = getStatusColor(appointment.status);
                          
                          return (
                            <div
                              key={appointment._id}
                              onClick={() => showAppointmentDetails(appointment)}
                              className={`absolute left-0.5 right-0.5 mx-0.5 p-1 rounded border ${statusColor} cursor-pointer hover:shadow-md transition-shadow duration-200 overflow-hidden`}
                              style={style}
                            >
                              <div className="text-xs font-medium truncate">{appointment.time}</div>
                              <div className="text-xs truncate">{appointment.user.name}</div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderizado de vista mensual
  const renderMonthView = () => {
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);
    const startDayOfWeek = getDay(startDate); // 0 (domingo) a 6 (sábado)
    
    // Ajustar para que la semana comience en lunes (1) en lugar de domingo (0)
    const startOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    // Crear un array con los días que se mostrarán en el calendario
    let calendarDays = [];
    
    // Agregar días del mes anterior para completar la primera semana
    for (let i = 0; i < startOffset; i++) {
      calendarDays.push(addDays(startDate, -startOffset + i));
    }
    
    // Agregar todos los días del mes actual
    for (let i = 0; i <= endDate.getDate() - 1; i++) {
      calendarDays.push(addDays(startDate, i));
    }
    
    // Agregar días del mes siguiente para completar la última semana
    const rowsNeeded = Math.ceil(calendarDays.length / 7);
    const totalCells = rowsNeeded * 7;
    const remainingCells = totalCells - calendarDays.length;
    
    for (let i = 1; i <= remainingCells; i++) {
      calendarDays.push(addDays(endDate, i));
    }
    
    // Agrupar días en semanas
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }
    
    // Función para manejar el clic en un día
    const handleDayClick = (day: Date) => {
      // Cambiar a la vista diaria
      setViewType('day');
      // Establecer la fecha seleccionada
      setCurrentDate(day);
    };
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h3>
        </div>
        
        <div className="grid grid-cols-7 text-center border-b">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="py-2 text-xs font-semibold uppercase text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 text-sm">
          {weeks.flat().map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelectedDay = isSameDay(day, currentDate);
            const isPastDay = isBefore(day, new Date()) && !isToday(day);
            
            // Filtrar citas para este día
            const dayAppointments = appointments.filter(appointment => 
              isSameDay(new Date(appointment.date), day)
            );
            
            return (
              <div 
                key={idx} 
                onClick={() => handleDayClick(day)}
                className={`min-h-[100px] border-b border-r p-1 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isSelectedDay ? 'bg-amber-50' : ''} ${isPastDay ? 'bg-gray-50' : ''} 
                  ${isCurrentMonth && !isPastDay ? 'cursor-pointer hover:bg-amber-50' : ''}`}
              >
                <div className={`text-right mb-1 ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>
                  {isToday(day) ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-600 text-white rounded-full">
                      {format(day, 'd')}
                    </span>
                  ) : (
                    <span>{format(day, 'd')}</span>
                  )}
                </div>
                
                <div className="space-y-1 overflow-y-auto max-h-20">
                  {dayAppointments.length > 0 ? (
                    dayAppointments.map(appointment => {
                      const statusColor = getStatusColor(appointment.status);
                      
                      return (
                        <div
                          key={appointment._id}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevenir que el clic se propague al día
                            showAppointmentDetails(appointment);
                          }}
                          className={`px-1 py-0.5 text-xs rounded truncate cursor-pointer ${statusColor}`}
                        >
                          {appointment.time} - {appointment.user.name.split(' ')[0]}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-xs text-gray-400 italic">
                      {isCurrentMonth && !isPastDay ? 'Sin citas' : ''}
                    </div>
                  )}
                </div>
                
                {/* Indicador de cantidad de citas */}
                {dayAppointments.length > 0 && (
                  <div className="mt-1 text-center">
                    <span className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-full">
                      {dayAppointments.length} {dayAppointments.length === 1 ? 'cita' : 'citas'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Función para marcar una cita como completada
  const markAppointmentAsCompleted = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/appointments/${appointmentId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'completed' })
      });
      
      if (!response.ok) {
        throw new Error('Error al completar la cita');
      }
      
      // Actualizar el estado local
      setAppointments(prevAppointments => 
        prevAppointments.map(app => 
          app._id === appointmentId 
            ? { ...app, status: 'completed' } 
            : app
        )
      );
      
      // Actualizar la cita seleccionada si está abierta
      if (selectedAppointment && selectedAppointment._id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, status: 'completed' });
      }
      
      // Mostrar mensaje de éxito
      alert('Cita marcada como completada exitosamente');
      
    } catch (error) {
      console.error('Error al marcar la cita como completada:', error);
      alert('Error al marcar la cita como completada');
    }
  };
  
  // Modal de detalles de la cita
  const renderAppointmentDetails = () => {
    if (!selectedAppointment || !isDetailsOpen) return null;
    
    const appointmentDate = new Date(selectedAppointment.date);
    
    // Calcular la hora de finalización
    const [hoursStr, minutesStr] = selectedAppointment.time.split(':');
    const startHours = parseInt(hoursStr);
    const startMinutes = parseInt(minutesStr);
    
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = startTimeInMinutes + selectedAppointment.totalDuration;
    
    const endHours = Math.floor(endTimeInMinutes / 60);
    const endMinutes = endTimeInMinutes % 60;
    
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b px-4 py-3">
            <h2 className="text-lg font-bold">Detalles de la Cita</h2>
            <button 
              onClick={() => setIsDetailsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="p-4">
            <div className={`mb-4 px-3 py-2 rounded-md ${getStatusColor(selectedAppointment.status)}`}>
              <div className="text-sm font-semibold">
                Estado: {
                  selectedAppointment.status === 'pending' ? 'Pendiente' :
                  selectedAppointment.status === 'confirmed' ? 'Confirmada' :
                  selectedAppointment.status === 'completed' ? 'Completada' :
                  selectedAppointment.status === 'cancelled' ? 'Cancelada' :
                  selectedAppointment.status === 'needsRescheduling' ? 'Necesita reprogramación' :
                  selectedAppointment.status
                }
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Fecha y Hora</p>
                  <p className="text-sm">
                    {format(appointmentDate, 'EEEE, d MMMM yyyy', { locale: es })}
                  </p>
                  <p className="text-sm font-medium">
                    {selectedAppointment.time} - {endTime} ({selectedAppointment.totalDuration} min)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <User className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Cliente</p>
                  <p className="text-sm">{selectedAppointment.user.name}</p>
                  <p className="text-xs text-gray-500">{selectedAppointment.user.email}</p>
                  <p className="text-xs text-gray-500">{selectedAppointment.user.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Scissors className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Servicios</p>
                  <ul className="text-sm space-y-1 mt-1">
                    {selectedAppointment.services.map(service => (
                      <li key={service._id} className="flex justify-between">
                        <span>{service.name}</span>
                        <span className="font-medium">${service.price}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-sm font-medium">Total Servicios:</span>
                    <span className="text-sm font-bold">
                      ${selectedAppointment.services.reduce((sum, service) => sum + service.price, 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Productos en carrito */}
              {selectedAppointment.cartItems && selectedAppointment.cartItems.length > 0 && (
                <div className="flex items-start">
                  <ShoppingBag className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Productos</p>
                    <ul className="text-sm space-y-1 mt-1">
                      {selectedAppointment.cartItems.map((item, index) => (
                        <li key={index} className="flex justify-between">
                          <div>
                            <span>{item.product.name} x{item.quantity}</span>
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-100">
                              {item.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                            </span>
                          </div>
                          <span className="font-medium">${item.product.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-sm font-medium">Total Productos:</span>
                      <span className="text-sm font-bold">
                        ${selectedAppointment.cartItems.reduce(
                          (sum, item) => sum + (item.product.price * item.quantity), 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Duración</p>
                  <p className="text-sm">{selectedAppointment.totalDuration} minutos</p>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div className="bg-gray-50 p-3 rounded-md mt-3">
                  <p className="text-sm font-semibold">Notas</p>
                  <p className="text-sm">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t px-4 py-3 flex justify-end space-x-2">
            {/* Botón para marcar como completada (solo visible si no está completada o cancelada) */}
            {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed') && (
              <button
                onClick={() => markAppointmentAsCompleted(selectedAppointment._id)}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
              >
                Marcar como Completada
              </button>
            )}
            
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderizado principal
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Cabecera */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendario de Citas</h1>
        <p className="text-gray-600">Visualiza y gestiona todas las citas programadas</p>
      </div>
      
      {/* Controles */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Navegación de fechas */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigateDate('prev')}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Fecha anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-lg font-semibold">
            {viewType === 'day' && format(currentDate, 'd MMMM yyyy', { locale: es })}
            {viewType === 'week' && (
              <>
                {format(startOfWeek(currentDate, { locale: es }), 'd MMM', { locale: es })} 
                {' - '} 
                {format(endOfWeek(currentDate, { locale: es }), 'd MMM yyyy', { locale: es })}
              </>
            )}
            {viewType === 'month' && format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          
          <button 
            onClick={() => navigateDate('next')}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Fecha siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            className="ml-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
          >
            Hoy
          </button>
        </div>
        
        {/* Selector de vista */}
        <div className="flex bg-gray-100 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setViewType('day')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium ${
              viewType === 'day'
                ? 'bg-amber-600 text-white shadow'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Día</span>
          </button>
          
          <button
            onClick={() => setViewType('week')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium ${
              viewType === 'week'
                ? 'bg-amber-600 text-white shadow'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Semana</span>
          </button>
          
          <button
            onClick={() => setViewType('month')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium ${
              viewType === 'month'
                ? 'bg-amber-600 text-white shadow'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span className="hidden sm:inline">Mes</span>
          </button>
        </div>
      </div>
      
      {/* Contenido principal */}
      {isLoading ? (
        // Skeleton loading
        <div className="bg-white rounded-lg shadow p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        // Error message
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error al cargar las citas</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md"
          >
            Intentar de nuevo
          </button>
        </div>
      ) : (
        // Calendar view based on the selected type
        <>
          {viewType === 'day' && renderDayView()}
          {viewType === 'week' && renderWeekView()}
          {viewType === 'month' && renderMonthView()}
        </>
      )}
      
      {/* Modal de detalles */}
      {renderAppointmentDetails()}
    </div>
  );
};

export default AppointmentsCalendar;