import React from 'react';

const InterviewHeader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center h-20 border-b border-gray-100 select-none bg-white ${className}`}>
    <span className="font-extrabold text-2xl md:text-3xl tracking-tight text-primary-700" style={{color: 'var(--wmt-orange)'}}>WMT Рекрутер</span>
  </div>
);

export default InterviewHeader; 