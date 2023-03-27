export const jsonCentralized = (data) => {
  return JSON.parse(JSON.stringify(data));
};

export const formatThousandSeparator = (number, separator = ',') => {
  return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, separator);
};

export const uppercaseWord = (word) => {
  return word
    ? word
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';
};

export const addZeroBefore = (n) => (n < 10 ? '0' : '') + n;

export const formateDateYYYMMDD = (date) => {
  // Get year, month, and day part from the date
  const year = date.toLocaleString('default', { year: 'numeric' });
  const month = date.toLocaleString('default', { month: '2-digit' });
  const day = date.toLocaleString('default', { day: '2-digit' });

  // Generate yyyy-mm-dd date string
  return year + '-' + month + '-' + day;
};

export const formateDateDDMMYYY = (date, isWithTime = false) => {
  // Get year, month, and day part from the date
  const year = date.toLocaleString('default', { year: 'numeric' });
  const month = date.toLocaleString('default', { month: '2-digit' });
  const day = date.toLocaleString('default', { day: '2-digit' });

  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  if (isWithTime) {
    return day + '-' + month + '-' + year + ' ' + hour + ':' + addZeroBefore(minute) + ':' + addZeroBefore(second);
  }

  // Generate dd-mm-yyyy date string
  return day + '-' + month + '-' + year;
};

export const formateNumber = (string) => (string ? +string.replaceAll(',', '') : '');
