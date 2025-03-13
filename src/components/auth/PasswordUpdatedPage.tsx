import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PasswordUpdatedPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir al login después de 2 segundos
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000);

    // Limpiar el timer si el componente se desmonta
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-center">Contraseña Actualizada</h2>
        <p className="text-green-500 mb-4">Tu contraseña ha sido actualizada correctamente.</p>
        <p className="text-gray-600">Serás redirigido al login en 2 segundos...</p>
      </div>
    </div>
  );
};

export default PasswordUpdatedPage;