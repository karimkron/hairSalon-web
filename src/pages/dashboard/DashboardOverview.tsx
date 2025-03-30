import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Calendar, Users, Package, Scissors, DollarSign, Clock,
  ChevronRight, TrendingUp, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppointmentStore } from '../../store/appointmentStore';
import { useSalesStore } from '../../store/salesStore';
import { useProductStore } from '../../store/products';
import QuickActionsPanel from '../../components/dashboard/QuickActionsPanel';
import AppointmentStats from '../../components/appointments/AppointmentStats';

// Colores para gráficas que sí se utilizan en el componente
const CHART_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

const DashboardOverview: React.FC = () => {
  // Estados para filtros
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Obtener datos de varios stores
  const { 
    fetchAppointmentStats, 
    appointmentStats, 
    recentAppointments,
    loadingAppointments 
  } = useAppointmentStore();
  
  const { 
    fetchSalesData, 
    salesData, 
    topProducts, 
    topServices,
    isLoading: salesLoading 
  } = useSalesStore();
  
  const { fetchProducts } = useProductStore();

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Determinar fechas para filtros
        const endDate = new Date().toISOString().split('T')[0];
        let startDate = new Date();
        
        switch(dateRange) {
          case 'today':
            startDate = new Date();
            break;
          case 'week':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        }
        
        // Cargar datos en paralelo
        await Promise.all([
          fetchAppointmentStats(startDate.toISOString().split('T')[0], endDate),
          fetchSalesData(startDate.toISOString().split('T')[0], endDate),
          fetchProducts()
        ]);
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [fetchAppointmentStats, fetchSalesData, fetchProducts, dateRange]);

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  // Renderizar el estado de carga
  if (isLoading || loadingAppointments || salesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mb-4"></div>
        <p className="text-gray-600">Cargando datos del dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Principal</h1>
        <p className="text-gray-600">
          Resumen de rendimiento y actividad del negocio
        </p>
      </div>

      {/* Filtros de fecha */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Ver datos de:</span>
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
              Última semana
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                dateRange === 'month'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Último mes
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

      {/* Panel de acciones rápidas */}
      <QuickActionsPanel />

      {/* Tarjetas de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* KPI 1: Citas Totales */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Citas Totales</h3>
            <div className="bg-indigo-100 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">
            {appointmentStats?.total || 0}
          </p>
          <div className="flex items-center mt-2">
            <span className={`text-xs flex items-center ${
              (appointmentStats?.percentChange || 0) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {appointmentStats?.percentChange 
                ? `${Math.abs(appointmentStats.percentChange || 0).toFixed(1)}%` 
                : '0%'
              }
            </span>
            <span className="text-xs text-gray-500 ml-1">vs. período anterior</span>
          </div>
        </div>

        {/* KPI 2: Ventas Totales */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Ventas Totales</h3>
            <div className="bg-green-100 p-2 rounded-full">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">
            {formatCurrency(salesData?.totalSales || 0)}
          </p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              5.2%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs. período anterior</span>
          </div>
        </div>

        {/* KPI 3: Productos Vendidos */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Productos Vendidos</h3>
            <div className="bg-amber-100 p-2 rounded-full">
              <Package className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">
            {topProducts?.reduce((sum, product) => sum + (product.quantity || 0), 0) || 0}
          </p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              3.8%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs. período anterior</span>
          </div>
        </div>

        {/* KPI 4: Clientes Atendidos */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Clientes Atendidos</h3>
            <div className="bg-purple-100 p-2 rounded-full">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">
            {salesData?.totalCustomers || 0}
          </p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              2.5%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs. período anterior</span>
          </div>
        </div>
      </div>

      {/* Estadísticas de Citas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Distribución de Citas por Estado */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Estado de Citas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pendientes', value: appointmentStats?.byStatus?.pending || 0 },
                    { name: 'Confirmadas', value: appointmentStats?.byStatus?.confirmed || 0 },
                    { name: 'Completadas', value: appointmentStats?.byStatus?.completed || 0 },
                    { name: 'Canceladas', value: appointmentStats?.byStatus?.cancelled || 0 },
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
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
              <span className="text-xs">Pendientes: {appointmentStats?.byStatus?.pending || 0}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-xs">Confirmadas: {appointmentStats?.byStatus?.confirmed || 0}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs">Completadas: {appointmentStats?.byStatus?.completed || 0}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-xs">Canceladas: {appointmentStats?.byStatus?.cancelled || 0}</span>
            </div>
          </div>
        </div>

        {/* Tendencia de Citas */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Tendencia de Citas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={appointmentStats?.byDate || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
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

      {/* Componente de estadísticas detalladas de citas */}
      <AppointmentStats stats={appointmentStats} />

      {/* Próximas citas y citas recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Citas Recientes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Citas Recientes</h3>
          </div>
          <div className="p-6">
            {recentAppointments && recentAppointments.length > 0 ? (
              <div className="space-y-4">
                {recentAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment._id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <div className={`p-2 rounded-full ${
                      appointment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {appointment.status === 'pending' ? <Clock className="h-5 w-5" /> :
                       appointment.status === 'confirmed' ? <CheckCircle className="h-5 w-5" /> :
                       appointment.status === 'completed' ? <CheckCircle className="h-5 w-5" /> :
                       <XCircle className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {new Date(appointment.date).toLocaleDateString()} - {appointment.time}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {appointment.user?.name || 'Cliente'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.services?.map((s: any) => s.name).join(', ')}
                      </p>
                    </div>
                    <Link to={`/admin/appointments?id=${appointment._id}`} className="text-blue-600 hover:text-blue-800">
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p>No hay citas recientes</p>
              </div>
            )}
            <div className="mt-4 text-center">
              <Link 
                to="/admin/appointments" 
                className="text-amber-600 hover:text-amber-800 text-sm font-medium"
              >
                Ver todas las citas
              </Link>
            </div>
          </div>
        </div>

        {/* Productos más Vendidos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Productos más Vendidos</h3>
          </div>
          <div className="p-6">
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.quantity} unidades · {formatCurrency(product.sales)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Package className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p>No hay datos de productos vendidos</p>
              </div>
            )}
            <div className="mt-4 text-center">
              <Link 
                to="/admin/products" 
                className="text-amber-600 hover:text-amber-800 text-sm font-medium"
              >
                Ver todos los productos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Servicios más Populares */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Servicios más Populares</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topServices?.slice(0, 5).map(service => ({
                    name: service.name,
                    value: service.sales
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" name="Ventas" fill="#4f46e5" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {topServices?.slice(0, 5).map((service, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {service.image ? (
                      <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                    ) : (
                      <Scissors className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-gray-500">
                      {service.quantity} servicios · {formatCurrency(service.sales)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="text-center mt-4">
                <Link 
                  to="/admin/services" 
                  className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                >
                  Ver todos los servicios
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;