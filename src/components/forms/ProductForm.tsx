import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductStore, Product } from "../../store/products";

const ProductForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteImage } =
    useProductStore();
  const [product, setProduct] = useState<Product>({
    name: "",
    brand: "",
    description: "",
    price: 0,
    stock: 0,
    available: true,
    images: [], // Array de URLs de imágenes
    mainImage: "", // URL de la imagen principal
    categories: [], // Nuevo campo para categorías
  });

  const [imageOption, setImageOption] = useState<"upload" | "url" | "none">(
    id ? "url" : "upload"
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [availableCategories, setAvailableCategories] = useState<string[]>([]); // Categorías disponibles
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // Categorías seleccionadas
  const [newCategory, setNewCategory] = useState<string>(""); // Nueva categoría a agregar

  // Obtener categorías desde la base de datos al cargar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token"); // Obtener el token del localStorage
        if (!token) {
          throw new Error("No se encontró el token de autenticación");
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/categories`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Enviar el token en la cabecera
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al obtener categorías");
        }
        const data = await response.json();
        setAvailableCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Cargar datos del producto si estamos editando
  useEffect(() => {
    if (id) {
      const existingProduct = products.find((p) => p._id === id);
      if (existingProduct) {
        setProduct({
          ...existingProduct,
          images: existingProduct.images || [],
          mainImage: existingProduct.mainImage || "",
          categories: existingProduct.categories || [], // Cargar categorías existentes
        });
        setSelectedCategories(existingProduct.categories || []); // Cargar categorías seleccionadas
        setImageUrls(existingProduct.images || []);
        setMainImageIndex(
          existingProduct.images.indexOf(existingProduct.mainImage)
        );
        setImageOption(existingProduct.images.length ? "url" : "none");
      }
    }
  }, [id, products]);

  // Validar URLs de imágenes
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validar el formulario
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!product.name.trim()) newErrors.name = "Nombre requerido";
    if (product.price <= 0) newErrors.price = "Precio inválido";
    if (product.stock < 0) newErrors.stock = "Stock inválido";

    if (imageOption === "url" && imageUrls.some((url) => !isValidUrl(url))) {
      newErrors.image = "URL inválida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Agregar una nueva categoría
  const handleAddCategory = async () => {
    if (
      newCategory.trim() &&
      !availableCategories.includes(newCategory.trim())
    ) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/categories`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ category: newCategory.trim() }),
          }
        );

        if (!response.ok) {
          throw new Error("Error al agregar categoría");
        }

        const data = await response.json();
        setAvailableCategories([...availableCategories, data.category]); // Agregar la nueva categoría a la lista
        setNewCategory(""); // Limpiar el input
      } catch (error) {
        console.error("Error adding category:", error);
      }
    }
  };

  // Manejar cambios en las imágenes subidas
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);

      // Validar que no se exceda el límite de 10 imágenes
      if (uploadedImages.length + newImages.length > 10) {
        setErrors((prev) => ({
          ...prev,
          image: "No puedes subir más de 10 imágenes",
        }));
        return;
      }

      setUploadedImages((prev) => [...prev, ...newImages]);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  // Manejar cambios en las URLs de las imágenes
  const handleUrlChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newUrls = [...imageUrls];
    newUrls[index] = e.target.value;
    setImageUrls(newUrls);

    if (e.target.value && !isValidUrl(e.target.value)) {
      setErrors((prev) => ({ ...prev, image: "URL inválida" }));
    } else {
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  // Eliminar una imagen
  const removeImage = async (index: number) => {
    if (imageOption === "upload") {
      const newImages = [...uploadedImages];
      newImages.splice(index, 1);
      setUploadedImages(newImages);
    } else {
      if (id) {
        try {
          await deleteImage(id, index); // Llama a la función del backend para eliminar la imagen
          const newUrls = [...imageUrls];
          newUrls.splice(index, 1);
          setImageUrls(newUrls);
        } catch (error: any) {
          setErrors({
            general: error.message || "Error al eliminar la imagen",
          });
        }
      }
    }
  };

  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("brand", product.brand);
    formData.append("description", product.description);
    formData.append("price", product.price.toString());
    formData.append("stock", product.stock.toString());
    formData.append("available", product.available.toString());

    // Agregar categorías seleccionadas al FormData
    selectedCategories.forEach((category, index) => {
      formData.append(`categories[${index}]`, category);
    });

    if (imageOption === "upload") {
      uploadedImages.forEach((image, _) => {
        formData.append("images", image); // Adjunta todas las imágenes
      });
      formData.append("mainImageIndex", mainImageIndex.toString()); // Envía el índice de la imagen principal
    } else if (imageOption === "url") {
      imageUrls.forEach((url, _) => {
        formData.append("images", url); // Adjunta todas las URLs de las imágenes
      });
      formData.append("mainImageIndex", mainImageIndex.toString()); // Envía el índice de la imagen principal
    }

    try {
      if (id) {
        await updateProduct(id, formData);
      } else {
        await addProduct(formData);
      }
      navigate("/admin/products");
    } catch (error: any) {
      setErrors({ general: error.message || "Error al guardar el producto" });
    }
  };

  return (
    <div className="inset-0 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {id ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <button
              onClick={() => navigate("/admin/products")}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campos de nombre, marca, precio, stock, etc. */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) =>
                    setProduct({ ...product, name: e.target.value })
                  }
                  className={`mt-1 block w-full border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm p-2`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Marca (opcional)
                </label>
                <input
                  type="text"
                  value={product.brand}
                  onChange={(e) =>
                    setProduct({ ...product, brand: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Precio
                </label>
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) =>
                    setProduct({ ...product, price: Number(e.target.value) })
                  }
                  className={`mt-1 block w-full border ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm p-2`}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stock
                </label>
                <input
                  type="number"
                  value={product.stock}
                  onChange={(e) =>
                    setProduct({ ...product, stock: Number(e.target.value) })
                  }
                  className={`mt-1 block w-full border ${
                    errors.stock ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm p-2`}
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={product.available}
                  onChange={(e) =>
                    setProduct({ ...product, available: e.target.checked })
                  }
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label className="text-sm text-gray-700">Disponible</label>
              </div>

              {/* Campo de categorías */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categorías
                </label>
                <div className="mt-1">
                  {/* Select para elegir categorías */}
                  <select
                    value={selectedCategories[0] || ""} // Selecciona la primera categoría
                    onChange={(e) => {
                      if (
                        e.target.value &&
                        !selectedCategories.includes(e.target.value)
                      ) {
                        setSelectedCategories([
                          ...selectedCategories,
                          e.target.value,
                        ]);
                      }
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="">Selecciona una categoría</option>
                    {availableCategories.length > 0 ? (
                      availableCategories.map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No hay categorías. Agrega una nueva.
                      </option>
                    )}
                  </select>

                  {/* Input para agregar nuevas categorías */}
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Agregar nueva categoría"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                    >
                      Agregar
                    </button>
                  </div>

                  {/* Categorías seleccionadas */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedCategories.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm"
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => {
                            const newCategories = [...selectedCategories];
                            newCategories.splice(index, 1);
                            setSelectedCategories(newCategories);
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="block">
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={product.description}
                  onChange={(e) =>
                    setProduct({ ...product, description: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows={3}
                />
              </div>

              <div className="block">
                <label className="block text-sm font-medium mb-2">
                  Imágenes
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setImageOption("upload")}
                    className={`px-4 py-2 rounded-lg ${
                      imageOption === "upload"
                        ? "bg-amber-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Subir imágenes
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageOption("url")}
                    className={`px-4 py-2 rounded-lg ${
                      imageOption === "url"
                        ? "bg-amber-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Usar URLs
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageOption("none")}
                    className={`px-4 py-2 rounded-lg ${
                      imageOption === "none"
                        ? "bg-amber-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Sin imágenes
                  </button>
                </div>

                {imageOption === "upload" && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full border rounded-lg p-2"
                      multiple
                      disabled={uploadedImages.length >= 10}
                    />
                    {uploadedImages.length >= 10 && (
                      <p className="text-red-500 text-sm mt-1">
                        No puedes subir más de 10 imágenes
                      </p>
                    )}
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="flex items-center mt-2">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Imagen ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="ml-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                        <button
                          type="button"
                          onClick={() => setMainImageIndex(index)}
                          className={`ml-2 bg-blue-500 text-white px-2 py-1 rounded-md text-sm hover:bg-blue-600 ${
                            index === mainImageIndex ? "bg-green-500" : ""
                          }`}
                        >
                          {index === mainImageIndex
                            ? "Principal"
                            : "Seleccionar como principal"}
                        </button>
                      </div>
                    ))}
                    {errors.image && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.image}
                      </p>
                    )}
                  </div>
                )}

                {imageOption === "url" && (
                  <div>
                    {imageUrls.map((url, index) => (
                      <div key={index} className="mb-2">
                        <input
                          type="text"
                          placeholder="https://ejemplo.com/imagen.jpg"
                          value={url}
                          onChange={(e) => handleUrlChange(e, index)}
                          className={`w-full border rounded-lg p-2 ${
                            errors.image ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="ml-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                        <button
                          type="button"
                          onClick={() => setMainImageIndex(index)}
                          className={`ml-2 bg-blue-500 text-white px-2 py-1 rounded-md text-sm hover:bg-blue-600 ${
                            index === mainImageIndex ? "bg-green-500" : ""
                          }`}
                        >
                          {index === mainImageIndex
                            ? "Principal"
                            : "Seleccionar como principal"}
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setImageUrls([...imageUrls, ""])}
                      className="bg-green-500 text-white px-4 py-2 rounded-md mt-2 hover:bg-green-600"
                    >
                      Añadir otra URL
                    </button>
                    {errors.image && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.image}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {errors.general && (
              <div className="text-red-500 text-center mt-4">
                {errors.general}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700"
              >
                {id ? "Actualizar Producto" : "Crear Producto"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
