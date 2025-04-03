import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useServiceStore } from '../../store/services';

interface Service {
  id?: string;
  name: string;
  description: string;
  price: number;
  points: number;
  duration: number;  // Cambiado a number
  categories: string[];  // Cambiado de category a categories (array)
  image: File | string | null;
}

const ServiceForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { services, categories, fetchServices, fetchCategories, addService, updateService, addCategory } = useServiceStore();
  const [service, setService] = useState<Service>({
    name: '',
    description: '',
    price: 0,
    points: 0,
    duration: 1,
    categories: [],  // Inicializado como array vacío
    image: null,
  });

  const [imageOption, setImageOption] = useState<'upload' | 'url' | 'none'>(id ? 'url' : 'upload');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);  // Estado para categorías seleccionadas
  const [newCategory, setNewCategory] = useState<string>('');  // Estado para nueva categoría

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [fetchServices, fetchCategories]);

  useEffect(() => {
    if (id) {
      const existingService = services.find((s) => s._id === id);
      if (existingService) {
        setService({
          ...existingService,
          duration: existingService.duration,
        });
        setSelectedCategories(existingService.categories || []);
        setImageUrl(existingService.image || '');
        setImageOption(existingService.image ? 'url' : 'none');
      }
    }
  }, [id, services]);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Función para manejar cuando se agrega una nueva categoría
  const handleAddCategory = async () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      try {
        await addCategory(newCategory.trim());
        setSelectedCategories([...selectedCategories, newCategory.trim()]);
        setNewCategory('');
      } catch (error) {
        setErrors({ ...errors, category: 'Error al agregar categoría' });
      }
    } else if (categories.includes(newCategory.trim())) {
      setErrors({ ...errors, category: 'Esta categoría ya existe' });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!service.name.trim()) newErrors.name = 'Nombre requerido';
    if (!service.description.trim()) newErrors.description = 'Descripción requerida';
    if (service.price <= 0) newErrors.price = 'Precio inválido';
    if (service.points < 0) newErrors.points = 'Puntos inválidos';
    if (service.duration < 1) newErrors.duration = 'Duración mínima: 1 hora';
    if (selectedCategories.length === 0) newErrors.category = 'Selecciona al menos una categoría';

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
    formData.append('duration', service.duration.toString());
    
    // Añadir categorías seleccionadas
    selectedCategories.forEach((category, index) => {
      formData.append(`categories[${index}]`, category);
    });

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

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
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

              {/* Selector de categorías */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categorías</label>
                <div className="mb-2">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value && !selectedCategories.includes(e.target.value)) {
                        setSelectedCategories([...selectedCategories, e.target.value]);
                        setErrors({...errors, category: ''});
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">-- Seleccionar categoría --</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categorías seleccionadas */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedCategories.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 px-2 py-1 rounded"
                    >
                      <span className="text-sm">{category}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newCategories = [...selectedCategories];
                          newCategories.splice(index, 1);
                          setSelectedCategories(newCategories);
                        }}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>

                {/* Agregar nueva categoría */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nueva categoría"
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                  >
                    Agregar
                  </button>
                </div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Duración (minutos)</label>
                <input
                  type="number"
                  name="duration"
                  value={service.duration}
                  onChange={(e) => setService({...service, duration: Number(e.target.value)})}
                  min="1"
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