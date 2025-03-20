import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../../store/userStore'; // Importar el store de usuario

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setCurrentUser } = useUserStore(); // Obtener la función para establecer el usuario actual

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar el token en localStorage
        localStorage.setItem('token', data.token);

        // Guardar el usuario en el store
        setCurrentUser(data.user);

        // Redirigir al panel de administración
        navigate('/admin');
      } else {
        // Verificar si la cuenta está bloqueada
        if (data.message === 'Cuenta bloqueada') {
          setError(`Tu cuenta ha sido bloqueada. Por favor, contacta con el soporte: ${data.superadminEmail}`);
        } else {
          setError(data.message || 'Error durante el inicio de sesión');
        }
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            Iniciar Sesión
          </button>
          <p className="text-center text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/admin/register"
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Regístrate aquí
            </Link>
            <br />
             <Link
               to="/forgot-password"
               className="text-amber-600 hover:text-amber-700 font-medium"
             >
               Recuperar contraseña
             </Link>          
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;