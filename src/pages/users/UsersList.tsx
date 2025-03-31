import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit, ChevronLeft, ChevronRight, Users, X, Check } from 'lucide-react';
import debounce from 'lodash/debounce';

interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const UsersList = () => {
  // Estados para la lista de usuarios y búsqueda
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para la paginación
  const [pagination, setPagination] = useState<PaginationMetadata>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Función para obtener usuarios con búsqueda y paginación
  const fetchUsers = useCallback(async (page = 1, search = '') => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No se encontró token de autenticación');
      
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
        throw new Error('Error al obtener usuarios');
      }
      
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Error al cargar los usuarios');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Crear una versión con debounce de la función de búsqueda
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      fetchUsers(1, value);
    }, 500),
    [fetchUsers]
  );

  // Manejar cambios en el término de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
    fetchUsers(1, '');
  };

  // Cambiar de página
  const changePage = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchUsers(newPage, searchTerm);
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
    
    // Limpiar debounce al desmontar
    return () => {
      debouncedSearch.cancel();
    };
  }, [fetchUsers, debouncedSearch]);

  // Función para formatear la fecha de registro
  const formatRegistrationTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      date: date.toLocaleDateString(),
      days: diffDays
    };
  };

  // Renderizar componentes de skeleton loading
  const renderSkeletons = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg p-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-gray-200"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Lista de Usuarios</h1>
        
        {/* Estadísticas de usuarios rápidas */}
        <div className="bg-white rounded-lg shadow p-3 flex items-center space-x-3">
          <Users className="h-5 w-5 text-amber-600" />
          <div>
            <span className="text-sm text-gray-500">Total de usuarios:</span>
            <span className="ml-2 font-medium">{pagination.total}</span>
          </div>
        </div>
      </div>
      
      {/* Barra de búsqueda mejorada */}
      <div className="mb-6">
        <div className="relative">
          <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            <div className="pl-3">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="flex-grow p-3 outline-none text-gray-700"
            />
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className="p-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Indicador de búsqueda activa */}
          {searchTerm && !isLoading && (
            <div className="absolute right-0 -bottom-6 text-xs text-gray-500">
              {pagination.total} resultado(s) para "{searchTerm}"
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p>{error}</p>
          <button 
            onClick={() => fetchUsers(1, searchTerm)} 
            className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Diseño adaptativo: Cards para móvil, tabla para desktop */}
      {isLoading ? (
        renderSkeletons()
      ) : users.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">No se encontraron usuarios</h3>
          <p className="text-gray-500 mb-3">
            {searchTerm 
              ? `No hay resultados para "${searchTerm}"`
              : "No hay usuarios registrados todavía"}
          </p>
          {searchTerm && (
            <button 
              onClick={clearSearch}
              className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Vista móvil: Cards */}
          <div className="md:hidden space-y-4">
            {users.map((user) => (
              <div key={user._id} className="bg-white rounded-lg shadow-sm p-4 transition-all hover:shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">{user.name}</h3>
                  {user.isBlocked ? (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">Bloqueado</span>
                  ) : (
                    <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full flex items-center">
                      <Check className="w-3 h-3 mr-1" />
                      Activo
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <p>{user.email}</p>
                  <p>{user.phone || 'Sin teléfono'}</p>
                  <p className="text-xs text-gray-500">
                    Registrado: {formatRegistrationTime(user.createdAt).date} 
                    ({formatRegistrationTime(user.createdAt).days} días)
                  </p>
                </div>
                
                <Link 
                  to={`/admin/users/edit/${user._id}`} 
                  className="w-full flex items-center justify-center gap-1 text-amber-600 hover:text-amber-700 bg-amber-50 p-2 rounded"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </Link>
              </div>
            ))}
          </div>
          
          {/* Vista desktop: Tabla */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const registration = formatRegistrationTime(user.createdAt);
                  
                  return (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-800">{user.name}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{user.email}</td>
                      <td className="py-4 px-4 text-gray-600">{user.phone || '-'}</td>
                      <td className="py-4 px-4">
                        <div className="text-gray-600">{registration.date}</div>
                        <div className="text-xs text-gray-500">{registration.days} días</div>
                      </td>
                      <td className="py-4 px-4">
                        {user.isBlocked ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Bloqueado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Activo
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Link 
                          to={`/admin/users/edit/${user._id}`} 
                          className="flex items-center gap-1 text-amber-600 hover:text-amber-700"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Editar</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      {/* Paginación */}
      {!isLoading && users.length > 0 && (
        <div className="mt-6 flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">
            Mostrando {users.length} de {pagination.total} usuarios
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => changePage(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className={`p-2 rounded-md ${
                pagination.hasPrevPage 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="px-3 py-2 text-sm font-medium">
              Página {pagination.page} de {pagination.totalPages}
            </div>
            
            <button
              onClick={() => changePage(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className={`p-2 rounded-md ${
                pagination.hasNextPage 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;