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

export const getProductSellDropdown = async (productLocationId, productBrandId = '') => {
  const getResp = await axios.get('product/sell/dropdown', {
    params: {
      locationId: productLocationId,
      brandId: productBrandId
    }
  });

  return getResp.data.map((dt) => {
    return { label: dt.fullName, value: +dt.id };
  });
};

export const getProductClinicDropdown = async (productLocationId, productBrandId = '') => {
  const getResp = await axios.get('product/clinic/dropdown', {
    params: {
      locationId: productLocationId,
      brandId: productBrandId
    }
  });

  return getResp.data.map((dt) => {
    return { label: dt.fullName, value: +dt.id, data: { ...dt } };
  });
};

export const getProductUsage = async () => {
  const getResp = await axios.get('product/usage');
  return getResp.data.map((dt) => {
    return { label: dt.usage, value: +dt.id };
  });
};

export const createPrductUsage = async (usageName) => {
  const parameter = new FormData();
  parameter.append('usage', usageName);

  return await axios.post('product/usage', parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
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

const generateParamSaved = (property, procedure = '') => {
  const productBrandId = property.productBrand ? +property.productBrand.value : '';
  const productSupplierId = property.productSupplier ? +property.productSupplier.value : '';
  const expiredDate = property.expiredDate ? new Date(property.expiredDate).toLocaleDateString('en-CA') : '';

  const fd = new FormData();
  fd.append('fullName', property.fullName);
  fd.append('simpleName', property.simpleName);
  fd.append('productBrandId', productBrandId);
  fd.append('productSupplierId', productSupplierId);
  fd.append('sku', property.sku);
  fd.append('expiredDate', expiredDate);
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

  fd.append('isCustomerPurchase', property.isCustomerPurchase);
  fd.append('isCustomerPurchaseOnline', property.isCustomerPurchaseOnline);
  fd.append('isCustomerPurchaseOutStock', property.isCustomerPurchaseOutStock);
  fd.append('isStockLevelCheck', property.isStockLevelCheck);
  fd.append('isNonChargeable', property.isNonChargeable);
  fd.append('isOfficeApproval', property.isOfficeApproval);
  fd.append('isAdminApproval', property.isAdminApproval);

  if (procedure === 'clinic') {
    fd.append('dosages', JSON.stringify(property.dosage));
  }

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
  return await axios.post(productSellUrl, parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteProductSell = async (id) => {
  return await axios.delete(productSellUrl, {
    data: { id }
  });
};

export const exportProductSell = async (property) => {
  return await axios.get(productSellUrl + '/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId.length ? property.locationId : [''],
      isExportAll: property.allData ? 1 : 0,
      isExportLimit: property.onlyItem ? 1 : 0
    }
  });
};

export const getProductSell = async (property) => {
  const getResp = await axios.get(productSellUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId
    }
  });

  return getResp;
};

export const getProductSellDetail = async (id) => {
  return await axios.get(productSellUrl + '/detail', {
    params: { id }
  });
};

// ============= END PRODUCT SELL ============= //

// ============= PRODUCT CLINIC ============= //

const productClinicUrl = 'product/clinic';
export const createProductClinic = async (property) => {
  const parameter = generateParamSaved(property);
  return await axios.post(productClinicUrl, parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteProductClinic = async (id) => {
  return await axios.delete(productClinicUrl, {
    data: { id }
  });
};

export const exportProductClinic = async (property) => {
  return await axios.get(productClinicUrl + '/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId.length ? property.locationId : [''],
      isExportAll: property.allData ? 1 : 0,
      isExportLimit: property.onlyItem ? 1 : 0
    }
  });
};

export const getProductClinic = async (property) => {
  const getResp = await axios.get(productClinicUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId
    }
  });

  return getResp;
};

export const getProductClinicDetail = async (id) => {
  return await axios.get(productClinicUrl + '/detail', {
    params: { id }
  });
};

// ============= END PRODUCT CLINIC ============= //

// ============= PRODUCT INVENTORY ============= //
const productInventoryUrl = 'product/inventory';
export const getProductInventory = async (property) => {
  const getResp = await axios.get(productInventoryUrl, {
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

export const getProductInventoryApproval = async (property) => {
  const getResp = await axios.get(productInventoryUrl + '/approval', {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId.length ? property.locationId : ['']
    }
  });

  return getResp;
};

export const getProductInventoryApprovalHistory = async (property) => {
  const getResp = await axios.get(productInventoryUrl + '/history', {
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

export const getProductInventoryApprovalHistoryExport = async (property) => {
  return await axios.get(productInventoryUrl + '/history/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      fromDate: property.fromDate,
      toDate: property.toDate,
      locationId: property.locationId.length ? property.locationId : ['']
    }
  });
};

export const getProductInventoryApprovalExport = async (property) => {
  return await axios.get(productInventoryUrl + '/approval/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId.length ? property.locationId : ['']
    }
  });
};

export const getProductInventoryDetail = async (id) => {
  return await axios.get(productInventoryUrl + '/detail', {
    params: { id }
  });
};

export const deleteProductInventory = async (id) => {
  return await axios.delete(productInventoryUrl, {
    data: { id }
  });
};

export const createProductInventory = async (property) => {
  const fd = new FormData();
  fd.append('requirementName', property.requirementName);
  fd.append('locationId', property.locationId);
  fd.append('listProducts', JSON.stringify(property.listProducts));

  property.images.forEach((file) => {
    fd.append('images[]', file.selectedFile);
  });

  return await axios.post(productInventoryUrl, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateProductInventoryApproval = async (property) => {
  const parameter = { id: property.id, status: property.status, reason: property.reason };

  return await axios.put(productInventoryUrl + '/approval', parameter);
};

// ============= END PRODUCT INVENTORY ============= //
