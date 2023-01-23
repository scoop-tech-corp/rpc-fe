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
