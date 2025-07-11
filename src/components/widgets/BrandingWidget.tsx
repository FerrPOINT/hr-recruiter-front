import React from 'react';
import BaseWidget from './BaseWidget';
// import Branding from '../pages/Branding';
const Branding = () => <div>Branding widget placeholder</div>;

interface BrandingWidgetProps {
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const BrandingWidget: React.FC<BrandingWidgetProps> = ({ 
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
    title="Брендинг"
  >
    <Branding />
  </BaseWidget>
);

export default BrandingWidget; 