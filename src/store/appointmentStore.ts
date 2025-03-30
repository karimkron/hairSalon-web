import { create } from 'zustand';

// Interfaces para el tipado
interface AppointmentStatus {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  needsRescheduling: number;
}

interface DateCount {
  date: string;
  count: number;
}

interface AppointmentStats {
  total: number;
  today: number;
  percentChange: number;
  byStatus: AppointmentStatus;
  byDate: DateCount[];
  byService: {
    serviceId: string;
    serviceName: string;
    count: number;
  }[];
  byHour: {
    hour: string;
    count: number;
  }[];
  mostPopularDay: string;
  mostPopularTime: string;
  cancellationRate: number;
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
    phone?: string;
  };
  services: {
    _id: string;
    name: string;
    duration: number;
    price: number;
    category?: string;
  }[];
  totalDuration: number;
  notes?: string;
  createdAt: string;
}

interface AppointmentStore {
  // Estados
  appointmentStats: AppointmentStats | null;
  todayAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  recentAppointments: Appointment[];
  loadingAppointments: boolean;
  error: string | null;
  
  // Acciones
  fetchAppointmentStats: (startDate: string, endDate: string) => Promise<void>;
  fetchTodayAppointments: () => Promise<void>;
  fetchUpcomingAppointments: () => Promise<void>;
  fetchRecentAppointments: () => Promise<void>;
  loadMockData: () => void;
}

