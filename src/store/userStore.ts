import { create } from 'zustand';

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

// Definición de la interfaz UserStore
interface UserStore {
  users: User[];
  currentUser: User | null; // Nuevo estado para el usuario actual
  setCurrentUser: (user: User | null) => void; // Función para establecer el usuario actual
  fetchUsers: () => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  updatePassword: (id: string, newPassword: string) => Promise<void>;
  toggleBlockUser: (id: string, isBlocked: boolean) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

// Creación del store usando Zustand
export const useUserStore = create<UserStore>((set) => ({
  users: [],
  currentUser: null, // Inicialmente no hay usuario actual

  // Función para establecer el usuario actual
  setCurrentUser: (user) => set({ currentUser: user }),

  // Función para obtener todos los usuarios
  fetchUsers: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los usuarios');
      }

      const data = await response.json();
      set({ users: data });
    } catch (error) {
      console.error('Error fetching users:', error);
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
      set((state) => ({
        users: state.users.map((u) => (u._id === id ? updatedUser : u)),
      }));
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

      const updatedUser = await response.json();
      set((state) => ({
        users: state.users.map((u) => (u._id === id ? updatedUser : u)),
      }));
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

      const updatedUser = await response.json();
      set((state) => ({
        users: state.users.map((u) => (u._id === id ? updatedUser : u)),
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
}));