import { setFormDataImage } from 'service/service-global';
import { formateDateYYYMMDD } from 'utils/func';
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

export const getProductCategoryList = async (customLabel = '') => {
  const getResp = await axios.get('product/category');
  const catchResp = (dt) => {
    if (!customLabel) {
      return { label: dt.categoryName, value: +dt.id };
    } else if (customLabel == 'categoryName-expiredDay') {
      return { label: `${dt.categoryName} - ${dt.expiredDay} hari`, value: +dt.id };
    }
  };
  return getResp.data.map(catchResp);
};

export const getLocationProductTransferDropdown = async (property) => {
  const getResp = await axios.get('location/product/transfer', {
    params: { locationId: property.locationId, productName: property.productName, productType: property.productType }
  });

  return getResp.data.map((dt) => {
    return { label: dt.locationName, value: +dt.id };
  });
};

export const getStaffProductTransferDropdown = async (locationId) => {
  const getResp = await axios.get('staff/product/transfer', {
    params: { locationId }
  });

  return getResp.data.map((dt) => {
    return { label: dt.name, value: +dt.id };
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

export const getProductSellSplitDropdown = async (locationId, productSellId) => {
  const getResp = await axios.get('product/sell/dropdown/split', {
    params: { locationId, productSellId }
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

export const getProductTransaction = async () => {
  const getResp = await axios.get('product/transaction');

  return getResp.data.data.map((dt) => {
    return { label: dt, value: dt };
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

export const uploadImageProduct = async (property, procedure) => {
  const fd = new FormData();
  const url = `product/${procedure.toLowerCase()}/image`;
  fd.append('id', property.id);
  setFormDataImage(property.photos, fd);

  return await axios.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getProductTransferNumber = async () => await axios.get('product/transfernumber');

export const createProductTransfer = async (property) => {
  const parameter = new FormData();
  parameter.append('transferNumber', property.transferNumber);
  parameter.append('transferName', property.transferName);
  parameter.append('locationId', property.locationId);
  parameter.append('totalItem', property.totalItem);

  parameter.append('userIdReceiver', property.userIdReceiver);
  parameter.append('productId', property.productId);
  parameter.append('productType', property.productType); //productSell or productClinic

  parameter.append('additionalCost', property.additionalCost);
  parameter.append('remark', property.remark);

  return await axios.post('product/transfer', parameter);
};

export const createProductAdjustment = async (property) => {
  const fd = new FormData();
  fd.append('productId', property.productId);
  fd.append('productType', property.productType); //productSell or productClinic
  fd.append('adjustment', property.adjustment);
  fd.append('totalAdjustment', property.totalAdjustment);
  fd.append('remark', property.remark);

  return await axios.post('product/adjust', fd);
};

export const createProductRestock = async (property) => {
  const requireDate = property.requireDate ? formateDateYYYMMDD(new Date(property.requireDate)) : '';

  const fd = new FormData();
  fd.append('productId', property.productId);
  fd.append('productType', property.productType); //productSell or productClinic
  fd.append('supplierId', property.supplierId);
  fd.append('requireDate', requireDate);
  fd.append('reStockQuantity', property.reStockQuantity);

  fd.append('costPerItem', property.costPerItem);
  fd.append('total', property.total);
  fd.append('remark', property.remark);
  setFormDataImage(property.photos, fd, 'save');

  return await axios.post('product/restock', fd);
};

export const getProductLogTransaction = async (property) => {
  const dateFrom = property.dateRange ? formateDateYYYMMDD(property.dateRange[0]) : '';
  const dateTo = property.dateRange ? formateDateYYYMMDD(property.dateRange[1]) : '';

  return await axios.get('product/log', {
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      goToPage: property.goToPage,
      rowPerPage: property.rowPerPage,
      productId: property.productId,
      locationId: property.locationId,
      dateFrom: dateFrom,
      dateTo: dateTo,
      staffId: property.staffId,
      transaction: property.transaction,
      productType: property.productType
    }
  });
};

const generateParamSaved = (property, procedure = '') => {
  const productBrandId = property.productBrand ? +property.productBrand.value : '';
  const productSupplierId = property.productSupplier ? +property.productSupplier.value : '';
  const expiredDate = property.expiredDate ? formateDateYYYMMDD(new Date(property.expiredDate)) : '';
  const categories = property.categories.map((dt) => {
    if ('label' in dt) {
      return { id: dt.value, categoryName: dt.label };
    } else {
      return dt;
    }
  });

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
  fd.append('categories', JSON.stringify(categories));
  fd.append('reminders', JSON.stringify(property.reminders));

  setFormDataImage(property.photos, fd, 'save');

  return fd;
};

const generateParamUpdate = (property, procedure = '') => {
  const productBrandId = property.productBrand ? +property.productBrand.value : '';
  const productSupplierId = property.productSupplier ? +property.productSupplier.value : '';
  const expiredDate = property.expiredDate ? formateDateYYYMMDD(new Date(property.expiredDate)) : '';
  const categories = property.categories.map((dt) => {
    if ('label' in dt) {
      return { id: dt.value, categoryName: dt.label };
    } else {
      return dt;
    }
  });

  let finalParam = {
    id: property.id,
    fullName: property.fullName,
    simpleName: property.simpleName,
    productBrandId: productBrandId,
    productSupplierId: productSupplierId,
    sku: property.sku,
    expiredDate: expiredDate,
    status: property.status,
    pricingStatus: property.pricingStatus,
    costPrice: property.costPrice,
    marketPrice: property.marketPrice,
    price: property.price,
    isShipped: property.isShipped,
    weight: property.weight,
    length: property.length,
    width: property.width,
    height: property.height,
    isCustomerPurchase: property.isCustomerPurchase,
    isCustomerPurchaseOnline: property.isCustomerPurchaseOnline,
    isCustomerPurchaseOutStock: property.isCustomerPurchaseOutStock,
    isStockLevelCheck: property.isStockLevelCheck,
    isNonChargeable: property.isNonChargeable,
    isOfficeApproval: property.isOfficeApproval,
    isAdminApproval: property.isAdminApproval,
    introduction: property.introduction,
    description: property.description,
    locations: property.locations,
    customerGroups: property.customerGroups,
    priceLocations: property.priceLocations,
    quantities: property.quantities,
    categories: categories,
    reminders: property.reminders
  };

  if (procedure === 'clinic') {
    finalParam = { ...finalParam, dosages: property.dosage };
  }

  return finalParam;
};

// ============= PRODUCT SELL ============= //

const productSellUrl = 'product/sell';
export const createProductSell = async (property) => {
  const parameter = generateParamSaved(property);
  return await axios.post(productSellUrl, parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateProductSell = async (property) => {
  return await axios.put(productSellUrl, generateParamUpdate(property));
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

export const downloadTemplateProductSell = async () => {
  return await axios.get(productSellUrl + '/template', { responseType: 'blob' });
};

export const importProductSell = async (file) => {
  const fd = new FormData();
  fd.append('file', file);

  return await axios.post(productSellUrl + '/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getProductSell = async (property) => {
  const getResp = await axios.get(productSellUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      stock: property.stock,
      category: property.category
    }
  });

  return getResp;
};

export const getProductSellDetail = async (id) => {
  return await axios.get(productSellUrl + '/detail', {
    params: { id }
  });
};

export const splitProductSell = async (property) => {
  const fd = new FormData();
  fd.append('id', property.id);
  fd.append('fullName', property.fullName);
  fd.append('qtyReduction', property.qtyReduction);
  fd.append('qtyIncrease', property.qtyIncrease);
  fd.append('productSellId', property.productSellId);

  return await axios.post(productSellUrl + '/split', fd);
};

// ============= END PRODUCT SELL ============= //

// ============= PRODUCT CLINIC ============= //

const productClinicUrl = 'product/clinic';
export const createProductClinic = async (property) => {
  const parameter = generateParamSaved(property, 'clinic');
  return await axios.post(productClinicUrl, parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateProductClinic = async (property) => {
  return await axios.put(productClinicUrl, generateParamUpdate(property, 'clinic'));
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

export const downloadTemplateProductClinic = async () => {
  return await axios.get(productClinicUrl + '/template', { responseType: 'blob' });
};

export const importProductClinic = async (file) => {
  const fd = new FormData();
  fd.append('file', file);

  return await axios.post(productClinicUrl + '/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getProductClinic = async (property) => {
  const getResp = await axios.get(productClinicUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      stock: property.stock,
      category: property.category
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
      search: property.keyword,
      locationId: property.locationId
    }
  });

  return getResp;
};

export const exportProductInventory = async (property) => {
  return await axios.get(productInventoryUrl + '/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId.length ? property.locationId : ['']
    }
  });
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

export const downloadTemplateProductInventory = async () => {
  return await axios.get(productInventoryUrl + '/template', { responseType: 'blob' });
};

export const importProductInventory = async (file) => {
  const fd = new FormData();
  fd.append('file', file);

  return await axios.post(productInventoryUrl + '/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// ============= END PRODUCT INVENTORY ============= //
