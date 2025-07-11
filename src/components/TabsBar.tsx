import React, { useState } from 'react';
import { usePagesStore } from '../store/pagesStore';
import MiniButton from './widgets/MiniButton';
import ConfirmModal from './widgets/ConfirmModal';

const TabsBar: React.FC = () => {
  const { pages, activePageId, setActivePage, renamePage, deletePage, addPage } = usePagesStore();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmClose, setConfirmClose] = useState<{ open: boolean; pageId: string | null }>({ open: false, pageId: null });

  const pageById = (id: string) => pages.find((p) => p.id === id);

  const handleAddPage = () => {
    const pageName = `Страница ${pages.length + 1}`;
    addPage(pageName);
  };

  return (
    <>
      <div className="flex items-center h-6 bg-gray-50 border-b border-gray-200 px-2 gap-1 shadow-sm select-none" style={{ marginTop: 4 }}>
        {pages.map((page) => (
          <div
            key={page.id}
            className={`relative flex justify-between items-center w-28 py-0.5 mr-1 rounded-t-md text-xs font-medium cursor-pointer transition-all duration-150
              ${page.id === activePageId ? 'bg-gray-100 border border-b-0 border-gray-300 text-blue-700 shadow' : 'bg-gray-50 border border-b-0 border-gray-200 text-gray-700'}`}
            onClick={() => setActivePage(page.id)}
            onDoubleClick={() => { setRenamingId(page.id); setRenameValue(page.name); }}
          >
            {renamingId === page.id ? (
              <input
                className="text-xs px-1 py-0.5 rounded border border-blue-400 focus:outline-none w-16"
                value={renameValue}
                autoFocus
                onChange={e => setRenameValue(e.target.value)}
                onBlur={() => {
                  if (renameValue.trim() && renameValue !== page.name) renamePage(page.id, renameValue.trim());
                  setRenamingId(null);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    if (renameValue.trim() && renameValue !== page.name) renamePage(page.id, renameValue.trim());
                    setRenamingId(null);
                  } else if (e.key === 'Escape') {
                    setRenamingId(null);
                  }
                }}
              />
            ) : (
              <span className="flex-1 truncate select-none pl-1">{page.name}</span>
            )}
            {pages.length > 1 && (
              <button
                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                title="Закрыть"
                onClick={e => {
                  e.stopPropagation();
                  if ((page.components?.length ?? 0) > 0) {
                    setConfirmClose({ open: true, pageId: page.id });
                  } else {
                    deletePage(page.id);
                  }
                }}
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M6 14L14 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>
        ))}
        
        {/* Add Page Button */}
        <button
          className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors duration-200 ml-2"
          title="Добавить страницу"
          onClick={handleAddPage}
          style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="15" height="15" viewBox="0 0 22 22" fill="none">
            <path d="M11 4v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 11h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <ConfirmModal
        open={confirmClose.open}
        title="Закрыть страницу?"
        description="На этой странице есть виджеты. Вы уверены, что хотите закрыть вкладку? Все виджеты будут удалены."
        onConfirm={() => {
          if (confirmClose.pageId) deletePage(confirmClose.pageId);
          setConfirmClose({ open: false, pageId: null });
        }}
        onCancel={() => setConfirmClose({ open: false, pageId: null })}
      />
    </>
  );
};

export default TabsBar; 