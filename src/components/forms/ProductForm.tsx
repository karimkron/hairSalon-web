import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProductStore, Product } from '../../store/products';

const ProductForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct } = useProductStore();
  const [product, setProduct] = useState<Product>({
    name: '',
    brand: '',
    description: '',
    price: 0,
    stock: 0,
    available: true,
    image: null,
  });

  const [imageOption, setImageOption] = useState<'upload' | 'url' | 'none'>(id ? 'url' : 'upload');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (id) {
      const existingProduct = products.find((p) => p._id === id);
      if (existingProduct) {
        setProduct({
          ...existingProduct,
          image: existingProduct.image || null,
        });
        setImageUrl(typeof existingProduct.image === 'string' ? existingProduct.image : '');
        setImageOption(existingProduct.image ? 'url' : 'none');
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
    if (!product.name.trim()) newErrors.name = 'Nombre requerido';
    if (product.price <= 0) newErrors.price = 'Precio inválido';
    if (product.stock < 0) newErrors.stock = 'Stock inválido';
    
    if (imageOption === 'url' && !isValidUrl(imageUrl)) {
      newErrors.image = 'URL inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProduct((prev: Product) => ({ 
        ...prev, 
        image: file 
      }));
      setErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url && !isValidUrl(url)) {
      setErrors((prev) => ({ ...prev, image: 'URL inválida' }));
    } else {
      setErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('brand', product.brand);
    formData.append('description', product.description);
    formData.append('price', product.price.toString());
    formData.append('stock', product.stock.toString());
    formData.append('available', product.available.toString());

    switch (imageOption) {
      case 'upload':
        if (product.image && typeof product.image !== 'string') {
          formData.append('image', product.image);
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
        await updateProduct(id, formData);
      } else {
        await addProduct(formData);
      }
      navigate('/admin/products');
    } catch (error: any) {
      setErrors({ general: error.message || 'Error al guardar el producto' });
    }
  };

  return (
    <div className="inset-0 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {id ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <button
              onClick={() => navigate('/admin/products')}
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
                  value={product.name}
                  onChange={(e) => setProduct({...product, name: e.target.value})}
                  className={`mt-1 block w-full border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm p-2`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Marca (opcional)</label>
                <input
                  type="text"
                  value={product.brand}
                  onChange={(e) => setProduct({...product, brand: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) => setProduct({...product, price: Number(e.target.value)})}
                  className={`mt-1 block w-full border ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm p-2`}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input
                  type="number"
                  value={product.stock}
                  onChange={(e) => setProduct({...product, stock: Number(e.target.value)})}
                  className={`mt-1 block w-full border ${
                    errors.stock ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm p-2`}
                />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={product.available}
                  onChange={(e) => setProduct({...product, available: e.target.checked})}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label className="text-sm text-gray-700">Disponible</label>
              </div>

              <div className="block">
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={product.description}
                  onChange={(e) => setProduct({...product, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows={3}
                />
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
                {id ? 'Actualizar Producto' : 'Crear Producto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;