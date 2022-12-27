import axios from 'utils/axios';

const productBundleUrl = 'product/bundle';

export const getProductBundle = async (property) => {
  return await axios.get(productBundleUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword
    }
  });
};

export const getProductBundleDetail = async (id) => {
  return await axios.get(productBundleUrl + '/detail', {
    params: { id }
  });
};

export const deleteProductBundle = async (id) => {
  return await axios.delete(productBundleUrl, {
    data: { id }
  });
};

export const createProductBundle = async (property) => {
  const newProducts = property.products.map((p) => ({
    productId: p.productId,
    quantity: p.quantity,
    total: p.total
  }));

  const parameter = new FormData();
  parameter.append('name', property.name);
  parameter.append('remark', property.remark);
  parameter.append('status', +property.status);
  parameter.append('locationId', property.sellingLocation.value);
  parameter.append('categoryId', property.category.value);
  parameter.append('products', JSON.stringify(newProducts));

  return await axios.post(productBundleUrl, parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateProductBundle = async (property) => {
  const newProducts = property.products.filter((p) => p.status);

  const parameter = {
    id: property.id,
    name: property.name,
    remark: property.remark,
    status: property.status,
    locationId: property.sellingLocation.value,
    categoryId: property.category.value,
    products: newProducts
  };

  return await axios.put(productBundleUrl, parameter);
};

export const updateProductBundleStatus = async (property) => {
  const parameter = { id: property.id, status: property.status };
  return await axios.put(productBundleUrl + '/status', parameter);
};
