import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserStore, User } from '../../store/userStore';
import Swal from 'sweetalert2';

const UserForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { users, updateUser, updatePassword } = useUserStore();
  const [user, setUser] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    rank: 'bronce',
    isBlocked: false,
  });
  const [newPassword, setNewPassword] = useState('');
  const [originalUser, setOriginalUser] = useState<Partial<User>>({});

  useEffect(() => {
    if (id) {
      const existingUser = users.find((u) => u._id === id);
      if (existingUser) {
        setUser(existingUser);
        setOriginalUser(existingUser);
      }
    }
  }, [id, users]);

  const handleChange = (field: keyof User, value: string | boolean) => {
    Swal.fire({
      title: `¿Quieres modificar ${field}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        setUser({ ...user, [field]: value });
      } else {
        setUser(originalUser);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await updateUser(id, user);
        if (newPassword) {
          await updatePassword(id, newPassword);
        }
      }
      Swal.fire({
        title: 'Éxito',
        text: 'Usuario actualizado correctamente',
        icon: 'success'
      }).then(() => {
        navigate('/admin/users');
      });
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al guardar los cambios',
        icon: 'error'
      });
      console.error('Error al guardar los cambios:', error);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">{id ? 'Editar Usuario' : 'Nuevo Usuario'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            value={user.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={user.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            type="text"
            value={user.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rango</label>
          <select
            value={user.rank}
            onChange={(e) => handleChange('rank', e.target.value as User['rank'])}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="bronce">Bronce</option>
            <option value="plata">Plata</option>
            <option value="oro">Oro</option>
            <option value="diamante">Diamante</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div className="flex justify-end">
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
