export const formatDistance = (kilometers) => {
    if (kilometers === null || kilometers === undefined) return '';
    
    const meters = kilometers * 1000;
    if (kilometers < 1) {
      return `${Math.round(meters)}m`;
    }
    return `${kilometers.toFixed(1)}km`;
  };
  
  export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const numbers = phone.replace(/[^0-9]/g, '');
    
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (numbers.length === 10) {
      return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else if (numbers.length === 9) {
      return numbers.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return phone;
  };