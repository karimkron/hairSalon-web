import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserStore, User } from '../../store/userStore';
import Swal from 'sweetalert2';

const UserForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { users, updateUser, updatePassword, toggleBlockUser } = useUserStore();
  const [user, setUser] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    rank: 'bronce',
    isBlocked: false,
  });

  useEffect(() => {
    if (id) {
      const existingUser = users.find((u) => u._id === id);
      if (existingUser) {
        setUser(existingUser);
      }
    }
  }, [id, users]);

  const handleChange = async (field: keyof User, currentValue: string | boolean) => {
    const { value } = await Swal.fire({
      title: `Modificar ${field}`,
      input: field === 'rank' ? 'select' : 'text', // Usar select para el campo 'rank'
      inputLabel: `Nuevo valor para ${field}`,
      inputValue: String(currentValue),
      inputOptions: field === 'rank' ? {
        bronce: 'Bronce',
        plata: 'Plata',
        oro: 'Oro',
        diamante: 'Diamante',
      } : undefined,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value: string) => {
        if (!value) {
          return 'Debes ingresar un valor';
        }
        return null;
      },
    });

    if (value) {
      setUser({ ...user, [field]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await updateUser(id, user);
      }
      Swal.fire({
        title: 'Éxito',
        text: 'Usuario actualizado correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
      }).then(() => {
        navigate('/admin/users');
      });
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al guardar los cambios',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      console.error('Error al guardar los cambios:', error);
    }
  };

  const handleToggleBlock = async () => {
    const result = await Swal.fire({
      title: `¿Seguro que quieres ${user.isBlocked ? 'desbloquear' : 'bloquear'} a ${user.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    });

    if (result.isConfirmed && id) {
      try {
        await toggleBlockUser(id, !user.isBlocked);
        setUser({ ...user, isBlocked: !user.isBlocked });
        Swal.fire({
          title: 'Éxito',
          text: `Usuario ${user.isBlocked ? 'desbloqueado' : 'bloqueado'} correctamente`,
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al bloquear/desbloquear al usuario',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error al bloquear/desbloquear usuario:', error);
      }
    }
  };

  const handleUpdatePassword = async () => {
    const { value: newPassword } = await Swal.fire({
      title: 'Cambiar Contraseña',
      input: 'password',
      inputLabel: 'Ingresa la nueva contraseña',
      inputPlaceholder: 'Nueva contraseña',
      showCancelButton: true,
      confirmButtonText: 'Cambiar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value: string) => {
        if (!value) {
          return 'Debes ingresar una contraseña';
        }
        return null;
      },
    });

    if (newPassword && id) {
      try {
        await updatePassword(id, newPassword);
        Swal.fire({
          title: 'Éxito',
          text: 'Contraseña actualizada correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al actualizar la contraseña',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error al actualizar la contraseña:', error);
      }
    }
  };

  const handleCloseForm = () => {
    navigate('/admin/users');
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{id ? 'Editar Usuario' : 'Nuevo Usuario'}</h1>
        <button
          onClick={handleCloseForm}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <button
              type="button"
              onClick={() => handleChange('name', user.name || '')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-left hover:bg-gray-50"
            >
              {user.name || 'Haz clic para editar'}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <button
              type="button"
              onClick={() => handleChange('email', user.email || '')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-left hover:bg-gray-50"
            >
              {user.email || 'Haz clic para editar'}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <button
              type="button"
              onClick={() => handleChange('phone', user.phone || '')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-left hover:bg-gray-50"
            >
              {user.phone || 'Haz clic para editar'}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rango</label>
            <button
              type="button"
              onClick={() => handleChange('rank', user.rank || 'bronce')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-left hover:bg-gray-50"
            >
              {user.rank || 'Haz clic para editar'}
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleToggleBlock}
            className={`px-4 py-2 rounded-md ${
              user.isBlocked
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {user.isBlocked ? 'Desbloquear Usuario' : 'Bloquear Usuario'}
          </button>
          <button
            type="button"
            onClick={handleUpdatePassword}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Cambiar Contraseña
          </button>
          <button
            type="submit"
            className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;