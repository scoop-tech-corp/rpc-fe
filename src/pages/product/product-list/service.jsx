import { setFormDataImage } from 'service/service-global';
import axios from 'utils/axios';

export const getCustomerGroupList = async () => {
  const getResp = await axios.get('customer/group');

  return getResp.data.map((dt) => {
    return { label: dt.customerGroup, value: +dt.id };
  });
};

export const getBrandList = async () => {
  const getResp = await axios.get('product/brand');

  return getResp.data.map((dt) => {
    return { label: dt.brandName, value: +dt.id };
  });
};

export const getSupplierList = async () => {
  const getResp = await axios.get('product/supplier');

  return getResp.data.map((dt) => {
    return { label: dt.supplierName, value: +dt.id };
  });
};

export const getProductCategoryList = async () => {
  const getResp = await axios.get('product/category');

  return getResp.data.map((dt) => {
    return { label: dt.categoryName, value: +dt.id };
  });
};

export const createBrand = async (brandName) => {
  const parameter = new FormData();
  parameter.append('brandName', brandName);

  return await axios.post('product/brand', parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const createSupplier = async (supplierName) => {
  const parameter = new FormData();
  parameter.append('supplierName', supplierName);

  return await axios.post('product/supplier', parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};

const generateParamSaved = (property) => {
  const fd = new FormData();
  fd.append('fullName', property.fullName);
  fd.append('simpleName', property.simpleName);
  fd.append('productBrandId', +property.productBrandId);
  fd.append('productSupplierId', +property.productSupplierId);
  fd.append('sku', property.sku);
  fd.append('expiredDate', property.expiredDate);
  fd.append('status', property.status);
  fd.append('pricingStatus', property.pricingStatus);
  fd.append('costPrice', property.costPrice);
  fd.append('marketPrice', property.marketPrice);
  fd.append('price', property.price);
  fd.append('isShipped', property.isShipped);
  fd.append('weight', property.weight);
  fd.append('length', property.length);
  fd.append('width', property.width);
  fd.append('height', property.height);

  fd.append('introduction', property.introduction);
  fd.append('description', property.description);
  fd.append('locations', JSON.stringify(property.locations));
  fd.append('customerGroups', JSON.stringify(property.customerGroups));
  fd.append('priceLocations', JSON.stringify(property.priceLocations));
  fd.append('quantities', JSON.stringify(property.quantities));
  fd.append('categories', JSON.stringify(property.categories));
  fd.append('reminders', JSON.stringify(property.reminders));

  setFormDataImage(property.photos, fd, 'save');

  return fd;
};

// ============= PRODUCT SELL ============= //

const productSellUrl = 'product/sell';
export const createProductSell = async (property) => {
  const parameter = generateParamSaved(property);
  const response = await axios.post(productSellUrl, parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response;
};

export const deleteProductSell = async (id) => {
  return await axios.delete(productSellUrl, {
    data: { id }
  });
};

export const getProductSell = async (property) => {
  const getResp = await axios.get(productSellUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword
    }
  });

  return getResp;
};

// ============= END PRODUCT SELL ============= //

// ============= PRODUCT CLINIC ============= //

const productClinicUrl = 'product/clinic';
export const createProductClinic = async (property) => {
  const parameter = generateParamSaved(property);
  const response = await axios.post(productClinicUrl, parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response;
};

export const deleteProductClinic = async (id) => {
  return await axios.delete(productClinicUrl, {
    data: { id }
  });
};

export const getProductClinic = async (property) => {
  const getResp = await axios.get(productClinicUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword
    }
  });

  return getResp;
};

// ============= END PRODUCT CLINIC ============= //

// ============= PRODUCT INVENTORY ============= //

export const getProductInventory = async (property) => {
  const getResp = await axios.get(productClinicUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword
    }
  });

  return getResp;
};

export const deleteProductInventory = async (id) => {
  return await axios.delete(productClinicUrl, {
    data: { id }
  });
};

// ============= END PRODUCT CLINIC ============= //
