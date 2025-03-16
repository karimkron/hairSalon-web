import { useEffect, useState } from 'react';
import { useProductStore } from '../../store/products';
import { Link } from 'react-router-dom';

const ProductsList = () => {
  const { products, fetchProducts, deleteProduct } = useProductStore();
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts().catch(error => {
      console.error('Error fetching products:', error);
    });
  }, [fetchProducts]);

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="p-2 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Lista de Productos</h1>
      <Link
        to="/admin/products/create"
        className="bg-amber-600 text-white px-4 py-2 rounded-md mb-6 inline-block hover:bg-amber-700"
      >
        Agregar Producto
      </Link>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 border-b">Imagen</th>
              <th className="py-3 px-4 border-b">Nombre</th>
              <th className="py-3 px-4 border-b">Marca</th>
              <th className="py-3 px-4 border-b">Descripción</th>
              <th className="py-3 px-4 border-b">Stock</th>
              <th className="py-3 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50 transition-colors relative">
                <td className="py-4 px-4 border-b">
                  {product.image && product.image !== 'none' ? (
                    <div className="w-16 h-16 overflow-hidden rounded-lg">
                      <img
                        src={typeof product.image === 'string' ? product.image : undefined}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-amber-600">
                      <span className="text-white text-2xl font-bold">
                        {getInitial(product.name)}
                      </span>
                    </div>
                  )}
                </td>
                <td className="py-4 px-4 border-b">{product.name}</td>
                <td className="py-4 px-4 border-b">{product.brand || '-'}</td>
                <td className="py-4 px-4 border-b max-w-xs truncate">{product.description}</td>
                <td className="py-4 px-4 border-b">{product.stock}</td>
                <td className="py-4 px-4 border-b relative">
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/products/edit/${product._id}`}
                      className="bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-600"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => setDeletingProduct(product._id!)}
                      className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                  {deletingProduct === product._id && (
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border shadow-lg p-4 rounded-lg z-50">
                      <p className="text-sm mb-2">¿Eliminar este producto?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            deleteProduct(product._id!).catch(error => {
                              console.error('Error deleting product:', error);
                            });
                            setDeletingProduct(null);
                          }}
                          className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600"
                        >
                          Sí, eliminar
                        </button>
                        <button
                          onClick={() => setDeletingProduct(null)}
                          className="bg-gray-300 text-black px-2 py-1 rounded-md text-xs hover:bg-gray-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsList;
