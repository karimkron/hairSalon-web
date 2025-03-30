import { create } from 'zustand';

// Interfaces para tipado
interface SalesData {
  servicesSales: number;
  productsSales: number;
  totalSales: number;
  totalCustomers: number;
}

interface SalesItem {
  _id: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
  sales: number;
  image?: string;
}

interface MonthlySales {
  month: string;
  total: number;
  services: number;
  products: number;
}

interface SalesByCategoryItem {
  name: string;
  value: number;
}

interface SalesStore {
  // Estados
  isLoading: boolean;
  error: string | null;
  salesData: SalesData | null;
  topProducts: SalesItem[];
  topServices: SalesItem[];
  monthlySales: MonthlySales[];
  totalSales: number;
  salesByCategory: SalesByCategoryItem[];
  
  // Acciones
  fetchSalesData: (startDate: string, endDate: string) => Promise<void>;
  loadMockData: () => void;
}

// Crear el store
export const useSalesStore = create<SalesStore>((set) => ({
  // Estados iniciales
  isLoading: false,
  error: null,
  salesData: null,
  topProducts: [],
  topServices: [],
  monthlySales: [],
  totalSales: 0,
  salesByCategory: [],
  
  // Acción para cargar datos de ventas
  fetchSalesData: async (startDate, endDate) => {
    try {
      set({ isLoading: true, error: null });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      // Hacer la petición al backend para obtener datos de ventas
      // Cambiamos process.env.REACT_APP_API_URL por import.meta.env.VITE_API_URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/sales/dashboard?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener datos de ventas');
      }
      
      const data = await response.json();
      
      // Actualizar el estado con los datos recibidos
      set({
        salesData: data.salesData,
        topProducts: data.topProducts,
        topServices: data.topServices,
        monthlySales: data.monthlySales,
        totalSales: data.totalSales,
        salesByCategory: data.salesByCategory,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Error fetching sales data:', error);
      set({ 
        error: error.message || 'Error al obtener datos de ventas',
        isLoading: false 
      });
      
      // Cargar datos de ejemplo en caso de error o en desarrollo
      if (import.meta.env.DEV) {
        set(state => {
          // Solo cargar datos de ejemplo si aún no hay datos
          if (!state.salesData) {
            return { ...state, ...getMockData() };
          }
          return state;
        });
      }
    }
  },
  
  // Función para cargar datos de ejemplo (desarrollo o cuando hay errores)
  loadMockData: () => {
    const mockData = getMockData();
    set({
      salesData: mockData.salesData,
      topProducts: mockData.topProducts,
      topServices: mockData.topServices,
      monthlySales: mockData.monthlySales,
      totalSales: mockData.totalSales,
      salesByCategory: mockData.salesByCategory,
      isLoading: false,
      error: null
    });
  }
}));

// Función para obtener datos de ejemplo
function getMockData() {
  const salesData: SalesData = {
    servicesSales: 25680.50,
    productsSales: 15420.75,
    totalSales: 41101.25,
    totalCustomers: 387
  };
  
  const topProducts: SalesItem[] = [
    { _id: '1', name: 'Champú Premium', category: 'Cuidado Capilar', price: 24.99, quantity: 120, sales: 2998.80 },
    { _id: '2', name: 'Acondicionador Profesional', category: 'Cuidado Capilar', price: 19.99, quantity: 98, sales: 1959.02 },
    { _id: '3', name: 'Cera Moldeadora', category: 'Styling', price: 15.50, quantity: 85, sales: 1317.50 },
    { _id: '4', name: 'Kit de Barbería', category: 'Barbería', price: 45.00, quantity: 42, sales: 1890.00 },
    { _id: '5', name: 'Tinte Profesional', category: 'Coloración', price: 32.95, quantity: 65, sales: 2141.75 }
  ];
  
  const topServices: SalesItem[] = [
    { _id: '1', name: 'Corte de Cabello Caballero', category: 'Cortes Clásicos', price: 15.00, quantity: 420, sales: 6300.00 },
    { _id: '2', name: 'Corte y Peinado', category: 'Servicios Premium', price: 28.00, quantity: 310, sales: 8680.00 },
    { _id: '3', name: 'Coloración', category: 'Tratamientos', price: 45.00, quantity: 180, sales: 8100.00 },
    { _id: '4', name: 'Arreglo de Barba', category: 'Barbería', price: 12.00, quantity: 250, sales: 3000.00 },
    { _id: '5', name: 'Tratamiento Hidratante', category: 'Tratamientos Especiales', price: 35.00, quantity: 120, sales: 4200.00 }
  ];
  
  const monthlySales: MonthlySales[] = [
    { month: 'Ene', total: 5820.50, services: 3800.00, products: 2020.50 },
    { month: 'Feb', total: 6250.75, services: 4100.75, products: 2150.00 },
    { month: 'Mar', total: 7120.25, services: 4720.25, products: 2400.00 },
    { month: 'Abr', total: 6580.00, services: 4300.00, products: 2280.00 },
    { month: 'May', total: 7530.50, services: 4830.50, products: 2700.00 },
    { month: 'Jun', total: 7800.25, services: 5100.00, products: 2700.25 }
  ];
  
  const salesByCategory: SalesByCategoryItem[] = [
    { name: 'Cortes Clásicos', value: 8500.00 },
    { name: 'Servicios Premium', value: 10200.00 },
    { name: 'Tratamientos Especiales', value: 6980.50 },
    { name: 'Barbería', value: 4800.25 },
    { name: 'Cuidado Capilar', value: 5320.75 },
    { name: 'Coloración', value: 5300.75 }
  ];
  
  return {
    salesData,
    topProducts,
    topServices,
    monthlySales,
    totalSales: salesData.totalSales,
    salesByCategory
  };
}