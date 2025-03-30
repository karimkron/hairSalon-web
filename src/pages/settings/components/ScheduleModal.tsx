import { useState, useEffect } from "react";
import { useScheduleStore } from "../../../store/scheduleStore";
import { ArrowLeft, Calendar, Clock, AlertTriangle, Check, X, HelpCircle, Info } from "lucide-react";
import Swal from "sweetalert2";

interface DailySchedule {
  openingAM: string;
  closingAM: string;
  openingPM?: string;
  closingPM?: string;
  closed: boolean;
}

interface SpecialDay {
  date: string;
  reason: string;
  schedule: DailySchedule;
}

const daysOfWeek = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

// Función para comparar objetos profundamente
const isEqual = (obj1: any, obj2: any): boolean => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

const ScheduleModal = ({ onClose }: { onClose: () => void }) => {
  const { schedule, updateSchedule, fetchSchedule } = useScheduleStore();
  const [selectedDay, setSelectedDay] = useState("Lunes");
  const [specialDate, setSpecialDate] = useState("");
  const [specialReason, setSpecialReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [originalData, setOriginalData] = useState<any>(null);
  const [selectedSpecialDayIndex, setSelectedSpecialDayIndex] = useState<number | null>(null);
  
  // Estado para mostrar tooltips de ayuda
  const [showHelp, setShowHelp] = useState({
    regularHours: false,
    specialDays: false,
  });

  // Estado inicial limpio sin valores por defecto en horario de tarde
  const initialRegularHours = daysOfWeek.reduce(
    (acc, day) => ({
      ...acc,
      [day]: {
        openingAM: "09:00",
        closingAM: "13:00",
        openingPM: undefined,
        closingPM: undefined,
        closed: false,
      },
    }),
    {} as { [key: string]: DailySchedule }
  );

  const [formData, setFormData] = useState<{
    regularHours: { [key: string]: DailySchedule };
    specialDays: SpecialDay[];
  }>({
    regularHours: initialRegularHours,
    specialDays: [],
  });

  useEffect(() => {
    const loadScheduleData = async () => {
      setIsLoading(true);
      try {
        await fetchSchedule();
      } catch (error) {
        console.error("Error al cargar el horario:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo cargar la configuración de horario",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadScheduleData();
  }, [fetchSchedule]);

  useEffect(() => {
    if (schedule) {
      const backendRegularHours = schedule.regularHours || {};

      const mergedRegularHours = daysOfWeek.reduce((acc, day) => {
        // Normalizar el nombre del día para comparar con la BD
        const normalizedDay = day
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        
        const backendDay = backendRegularHours[normalizedDay];
        return {
          ...acc,
          [day]: backendDay
            ? {
                openingAM: backendDay.openingAM || "09:00",
                closingAM: backendDay.closingAM || "13:00",
                openingPM: backendDay.openingPM,
                closingPM: backendDay.closingPM,
                closed: backendDay.closed ?? false,
              }
            : initialRegularHours[day],
        };
      }, {} as { [key: string]: DailySchedule });

      const formattedData = {
        regularHours: mergedRegularHours,
        specialDays:
          schedule.specialDays?.map((day: any) => ({
            ...day,
            date: new Date(day.date).toISOString().split("T")[0],
          })) || [],
      };

      setFormData(formattedData);
      // Guardar una copia de los datos originales para comparación
      setOriginalData(JSON.parse(JSON.stringify(formattedData)));
    }
  }, [schedule]);

  const handleTimeChange = (
    day: string,
    field: keyof DailySchedule,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      regularHours: {
        ...prev.regularHours,
        [day]: {
          ...prev.regularHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleSpecialDayTimeChange = (
    index: number,
    field: keyof DailySchedule,
    value: string | boolean
  ) => {
    setFormData((prev) => {
      const updatedSpecialDays = [...prev.specialDays];
      updatedSpecialDays[index] = {
        ...updatedSpecialDays[index],
        schedule: {
          ...updatedSpecialDays[index].schedule,
          [field]: value,
        },
      };
      return {
        ...prev,
        specialDays: updatedSpecialDays,
      };
    });
  };

  const toggleAllDaySchedule = (day: string) => {
    const currentDaySchedule = formData.regularHours[day];
    
    setFormData((prev) => ({
      ...prev,
      regularHours: {
        ...prev.regularHours,
        [day]: {
          ...currentDaySchedule,
          openingPM: currentDaySchedule.openingPM ? undefined : "16:00",
          closingPM: currentDaySchedule.closingPM ? undefined : "20:00",
        },
      },
    }));
  };

  const toggleDayClosure = (day: string) => {
    const isClosed = formData.regularHours[day].closed;
    
    setFormData((prev) => ({
      ...prev,
      regularHours: {
        ...prev.regularHours,
        [day]: {
          ...prev.regularHours[day],
          closed: !isClosed,
          // Si estamos abriendo el día, establecemos horarios predeterminados
          openingAM: !isClosed ? prev.regularHours[day].openingAM : "09:00",
          closingAM: !isClosed ? prev.regularHours[day].closingAM : "13:00",
          openingPM: !isClosed ? prev.regularHours[day].openingPM : undefined,
          closingPM: !isClosed ? prev.regularHours[day].closingPM : undefined,
        },
      },
    }));
  };

  const handleAddSpecialDay = () => {
    if (!specialDate || !specialReason) {
      Swal.fire({
        title: "Información incompleta",
        text: "Por favor, selecciona una fecha y proporciona un motivo para el día especial",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }
    
    // Verificar si la fecha ya existe
    const existingDayIndex = formData.specialDays.findIndex(
      (day) => day.date === specialDate
    );
    
    if (existingDayIndex !== -1) {
      Swal.fire({
        title: "Fecha duplicada",
        text: "Esta fecha ya ha sido agregada como día especial",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    const newSpecialDay: SpecialDay = {
      date: specialDate,
      reason: specialReason,
      schedule: {
        openingAM: "09:00",
        closingAM: "13:00",
        closed: true,
        openingPM: undefined,
        closingPM: undefined,
      },
    };

    setFormData((prev) => ({
      ...prev,
      specialDays: [...prev.specialDays, newSpecialDay],
    }));

    // Seleccionar automáticamente el nuevo día especial
    setSelectedSpecialDayIndex(formData.specialDays.length);
    
    setSpecialDate("");
    setSpecialReason("");
  };

  const toggleSpecialDayConfiguration = (
    index: number,
    type: "closed" | "schedule"
  ) => {
    setFormData((prev) => {
      const updatedSpecialDays = [...prev.specialDays];
      const currentSpecialDay = updatedSpecialDays[index];

      if (type === "closed") {
        updatedSpecialDays[index] = {
          ...currentSpecialDay,
          schedule: {
            ...currentSpecialDay.schedule,
            closed: !currentSpecialDay.schedule.closed,
            openingAM: !currentSpecialDay.schedule.closed ? currentSpecialDay.schedule.openingAM : "09:00",
            closingAM: !currentSpecialDay.schedule.closed ? currentSpecialDay.schedule.closingAM : "13:00",
            openingPM: !currentSpecialDay.schedule.closed ? currentSpecialDay.schedule.openingPM : undefined,
            closingPM: !currentSpecialDay.schedule.closed ? currentSpecialDay.schedule.closingPM : undefined,
          },
        };
      } else if (type === "schedule") {
        updatedSpecialDays[index] = {
          ...currentSpecialDay,
          schedule: {
            ...currentSpecialDay.schedule,
            openingPM: currentSpecialDay.schedule.openingPM ? undefined : "16:00",
            closingPM: currentSpecialDay.schedule.closingPM ? undefined : "20:00",
          },
        };
      }

      // Seleccionar automáticamente el día especial modificado
      setSelectedSpecialDayIndex(index);

      return {
        ...prev,
        specialDays: updatedSpecialDays,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprobar si ha habido cambios
    if (isEqual(formData, originalData)) {
      Swal.fire({
        title: "Sin cambios",
        text: "No has realizado cambios en la configuración del horario",
        icon: "info",
        confirmButtonText: "Aceptar",
      });
      return;
    }
    
    // Preparar lista de cambios para mostrar al usuario
    const changes = [];
    
    // Comprobar cambios en horarios regulares
    for (const day of daysOfWeek) {
      const originalDay = originalData?.regularHours?.[day];
      const newDay = formData.regularHours[day];
      
      if (!isEqual(originalDay, newDay)) {
        if (originalDay?.closed !== newDay.closed) {
          changes.push(`• ${day}: ${newDay.closed ? "Ahora está cerrado" : "Ahora está abierto"}`);
        } else if (!newDay.closed) {
          changes.push(`• ${day}: Horario modificado`);
        }
      }
    }
    
    // Comprobar días especiales
    const originalSpecialDayDates = originalData?.specialDays.map((d: SpecialDay) => d.date) || [];
    const newSpecialDayDates = formData.specialDays.map(d => d.date);
    
    // Días especiales añadidos
    const addedDays = newSpecialDayDates.filter(d => !originalSpecialDayDates.includes(d));
    if (addedDays.length > 0) {
      changes.push(`• Días especiales añadidos: ${addedDays.length}`);
    }
    
    // Días especiales eliminados
    const removedDays = originalSpecialDayDates.filter((d: string) => !newSpecialDayDates.includes(d));
    if (removedDays.length > 0) {
      changes.push(`• Días especiales eliminados: ${removedDays.length}`);
    }
    
    // Días especiales modificados
    const commonDays = newSpecialDayDates.filter(d => originalSpecialDayDates.includes(d));
    let modifiedDays = 0;
    
    for (const date of commonDays) {
      const originalDay = originalData?.specialDays.find((d: SpecialDay) => d.date === date);
      const newDay = formData.specialDays.find(d => d.date === date);
      
      if (!isEqual(originalDay, newDay)) {
        modifiedDays++;
      }
    }
    
    if (modifiedDays > 0) {
      changes.push(`• Días especiales modificados: ${modifiedDays}`);
    }

    // Mostrar confirmación con los cambios
    const result = await Swal.fire({
      title: "¿Guardar cambios?",
      html: changes.length > 0 
        ? `<div class="text-left"><p>Se aplicarán los siguientes cambios:</p><p>${changes.join('<br>')}</p></div>`
        : "¿Estás seguro de que quieres guardar los cambios?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar cambios",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d97706", // color ámbar
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        
        // Limpieza de datos antes de enviar
        const cleanedData = {
          regularHours: Object.entries(formData.regularHours).reduce((acc, [day, schedule]) => {
            // Normalizar el nombre del día para enviarlo a la BD
            const normalizedDay = day
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
              
            return {
              ...acc,
              [normalizedDay]: {
                closed: schedule.closed,
                openingAM: schedule.openingAM || "09:00",
                closingAM: schedule.closingAM || "13:00",
                ...(schedule.openingPM && { openingPM: schedule.openingPM }),
                ...(schedule.closingPM && { closingPM: schedule.closingPM }),
              },
            };
          }, {}),
          specialDays: formData.specialDays.map((day) => ({
            ...day,
            date: new Date(day.date).toISOString().split('T')[0], // Asegurar formato de fecha correcto
            schedule: {
              closed: day.schedule.closed,
              openingAM: day.schedule.openingAM || "09:00",
              closingAM: day.schedule.closingAM || "13:00",
              ...(day.schedule.openingPM && { openingPM: day.schedule.openingPM }),
              ...(day.schedule.closingPM && { closingPM: day.schedule.closingPM }),
            },
          })),
        };

        await updateSchedule(cleanedData);
        
        await Swal.fire({
          title: "Configuración guardada",
          text: "El horario ha sido actualizado correctamente",
          icon: "success",
          confirmButtonText: "Continuar",
          confirmButtonColor: "#d97706", // color ámbar
        });
        
        // Actualizar datos originales
        setOriginalData(JSON.parse(JSON.stringify(formData)));
        
        // Cerrar el modal y volver a la página de configuración
        onClose();
      } catch (error) {
        console.error("Error saving schedule:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo guardar la configuración del horario",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSpecialDaySelect = (index: number) => {
    setSelectedSpecialDayIndex(selectedSpecialDayIndex === index ? null : index);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Cargando configuración de horario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-40 overflow-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={onClose}
                  className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Calendar className="h-6 w-6 mr-2 text-amber-600" />
                  Configuración de Horarios
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  Horario Regular
                  <button
                    type="button"
                    onClick={() => setShowHelp({ ...showHelp, regularHours: !showHelp.regularHours })}
                    className="ml-2 text-gray-400 hover:text-gray-500"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </h3>
              </div>

              {showHelp.regularHours && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Configuración del horario regular</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Selecciona el día de la semana que quieras configurar</li>
                        <li>Puedes marcar un día como cerrado o configurar sus horarios</li>
                        <li>Para cada día abierto, establece el horario de mañana</li>
                        <li>Opcionalmente, agrega un horario de tarde pulsando "Añadir horario tarde"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Selector de días */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`p-2 text-sm rounded-lg flex flex-col items-center transition-all ${
                      selectedDay === day
                        ? "bg-amber-600 text-white shadow-md"
                        : formData.regularHours[day]?.closed
                        ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <span className="font-medium">{day.substring(0, 3)}</span>
                    {formData.regularHours[day]?.closed && (
                      <span className="text-xs mt-1 flex items-center">
                        <X className="h-3 w-3 mr-0.5" />
                        Cerrado
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Horario del día seleccionado */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-800 text-lg">{selectedDay}</h4>
                  <div className="flex items-center">
                    <div className="flex items-center mr-4">
                      <input
                        type="checkbox"
                        id={`closed-${selectedDay}`}
                        checked={formData.regularHours[selectedDay].closed}
                        onChange={(e) =>
                          handleTimeChange(
                            selectedDay,
                            "closed",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                      />
                      <label htmlFor={`closed-${selectedDay}`} className="ml-2 text-sm text-gray-700">
                        Cerrado este día
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDayClosure(selectedDay)}
                      className={`text-sm px-3 py-1 rounded-md ${
                        formData.regularHours[selectedDay].closed
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {formData.regularHours[selectedDay].closed
                        ? "Abrir día"
                        : "Cerrar día"}
                    </button>
                  </div>
                </div>

                {!formData.regularHours[selectedDay].closed && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-700 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-amber-600" />
                        Horario Mañana
                      </h5>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">
                            Apertura
                          </label>
                          <input
                            type="time"
                            value={formData.regularHours[selectedDay].openingAM}
                            onChange={(e) =>
                              handleTimeChange(
                                selectedDay,
                                "openingAM",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">
                            Cierre
                          </label>
                          <input
                            type="time"
                            value={formData.regularHours[selectedDay].closingAM}
                            onChange={(e) =>
                              handleTimeChange(
                                selectedDay,
                                "closingAM",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium text-gray-700 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-600" />
                          Horario Tarde
                        </h5>
                        <button
                          type="button"
                          onClick={() => toggleAllDaySchedule(selectedDay)}
                          className="text-sm text-amber-600 hover:text-amber-700 flex items-center"
                        >
                          {formData.regularHours[selectedDay].openingPM ? (
                            <>
                              <X className="h-4 w-4 mr-1" />
                              Quitar horario tarde
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Añadir horario tarde
                            </>
                          )}
                        </button>
                      </div>
                      {formData.regularHours[selectedDay].openingPM && (
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-sm text-gray-600 mb-1">
                              Apertura
                            </label>
                            <input
                              type="time"
                              value={
                                formData.regularHours[selectedDay].openingPM ||
                                ""
                              }
                              onChange={(e) =>
                                handleTimeChange(
                                  selectedDay,
                                  "openingPM",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm text-gray-600 mb-1">
                              Cierre
                            </label>
                            <input
                              type="time"
                              value={
                                formData.regularHours[selectedDay].closingPM ||
                                ""
                              }
                              onChange={(e) =>
                                handleTimeChange(
                                  selectedDay,
                                  "closingPM",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Días especiales */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  Excepciones y Días Especiales
                  <button
                    type="button"
                    onClick={() => setShowHelp({ ...showHelp, specialDays: !showHelp.specialDays })}
                    className="ml-2 text-gray-400 hover:text-gray-500"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </h3>
              </div>

              {showHelp.specialDays && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Configuración de días especiales</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Utiliza esta sección para festivos, vacaciones o eventos especiales</li>
                        <li>Selecciona una fecha y añade un motivo descriptivo</li>
                        <li>Por defecto, los días especiales se marcan como cerrados</li>
                        <li>Puedes cambiar un día especial a abierto y configurar sus horarios específicos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={specialDate}
                    onChange={(e) => setSpecialDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                    min={new Date().toISOString().split('T')[0]} // Solo fechas futuras
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo
                  </label>
                  <input
                    type="text"
                    value={specialReason}
                    onChange={(e) => setSpecialReason(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Ej: Festivo nacional, Vacaciones..."
                  />
                </div>
                <div className="sm:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={handleAddSpecialDay}
                    className="w-full bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center"
                    disabled={!specialDate || !specialReason}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Añadir Excepción
                  </button>
                </div>
              </div>

              {formData.specialDays.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <Calendar className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">No hay días especiales configurados</p>
                  <p className="text-sm text-gray-400 mt-1">Añade festivos, vacaciones u otros días con horarios especiales</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.specialDays.map((day, index) => (
                          <tr 
                            key={day.date} 
                            className={`${day.schedule.closed ? "bg-red-50" : ""} 
                                       ${selectedSpecialDayIndex === index ? "bg-amber-50 border-l-4 border-amber-500" : ""}
                                       hover:bg-gray-50 cursor-pointer`}
                            onClick={() => handleSpecialDaySelect(index)}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              {new Date(day.date).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              })}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm">{day.reason}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {day.schedule.closed ? (
                                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
                                  <X className="h-3 w-3 mr-1" />
                                  Cerrado
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Abierto (horario especial)
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSpecialDayConfiguration(index, "closed");
                                  }}
                                  className={`text-xs px-2.5 py-1 rounded-md ${
                                    day.schedule.closed
                                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                                      : "bg-red-100 text-red-700 hover:bg-red-200"
                                  }`}
                                >
                                  {day.schedule.closed ? "Abrir" : "Cerrar"}
                                </button>
                                
                                {!day.schedule.closed && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSpecialDayConfiguration(index, "schedule");
                                    }}
                                    className="text-xs px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  >
                                    {day.schedule.openingPM ? "Quitar tarde" : "Añadir tarde"}
                                  </button>
                                )}
                                
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFormData((prev) => ({
                                      ...prev,
                                      specialDays: prev.specialDays.filter((_, i) => i !== index),
                                    }));
                                    if (selectedSpecialDayIndex === index) {
                                      setSelectedSpecialDayIndex(null);
                                    }
                                  }}
                                  className="text-xs px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Panel de detalle de día especial */}
              {formData.specialDays.length > 0 && selectedSpecialDayIndex !== null && (
                <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-800">
                      Configuración para: {formData.specialDays[selectedSpecialDayIndex].reason}
                      <span className="ml-2 text-sm text-gray-500">
                        ({new Date(formData.specialDays[selectedSpecialDayIndex].date).toLocaleDateString('es-ES')})
                      </span>
                    </h4>
                    
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => toggleSpecialDayConfiguration(selectedSpecialDayIndex, "closed")}
                        className={`text-xs px-3 py-1.5 rounded-md ${
                          formData.specialDays[selectedSpecialDayIndex].schedule.closed
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {formData.specialDays[selectedSpecialDayIndex].schedule.closed ? "Abrir día" : "Cerrar día"}
                      </button>
                      
                      {!formData.specialDays[selectedSpecialDayIndex].schedule.closed && (
                        <button
                          type="button"
                          onClick={() => toggleSpecialDayConfiguration(selectedSpecialDayIndex, "schedule")}
                          className="text-xs px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          {formData.specialDays[selectedSpecialDayIndex].schedule.openingPM
                            ? "Quitar horario tarde"
                            : "Añadir horario tarde"}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {!formData.specialDays[selectedSpecialDayIndex].schedule.closed && (
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-700 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-600" />
                          Horario Mañana
                        </h5>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-sm text-gray-600 mb-1">
                              Apertura
                            </label>
                            <input
                              type="time"
                              value={formData.specialDays[selectedSpecialDayIndex].schedule.openingAM}
                              onChange={(e) =>
                                handleSpecialDayTimeChange(
                                  selectedSpecialDayIndex,
                                  "openingAM",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm text-gray-600 mb-1">
                              Cierre
                            </label>
                            <input
                              type="time"
                              value={formData.specialDays[selectedSpecialDayIndex].schedule.closingAM}
                              onChange={(e) =>
                                handleSpecialDayTimeChange(
                                  selectedSpecialDayIndex,
                                  "closingAM",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>

                      {formData.specialDays[selectedSpecialDayIndex].schedule.openingPM && (
                        <div className="space-y-4">
                          <h5 className="font-medium text-gray-700 flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-amber-600" />
                            Horario Tarde
                          </h5>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-sm text-gray-600 mb-1">
                                Apertura
                              </label>
                              <input
                                type="time"
                                value={formData.specialDays[selectedSpecialDayIndex].schedule.openingPM || ""}
                                onChange={(e) =>
                                  handleSpecialDayTimeChange(
                                    selectedSpecialDayIndex,
                                    "openingPM",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm text-gray-600 mb-1">
                                Cierre
                              </label>
                              <input
                                type="time"
                                value={formData.specialDays[selectedSpecialDayIndex].schedule.closingPM || ""}
                                onChange={(e) =>
                                  handleSpecialDayTimeChange(
                                    selectedSpecialDayIndex,
                                    "closingPM",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {formData.specialDays[selectedSpecialDayIndex].schedule.closed && (
                    <div className="p-4 bg-red-50 rounded-md border border-red-200 text-red-700 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span>Este día está configurado como cerrado. Cambia a "Abrir día" para configurar horarios.</span>
                    </div>
                  )}
                </div>
              )}
              
              {formData.specialDays.length > 0 && selectedSpecialDayIndex === null && (
                <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-center p-4">
                    <Info className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-blue-700">
                      Selecciona un día especial de la tabla para configurar sus horarios.
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center p-4">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                    <span className="text-amber-700">
                      Importante: Los días especiales tienen prioridad sobre el horario regular.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-between mt-10 border-t pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center shadow-sm"
              >
                <Check className="h-4 w-4 mr-2" />
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;