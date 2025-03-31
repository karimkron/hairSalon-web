import React, { useState, useEffect } from 'react';
import { 
 LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Calendar, Package,
  ChevronRight, TrendingUp, AlertCircle, CheckCircle, XCircle,
  Calendar as CalendarIcon, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardStore } from '../../store/dashboardStore';
import QuickActionsPanel from '../../components/dashboard/QuickActionsPanel';
import AppointmentStats from '../../components/appointments/AppointmentStats';
import { format, subDays, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const DashboardOverview: React.FC = () => {
  // Estados para filtros de fecha
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [dateInterval, setDateInterval] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  // Obtener datos del dashboard
  const { 
    appointmentStats, 
    productStats,
    isLoading, 
    error, 
    fetchDashboardData 
  } = useDashboardStore();

  // Cargar datos al montar el componente o cambiar el filtro de fechas
  useEffect(() => {
    const loadDashboardData = async () => {
      let startDate, endDate;
      const now = new Date();
      
      switch(dateRange) {
        case 'today':
          startDate = format(startOfDay(now), 'yyyy-MM-dd');
          endDate = format(endOfDay(now), 'yyyy-MM-dd');
          break;
        case 'week':
          startDate = format(startOfWeek(now, { locale: es }), 'yyyy-MM-dd');
          endDate = format(endOfWeek(now, { locale: es }), 'yyyy-MM-dd');
          break;
        case 'month':
          startDate = format(startOfMonth(now), 'yyyy-MM-dd');
          endDate = format(endOfMonth(now), 'yyyy-MM-dd');
          break;
        case 'year':
          startDate = format(subMonths(now, 12), 'yyyy-MM-dd');
          endDate = format(now, 'yyyy-MM-dd');
          break;
        default:
          startDate = format(subDays(now, 7), 'yyyy-MM-dd');
          endDate = format(now, 'yyyy-MM-dd');
      }
      
      setDateInterval({ startDate, endDate });
      await fetchDashboardData(startDate, endDate);
    };
    
    loadDashboardData();
  }, [fetchDashboardData, dateRange]);

  

  // Renderizar el estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mb-4"></div>
        <p className="text-gray-600">Cargando datos del dashboard...</p>
      </div>
    );
  }

  // Renderizar el estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Error al cargar datos</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => fetchDashboardData(dateInterval.startDate, dateInterval.endDate)}
          className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Resumen de actividad del {format(new Date(dateInterval.startDate), 'PP', { locale: es })} al {format(new Date(dateInterval.endDate), 'PP', { locale: es })}
        </p>
      </div>

      {/* Selector de rango de fechas */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400" size={20} />
          <span className="text-sm font-medium text-gray-500">Filtrar por período:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDateRange('today')}
              className={`px-3 py-1 text-sm rounded-md ${
                dateRange === 'today'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-3 py-1 text-sm rounded-md ${
                dateRange === 'week'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Esta semana
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                dateRange === 'month'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Este mes
            </button>
            <button
              onClick={() => setDateRange('year')}
              className={`px-3 py-1 text-sm rounded-md ${
                dateRange === 'year'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Último año
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de KPIs - Citas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Total Citas */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Citas</h3>
            <div className="p-2 bg-indigo-100 rounded-full">
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{appointmentStats?.total || 0}</p>
          <div className="flex items-center mt-2">
            <span className={`text-xs flex items-center ${
              (appointmentStats?.percentChange || 0) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {appointmentStats && appointmentStats.percentChange !== undefined
                ? `${Math.abs(appointmentStats.percentChange).toFixed(1)}%` 
                : '0%'
              }
            </span>
            <span className="text-xs text-gray-500 ml-1">vs. período anterior</span>
          </div>
        </div>

        {/* Citas Nuevas */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Citas Nuevas</h3>
            <div className="p-2 bg-blue-100 rounded-full">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{appointmentStats?.byStatus?.pending || 0}</p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-blue-600">Pendientes de atención</span>
          </div>
        </div>

        {/* Citas Completadas */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Citas Atendidas</h3>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{appointmentStats?.byStatus?.completed || 0}</p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-green-600">Completadas exitosamente</span>
          </div>
        </div>

        {/* Citas Canceladas */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Citas Canceladas</h3>
            <div className="p-2 bg-red-100 rounded-full">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{appointmentStats?.byStatus?.cancelled || 0}</p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-red-600">
              {appointmentStats?.cancellationRate !== undefined
                ? `${appointmentStats.cancellationRate.toFixed(1)}% tasa de cancelación`
                : 'Sin datos'
              }
            </span>
          </div>
        </div>

        {/* Productos Confirmados */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Productos</h3>
            <div className="p-2 bg-amber-100 rounded-full">
              <Package className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-bold">{productStats?.confirmed || 0}</p>
              <span className="text-xs text-green-600">Confirmados</span>
            </div>
            <div>
              <p className="text-xl font-bold text-right">{productStats?.cancelled || 0}</p>
              <span className="text-xs text-red-600">Cancelados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos de datos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de citas por estado */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Distribución de Citas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pendientes', value: appointmentStats?.byStatus?.pending || 0 },
                    { name: 'Confirmadas', value: appointmentStats?.byStatus?.confirmed || 0 },
                    { name: 'Completadas', value: appointmentStats?.byStatus?.completed || 0 },
                    { name: 'Canceladas', value: appointmentStats?.byStatus?.cancelled || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => 
                    percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                  }
                >
                  <Cell fill="#f59e0b" /> {/* Pendientes - amber */}
                  <Cell fill="#3b82f6" /> {/* Confirmadas - blue */}
                  <Cell fill="#10b981" /> {/* Completadas - green */}
                  <Cell fill="#ef4444" /> {/* Canceladas - red */}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de tendencia de citas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Tendencia de Citas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={appointmentStats?.byDate || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return format(date, 'd MMM', { locale: es });
                  }}  
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return format(date, 'PPP', { locale: es });
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Citas" 
                  stroke="#4f46e5" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Panel de acciones rápidas */}
      <QuickActionsPanel />

      {/* Componente de estadísticas detalladas de citas */}
      <AppointmentStats stats={appointmentStats} />

      {/* Citas recientes y productos más vendidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Citas Recientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Citas Recientes</h3>
            <Link to="/admin/appointments" className="text-sm text-amber-600 hover:text-amber-700">
              Ver todas
            </Link>
          </div>
          <div className="p-6">
            {appointmentStats?.byDate && appointmentStats.byDate.length > 0 ? (
              <div className="space-y-4">
                {/* Limitamos a mostrar las 4 citas más recientes */}
                {appointmentStats.byDate.slice(-4).map((dayData, index) => (
                  <div 
                    key={index} 
                    className="p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-full mr-4">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium">{format(new Date(dayData.date), 'PPPP', { locale: es })}</p>
                        <p className="text-sm text-gray-500">{dayData.count} citas</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                )).reverse()}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No hay citas recientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Productos más vendidos */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Productos Más Vendidos</h3>
            <Link to="/admin/products" className="text-sm text-amber-600 hover:text-amber-700">
              Ver todos
            </Link>
          </div>
          <div className="p-6">
            {productStats?.topProducts && productStats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {/* Limitamos a mostrar los 4 productos más vendidos */}
                {productStats.topProducts.slice(0, 4).map((product, index) => (
                  <div 
                    key={index} 
                    className="p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-lg mr-4 overflow-hidden">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.quantity} unidades vendidas</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No hay datos de productos vendidos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;