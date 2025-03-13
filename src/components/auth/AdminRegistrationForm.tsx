import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Lista de países europeos y de EE. UU. con códigos y banderas
const countries = [
  { code: '+34', name: 'España', flag: '🇪🇸', maxLength: 9 },
  { code: '+33', name: 'Francia', flag: '🇫🇷', maxLength: 9 },
  { code: '+49', name: 'Alemania', flag: '🇩🇪', maxLength: 10 },
  { code: '+39', name: 'Italia', flag: '🇮🇹', maxLength: 10 },
  { code: '+44', name: 'Reino Unido', flag: '🇬🇧', maxLength: 10 },
  { code: '+1', name: 'Estados Unidos', flag: '🇺🇸', maxLength: 10 },
];

const AdminRegistrationForm = () => {
  const location = useLocation();
  const email = location.state?.email || '';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // País seleccionado
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false); // Estado del dropdown
  const [searchCountry, setSearchCountry] = useState(''); // Búsqueda de país
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false); // Estado de enfoque del input de contraseña
  const navigate = useNavigate();

  // Validaciones en tiempo real
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[.,!@#$%^&*]/.test(password);
  const hasMinLength = password.length >= 6;
  const passwordsMatch = password === confirmPassword;

  // Validación del número de teléfono según el país seleccionado
  const isPhoneValid = phone.length === selectedCountry.maxLength;

  // Función para validar si el nombre está rellenado
  const isNameValid = name.trim() !== '';

  // Función para filtrar países según la búsqueda
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchCountry.toLowerCase()) ||
    country.code.includes(searchCountry)
  );

  // Efecto para cerrar el dropdown si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.country-dropdown')) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validar que todos los campos estén correctos antes de enviar
    if (!isNameValid || !isPhoneValid || !hasUppercase || !hasNumber || !hasSpecialChar || !hasMinLength || !passwordsMatch) {
      setError('Por favor, completa todos los campos correctamente.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, name, phone: `${selectedCountry.code}${phone}`, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar el token en localStorage
        localStorage.setItem('token', data.token);
        // Redirigir al panel de administración
        navigate('/admin');
      } else {
        setError(data.message || 'Error durante el registro');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Registro de Administrador
        </h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input de Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 ${
                isNameValid ? 'border-green-500' : ''
              }`}
              required
            />
          </div>

          {/* Input de Teléfono con selector de país */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  className="w-full flex items-center justify-between border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                >
                  <span>{selectedCountry.flag} {selectedCountry.code}</span>
                  <span>▼</span>
                </button>
                {isCountryDropdownOpen && (
                  <div className="country-dropdown absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <input
                      type="text"
                      value={searchCountry}
                      onChange={(e) => setSearchCountry(e.target.value)}
                      placeholder="Buscar país..."
                      className="w-full p-2 border-b border-gray-300 focus:outline-none"
                    />
                    {filteredCountries.map((country) => (
                      <div
                        key={country.code}
                        onClick={() => {
                          setSelectedCountry(country);
                          setIsCountryDropdownOpen(false);
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      >
                        <span>{country.flag}</span>
                        <span>{country.name} ({country.code})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`flex-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 ${
                  isPhoneValid ? 'border-green-500' : ''
                }`}
                required
              />
            </div>
            {!isPhoneValid && phone && (
              <p className="text-red-500 text-sm mt-1">
                El número de teléfono debe tener {selectedCountry.maxLength} dígitos.
              </p>
            )}
          </div>

          {/* Input de Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            disabled={isLoading}
            className="w-full bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegistrationForm;