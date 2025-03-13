import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPasswordPage = () => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña
  const [isPasswordFocused, setIsPasswordFocused] = useState(false); // Estado de enfoque del input de contraseña
  const navigate = useNavigate();

  const location = useLocation();
  const userEmail = location.state?.email || '';

  if (!userEmail) {
    // Si no hay email, redirige al usuario a la página de "Olvidé mi contraseña"
    navigate('/forgot-password');
  }

  // Validaciones en tiempo real
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[.,!@#$%^&*]/.test(newPassword);
  const hasMinLength = newPassword.length >= 6;
  const passwordsMatch = newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!hasUppercase || !hasNumber || !hasSpecialChar || !hasMinLength) {
      setError('La contraseña no cumple con los requisitos.');
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
          password: newPassword,
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
          {/* Input de Código de Recuperación */}
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

          {/* Input de Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 ${
                  hasUppercase && hasNumber && hasSpecialChar && hasMinLength ? 'border-green-500' : ''
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {isPasswordFocused && !(hasUppercase && hasNumber && hasSpecialChar && hasMinLength) && (
              <div className="text-sm text-gray-600 mt-2">
                <p className={hasUppercase ? 'text-green-500' : 'text-red-500'}>• Al menos una letra mayúscula</p>
                <p className={hasNumber ? 'text-green-500' : 'text-red-500'}>• Al menos un número</p>
                <p className={hasSpecialChar ? 'text-green-500' : 'text-red-500'}>• Al menos un carácter especial (.,!@#$%^&*)</p>
                <p className={hasMinLength ? 'text-green-500' : 'text-red-500'}>• Mínimo 6 caracteres</p>
              </div>
            )}
          </div>

          {/* Input de Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
            <input
             type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 ${
                passwordsMatch && confirmPassword ? 'border-green-500' : ''
              }`}
              required
            />
            {!passwordsMatch && confirmPassword && (
              <p className="text-red-500 text-sm mt-1">Las contraseñas no coinciden.</p>
            )}
          </div>

          {/* Botón de enviar */}
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