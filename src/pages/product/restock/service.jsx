import { setFormDataImage } from 'service/service-global';
import { formateDateYYYMMDD } from 'utils/func';
import axios from 'utils/axios';

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
      supplierId: property.supplierId,
      locationId: property.locationId
    }
  });
};

export const exportProductRestockPdf = async (property) => {
  return await axios.get(productRestockUrl + '/export/pdf', {
    responseType: 'blob',
    params: {
      id: property.id,
      isExportAll: property.isExportAll,
      supplierId: property.supplierId
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
  fd.append('locationId', property.locationId);
  fd.append('productList', JSON.stringify(property.productList));

  return await axios.post(productRestockUrl + '/multiple', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateProductRestock = async (parameter) => {
  return await axios.put(productRestockUrl, parameter);
};

export const createProductRestockTracking = async (property) => {
  const fd = new FormData();
  fd.append('productRestockId', property.id);
  fd.append('progress', property.progress);

  return await axios.post(productRestockUrl + '/tracking', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getProductRestockDetail = async (id, type = '') => {
  return await axios.get(productRestockUrl + '/detail', {
    params: { id, type }
  });
};

export const getProductRestockDetailHistory = async (property) => {
  return await axios.get(productRestockUrl + '/detail/history', {
    params: {
      id: property.id,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      goToPage: property.goToPage,
      rowPerPage: property.rowPerPage
    }
  });
};

export const getSupplierProductRestock = async (id) => {
  const getResp = await axios.get(productRestockUrl + '/detail/supplier', {
    params: { id }
  });

  return getResp.data.map((dt) => {
    return { label: dt.supplierName, value: +dt.id };
  });
};
