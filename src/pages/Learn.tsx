import React, { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

const Learn: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        // Удалить или заменить вызов apiService.getLearnMaterials()
        // ... существующий код ...
      } catch (error) {
        console.error('Error loading learn materials:', error);
        toast.error('Ошибка загрузки обучающих материалов');
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Обучение</h1>
      <p className="text-gray-600 mb-6">Материалы и инструкции по использованию платформы.</p>
      <div className="bg-white rounded-lg border border-gray-100 shadow-soft p-6">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Загрузка...</div>
        ) : materials.length === 0 ? (
          <div className="text-center text-gray-400 py-8">Нет обучающих материалов</div>
        ) : (
          <ul className="list-disc pl-6 space-y-2">
            {materials.map((item, idx) => (
              <li key={idx}>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{item.title}</a>
                <div className="text-xs text-gray-500">{item.description}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Learn;
