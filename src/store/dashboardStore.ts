import { create } from 'zustand';

// Interfaces para el tipado
interface AppointmentStats {
  total: number;
  today: number;
  percentChange: number;
  byStatus: {
    pending?: number;
    confirmed?: number;
    completed?: number;
    cancelled?: number;
    needsRescheduling?: number;
  };
  byDate: { date: string; count: number }[];
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

interface ProductStats {
  confirmed: number;
  completed: number;
  cancelled: number;
  total: number;
  topProducts: {
    productId: string;
    name: string;
    count: number;
    quantity: number;
    image?: string | null;
  }[];
}

interface DashboardData {
  appointmentStats: AppointmentStats | null;
  productStats: ProductStats | null;
}

interface DashboardStore extends DashboardData {
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: (startDate: string, endDate: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  // Estado inicial
  appointmentStats: null,
  productStats: null,
  isLoading: false,
  error: null,

  // Acción para cargar datos del dashboard
  fetchDashboardData: async (startDate, endDate) => {
    try {
      set({ isLoading: true, error: null });

      // Obtener token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Realizar peticiones en paralelo
      const [appointmentsResponse, productsResponse] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/appointments/stats?from=${startDate}&to=${endDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
        fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/products/stats?from=${startDate}&to=${endDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
      ]);

      // Verificar respuestas
      if (!appointmentsResponse.ok) {
        const error = await appointmentsResponse.json();
        throw new Error(error.message || 'Error al obtener estadísticas de citas');
      }

      if (!productsResponse.ok) {
        const error = await productsResponse.json();
        throw new Error(error.message || 'Error al obtener estadísticas de productos');
      }

      // Obtener datos
      const appointmentStats = await appointmentsResponse.json();
      const productStats = await productsResponse.json();

      // Actualizar el estado
      set({
        appointmentStats,
        productStats,
        isLoading: false,
      });

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      set({ 
        error: error.message || 'Error al cargar datos del dashboard',
        isLoading: false 
      });
    }
  },
}));