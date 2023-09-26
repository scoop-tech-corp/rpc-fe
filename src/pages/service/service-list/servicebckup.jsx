// import axios from 'utils/axios';
// import { setFormDataImage } from 'service/service-global';

// export const getCustomerGroupList = async () => {
//   const getResp = await axios.get('customer/group');

//   return getResp.data.map((dt) => {
//     return { label: dt.customerGroup, value: +dt.id };
//   });
// };

// // ============= PRODUCT SELL ============= //

// const serviceListUrl = 'service/list';

// export const getServiceList = async (params) => {
//   const getResp = await axios.get(serviceListUrl, {
//     params
//   });

//   return getResp;
// };

// export const createServiceList = async (property) => {
//   // const parameter = generateParamSaved(property);
//   const fd = new FormData();
//   Object.entries(property).forEach(([key, value]) => {
//     if (['listPrice', 'categories', 'facility', 'listStaff', 'productRequired', 'location', 'listPrice'].includes(key)) {
//       fd.append(key, JSON.stringify(value));
//     } else {
//       fd.append(key, value);
//     }
//   });
//   setFormDataImage(property.photos, fd, 'save');
//   fd.delete('photos');
//   return await axios.post(serviceListUrl, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
// };

// export const updateProductSell = async (property) => {
//   return await axios.put(serviceListUrl, generateParamUpdate(property));
// };

// export const deleteServiceList = async (id) => {
//   return await axios.delete(serviceListUrl, {
//     data: { id }
//   });
// };

// export const exportServiceList = async (property) => {
//   return await axios.get(serviceListUrl + '/export', {
//     responseType: 'blob',
//     params: {
//       orderValue: property.orderValue,
//       orderColumn: property.orderColumn,
//       search: property.keyword,
//       locationId: property.locationId.length ? property.locationId : [''],
//       isExportAll: property.allData ? 1 : 0,
//       isExportLimit: property.onlyItem ? 1 : 0
//     }
//   });
// };

// export const downloadTemplateProductSell = async () => {
//   return await axios.get(serviceListUrl + '/template', { responseType: 'blob' });
// };

// export const importProductSell = async (file) => {
//   const fd = new FormData();
//   fd.append('file', file);

//   return await axios.post(serviceListUrl + '/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
// };

// export const getProductSell = async (property) => {
//   const getResp = await axios.get(serviceListUrl, {
//     params: {
//       rowPerPage: property.rowPerPage,
//       goToPage: property.goToPage,
//       orderValue: property.orderValue,
//       orderColumn: property.orderColumn,
//       search: property.keyword,
//       locationId: property.locationId,
//       stock: property.stock,
//       category: property.category
//     }
//   });

//   return getResp;
// };

// export const getProductSellDetail = async (id) => {
//   return await axios.get(serviceListUrl + '/detail', {
//     params: { id }
//   });
// };

// export const splitProductSell = async (property) => {
//   const fd = new FormData();
//   fd.append('id', property.id);
//   fd.append('fullName', property.fullName);
//   fd.append('qtyReduction', property.qtyReduction);
//   fd.append('qtyIncrease', property.qtyIncrease);
//   fd.append('productSellId', property.productSellId);

//   return await axios.post(serviceListUrl + '/split', fd);
// };

// // ============= END PRODUCT SELL ============= //
