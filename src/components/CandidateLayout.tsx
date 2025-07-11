import React from 'react';

interface CandidateLayoutProps {
  children: React.ReactNode;
}

/**
 * Простой Layout для кандидатов
 * Не содержит сайдбар, меню и лишние API запросы
 */
const CandidateLayout: React.FC<CandidateLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Простой заголовок для кандидатов */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Интервью
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <main className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default CandidateLayout; 