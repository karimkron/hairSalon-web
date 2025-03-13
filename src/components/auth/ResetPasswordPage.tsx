import React, { useState } from 'react';
import { useNavigate, useLocation  } from 'react-router-dom';

const ResetPasswordPage = () => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();


  const location = useLocation();
  const userEmail = location.state?.email || '';

  if (!userEmail) {
    // Si no hay email, redirige al usuario a la página de "Olvidé mi contraseña"
    navigate('/forgot-password');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userEmail, // Asegúrate de que este campo esté definido
          code, 
          password: newPassword 
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setSuccess('Contraseña actualizada correctamente.');
        navigate('/password-updated');
      } else {
        setError(data.message || 'Error al actualizar la contraseña.');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.');
    }
  };

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$%^&*]).{6,}$/;
    return regex.test(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Restablecer Contraseña</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
      Revisa tu correo o verifica la carpeta de spam para obtener el código.
    </p>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 mb-4 text-center">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Código de Recuperación</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 ${
                newPassword && !validatePassword(newPassword) ? 'border-red-500' : 'border-green-500'
              }`}
              required
            />
            {newPassword && !validatePassword(newPassword) && (
              <p className="text-red-500 text-sm mt-1">
                La contraseña debe tener al menos 6 caracteres, una mayúscula, un número y un carácter especial.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 ${
                confirmPassword && confirmPassword !== newPassword ? 'border-red-500' : 'border-green-500'
              }`}
              required
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-red-500 text-sm mt-1">Las contraseñas no coinciden.</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            Restablecer Contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;