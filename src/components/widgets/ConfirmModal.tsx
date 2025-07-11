import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, title, description, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[260px] max-w-xs">
        <div className="font-semibold text-lg mb-2">{title}</div>
        {description && <div className="text-sm text-gray-600 mb-4">{description}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            className="px-3 py-1 text-sm rounded bg-red-500 hover:bg-red-600 text-white"
            onClick={onConfirm}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 