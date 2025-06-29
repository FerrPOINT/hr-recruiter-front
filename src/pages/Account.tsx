import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, X, User, Mail, Phone, Globe, Shield } from 'lucide-react';
import { apiService } from '../services/apiService';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  language: string;
  phone?: string;
}

const Account: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<UserData | null>(null);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const data = await apiService.getAccount();
        const userData: UserData = {
          id: data.id?.toString() || '',
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Пользователь',
          email: data.email || '',
          role: data.role || 'recruiter',
          avatarUrl: data.avatarUrl,
          language: data.language || 'Русский',
          phone: data.phone,
        };
        setUser(userData);
        setEditData(userData);
      } catch (error: any) {
        console.error('Error loading account:', error);
        const errorMessage = error.response?.data?.message || 'Ошибка загрузки профиля';
        toast.error(errorMessage);
        
        // Если ошибка авторизации, перенаправляем на логин
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Выход выполнен успешно');
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Ошибка при выходе');
      // В любом случае перенаправляем на логин
      navigate('/login');
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditData(user);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData(user);
  };

  const handleSave = async () => {
    if (!editData) return;
    
    try {
      const updatedUser = await apiService.updateAccount({
        firstName: editData.name.split(' ')[0] || '',
        lastName: editData.name.split(' ').slice(1).join(' ') || '',
        email: editData.email,
        phone: editData.phone,
        language: editData.language
      });
      
      const userData: UserData = {
        id: updatedUser.id?.toString() || '',
        name: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim() || 'Пользователь',
        email: updatedUser.email || '',
        role: updatedUser.role || 'recruiter',
        avatarUrl: updatedUser.avatarUrl,
        language: updatedUser.language || 'Русский',
        phone: updatedUser.phone,
      };
      
      setUser(userData);
      toast.success('Профиль обновлен');
      setEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Ошибка при обновлении профиля');
    }
  };

  const handleInputChange = (field: keyof UserData, value: string) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'recruiter': 'Рекрутер',
      'admin': 'Администратор',
      'viewer': 'Наблюдатель'
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <button onClick={() => navigate('/')} className="mb-4 flex items-center text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5 mr-2" /> Назад
        </button>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg w-full">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <button onClick={() => navigate('/')} className="mb-4 flex items-center text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-5 w-5 mr-2" /> Назад
      </button>
      
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Профиль аккаунта</h1>
          {!editing && (
            <button 
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="h-4 w-4" />
              Редактировать
            </button>
          )}
        </div>

        {user && (
          <div className="space-y-6">
            {/* Аватар и основная информация */}
            <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
              <div className="relative">
                <img 
                  src={user.avatarUrl || 'https://randomuser.me/api/portraits/women/1.jpg'} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                />
                {editing && (
                  <button className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700 transition-colors">
                    <Edit className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-gray-500">{getRoleDisplayName(user.role)}</p>
              </div>
            </div>

            {/* Поля профиля */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Имя */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4" />
                  Имя
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={editData?.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-base text-gray-900">{user.name}</div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={editData?.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-base text-gray-900">{user.email}</div>
                )}
              </div>

              {/* Телефон */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="h-4 w-4" />
                  Телефон
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={editData?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+7 (999) 123-45-67"
                  />
                ) : (
                  <div className="text-base text-gray-900">{user.phone || 'Не указан'}</div>
                )}
              </div>

              {/* Язык */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Globe className="h-4 w-4" />
                  Язык интерфейса
                </label>
                {editing ? (
                  <select
                    value={editData?.language || ''}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Русский">Русский</option>
                    <option value="English">English</option>
                  </select>
                ) : (
                  <div className="text-base text-gray-900">{user.language}</div>
                )}
              </div>

              {/* Роль */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Shield className="h-4 w-4" />
                  Роль
                </label>
                <div className="text-base text-gray-900">{getRoleDisplayName(user.role)}</div>
              </div>

              {/* ID пользователя */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4" />
                  ID пользователя
                </label>
                <div className="text-base text-gray-500 font-mono">{user.id}</div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-4 pt-6 border-t border-gray-100">
              {editing ? (
                <>
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    Сохранить
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Отмена
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Выйти
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account; 