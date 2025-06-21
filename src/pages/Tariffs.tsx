import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Check } from 'lucide-react';
import { mockApi } from '../mocks/mockApi';

const useMock = process.env.REACT_APP_USE_MOCK_API === 'true';

const Tariffs: React.FC = () => {
  const navigate = useNavigate();
  const [tariffs, setTariffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTariff, setEditingTariff] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    features: [''],
    price: 0,
    isActive: true,
  });

  useEffect(() => {
    setLoading(true);
    (async () => {
      let data;
      if (useMock) {
        data = await mockApi.getTariffs();
      } else {
        data = await mockApi.getTariffs();
      }
      setTariffs(data);
      setLoading(false);
    })();
  }, []);

  const handleCreateTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTariff = await mockApi.createTariff({
        ...formData,
        features: formData.features.filter(f => f.trim() !== ''),
      });
      setTariffs([...tariffs, newTariff]);
      setShowCreateForm(false);
      setFormData({ name: '', features: [''], price: 0, isActive: true });
    } catch (error) {
      console.error('Error creating tariff:', error);
    }
  };

  const handleUpdateTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedTariff = await mockApi.updateTariff(editingTariff.id, {
        ...formData,
        features: formData.features.filter(f => f.trim() !== ''),
      });
      setTariffs(tariffs.map(t => t.id === editingTariff.id ? updatedTariff : t));
      setEditingTariff(null);
      setFormData({ name: '', features: [''], price: 0, isActive: true });
    } catch (error) {
      console.error('Error updating tariff:', error);
    }
  };

  const handleDeleteTariff = async (tariffId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот тариф?')) {
      try {
        await mockApi.deleteTariff(tariffId);
        setTariffs(tariffs.filter(t => t.id !== tariffId));
      } catch (error) {
        console.error('Error deleting tariff:', error);
      }
    }
  };

  const openEditForm = (tariff: any) => {
    setEditingTariff(tariff);
    setFormData({
      name: tariff.name,
      features: tariff.features.length > 0 ? tariff.features : [''],
      price: tariff.price,
      isActive: tariff.isActive,
    });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures.length > 0 ? newFeatures : [''] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <button onClick={() => navigate('/')} className="mb-4 flex items-center text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-5 w-5 mr-2" /> Назад
      </button>
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg w-full flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Управление тарифами</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить тариф
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Загрузка...</div>
        ) : (
          <div className="grid gap-6">
            {tariffs.map((tariff) => (
              <div key={tariff.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{tariff.name}</h3>
                    <p className="text-2xl font-bold text-primary-600">
                      {tariff.price === 0 ? 'Бесплатно' : `${tariff.price} ₽/месяц`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(tariff)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTariff(tariff.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {tariff.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tariff.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tariff.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Модальное окно создания/редактирования */}
        {(showCreateForm || editingTariff) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-medium mb-4">
                {editingTariff ? 'Редактировать тариф' : 'Добавить тариф'}
              </h2>
              <form onSubmit={editingTariff ? handleUpdateTariff : handleCreateTariff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Цена (₽/месяц)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="input-field"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Возможности</label>
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="input-field flex-1"
                        placeholder="Описание возможности"
                        required
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Добавить возможность
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Активный тариф
                  </label>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingTariff ? 'Сохранить' : 'Создать'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingTariff(null);
                      setFormData({ name: '', features: [''], price: 0, isActive: true });
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

export default Tariffs; 