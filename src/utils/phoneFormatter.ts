/**
 * Форматирует номер телефона в российский формат
 * @param value - Сырой номер телефона
 * @returns Отформатированный номер в формате +7 (999) 123-45-67
 */
export const formatPhoneNumber = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length === 0) return '';
  if (cleanValue.length <= 3) return `+7 (${cleanValue}`;
  if (cleanValue.length <= 6) return `+7 (${cleanValue.slice(0, 3)}) ${cleanValue.slice(3)}`;
  if (cleanValue.length <= 8) return `+7 (${cleanValue.slice(0, 3)}) ${cleanValue.slice(3, 6)}-${cleanValue.slice(6)}`;
  return `+7 (${cleanValue.slice(0, 3)}) ${cleanValue.slice(3, 6)}-${cleanValue.slice(6, 8)}-${cleanValue.slice(8, 10)}`;
};

/**
 * Валидирует номер телефона
 * @param phone - Номер телефона для валидации
 * @returns true если номер валиден, false в противном случае
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return /^[\+]?[0-9]{10,15}$/.test(cleanPhone);
};

/**
 * Очищает номер телефона от форматирования
 * @param phone - Отформатированный номер телефона
 * @returns Очищенный номер (только цифры)
 */
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
}; 