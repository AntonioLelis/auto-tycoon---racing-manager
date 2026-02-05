import { START_DATE_TIMESTAMP } from '../constants';

export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatDate = (daysPassed: number): string => {
  // Add days to start timestamp
  const date = new Date(START_DATE_TIMESTAMP + daysPassed * 24 * 60 * 60 * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};
