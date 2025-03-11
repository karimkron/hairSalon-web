
import { useEffect } from 'react';
import { useServiceStore } from '../../store/services';
import { Link } from 'react-router-dom';

const ServicesList = () => {
  const { services, fetchServices, deleteService } = useServiceStore();

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="p-2 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Lista de Servicios</h1>
      <Link
        to="/admin/services/create"
        className="bg-amber-600 text-white  px-4 py-2 rounded-md mb-6 inline-block hover:bg-amber-700"
      >
        Agregar Servicio
      </Link>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 border-b">Imagen</th>
              <th className="py-3 px-4 border-b">Nombre</th>
              <th className="py-3 px-4 border-b">Descripción</th>
              <th className="py-3 px-4 border-b">Precio</th>
              <th className="py-3 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 border-b">
                  {service.image ? (
                    <div className="w-16 h-16 overflow-hidden rounded-lg">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-16 h-16 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#f59e0b' }}
                    >
                      <span className="text-white text-2xl font-bold">
                        {getInitial(service.name)}
                      </span>
                    </div>
                  )}
                </td>
                <td className="py-4 px-4 border-b">{service.name}</td>
                <td className="py-4 px-4 border-b max-w-xs truncate">{service.description}</td>
                <td className="py-4 px-4 border-b">${service.price}</td>
                <td className="py-4 px-4 border-b">
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/services/edit/${service._id}`}
                      className="bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-600"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => deleteService(service._id!)}
                      className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServicesList;
