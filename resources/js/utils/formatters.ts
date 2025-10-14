export const formatPrice = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined || amount === '') {
    return '0.00';
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

export const toNumber = (amount: string | number | null | undefined): number => {
  if (amount === null || amount === undefined || amount === '') {
    return 0;
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return isNaN(num) ? 0 : Number(num.toFixed(2));
};
