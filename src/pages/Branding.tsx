import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { apiService } from '../services/apiService';
import { BrandingUpdateRequest } from '../client/models/branding-update-request';
import toast from 'react-hot-toast';

const Branding: React.FC = () => {
  const navigate = useNavigate();
  const [branding, setBranding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<BrandingUpdateRequest>({
    companyName: '',
    logoUrl: '',
    primaryColor: '#FF6600',
    secondaryColor: '#0055FF',
    emailSignature: '',
  });

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const data = await apiService.getBranding();
        setBranding(data);
        // Use default values since Branding model might not have all properties
        setFormData({
          companyName: '',
          logoUrl: '',
          primaryColor: '#FF6600',
          secondaryColor: '#0055FF',
          emailSignature: '',
        });
      } catch (error) {
        console.error('Error loading branding:', error);
        toast.error('Ошибка загрузки настроек брендинга');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const updatedBranding = await apiService.updateBranding(formData);
      setBranding(updatedBranding);
      toast.success('Настройки брендинга сохранены!');
    } catch (error) {
      console.error('Error updating branding:', error);
      toast.error('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <button onClick={() => navigate('/')} className="mb-4 flex items-center text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-5 w-5 mr-2" /> Назад
      </button>
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg w-full flex flex-col gap-8">
        <h1 className="text-2xl font-bold text-gray-900">Настройки брендинга</h1>
        
        {loading ? (
          <div className="text-center py-8 text-gray-400">Загрузка...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название компании</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="input-field"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL логотипа</label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="input-field"
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Основной цвет</label>
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-full h-12 rounded-lg border border-gray-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Дополнительный цвет</label>
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-full h-12 rounded-lg border border-gray-300"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Подпись в email</label>
              <textarea
                value={formData.emailSignature}
                onChange={(e) => setFormData({ ...formData, emailSignature: e.target.value })}
                className="input-field"
                rows={4}
                placeholder="С уважением, команда [Название компании]"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Branding;
