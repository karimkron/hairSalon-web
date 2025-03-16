import { create } from 'zustand';

// Definición de la interfaz Service
interface Service {
  _id?: string;
  name: string;
  description: string;
  price: number;
  points: number;
  duration: number;
  category: string;
  image: string;
}

// Definición de la interfaz ServiceStore
interface ServiceStore {
  services: Service[];
  fetchServices: () => Promise<void>;
  addService: (formData: FormData) => Promise<void>;
  updateService: (id: string, formData: FormData) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
}

// Creación del store usando Zustand
const useServiceStore = create<ServiceStore>((set) => ({
  services: [],

  // Función para obtener servicios
  fetchServices: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al obtener servicios');
      const data = await response.json();
      set({ services: data });
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  // Función para agregar un servicio
  addService: async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Error al crear servicio');
      const newService = await response.json();
      set((state) => ({ services: [...state.services, newService] }));
    } catch (error) {
      console.error('Error adding service:', error);
      throw error;
    }
  },

  // Función para actualizar un servicio
  updateService: async (id, formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Error al actualizar servicio');
      const updatedService = await response.json();
      set((state) => ({
        services: state.services.map((s) => 
          s._id === id ? updatedService : s
        ),
      }));
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  // Función para eliminar un servicio
  deleteService: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al eliminar servicio');
      set((state) => ({ 
        services: state.services.filter((s) => s._id !== id) 
      }));
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  },
}));

// Exportar el store
export { useServiceStore };