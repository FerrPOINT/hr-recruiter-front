import React from 'react';

const Branding: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Брендирование</h1>
      <p className="text-gray-600 mb-6">Настройте фирменный стиль, логотип и цвета для вашей компании (заглушка, мок).</p>
      <div className="bg-white border border-gray-100 rounded-lg shadow-soft p-6 text-gray-500 text-sm">
        <div>В будущем здесь появится возможность загрузить логотип, выбрать фирменные цвета и настроить внешний вид платформы под ваш бренд.</div>
      </div>
    </div>
  );
};

export default Branding; 