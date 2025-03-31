import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useUserStore } from '../store/userStore';

interface AuthContextType {
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { fetchCurrentUser, isLoading } = useUserStore();
  const [isInitializing, setIsInitializing] = React.useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Verificar si hay un token en localStorage
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Intentar cargar la información del usuario si hay un token
          await fetchCurrentUser();
        } catch (error) {
          console.error('Error initializing auth:', error);
          // Si hay un error, podríamos limpiar el token
          // localStorage.removeItem('token');
        }
      }
      
      // Marcar la inicialización como completa
      setIsInitializing(false);
    };

    initializeAuth();
  }, [fetchCurrentUser]);

  // Proporcionar el estado de inicialización al contexto
  const value = {
    isInitializing: isInitializing || isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};