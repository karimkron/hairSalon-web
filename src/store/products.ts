import { create } from 'zustand';

// Definición de la interfaz Product
export interface Product {
  _id?: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  available: boolean;
  image: string | File | null;  // Permitir null para cuando no haya imagen
}

// Definición de la interfaz ProductStore
interface ProductStore {
  products: Product[];
  fetchProducts: () => Promise<void>;
  addProduct: (formData: FormData) => Promise<void>;
  updateProduct: (id: string, formData: FormData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],

  // Función para obtener productos
  fetchProducts: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener productos');
      }

      const data = await response.json();
      set({ products: data });
    } catch (error: any) {
      console.error('Error fetching products:', error);
      throw new Error(error.message || 'Error al cargar productos');
    }
  },

  // Función para agregar un producto
  addProduct: async (formData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear producto');
      }

      const newProduct = await response.json();
      set((state) => ({ products: [...state.products, newProduct] }));
    } catch (error: any) {
      console.error('Error adding product:', error);
      throw new Error(error.message || 'Error al guardar producto');
    }
  },

  // Función para actualizar un producto
  updateProduct: async (id, formData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar producto');
      }

      const updatedProduct = await response.json();
      set((state) => ({
        products: state.products.map((p) => 
          p._id === id ? updatedProduct : p
        ),
      }));
    } catch (error: any) {
      console.error('Error updating product:', error);
      throw new Error(error.message || 'Error al actualizar producto');
    }
  },

  // Función para eliminar un producto
  deleteProduct: async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar producto');
      }

      set((state) => ({ 
        products: state.products.filter((p) => p._id !== id),
      }));
    } catch (error: any) {
      console.error('Error deleting product:', error);
      throw new Error(error.message || 'Error al eliminar producto');
    }
  },
}));