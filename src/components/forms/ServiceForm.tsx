import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useServiceStore } from '../../store/services';

interface Service {
  id?: string;
  name: string;
  description: string;
  price: number;
  points: number;
  duration: string;
  category: string;
  image: File | string | null;
  stock: boolean;
}

const ServiceForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { services, addService, updateService } = useServiceStore();
  const [service, setService] = useState<Service>({
    name: '',
    description: '',
    price: 0,
    points: 0,
    duration: '',
    category: '',
    image: null,
    stock: true,
  });

  const [imageOption, setImageOption] = useState<'upload' | 'url' | 'none'>(id ? 'url' : 'upload');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (id) {
      const existingService = services.find((s) => s._id === id);
      if (existingService) {
        setService(existingService);
        setImageUrl(existingService.image || '');
        setImageOption(existingService.image ? 'url' : 'none');
      }
    }
  }, [id]);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!service.name.trim()) newErrors.name = 'Nombre requerido';
    if (!service.description.trim()) newErrors.description = 'Descripción requerida';
    if (service.price <= 0) newErrors.price = 'Precio inválido';
    if (service.points < 0) newErrors.points = 'Puntos inválidos';
    if (!service.duration.trim()) newErrors.duration = 'Duración requerida';
    if (!service.category.trim()) newErrors.category = 'Categoría requerida';

    if (imageOption === 'url' && !isValidUrl(imageUrl)) {
      newErrors.image = 'URL inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setService(prev => ({ ...prev, image: file }));
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url && !isValidUrl(url)) {
      setErrors(prev => ({ ...prev, image: 'URL inválida' }));
    } else {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('name', service.name);
    formData.append('description', service.description);
    formData.append('price', service.price.toString());
    formData.append('points', service.points.toString());
    formData.append('duration', service.duration);
    formData.append('category', service.category);
    formData.append('stock', service.stock.toString());

    switch (imageOption) {
      case 'upload':
        if (service.image instanceof File) {
          formData.append('image', service.image);
        }
        break;
      case 'url':
        formData.append('imageUrl', imageUrl);
        break;
      case 'none':
        formData.append('imageUrl', 'none');
        break;
    }

    try {
      if (id) {
        await updateService(id, formData);
      } else {
        await addService(formData);
      }
      navigate('/admin/services');
    } catch (error: any) {
      setErrors({ general: error.message || 'Error al guardar el servicio' });
    }
  };

  return (
    <div className=" inset-0 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {id ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h2>
            <button
              onClick={() => navigate('/admin/services')}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={service.name}
                  onChange={(e) => setService({...service, name: e.target.value})}
                  className={`mt-1 block w-full border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm p-2`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select
                  name="category"
                  value={service.category}
                  onChange={(e) => setService({...service, category: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Cortes Clásicos">Cortes Clásicos</option>
                  <option value="Servicios Premium">Servicios Premium</option>
                  <option value="Tratamientos Especiales">Tratamientos Especiales</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              

              <div>
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <input
                  type="number"
                  name="price"
                  value={service.price}
                  onChange={(e) => setService({...service, price: Number(e.target.value)})}
                  className={`mt-1 block w-full border ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm p-2`}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Puntos</label>
                <input
                  type="number"
                  name="points"
                  value={service.points}
                  onChange={(e) => setService({...service, points: Number(e.target.value)})}
                  className={`mt-1 block w-full border ${
                    errors.points ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm p-2`}
                />
                {errors.points && <p className="text-red-500 text-sm mt-1">{errors.points}</p>}
              </div>

                <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Duración</label>
                <input
                  type="text"
                  name="duration"
                  value={service.duration}
                  onChange={(e) => setService({...service, duration: e.target.value})}
                  className={`mt-1 block w-full border ${
                  errors.duration ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm p-2`}
                />
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                </div>

              

              <div className="block">
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  name="description"
                  value={service.description}
                  onChange={(e) => setService({...service, description: e.target.value})}
                  className={`mt-1 block w-full border ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm p-2`}
                  rows={4}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="block">
                <label className="block text-sm font-medium mb-2">Imagen</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setImageOption('upload')}
                    className={`px-4 py-2 rounded-lg ${
                      imageOption === 'upload' 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Subir imagen
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageOption('url')}
                    className={`px-4 py-2 rounded-lg ${
                      imageOption === 'url' 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Usar URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageOption('none')}
                    className={`px-4 py-2 rounded-lg ${
                      imageOption === 'none' 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Sin imagen
                  </button>
                </div>

                {imageOption === 'upload' && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full border rounded-lg p-2"
                    />
                    {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                  </div>
                )}

                {imageOption === 'url' && (
                  <div>
                    <input
                      type="text"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={imageUrl}
                      onChange={handleUrlChange}
                      className={`w-full border rounded-lg p-2 ${
                        errors.image ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                  </div>
                )}
              </div>

              
            </div>

            {errors.general && (
              <div className="text-red-500 text-center mt-4">{errors.general}</div>
            )}

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700"
              >
                {id ? 'Actualizar Servicio' : 'Crear Servicio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceForm;