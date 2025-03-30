import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { ArrowUp, ArrowDown, AlertCircle, Clock } from 'lucide-react';

// Tipo para las estadísticas recibidas como prop
interface AppointmentStatsProps {
  stats: any | null;
}

const AppointmentStats: React.FC<AppointmentStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
        <p className="text-gray-600">No hay datos de citas disponibles</p>
      </div>
    );
  }

  // Asegurar que cancellationRate exista, si no, usar 0
  const cancellationRate = stats.cancellationRate || 0;
  const mostPopularDay = stats.mostPopularDay || 'No disponible';
  const mostPopularTime = stats.mostPopularTime || 'No disponible';
  const percentChange = stats.percentChange || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-6">Estadísticas Detalladas de Citas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Tarjeta de Tasa de Cancelación */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Tasa de Cancelación</h3>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              cancellationRate < 10 ? 'bg-green-100 text-green-800' : 
              cancellationRate < 20 ? 'bg-amber-100 text-amber-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {cancellationRate.toFixed(1)}%
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {cancellationRate < 10 
              ? 'Excelente tasa de asistencia.' 
              : cancellationRate < 20 
                ? 'Tasa de cancelación moderada.'
                : 'Alta tasa de cancelación. Considere implementar recordatorios adicionales.'}
          </p>
        </div>
        
        {/* Tarjeta de Día más Popular */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Día más Popular</h3>
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              {mostPopularDay}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Considere asignar más personal este día para manejar la alta demanda.
          </p>
        </div>
        
        {/* Tarjeta de Hora más Popular */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Hora más Popular</h3>
            <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {mostPopularTime}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Planifique descansos del personal y actividades fuera de este horario pico.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de citas por servicios */}
        <div>
          <h3 className="text-lg font-medium mb-4">Distribución por Servicios</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.byService || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="serviceName" 
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="count" name="Cantidad" fill="#4f46e5" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Gráfico de citas por hora */}
        <div>
          <h3 className="text-lg font-medium mb-4">Distribución por Hora</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.byHour || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="Citas" 
                  stroke="#8b5cf6"
                  fill="#c4b5fd"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recomendaciones basadas en datos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Recomendaciones</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start">
            <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center mr-2 mt-0.5">1</span>
            <span>
              {cancellationRate > 15 
                ? "La tasa de cancelación es alta. Considere implementar una política de cancelación con mayor anticipación o un sistema de recordatorios."
                : "Mantiene una buena tasa de asistencia. Continúe con su sistema actual de confirmaciones."}
            </span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center mr-2 mt-0.5">2</span>
            <span>
              Programe a su personal más experimentado durante el horario pico ({mostPopularTime}) 
              y en {mostPopularDay}, que es el día con más afluencia.
            </span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center mr-2 mt-0.5">3</span>
            <span>
              Considere promociones especiales para las horas menos ocupadas para distribuir mejor la carga de trabajo.
            </span>
          </li>
        </ul>
      </div>
      
      {/* Tendencias de citas mensuales */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Tendencia Mensual de Citas</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats.byDate || []}
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
                stroke="#10b981" 
                activeDot={{ r: 8 }}
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-sm text-green-700">
            <span className="font-medium">Análisis de tendencia: </span>
            {percentChange > 0 ? (
              <span className="flex items-center">
                <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                Las citas han aumentado un {percentChange.toFixed(1)}% comparado con el período anterior.
                Esto indica un crecimiento positivo del negocio.
              </span>
            ) : (
              <span className="flex items-center">
                <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
                Las citas han disminuido un {Math.abs(percentChange).toFixed(1)}% comparado con el período anterior.
                Considere realizar promociones especiales o campañas de marketing.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentStats;