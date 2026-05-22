import axios from 'utils/axios';

const baseUrl = 'product/stock-opname';

export const getProductByBarcode = async (property) => {
  return await axios.post(baseUrl + '/scan-barcode', {
    locationId: property.locationId,
    sku: property.sku
  });
};

export const submitStockOpnameProducts = async (payload, type) => {
  return await axios.post(baseUrl + '/input-product', { type, data: payload });
};
