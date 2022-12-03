import axios from 'utils/axios';

export const getCustomerGroupList = async () => {
  const getResp = await axios.get('customer/group');

  return getResp.data.map((dt) => {
    return { label: dt.customerGroup, value: +dt.id };
  });
};

export const getLocationList = async () => {
  const getResp = await axios.get('location/list');

  return getResp.data.map((dt) => {
    return { label: dt.locationName, value: +dt.id };
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

// ============= PRODUCT SELL ============= //

const setFormDataImage = (sourcePhoto, fd, procedure) => {
  if (sourcePhoto.length) {
    const tempFileName = [];
    sourcePhoto.forEach((file) => {
      fd.append('images[]', file.selectedFile);

      const id = procedure === 'update' ? +file.id : '';
      tempFileName.push({ id, name: file.label, status: file.status });
    });
    fd.append('imagesName', JSON.stringify(tempFileName));
  } else {
    fd.append('images[]', []);
    fd.append('imagesName', JSON.stringify([]));
  }
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

export const createProductSell = async (property) => {
  const parameter = generateParamSaved(property);
  const response = await axios.post('product/sell', parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response;
};

// ============= END PRODUCT SELL ============= //
