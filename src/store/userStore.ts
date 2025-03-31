import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Definición de la interfaz User
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'superadmin';
  rank: 'bronce' | 'plata' | 'oro' | 'diamante';
  isBlocked: boolean;
  createdAt: string;
}

// Interfaz para metadatos de paginación
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Definición de la interfaz UserStore
interface UserStore {
  users: User[];
  currentUser: User | null; // Usuario actual
  isLoading: boolean; // Indicador de carga
  paginationMeta: PaginationMeta | null; // Metadatos de paginación
  setCurrentUser: (user: User | null) => void; // Función para establecer el usuario actual
  fetchCurrentUser: () => Promise<void>; // Función para obtener el usuario actual desde el servidor
  fetchUsers: (page?: number, search?: string) => Promise<{ users: User[], pagination: PaginationMeta }>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  updatePassword: (id: string, newPassword: string) => Promise<void>;
  toggleBlockUser: (id: string, isBlocked: boolean) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

// Valores iniciales para paginación
const initialPaginationMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false
};

// Creación del store usando Zustand con persistencia
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      isLoading: false,
      paginationMeta: initialPaginationMeta,

      // Función para establecer el usuario actual
      setCurrentUser: (user) => set({ currentUser: user }),

      // Función para obtener el usuario actual desde el token
      fetchCurrentUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Error al obtener información del usuario');
          }

          const userData = await response.json();
          set({ currentUser: userData, isLoading: false });
        } catch (error) {
          console.error('Error fetching current user:', error);
          set({ isLoading: false });
        }
      },

      // Función para obtener todos los usuarios con paginación y búsqueda
      fetchUsers: async (page = 1, search = '') => {
        set({ isLoading: true });
        
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No se encontró token de autenticación');
          }
          
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: '10',
            ...(search ? { search } : {})
          }).toString();
          
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users?${queryParams}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Error al obtener los usuarios');
          }

          const data = await response.json();
          set({ 
            users: data.users,
            paginationMeta: data.pagination,
            isLoading: false 
          });
          
          return data;
        } catch (error) {
          console.error('Error fetching users:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Función para actualizar un usuario
      updateUser: async (id, user) => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
          });

          if (!response.ok) {
            throw new Error('Error al actualizar el usuario');
          }

          const updatedUser = await response.json();
          
          // Actualizar la lista de usuarios
          set((state) => ({
            users: state.users.map((u) => (u._id === id ? updatedUser : u)),
          }));

          // Si el usuario actualizado es el usuario actual, actualizar también currentUser
          const { currentUser } = get();
          if (currentUser && currentUser._id === id) {
            set({ currentUser: { ...currentUser, ...user } });
          }
        } catch (error) {
          console.error('Error updating user:', error);
          throw error;
        }
      },

      // Función para actualizar la contraseña de un usuario
      updatePassword: async (id, newPassword) => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}/password`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newPassword }),
          });

          if (!response.ok) {
            throw new Error('Error al actualizar la contraseña');
          }
        } catch (error) {
          console.error('Error updating password:', error);
          throw error;
        }
      },

      // Función para bloquear/desbloquear un usuario
      toggleBlockUser: async (id, isBlocked) => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}/block`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isBlocked }),
          });

          if (!response.ok) {
            throw new Error('Error al bloquear/desbloquear el usuario');
          }

          const data = await response.json();
          
          // Actualizar el estado en la lista de usuarios
          set((state) => ({
            users: state.users.map((u) => 
              u._id === id ? { ...u, isBlocked: data.isBlocked } : u
            ),
          }));
        } catch (error) {
          console.error('Error toggling block user:', error);
          throw error;
        }
      },

      // Función para eliminar un usuario
      deleteUser: async (id) => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Error al eliminar el usuario');
          }

          set((state) => ({
            users: state.users.filter((u) => u._id !== id),
          }));
        } catch (error) {
          console.error('Error deleting user:', error);
          throw error;
        }
      },
    }),
    {
      name: 'user-storage', // Nombre para el almacenamiento en localStorage
      partialize: (state) => ({ currentUser: state.currentUser }), // Solo persistir el usuario actual
    }
  )
);