export const useAppointmentStore = create<AppointmentStore>((set) => ({
  // Estados iniciales
  appointmentStats: null,
  todayAppointments: [],
  upcomingAppointments: [],
  recentAppointments: [],
  loadingAppointments: false,
  error: null,
  
  // Acción para cargar estadísticas de citas
  fetchAppointmentStats: async (startDate, endDate) => {
    try {
      set({ loadingAppointments: true, error: null });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      // Hacer la petición al backend para obtener estadísticas
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/appointments/stats?from=${startDate}&to=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener estadísticas de citas');
      }
      
      const data = await response.json();
      
      // Actualizar el estado con los datos recibidos
      set({
        appointmentStats: data,
        loadingAppointments: false,
      });
      
      // También cargar citas recientes de una vez
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/appointments?limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => res.json())
      .then(recentData => {
        set({ recentAppointments: recentData });
      })
      .catch(error => {
        console.error('Error fetching recent appointments:', error);
      });
      
    } catch (error: any) {
      console.error('Error fetching appointment stats:', error);
      set({ 
        error: error.message || 'Error al obtener estadísticas de citas',
        loadingAppointments: false 
      });
      
      // Cargar datos mock en caso de error o en desarrollo
      if (process.env.NODE_ENV === 'development') {
        set(state => ({ ...state, ...getMockData() }));
      }
    }
  },
  
  // Acción para cargar citas de hoy
  fetchTodayAppointments: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/appointments?from=${today}&to=${today}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Error al obtener citas de hoy');
      }
      
      const data = await response.json();
      set({ todayAppointments: data });
    } catch (error: any) {
      console.error('Error fetching today appointments:', error);
      // Usar datos mock en desarrollo
      if (process.env.NODE_ENV === 'development') {
        set({ todayAppointments: getMockData().todayAppointments });
      }
    }
  },
  
  // Acción para cargar próximas citas
  fetchUpcomingAppointments: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthStr = nextMonth.toISOString().split('T')[0];
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/appointments?from=${today}&to=${nextMonthStr}&status=pending,confirmed`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Error al obtener próximas citas');
      }
      
      const data = await response.json();
      set({ upcomingAppointments: data });
    } catch (error: any) {
      console.error('Error fetching upcoming appointments:', error);
      // Usar datos mock en desarrollo
      if (process.env.NODE_ENV === 'development') {
        set({ upcomingAppointments: getMockData().upcomingAppointments });
      }
    }
  },
  
  // Acción para cargar citas recientes
  fetchRecentAppointments: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/appointments?limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Error al obtener citas recientes');
      }
      
      const data = await response.json();
      set({ recentAppointments: data });
    } catch (error: any) {
      console.error('Error fetching recent appointments:', error);
      // Usar datos mock en desarrollo
      if (process.env.NODE_ENV === 'development') {
        set({ recentAppointments: getMockData().recentAppointments });
      }
    }
  },
  
  // Función para cargar datos de ejemplo (desarrollo o cuando hay errores)
  loadMockData: () => {
    const mockData = getMockData();
    set({
      appointmentStats: mockData.appointmentStats,
      todayAppointments: mockData.todayAppointments,
      upcomingAppointments: mockData.upcomingAppointments,
      recentAppointments: mockData.recentAppointments,
      loadingAppointments: false,
      error: null
    });
  }
}));

// Función auxiliar para generar datos de ejemplo
function getMockData() {
  // Generar fechas para datos históricos (últimos 14 días)
  const byDate = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return {
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 10) + 1 // 1 a 10 citas por día
    };
  });
  
  // Estadísticas
  const appointmentStats: AppointmentStats = {
    total: 156,
    today: 8,
    percentChange: 12.5,
    byStatus: {
      pending: 35,
      confirmed: 42,
      completed: 68,
      cancelled: 11,
      needsRescheduling: 0
    },
    byDate: byDate,
    byService: [
      { serviceId: '1', serviceName: 'Corte de Cabello', count: 45 },
      { serviceId: '2', serviceName: 'Afeitado', count: 32 },
      { serviceId: '3', serviceName: 'Coloración', count: 28 },
      { serviceId: '4', serviceName: 'Peinado', count: 18 },
      { serviceId: '5', serviceName: 'Tratamiento Capilar', count: 15 }
    ],
    byHour: [
      { hour: '09:00', count: 12 },
      { hour: '10:00', count: 18 },
      { hour: '11:00', count: 22 },
      { hour: '12:00', count: 15 },
      { hour: '13:00', count: 10 },
      { hour: '16:00', count: 14 },
      { hour: '17:00', count: 20 },
      { hour: '18:00', count: 25 },
      { hour: '19:00', count: 20 }
    ],
    mostPopularDay: 'Sábado',
    mostPopularTime: '11:00',
    cancellationRate: 7.05
  };
  
  // Generar citas de ejemplo
  const generateMockAppointments = (count: number, baseDate: Date, statusDistribution: Record<string, number>) => {
    const appointments: Appointment[] = [];
    const statuses = Object.keys(statusDistribution);
    const statusWeights = Object.values(statusDistribution);
    const services = [
      { _id: '1', name: 'Corte de Cabello', duration: 30, price: 15 },
      { _id: '2', name: 'Afeitado', duration: 20, price: 12 },
      { _id: '3', name: 'Coloración', duration: 90, price: 45 },
      { _id: '4', name: 'Peinado', duration: 30, price: 20 },
      { _id: '5', name: 'Tratamiento Capilar', duration: 45, price: 35 }
    ];
    const users = [
      { _id: 'u1', name: 'Juan Pérez', email: 'juan@example.com', phone: '123456789' },
      { _id: 'u2', name: 'María López', email: 'maria@example.com', phone: '987654321' },
      { _id: 'u3', name: 'Carlos Rodríguez', email: 'carlos@example.com', phone: '456123789' },
      { _id: 'u4', name: 'Ana Martínez', email: 'ana@example.com', phone: '789123456' },
      { _id: 'u5', name: 'Miguel Sánchez', email: 'miguel@example.com', phone: '654789123' }
    ];
    
    for (let i = 0; i < count; i++) {
      // Determinar el estado basado en la distribución de probabilidad
      let statusIndex = 0;
      const random = Math.random() * 100;
      let cumulative = 0;
      
      for (let j = 0; j < statusWeights.length; j++) {
        cumulative += statusWeights[j];
        if (random <= cumulative) {
          statusIndex = j;
          break;
        }
      }
      
      // Generar fecha y hora
      const appointmentDate = new Date(baseDate);
      appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 14) - 7); // -7 a +7 días
      appointmentDate.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 4) * 15, 0);
      
      // Seleccionar servicios aleatorios (1 a 3)
      const appointmentServices: { _id: string; name: string; duration: number; price: number; }[] = [];
      const serviceCount = Math.floor(Math.random() * 3) + 1;
      const serviceIndices = new Set<number>();
      
      while (serviceIndices.size < serviceCount) {
        serviceIndices.add(Math.floor(Math.random() * services.length));
      }
      
      let totalDuration = 0;
      Array.from(serviceIndices).forEach(index => {
        appointmentServices.push(services[index]);
        totalDuration += services[index].duration;
      });
      
      // Crear la cita
      appointments.push({
        _id: `app${i}`,
        date: appointmentDate.toISOString().split('T')[0],
        time: `${String(appointmentDate.getHours()).padStart(2, '0')}:${String(appointmentDate.getMinutes()).padStart(2, '0')}`,
        status: statuses[statusIndex] as any,
        user: users[Math.floor(Math.random() * users.length)],
        services: appointmentServices,
        totalDuration,
        createdAt: new Date(appointmentDate.getTime() - 86400000 * Math.floor(Math.random() * 10)).toISOString()
      });
    }
    
    return appointments;
  };
  
  // Generar citas para hoy
  const today = new Date();
  const todayAppointments = generateMockAppointments(8, today, {
    pending: 20,
    confirmed: 60,
    completed: 10,
    cancelled: 10
  });
  
  // Generar próximas citas
  const upcomingAppointments = generateMockAppointments(20, today, {
    pending: 40,
    confirmed: 60
  });
  
  // Generar citas recientes
  const recentAppointments = generateMockAppointments(10, today, {
    pending: 20,
    confirmed: 30,
    completed: 40,
    cancelled: 10
  });
  
  return {
    appointmentStats,
    todayAppointments,
    upcomingAppointments,
    recentAppointments
  };
}