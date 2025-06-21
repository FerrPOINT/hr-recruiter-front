import React, { useEffect, useState } from 'react';
import { mockApi } from '../mocks/mockApi';

const useMock = process.env.REACT_APP_USE_MOCK_API === 'true';

const Branding: React.FC = () => {
  const [branding, setBranding] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      let data;
      if (useMock) {
        data = await mockApi.getBranding?.();
      } else {
        // TODO: подключить реальный API-клиент
        data = await mockApi.getBranding?.();
      }
      setBranding(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Брендинг</h1>
      <p className="text-gray-600 mb-6">Настройте фирменный стиль вашей компании.</p>
      <div className="bg-white rounded-lg border border-gray-100 shadow-soft p-6">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Загрузка...</div>
        ) : branding ? (
          <>
            <div className="mb-4"><b>Название компании:</b> {branding.companyName}</div>
            <div className="mb-4"><b>Цвет бренда:</b> <span style={{color: branding.brandColor}}>{branding.brandColor}</span></div>
            <div className="mb-4"><b>Логотип:</b> <img src={branding.logoUrl} alt="logo" className="h-12 inline-block align-middle" /></div>
            <div className="mb-4"><b>Описание:</b> {branding.description}</div>
          </>
        ) : (
          <div className="text-center text-gray-400 py-8">Нет данных о брендинге</div>
        )}
      </div>
    </div>
  );
};

export default Branding;
