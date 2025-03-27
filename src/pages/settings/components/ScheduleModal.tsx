import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScheduleStore } from "../../../store/scheduleStore";
import { Copy } from "lucide-react";

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

const ScheduleModal = ({ onClose }: { onClose: () => void }) => {
  const { schedule, updateSchedule } = useScheduleStore();
  const [selectedDay, setSelectedDay] = useState("Lunes");
  const [specialDate, setSpecialDate] = useState("");
  const [specialReason, setSpecialReason] = useState("");

  // Estado inicial con valores por defecto seguros
  const initialRegularHours = daysOfWeek.reduce(
    (acc, day) => ({
      ...acc,
      [day]: {
        openingAM: "09:00",
        closingAM: "13:00",
        openingPM: "15:00",
        closingPM: "19:00",
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
    if (schedule) {
      const backendRegularHours = schedule.regularHours || {};

      Copy;
      const mergedRegularHours = daysOfWeek.reduce((acc, day) => {
        const backendDay = backendRegularHours[day];
        return {
          ...acc,
          [day]: backendDay
            ? {
                openingAM:
                  backendDay.openingAM || initialRegularHours[day].openingAM,
                closingAM:
                  backendDay.closingAM || initialRegularHours[day].closingAM,
                openingPM:
                  backendDay.openingPM || initialRegularHours[day].openingPM,
                closingPM:
                  backendDay.closingPM || initialRegularHours[day].closingPM,
                closed: backendDay.closed ?? initialRegularHours[day].closed,
              }
            : initialRegularHours[day],
        };
      }, {} as { [key: string]: DailySchedule });

      setFormData({
        regularHours: mergedRegularHours,
        specialDays:
          schedule.specialDays?.map((day: any) => ({
            ...day,
            date: new Date(day.date).toISOString().split("T")[0],
          })) || [],
      });
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

  const toggleAllDaySchedule = (day: string) => {
    const currentDaySchedule = formData.regularHours[day];

    Copy;
    setFormData((prev) => ({
      ...prev,
      regularHours: {
        ...prev.regularHours,
        [day]: {
          ...currentDaySchedule,
          openingPM: currentDaySchedule.openingPM ? undefined : "15:00",
          closingPM: currentDaySchedule.closingPM ? undefined : "19:00",
        },
      },
    }));
  };

  const toggleDayClosure = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      regularHours: {
        ...prev.regularHours,
        [day]: {
          ...prev.regularHours[day],
          closed: !prev.regularHours[day].closed,
          openingPM: undefined,
          openingAM: "00:00",
          closingAM: "00:00",
          closingPM: undefined,
        },
      },
    }));
  };

  const handleAddSpecialDay = () => {
    if (specialDate && specialReason) {
      const newSpecialDay: SpecialDay = {
        date: specialDate,
        reason: specialReason,
        schedule: {
          openingAM: "00:00",
          closingAM: "00:00",
          closed: true,
          openingPM: undefined,
          closingPM: undefined,
        },
      };

      Copy;
      setFormData((prev) => ({
        ...prev,
        specialDays: [...prev.specialDays, newSpecialDay],
      }));

      setSpecialDate("");
      setSpecialReason("");
    }
  };

  const toggleSpecialDayConfiguration = (
    index: number,
    type: "closed" | "schedule"
  ) => {
    setFormData((prev) => {
      const updatedSpecialDays = [...prev.specialDays];
      const currentSpecialDay = updatedSpecialDays[index];

      Copy;
      if (type === "closed") {
        updatedSpecialDays[index] = {
          ...currentSpecialDay,
          schedule: {
            ...currentSpecialDay.schedule,
            closed: !currentSpecialDay.schedule.closed,
            openingAM: "00:00",
            closingAM: "00:00",
            openingPM: undefined,
            closingPM: undefined,
          },
        };
      } else {
        updatedSpecialDays[index] = {
          ...currentSpecialDay,
          schedule: {
            ...currentSpecialDay.schedule,
            openingPM: currentSpecialDay.schedule.openingPM
              ? undefined
              : "15:00",
            closingPM: currentSpecialDay.schedule.closingPM
              ? undefined
              : "19:00",
          },
        };
      }

      return {
        ...prev,
        specialDays: updatedSpecialDays,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSchedule({
        ...formData,
        specialDays: formData.specialDays.map((day) => ({
          ...day,
          date: new Date(day.date).toISOString(),
        })),
      });
      onClose();
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Configuración de Horarios
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            Copy
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Selector de días */}
              <div className="grid grid-cols-7 gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`p-2 text-sm rounded-lg transition-colors ${
                      selectedDay === day
                        ? "bg-amber-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>

              {/* Horario del día seleccionado */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.regularHours[selectedDay].closed}
                      onChange={(e) =>
                        handleTimeChange(
                          selectedDay,
                          "closed",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4"
                    />
                    Cerrado este día
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleDayClosure(selectedDay)}
                    className="text-sm text-amber-600 hover:text-amber-700"
                  >
                    {formData.regularHours[selectedDay].closed
                      ? "Abrir día"
                      : "Cerrar día"}
                  </button>
                </div>

                {!formData.regularHours[selectedDay].closed && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-700">
                        Horario Mañana
                      </h3>
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
                            className="w-full p-2 border rounded-lg"
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
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-700">
                          Horario Tarde
                        </h3>
                        <button
                          type="button"
                          onClick={() => toggleAllDaySchedule(selectedDay)}
                          className="text-sm text-amber-600 hover:text-amber-700"
                        >
                          {formData.regularHours[selectedDay].openingPM
                            ? "Quitar descanso"
                            : "Añadir horario tarde"}
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
                              className="w-full p-2 border rounded-lg"
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
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Días especiales */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Excepciones especiales
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    type="date"
                    value={specialDate}
                    onChange={(e) => setSpecialDate(e.target.value)}
                    className="p-2 border rounded-lg"
                    placeholder="Fecha especial"
                  />
                  <input
                    type="text"
                    value={specialReason}
                    onChange={(e) => setSpecialReason(e.target.value)}
                    className="p-2 border rounded-lg"
                    placeholder="Motivo del cierre"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpecialDay}
                    className="bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Añadir Excepción
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.specialDays.map((day, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">
                            {new Date(day.date).toLocaleDateString()}
                          </span>
                          <span className="text-gray-600 ml-4">
                            {day.reason}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              toggleSpecialDayConfiguration(index, "closed")
                            }
                            className="text-sm text-amber-600 hover:text-amber-700"
                          >
                            {day.schedule.closed ? "Abrir día" : "Cerrar día"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              toggleSpecialDayConfiguration(index, "schedule")
                            }
                            className="text-sm text-amber-600 hover:text-amber-700"
                          >
                            {day.schedule.openingPM
                              ? "Quitar descanso"
                              : "Añadir horario tarde"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                specialDays: prev.specialDays.filter(
                                  (_, i) => i !== index
                                ),
                              }))
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>

                      {!day.schedule.closed && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-600">
                              Horario Mañana
                            </h4>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">
                                  Apertura
                                </label>
                                <input
                                  type="time"
                                  value={day.schedule.openingAM}
                                  onChange={(e) => {
                                    const updatedSpecialDays = [
                                      ...formData.specialDays,
                                    ];
                                    updatedSpecialDays[
                                      index
                                    ].schedule.openingAM = e.target.value;
                                    setFormData((prev) => ({
                                      ...prev,
                                      specialDays: updatedSpecialDays,
                                    }));
                                  }}
                                  className="w-full p-2 border rounded-lg text-sm"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">
                                  Cierre
                                </label>
                                <input
                                  type="time"
                                  value={day.schedule.closingAM}
                                  onChange={(e) => {
                                    const updatedSpecialDays = [
                                      ...formData.specialDays,
                                    ];
                                    updatedSpecialDays[
                                      index
                                    ].schedule.closingAM = e.target.value;
                                    setFormData((prev) => ({
                                      ...prev,
                                      specialDays: updatedSpecialDays,
                                    }));
                                  }}
                                  className="w-full p-2 border rounded-lg text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          {day.schedule.openingPM && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-600">
                                Horario Tarde
                              </h4>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-500 mb-1">
                                    Apertura
                                  </label>
                                  <input
                                    type="time"
                                    value={day.schedule.openingPM}
                                    onChange={(e) => {
                                      const updatedSpecialDays = [
                                        ...formData.specialDays,
                                      ];
                                      updatedSpecialDays[
                                        index
                                      ].schedule.openingPM = e.target.value;
                                      setFormData((prev) => ({
                                        ...prev,
                                        specialDays: updatedSpecialDays,
                                      }));
                                    }}
                                    className="w-full p-2 border rounded-lg text-sm"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-500 mb-1">
                                    Cierre
                                  </label>
                                  <input
                                    type="time"
                                    value={day.schedule.closingPM}
                                    onChange={(e) => {
                                      const updatedSpecialDays = [
                                        ...formData.specialDays,
                                      ];
                                      updatedSpecialDays[
                                        index
                                      ].schedule.closingPM = e.target.value;
                                      setFormData((prev) => ({
                                        ...prev,
                                        specialDays: updatedSpecialDays,
                                      }));
                                    }}
                                    className="w-full p-2 border rounded-lg text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScheduleModal;
