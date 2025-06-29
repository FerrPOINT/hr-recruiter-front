import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

const Team: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'recruiter',
    password: '',
  });

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const data = await apiService.getUsers();
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('getUsers returned non-array:', data);
          setUsers([]);
          toast.error('Неверный формат данных пользователей');
        }
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Ошибка загрузки пользователей');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newUser = await apiService.createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        password: formData.password
      });
      setUsers([...users, newUser]);
      setShowCreateForm(false);
      setFormData({ firstName: '', lastName: '', email: '', role: 'recruiter', password: '' });
      toast.success('Пользователь создан');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Ошибка создания пользователя');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = await apiService.updateUser(editingUser.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role
      });
      setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
      setEditingUser(null);
      setFormData({ firstName: '', lastName: '', email: '', role: 'recruiter', password: '' });
      toast.success('Пользователь обновлен');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Ошибка обновления пользователя');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await apiService.deleteUser(parseInt(userId));
        setUsers(users.filter(u => u.id !== userId));
        toast.success('Пользователь удален');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Ошибка удаления пользователя');
      }
    }
  };

  const openEditForm = (user: any) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || 'recruiter',
      password: '',
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <button onClick={() => navigate('/')} className="mb-4 flex items-center text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-5 w-5 mr-2" /> Назад
      </button>
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg w-full flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Управление командой</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить пользователя
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Загрузка...</div>
        ) : (
          <div className="grid gap-4">
            {Array.isArray(users) && users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-medium text-gray-900">{`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Пользователь'}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400 capitalize">{user.role}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(user)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {Array.isArray(users) && users.length === 0 && (
              <div className="text-center py-8 text-gray-400">Пользователи не найдены</div>
            )}
          </div>
        )}

        {/* Модальное окно создания/редактирования */}
        {(showCreateForm || editingUser) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-medium mb-4">
                {editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
              </h2>
              <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                  >
                    <option value="admin">Администратор</option>
                    <option value="recruiter">Рекрутер</option>
                    <option value="viewer">Наблюдатель</option>
                  </select>
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingUser ? 'Сохранить' : 'Создать'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingUser(null);
                      setFormData({ firstName: '', lastName: '', email: '', role: 'recruiter', password: '' });
                    }}
                    className="btn-secondary flex-1"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;