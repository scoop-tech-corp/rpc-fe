import { formateDateYYYMMDD } from 'utils/func';
import axios from 'utils/axios';

const urlCustomerGrowth = 'report/customer/growth';
const urlCustomerGrowthByGroup = 'report/customer/growthgroup';
const urlCustomerTotal = 'report/customer/total';
const urlCustomerLeaving = 'report/customer/leaving';
const urlCustomerList = 'report/customer/list';
const urlCustomerReferralSpend = 'report/customer/refspend';
const urlCustomerSubAccount = 'report/customer/subaccount';

const urlStaffLogin = 'report/staff/login';
const urlStaffLate = 'report/staff/late';
const urlStaffLeave = 'report/staff/leave';
const urlStaffPerformance = 'report/staff/peformance';

const urlProductsStockCount = 'report/products/stockcount';
const urlProductsLowStock = 'report/products/lowstock';
const urlProductsCost = 'report/products/cost';
const urlProductsNoStock = 'report/products/nostock';

const urlDepositList = 'report/deposit/list';
const urlDepositSummary = 'report/deposit/summary';

const urlSalesSummary = 'report/sales/summary';
const urlSalesItems = 'report/sales/items';

export const exportReportCustomerGrowth = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);

  return await axios.get(`${urlCustomerGrowth}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      customerGroup: customerGroup.length ? customerGroup : ['']
    }
  });
};

export const getReportCustomerGrowth = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlCustomerGrowth, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      locationId: location,
      customerGroup
    }
  });
};

export const exportReportCustomerGrowthGroup = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);

  return await axios.get(`${urlCustomerGrowthByGroup}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      customerGroup: customerGroup.length ? customerGroup : ['']
    }
  });
};

export const getReportCustomerGrowthGroup = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlCustomerGrowthByGroup, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      locationId: location,
      customerGroup
    }
  });
};

export const exportReportCustomerTotal = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);

  return await axios.get(`${urlCustomerTotal}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      customerGroup: customerGroup.length ? customerGroup : ['']
    }
  });
};

export const getReportCustomerTotal = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlCustomerTotal, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      locationId: location,
      customerGroup
    }
  });
};

export const exportReportCustomerLeaving = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);

  return await axios.get(`${urlCustomerLeaving}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      customerGroup: customerGroup.length ? customerGroup : [''],
      status: payload.status
    }
  });
};

export const getReportCustomerLeaving = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlCustomerLeaving, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      locationId: location,
      customerGroup,
      status: payload.status
    }
  });
};

export const exportReportCustomerList = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);

  return await axios.get(`${urlCustomerList}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      customerGroup: customerGroup.length ? customerGroup : [''],
      status: payload.status,
      search: payload.search,
      gender: payload.gender,
      idType: payload.typeId.length ? payload.typeId : ['']
    }
  });
};

export const getReportCustomerList = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);
  const typeId = payload.typeId.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlCustomerList, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      locationId: location,
      customerGroup,
      status: payload.status,
      search: payload.search,
      gender: payload.gender,
      idType: typeId
    }
  });
};

export const exportReportCustomerReferralSpend = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);

  return await axios.get(`${urlCustomerReferralSpend}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      search: payload.search
    }
  });
};

export const getReportCustomerReferralSpend = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlCustomerReferralSpend, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      locationId: location,
      search: payload.search
    }
  });
};

export const exportReportCustomerSubAccount = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);

  return await axios.get(`${urlCustomerSubAccount}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      customerGroup: customerGroup.length ? customerGroup : [''],
      status: payload.status,
      sterile: payload.sterile,
      gender: payload.gender,
      search: payload.search
    }
  });
};

export const getReportCustomerSubAccount = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlCustomerSubAccount, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      locationId: location,
      customerGroup,
      sterile: payload.sterile,
      gender: payload.gender,
      search: payload.search
    }
  });
};

export const getReportStaffLogin = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlStaffLogin, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      locationId: location,
      staffId: staff
    }
  });
};

export const exportReportStaffLogin = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);

  return await axios.get(`${urlStaffLogin}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      staffId: staff.length ? staff : ['']
    }
  });
};

export const getReportStaffLate = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlStaffLate, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      locationId: location,
      staffId: staff
    }
  });
};

export const exportReportStaffLate = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);

  return await axios.get(`${urlStaffLate}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      staffId: staff.length ? staff : ['']
    }
  });
};

export const getReportStaffLeave = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const leaveType = payload.leaveType.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlStaffLeave, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      locationId: location,
      staffId: staff,
      leaveType: leaveType
    }
  });
};

export const exportReportStaffLeave = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const leaveType = payload.leaveType.map((dt) => dt.value);

  return await axios.get(`${urlStaffLeave}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      staffId: staff.length ? staff : [''],
      leaveType: leaveType.length ? leaveType : ['']
    }
  });
};

export const getReportStaffPerformance = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlStaffPerformance, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      locationId: location,
      staffId: staff
    }
  });
};

