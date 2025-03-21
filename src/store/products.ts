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
  images: string[]; // Array de URLs de imágenes
  mainImage: string; // URL de la imagen principal
  categories: string[];
}

// Definición de la interfaz ProductStore
interface ProductStore {
  products: Product[];
  fetchProducts: () => Promise<void>;
  addProduct: (formData: FormData) => Promise<void>;
  updateProduct: (id: string, formData: FormData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteImage: (id: string, imageIndex: number) => Promise<void>; 
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],

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

  deleteImage: async (id: string, imageIndex: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${id}/images/${imageIndex}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la imagen');
      }

      // Actualizar la lista de productos después de eliminar la imagen
      set((state) => ({
        products: state.products.map((p) =>
          p._id === id
            ? {
                ...p,
                images: p.images.filter((_, index) => index !== imageIndex),
                mainImage:
                  p.mainImage === p.images[imageIndex] ? p.images[0] || '' : p.mainImage,
              }
            : p
        ),
      }));
    } catch (error: any) {
      console.error('Error deleting image:', error);
      throw new Error(error.message || 'Error al eliminar la imagen');
    }
  },
}));