import React from 'react';
import { usePagesStore } from '../store/pagesStore';

export const SaveStatusIndicator: React.FC = () => {
  const isDirty = usePagesStore((s) => s.isDirty);
  const isSaved = usePagesStore((s) => s.isSaved);

  let status = '';
  let color = '';
  if (isDirty) {
    status = 'Есть несохранённые изменения…';
    color = 'bg-orange-100 text-orange-700 border-orange-300';
  } else if (isSaved) {
    status = 'Сохранено';
    color = 'bg-green-100 text-green-700 border-green-300';
  } else {
    status = '—';
    color = 'bg-gray-100 text-gray-500 border-gray-200';
  }

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow border text-sm font-medium transition-colors z-50 ${color}`}
      style={{ pointerEvents: 'none', minWidth: 140, textAlign: 'center' }}
      aria-live="polite"
      role="status"
    >
      {status}
    </div>
  );
};

export default SaveStatusIndicator; 