export const exportReportStaffPerformance = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);

  return await axios.get(`${urlStaffPerformance}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      staffId: staff.length ? staff : ['']
    }
  });
};

export const getReportProductsLowStock = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const brand = payload.brand.map((dt) => dt.value);
  const supplier = payload.supplier.map((dt) => dt.value);

  return await axios.get(urlProductsLowStock, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      locationId: location.length ? location : [''],
      brandId: brand.length ? brand : [''],
      supplierId: supplier.length ? supplier : [''],
      search: payload.search
    }
  });
};

export const exportReportProductsLowStock = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const brand = payload.brand.map((dt) => dt.value);
  const supplier = payload.supplier.map((dt) => dt.value);

  return await axios.get(`${urlProductsLowStock}/export`, {
    responseType: 'blob',
    params: {
      locationId: location.length ? location : [''],
      brandId: brand.length ? brand : [''],
      supplierId: supplier.length ? supplier : [''],
      search: payload.search
    }
  });
};

export const getReportProductsStockCount = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const brand = payload.brand.map((dt) => dt.value);
  const supplier = payload.supplier.map((dt) => dt.value);

  return await axios.get(urlProductsStockCount, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      locationId: location.length ? location : [''],
      brandId: brand.length ? brand : [''],
      supplierId: supplier.length ? supplier : [''],
      search: payload.search
    }
  });
};

export const exportReportProductsStockCount = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const brand = payload.brand.map((dt) => dt.value);
  const supplier = payload.supplier.map((dt) => dt.value);

  return await axios.get(`${urlProductsStockCount}/export`, {
    responseType: 'blob',
    params: {
      locationId: location.length ? location : [''],
      brandId: brand.length ? brand : [''],
      supplierId: supplier.length ? supplier : [''],
      search: payload.search
    }
  });
};

export const getReportProductsCost = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const product = payload.product.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlProductsCost, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      productId: product.length ? product : ['']
    }
  });
};

export const exportReportProductsCost = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const product = payload.product.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlProductsCost}/export`, {
    responseType: 'blob',
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      productId: product.length ? product : ['']
    }
  });
};

export const getReportProductsNoStock = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const brand = payload.brand.map((dt) => dt.value);
  const supplier = payload.supplier.map((dt) => dt.value);

  return await axios.get(urlProductsNoStock, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      locationId: location.length ? location : [''],
      brandId: brand.length ? brand : [''],
      supplierId: supplier.length ? supplier : [''],
      search: payload.search
    }
  });
};

export const exportReportProductsNoStock = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const brand = payload.brand.map((dt) => dt.value);
  const supplier = payload.supplier.map((dt) => dt.value);

  return await axios.get(`${urlProductsNoStock}/export`, {
    responseType: 'blob',
    params: {
      locationId: location.length ? location : [''],
      brandId: brand.length ? brand : [''],
      supplierId: supplier.length ? supplier : [''],
      search: payload.search
    }
  });
};

export const getReportDepositList = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const method = payload.method.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlDepositList, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      methodId: method.length ? method : [''],
      search: payload.search
    }
  });
};

export const exportReportDepositList = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const method = payload.method.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlDepositList}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      methodId: method.length ? method : [''],
      search: payload.search
    }
  });
};

export const getReportDepositSummary = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const method = payload.method.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlDepositSummary, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      methodId: method.length ? method : ['']
    }
  });
};

export const exportReportDepositSummary = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const method = payload.method.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlDepositSummary}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      methodId: method.length ? method : ['']
    }
  });
};

export const getReportSalesSummary = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const status = payload.status.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlSalesSummary, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      statusId: status.length ? status : [''],
      paymentId: payment.length ? payment : [''],
      staffId: staff.length ? staff : ['']
    }
  });
};

export const exportReportSalesSummary = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const status = payload.status.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlSalesSummary}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      statusId: status.length ? status : [''],
      paymentId: payment.length ? payment : [''],
      staffId: staff.length ? staff : ['']
    }
  });
};

export const getReportSalesItems = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const status = payload.status.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const itemType = payload.itemType.map((dt) => dt.value);
  const productCategory = payload.productCategory.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlSalesItems, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      statusId: status.length ? status : [''],
      paymentId: payment.length ? payment : [''],
      staffId: staff.length ? staff : [''],
      itemTypeId: itemType.length ? itemType : [''],
      productCategoryId: productCategory.length ? productCategory : [''],
      search: payload.search
    }
  });
};

export const exportReportSalesItems = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const status = payload.status.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const itemType = payload.itemType.map((dt) => dt.value);
  const productCategory = payload.productCategory.map((dt) => dt.value);

  return await axios.get(`${urlSalesItems}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      statusId: status.length ? status : [''],
      paymentId: payment.length ? payment : [''],
      staffId: staff.length ? staff : [''],
      itemTypeId: itemType.length ? itemType : [''],
      productCategoryId: productCategory.length ? productCategory : [''],
      search: payload.search
    }
  });
};
