import React, { useState, useEffect } from 'react';
import TabsBar from './TabsBar';
import { LeftPanel } from './LeftPanel';
import { EditorCanvas } from './EditorCanvas';
import { RightPanel } from './RightPanel';
import SaveStatusIndicator from './SaveStatusIndicator';
import { usePagesStore } from '../store/pagesStore';

export const EditorLayout: React.FC = () => {
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);
  const [isMobile, setIsMobile] = useState(false);
  const [showTabletBanner, setShowTabletBanner] = useState(false);



  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 700);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const checkTablet = () => setShowTabletBanner(window.innerWidth < 900 && window.innerWidth >= 700);
    checkTablet();
    window.addEventListener('resize', checkTablet);
    return () => window.removeEventListener('resize', checkTablet);
  }, []);

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-95 text-center p-8">
        <div className="text-5xl mb-6">📱</div>
        <div className="text-2xl font-bold mb-2">Редактор недоступен на мобильных устройствах</div>
        <div className="text-lg text-gray-600 mb-4">Пожалуйста, используйте планшет или компьютер для работы с редактором интерфейса.</div>
      </div>
    );
  }

  return (
    <>
      {showTabletBanner && (
        <div className="fixed top-0 left-0 w-full z-50 bg-yellow-100 text-yellow-900 px-6 py-3 flex items-center justify-between shadow-md animate-fade-in">
          <span className="text-lg font-medium">Для полного функционала редактора рекомендуется использовать десктоп. На планшете возможны ограничения.</span>
          <button onClick={() => setShowTabletBanner(false)} className="ml-4 px-3 py-1 rounded bg-yellow-200 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400" aria-label="Скрыть предупреждение" title="Скрыть предупреждение">✕</button>
        </div>
      )}
      <div className="flex flex-col h-screen w-full">
        <TabsBar />
        <div className="flex flex-1 min-h-0 w-full">
          <div className="relative h-full flex-shrink-0 bg-gray-50 border-r border-gray-200 transition-all duration-500 md:min-w-[180px] md:max-w-[320px] min-w-[120px] max-w-[400px]" style={{ width: leftPanelWidth }}>
            <LeftPanel width={leftPanelWidth} onWidthChange={setLeftPanelWidth} />
          </div>
          <div className="flex-1 relative overflow-auto bg-white min-w-0">
            <EditorCanvas leftPanelWidth={leftPanelWidth} rightPanelWidth={rightPanelWidth} />
          </div>
          <div className="relative h-full flex-shrink-0 bg-gray-50 border-l border-gray-200 transition-all duration-500 md:min-w-[180px] md:max-w-[320px] min-w-[120px] max-w-[400px]" style={{ width: rightPanelWidth }}>
            <RightPanel width={rightPanelWidth} onWidthChange={setRightPanelWidth} />
          </div>
        </div>
        <SaveStatusIndicator />
      </div>
    </>
  );
};

export default EditorLayout; 