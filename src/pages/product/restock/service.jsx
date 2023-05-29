import { setFormDataImage } from 'service/service-global';
import axios from 'utils/axios';
import { formateDateYYYMMDD } from 'utils/func';

const productRestockUrl = 'product/restock';

export const getProductRestock = async (property) => {
  return await axios.get(productRestockUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      supplierId: property.supplierId
    }
  });
};

export const deleteProductRestock = async (id) => {
  return await axios.delete(productRestockUrl, {
    data: { id }
  });
};

export const exportProductRestock = async (property) => {
  return await axios.get(productRestockUrl + '/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword
    }
  });
};

export const createProductRestock = async (property) => {
  const requireDate = property.requireDate ? formateDateYYYMMDD(new Date(property.requireDate)) : '';

  const fd = new FormData();
  fd.append('productId', property.productId);
  fd.append('productType', property.productType);
  fd.append('supplierId', property.supplierId);
  fd.append('requireDate', requireDate);
  fd.append('reStockQuantity', property.reStockQuantity);
  fd.append('costPerItem', property.costPerItem);
  fd.append('total', property.total);
  fd.append('remark', property.remark);

  setFormDataImage(property.images, fd, 'save');

  return await axios.post(productRestockUrl, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const createProductRestockMultiple = async (property) => {
  const fd = new FormData();
  fd.append('status', property.status);
  fd.append('locationId', property.productLocation);

  property.productList.forEach((dt) => {
    fd.append(`productList[]`, JSON.stringify(dt));
  });

  return await axios.post(productRestockUrl + '/multiple', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
