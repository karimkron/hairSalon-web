import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Package, Users, Filter, Download, RefreshCw, Scissors } from 'lucide-react';
import { useSalesStore } from '../../store/salesStore';
// Removed unnecessary import of 'process' as it's not available in the browser environment.

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const AdminDashboard: React.FC = () => {
  const { 
    fetchSalesData, 
    isLoading, 
    error, 
    salesData, 
    topProducts, 
    topServices, 
    monthlySales, 
    totalSales, 
    salesByCategory,
    loadMockData 
  } = useSalesStore();
  
  const [dateRange, setDateRange] = useState({
    start: getStartDateForPeriod(6), // 6 meses por defecto
    end: formatDateToString(new Date())
  });
  
  const [selectedView, setSelectedView] = useState('overview'); // 'overview', 'products', 'services'
  const [chartTimeframe, setChartTimeframe] = useState('6months'); // '30days', '3months', '6months', '1year'
  
  useEffect(() => {
    // En desarrollo usamos datos de ejemplo
    if (process.env.NODE_ENV === 'development') {
      loadMockData();
    } else {
      fetchSalesData(dateRange.start, dateRange.end);
    }
  }, [fetchSalesData, loadMockData, dateRange]);
  
  function formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  function getStartDateForPeriod(months: number): string {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return formatDateToString(date);
  }
  
  function formatDateDisplay(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }
  
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Función para actualizar timeframe
  const updateTimeframe = (timeframe: string): void => {
    setChartTimeframe(timeframe);
    
    let months: number;
    switch (timeframe) {
      case '30days':
        // Para 30 días usamos un mes
        months = 1;
        break;
      case '3months':
        months = 3;
        break;
      case '6months':
        months = 6;
        break;
      case '1year':
        months = 12;
        break;
      default:
        months = 6;
    }
    
    setDateRange({
      start: getStartDateForPeriod(months),
      end: formatDateToString(new Date())
    });
  };
  
  // Renderizar el estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mb-4"></div>
        <p className="text-gray-600">Cargando datos de ventas...</p>
      </div>
    );
  }
  
  // Renderizar el estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">Error al cargar datos</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => fetchSalesData(dateRange.start, dateRange.end)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Intentar nuevamente
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Ventas</h1>
        <p className="text-gray-600">
          Análisis de ventas del {formatDateDisplay(dateRange.start)} al {formatDateDisplay(dateRange.end)}
        </p>
      </div>
      
      {/* Filtros y controles */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <span className="font-medium mr-4">Período:</span>
            <div className="flex bg-gray-100 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => updateTimeframe('30days')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  chartTimeframe === '30days'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                30 días
              </button>
              <button
                onClick={() => updateTimeframe('3months')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  chartTimeframe === '3months'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                3 meses
              </button>
              <button
                onClick={() => updateTimeframe('6months')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  chartTimeframe === '6months'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                6 meses
              </button>
              <button
                onClick={() => updateTimeframe('1year')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  chartTimeframe === '1year'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                1 año
              </button>
            </div>
          </div>
          
          <div className="flex">
            <button
              onClick={() => setSelectedView('overview')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium ${
                selectedView === 'overview'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>General</span>
            </button>
            <button
              onClick={() => setSelectedView('products')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium ml-2 ${
                selectedView === 'products'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Productos</span>
            </button>
            <button
              onClick={() => setSelectedView('services')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium ml-2 ${
                selectedView === 'services'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>Servicios</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm uppercase">Total Ventas</h3>
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{formatCurrency(totalSales || 0)}</span>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +5.2%
              </span>
              <span className="text-gray-500 ml-2">vs. periodo anterior</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm uppercase">Ventas Servicios</h3>
            <div className="p-2 bg-blue-100 rounded-full">
              <Scissors className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{formatCurrency(salesData?.servicesSales || 0)}</span>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-blue-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +3.8%
              </span>
              <span className="text-gray-500 ml-2">vs. periodo anterior</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm uppercase">Ventas Productos</h3>
            <div className="p-2 bg-amber-100 rounded-full">
              <Package className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{formatCurrency(salesData?.productsSales || 0)}</span>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-amber-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +7.1%
              </span>
              <span className="text-gray-500 ml-2">vs. periodo anterior</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm uppercase">Clientes Atendidos</h3>
            <div className="p-2 bg-purple-100 rounded-full">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{salesData?.totalCustomers || 0}</span>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-purple-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +2.5%
              </span>
              <span className="text-gray-500 ml-2">vs. periodo anterior</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vista General */}
      {selectedView === 'overview' && (
        <>
          {/* Gráfico de ventas por mes */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Ventas Mensuales</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlySales || []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    name="Ventas Totales" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="services" 
                    name="Servicios" 
                    stroke="#82ca9d" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="products" 
                    name="Productos" 
                    stroke="#ffc658" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Gráficos de distribución */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Distribución de ventas por categoría */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Distribución de Ventas</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Servicios', value: salesData?.servicesSales || 0 },
                        { name: 'Productos', value: salesData?.productsSales || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Servicios', value: salesData?.servicesSales || 0 },
                        { name: 'Productos', value: salesData?.productsSales || 0 }
                      ].map((_item, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Distribución por categorías */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Ventas por Categoría</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesByCategory || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="value" name="Ventas" fill="#8884d8">
                      {(salesByCategory || []).map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Vista de Productos */}
      {selectedView === 'products' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Productos */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Top Productos</h3>
                <button className="text-amber-600 hover:text-amber-700 flex items-center text-sm">
                  <Download className="h-4 w-4 mr-1" /> Exportar
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidades</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(topProducts || []).map((product: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {product.image ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt={product.name} />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {product.quantity}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(product.sales)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!topProducts || topProducts.length === 0) && (
                  <div className="text-center py-4 text-gray-500">
                    No hay productos vendidos en este período
                  </div>
                )}
              </div>
            </div>
            
            {/* Gráfico de ventas de productos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Ventas por Producto</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(topProducts || []).slice(0, 5)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="sales" name="Ventas" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Vista de Servicios */}
      {selectedView === 'services' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Servicios */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Top Servicios</h3>
                <button className="text-amber-600 hover:text-amber-700 flex items-center text-sm">
                  <Download className="h-4 w-4 mr-1" /> Exportar
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservas</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(topServices || []).map((service: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {service.image ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={service.image} alt={service.name} />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Scissors className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{service.name}</div>
                              <div className="text-sm text-gray-500">{service.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {service.quantity}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(service.sales)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!topServices || topServices.length === 0) && (
                  <div className="text-center py-4 text-gray-500">
                    No hay servicios vendidos en este período
                  </div>
                )}
              </div>
            </div>
            
            {/* Gráfico de ventas de servicios */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Ventas por Servicio</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(topServices || []).slice(0, 5)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="sales" name="Ventas" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;