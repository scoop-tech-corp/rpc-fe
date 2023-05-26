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
  console.log('property', property);
  // const newProductList = property.productList.map((dt) => {
  //   dt.images = JSON.stringify(dt.images);
  //   return dt;
  // });

  // console.log('newProductList', newProductList);
  const fd = new FormData();
  fd.append('status', property.status);
  fd.append('locationId', property.productLocation);
  // fd.append('productList', JSON.stringify(newProductList));

  // productId: productId.value,
  // productType: productType,
  // productName: productId.label,
  // supplier: supplierId.label,
  // supplierId: supplierId.value,
  // requireDate: newRequireDate,
  // currentStock: currentStock,
  // restockQuantity: restockQuantity,
  // costPerItem: costPerItem,
  // total: total,
  // remark: remark,
  // images: images,
  // totalImage: images.filter((dt) => dt.status !== 'del').length

  property.productList.forEach((dt, i) => {
    fd.append(`productList[${i}].productId`, dt.productId);
    fd.append(`productList[${i}].productType`, dt.productType);
    fd.append(`productList[${i}].productName`, dt.productName);
    fd.append(`productList[${i}].supplier`, dt.supplier);
    fd.append(`productList[${i}].supplierId`, dt.supplierId);
    fd.append(`productList[${i}].requireDate`, dt.requireDate);
    fd.append(`productList[${i}].currentStock`, dt.currentStock);
    fd.append(`productList[${i}].restockQuantity`, dt.restockQuantity);
    fd.append(`productList[${i}].costPerItem`, dt.costPerItem);
    fd.append(`productList[${i}].total`, dt.total);
    fd.append(`productList[${i}].remark`, dt.remark);
    fd.append(`productList[${i}].totalImage`, dt.totalImage);

    dt.images.forEach((img, imgIdx) => {
      fd.append(`productList[${i}].images[${imgIdx}].id`, img.id);
      fd.append(`productList[${i}].images[${imgIdx}].label`, img.label);
      fd.append(`productList[${i}].images[${imgIdx}].imagePath`, img.imagePath);
      fd.append(`productList[${i}].images[${imgIdx}].status`, img.status);
      fd.append(`productList[${i}].images[${imgIdx}].selectedFile`, img.selectedFile);
    });
  });

  setFormDataImage(property.images, fd, 'save');

  return await axios.post(productRestockUrl + '/multiple', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
