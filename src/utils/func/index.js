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

export const formateDateDDMMYYY = (date, additional = { isWithTime: { show: false, withSecond: true }, separator: '-' }) => {
  // Get year, month, and day part from the date
  const year = date.toLocaleString('default', { year: 'numeric' });
  const month = date.toLocaleString('default', { month: '2-digit' });
  const day = date.toLocaleString('default', { day: '2-digit' });

  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  if (additional.isWithTime.show) {
    const time = day + additional.separator + month + additional.separator + year + ' ' + addZeroBefore(hour) + ':' + addZeroBefore(minute);

    if (additional.isWithTime.withSecond) {
      return time + ':' + addZeroBefore(second);
    }

    return time;
  }

  // Generate dd-mm-yyyy date string
  return day + additional.separator + month + additional.separator + year;
};

// from 2025-02-20 to 20 Feb 2025
export const formatDateString = (dateString, locale = 'en') => {
  const locales = {
    id: 'id-ID',
    en: 'en-US'
  };

  const date = new Date(dateString);

  // Ambil nama bulan sesuai locale
  const monthName = new Intl.DateTimeFormat(locales[locale], { month: 'short' }).format(date);

  // Format manual menjadi "DD MMM YYYY"
  return `${date.getDate()} ${monthName} ${date.getFullYear()}`;
};

export const isContainsUppercaseForWord = (str) => Boolean(str.match(/[A-Z]/));

export const formateNumber = (string) => (string ? +string.replaceAll(',', '') : '');
