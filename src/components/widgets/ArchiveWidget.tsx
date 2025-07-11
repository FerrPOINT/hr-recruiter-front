import React from 'react';
import BaseWidget from './BaseWidget';
// import Archive from '../pages/Archive';
const Archive = () => <div>Archive widget placeholder</div>;

interface ArchiveWidgetProps {
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const ArchiveWidget: React.FC<ArchiveWidgetProps> = ({ 
  id, 
  isSelected, 
  onClick, 
  onClose, 
  onRefresh,
  onMouseDown
}) => (
  <BaseWidget
    id={id}
    isSelected={isSelected}
    onClick={onClick}
    onClose={onClose}
    onRefresh={onRefresh}
    onMouseDown={onMouseDown}
    title="Архив"
  >
    <Archive />
  </BaseWidget>
);

export default ArchiveWidget; 