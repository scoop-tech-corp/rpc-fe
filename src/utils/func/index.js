export const jsonCentralized = (data) => {
  return JSON.parse(JSON.stringify(data));
};

export const formatThousandSeparator = (number, separator = ',') => {
  return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, separator);
};
