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
const urlProductsReminders = 'report/products/reminders';

const urlDepositList = 'report/deposit/list';
const urlDepositSummary = 'report/deposit/summary';

const urlExpensesList = 'report/expenses/list';
const urlExpensesSummary = 'report/expenses/summary';

const urlSalesSummary = 'report/sales/summary';
const urlSalesItems = 'report/sales/items';
const urlSalesByService = 'report/sales/salesbyservice';
const urlSalesByProduct = 'report/sales/salesbyproduct';
const urlSalesPaymentList = 'report/sales/paymentlist';
const urlSalesUnpaid = 'report/sales/unpaid';
const urlSalesNetIncome = 'report/sales/netincome';
const urlSalesDailyAudit = 'report/sales/dailyaudit';
const urlSalesByItemType = 'report/sales/salesbyitemtype';
const urlSalesPackageSummary = 'report/sales/packagesummary';
const urlSalesCustomerSpend = 'report/sales/customerspend';
const urlSalesDailyReconciliation = 'report/sales/dailyreconciliation';
const urlSalesRefunds = 'report/sales/refunds';
const urlSalesDiscountSummary = 'report/sales/discountsummary';
const urlSalesPaymentsSummary = 'report/sales/paymentsummary';
const urlSalesDetails = 'report/sales/details';
const urlSalesStaffServiceSales = 'report/sales/staffservicesales';

const urlBookingByDiagnosisSpeciesGender = 'report/booking/diagnosespeciesgender';

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
      status: payload.status,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage
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
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
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
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
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
      search: payload.search,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage
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
  const jobTitle = payload.jobTitle.map((dt) => dt.value);
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
      staffId: staff,
      staffJob: jobTitle
    }
  });
};

export const exportReportStaffLate = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const jobTitle = payload.jobTitle.map((dt) => dt.value);

  return await axios.get(`${urlStaffLate}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      staffId: staff.length ? staff : [''],
      staffJob: jobTitle.length ? jobTitle : ['']
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
      locationId: location,
      brandId: brand,
      supplierId: supplier,
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
      locationId: location,
      brandId: brand,
      supplierId: supplier,
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
      locationId: location,
      brandId: brand,
      supplierId: supplier,
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
      locationId: location,
      brandId: brand,
      supplierId: supplier,
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
      locationId: location,
      productId: product,
      search: payload.search
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
      dateFrom,
      dateTo,
      locationId: location,
      productId: product,
      search: payload.search
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
      locationId: location,
      brandId: brand,
      supplierId: supplier,
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
      locationId: location,
      brandId: brand,
      supplierId: supplier,
      search: payload.search
    }
  });
};

export const getReportProductsReminders = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const customer = payload.customer.map((dt) => dt.value);

  return await axios.get(urlProductsReminders, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location,
      search: payload.search,
      customerId: customer
    }
  });
};

export const exportReportProductsReminders = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const customer = payload.customer.map((dt) => dt.value);

  return await axios.get(`${urlProductsReminders}/export`, {
    responseType: 'blob',
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      search: payload.search,
      customerId: customer.length ? customer : ['']
    }
  });
};

const urlProductsBatches = 'report/products/batches';

export const getReportProductsBatches = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlProductsBatches, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location,
      search: payload.search,
      expiryStatus: payload.expiryStatus
    }
  });
};

export const exportReportProductsBatches = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlProductsBatches}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      search: payload.search,
      expiryStatus: payload.expiryStatus
    }
  });
};

const urlProductsExpiry = 'report/products/expiry';

export const getReportProductsExpiry = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlProductsExpiry, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location,
      search: payload.search,
      status: payload.status
    }
  });
};

export const exportReportProductsExpiry = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlProductsExpiry}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      search: payload.search,
      status: payload.status
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
      locationId: location,
      methodId: method,
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
      locationId: location,
      methodId: method
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

export const getExpensesOptionPayment = async () => {
  const resp = await axios.get('report/expenses/options/payment');
  return resp.data;
};

export const getExpensesOptionStatus = async () => {
  const resp = await axios.get('report/expenses/options/status');
  return resp.data;
};

export const getExpensesOptionSubmiter = async () => {
  const resp = await axios.get('report/expenses/options/submiter');
  return resp.data;
};

export const getExpensesOptionRecipient = async () => {
  const resp = await axios.get('report/expenses/options/recipient');
  return resp.data;
};

export const getExpensesOptionCategory = async () => {
  const resp = await axios.get('report/expenses/options/category');
  return resp.data;
};

export const getExpensesOptionSupplier = async () => {
  const resp = await axios.get('report/expenses/options/supplier');
  return resp.data;
};

export const getReportExpensesList = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const status = payload.status.map((dt) => dt.value);
  const submiter = payload.submiter.map((dt) => dt.value);
  const supplier = payload.supplier.map((dt) => dt.value);
  const recipient = payload.recipient.map((dt) => dt.value);
  const category = payload.category.map((dt) => dt.value);

  return await axios.get(urlExpensesList, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location,
      paymentId: payment,
      statusId: status,
      submiterId: submiter,
      supplierId: supplier,
      recipientId: recipient,
      categoryId: category,
      search: payload.search
    }
  });
};

export const exportReportExpensesList = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const status = payload.status.map((dt) => dt.value);
  const submiter = payload.submiter.map((dt) => dt.value);
  const supplier = payload.supplier.map((dt) => dt.value);
  const recipient = payload.recipient.map((dt) => dt.value);
  const category = payload.category.map((dt) => dt.value);

  return await axios.get(`${urlExpensesList}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      paymentId: payment.length ? payment : [''],
      statusId: status.length ? status : [''],
      submiterId: submiter.length ? submiter : [''],
      supplierId: supplier.length ? supplier : [''],
      recipientId: recipient.length ? recipient : [''],
      categoryId: category.length ? category : [''],
      search: payload.search
    }
  });
};

export const getReportExpensesSummary = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const status = payload.status.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const supplier = payload.supplier.map((dt) => dt.value);
  const recipient = payload.recipient.map((dt) => dt.value);
  const category = payload.category.map((dt) => dt.value);

  return await axios.get(urlExpensesSummary, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location,
      paymentId: payment,
      statusId: status,
      staffId: staff,
      supplierId: supplier,
      recipientId: recipient,
      categoryId: category
    }
  });
};

export const exportReportExpensesSummary = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const status = payload.status.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const supplier = payload.supplier.map((dt) => dt.value);
  const recipient = payload.recipient.map((dt) => dt.value);
  const category = payload.category.map((dt) => dt.value);

  return await axios.get(`${urlExpensesSummary}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      paymentId: payment.length ? payment : [''],
      statusId: status.length ? status : [''],
      staffId: staff.length ? staff : [''],
      supplierId: supplier.length ? supplier : [''],
      recipientId: recipient.length ? recipient : [''],
      categoryId: category.length ? category : ['']
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
      locationId: location,
      statusId: status,
      paymentId: payment,
      staffId: staff
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
      locationId: location,
      statusId: status,
      paymentId: payment,
      staffId: staff,
      itemTypeId: itemType,
      productCategoryId: productCategory,
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

export const getReportSalesByService = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const category = payload.category.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlSalesByService, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location,
      paymentId: payment,
      categoryId: category
    }
  });
};

export const exportReportSalesByService = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const category = payload.category.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlSalesByService}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      paymentId: payment.length ? payment : [''],
      categoryId: category.length ? category : ['']
    }
  });
};

export const getReportSalesByProduct = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const category = payload.category.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlSalesByProduct, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location,
      paymentId: payment,
      categoryId: category,
      search: payload.search
    }
  });
};

export const exportReportSalesByProduct = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const category = payload.category.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlSalesByProduct}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      paymentId: payment.length ? payment : [''],
      categoryId: category.length ? category : [''],
      search: payload.search
    }
  });
};

export const getReportSalesPaymentList = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const status = payload.status.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const method = payload.method.map((dt) => dt.value);
  const category = payload.category.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlSalesPaymentList, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location,
      statusId: status,
      paymentId: payment,
      staffId: staff,
      methodId: method,
      categoryId: category,
      search: payload.search
    }
  });
};

export const exportReportSalesPaymentList = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const status = payload.status.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const method = payload.method.map((dt) => dt.value);
  const category = payload.category.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlSalesPaymentList}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      statusId: status.length ? status : [''],
      paymentId: payment.length ? payment : [''],
      staffId: staff.length ? staff : [''],
      methodId: method.length ? method : [''],
      categoryId: category.length ? category : [''],
      search: payload.search
    }
  });
};

export const getReportSalesUnpaid = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const status = payload.status.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const customer = payload.customer.map((dt) => dt.value);
  const invoiceCategory = payload.invoiceCategory.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlSalesUnpaid, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location,
      statusId: status,
      paymentId: payment,
      customerId: customer,
      invoiceCategoryId: invoiceCategory,
      search: payload.search
    }
  });
};

export const exportReportSalesUnpaid = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const status = payload.status.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const customer = payload.customer.map((dt) => dt.value);
  const invoiceCategory = payload.invoiceCategory.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlSalesUnpaid}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      statusId: status.length ? status : [''],
      paymentId: payment.length ? payment : [''],
      customerId: customer.length ? customer : [''],
      invoiceCategoryId: invoiceCategory.length ? invoiceCategory : [''],
      search: payload.search
    }
  });
};

export const getReportSalesDailyAudit = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const invoiceCategory = payload.invoiceCategory.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlSalesDailyAudit, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location,
      paymentId: payment,
      staffId: staff,
      invoiceCategoryId: invoiceCategory
    }
  });
};

export const exportReportSalesDailyAudit = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const invoiceCategory = payload.invoiceCategory.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlSalesDailyAudit}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      paymentId: payment.length ? payment : [''],
      staffId: staff.length ? staff : [''],
      invoiceCategoryId: invoiceCategory.length ? invoiceCategory : ['']
    }
  });
};

export const getReportSalesDetails = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const status = payload.status.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const invoiceCategory = payload.invoiceCategory.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlSalesDetails, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location,
      statusId: status,
      paymentId: payment,
      staffId: staff,
      invoiceCategoryId: invoiceCategory,
      search: payload.search
    }
  });
};

export const exportReportSalesDetails = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const status = payload.status.map((dt) => dt.value);
  const payment = payload.payment.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const invoiceCategory = payload.invoiceCategory.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlSalesDetails}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      statusId: status.length ? status : [''],
      paymentId: payment.length ? payment : [''],
      staffId: staff.length ? staff : [''],
      invoiceCategoryId: invoiceCategory.length ? invoiceCategory : [''],
      search: payload.search
    }
  });
};

export const getReportSalesStaffServiceSales = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const service = payload.service.map((dt) => dt.value);
  const category = payload.category.map((dt) => dt.value);

  return await axios.get(urlSalesStaffServiceSales, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location,
      staffId: staff,
      serviceId: service,
      categoryId: category
    }
  });
};

export const exportReportSalesStaffServiceSales = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const staff = payload.staff.map((dt) => dt.value);
  const service = payload.service.map((dt) => dt.value);
  const category = payload.category.map((dt) => dt.value);

  return await axios.get(`${urlSalesStaffServiceSales}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      staffId: staff.length ? staff : [''],
      serviceId: service.length ? service : [''],
      categoryId: category.length ? category : ['']
    }
  });
};

export const getReportSalesPackageSummary = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlSalesPackageSummary, {
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      status: payload.packageStatus || ''
    }
  });
};

export const exportReportSalesPackageSummary = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlSalesPackageSummary}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      status: payload.packageStatus || ''
    }
  });
};

export const getReportSalesByItemType = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlSalesByItemType, {
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : ['']
    }
  });
};

export const exportReportSalesByItemType = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlSalesByItemType}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : ['']
    }
  });
};

export const getReportSalesNetIncome = async () => {
  return await axios.get(urlSalesNetIncome);
};

export const exportReportSalesNetIncome = async () => {
  return await axios.get(`${urlSalesNetIncome}/export`, {
    responseType: 'blob'
  });
};

export const getReportSalesDiscountSummary = async () => {
  const res = await axios.get(urlSalesDiscountSummary);
  return res;
};

export const getReportSalesPaymentSummary = async () => {
  return await axios.get(urlSalesPaymentsSummary);
};

export const getReportBookingDiagnoseOptions = async () => {
  const resp = await axios.get('report/booking/diagnoseoptions');
  return resp.data; // [{value, label}]
};

export const getReportBookingByDiagnosisSpeciesGender = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const gender = payload.gender.map((dt) => dt.value);
  const diagnose = payload.diagnose.map((dt) => dt.value);
  const species = payload.species.map((dt) => dt.value);

  return await axios.get(urlBookingByDiagnosisSpeciesGender, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      dateFrom,
      dateTo,
      locationId: location,
      genderId: gender,
      diagnoseId: diagnose,
      speciesId: species
    }
  });
};

export const exportReportBookingByDiagnosisSpeciesGender = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = payload.location.map((dt) => dt.value);
  const gender = payload.gender.map((dt) => dt.value);
  const diagnose = payload.diagnose.map((dt) => dt.value);
  const species = payload.species.map((dt) => dt.value);

  return await axios.get(`${urlBookingByDiagnosisSpeciesGender}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      genderId: gender.length ? gender : [''],
      diagnoseId: diagnose.length ? diagnose : [''],
      speciesId: species.length ? species : ['']
    }
  });
};

// ─── Booking Diagnosis List ───────────────────────────────────────────────────
const urlBookingDiagnosisList = 'report/booking/diagnose';

export const getReportBookingDiagnosisList = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = (payload.location || []).map((dt) => dt.value);

  return await axios.get(urlBookingDiagnosisList, {
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      search: payload.search || '',
      status: payload.status || '',
      orderValue: payload.orderValue || 'desc',
      orderColumn: payload.orderColumn || 't.startDate',
      goToPage: payload.goToPage || 1,
      rowPerPage: payload.rowPerPage || 10
    }
  });
};

// ─── Booking List ─────────────────────────────────────────────────────────────
const urlBookingList = 'report/booking/list';

export const getReportBookingList = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = (payload.location || []).map((dt) => dt.value);

  return await axios.get(urlBookingList, {
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      orderValue: payload.orderValue || 'desc',
      orderColumn: payload.orderColumn || 'e.bookingTime',
      goToPage: payload.goToPage || 1,
      rowPerPage: payload.rowPerPage || 10
    }
  });
};

// ─── Booking By Cancellation Reason ──────────────────────────────────────────
const urlBookingByCancelReason = 'report/booking/cancellationreason';

export const getReportBookingByCancellationReason = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = (payload.location || []).map((dt) => dt.value);

  return await axios.get(urlBookingByCancelReason, {
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : ['']
    }
  });
};

// ─── Booking By Status ────────────────────────────────────────────────────────
const urlBookingByStatus = 'report/booking/status';

export const getReportBookingByStatus = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = (payload.location || []).map((dt) => dt.value);

  return await axios.get(urlBookingByStatus, {
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : ['']
    }
  });
};

// ─── Booking By Location ──────────────────────────────────────────────────────
const urlBookingByLocation = 'report/booking/location';

export const getReportBookingByLocation = async (payload) => {
  return await axios.get(urlBookingByLocation, {
    params: {
      year: payload.year
    }
  });
};

// ─── Customer Spend ───────────────────────────────────────────────────────────
export const getReportSalesCustomerSpend = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = (payload.location || []).map((dt) => dt.value);
  const customerGroup = (payload.customerGroup || []).map((dt) => dt.value);

  return await axios.get(urlSalesCustomerSpend, {
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      customerGroup: customerGroup.length ? customerGroup : [''],
      minSpend: payload.minSpend || 0,
      goToPage: payload.goToPage || 1,
      rowPerPage: payload.rowPerPage || 10,
      orderColumn: payload.orderColumn || 'totalSpend',
      orderValue: payload.orderValue || 'desc'
    }
  });
};

export const exportReportSalesCustomerSpend = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = (payload.location || []).map((dt) => dt.value);
  const customerGroup = (payload.customerGroup || []).map((dt) => dt.value);

  return await axios.get(`${urlSalesCustomerSpend}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      customerGroup: customerGroup.length ? customerGroup : [''],
      minSpend: payload.minSpend || 0
    }
  });
};

// ─── Daily Reconciliation ─────────────────────────────────────────────────────
export const getReportSalesDailyReconciliation = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = (payload.location || []).map((dt) => dt.value);

  return await axios.get(urlSalesDailyReconciliation, {
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : ['']
    }
  });
};

export const exportReportSalesDailyReconciliation = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = (payload.location || []).map((dt) => dt.value);

  return await axios.get(`${urlSalesDailyReconciliation}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : ['']
    }
  });
};

// ─── Refunds ──────────────────────────────────────────────────────────────────
export const getReportSalesRefunds = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = (payload.location || []).map((dt) => dt.value);

  return await axios.get(urlSalesRefunds, {
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      serviceType: payload.serviceType || '',
      status: payload.refundStatus !== undefined && payload.refundStatus !== '' ? payload.refundStatus : '',
      goToPage: payload.goToPage || 1,
      rowPerPage: payload.rowPerPage || 10,
      orderColumn: payload.orderColumn || 'fr.created_at',
      orderValue: payload.orderValue || 'desc'
    }
  });
};

export const exportReportSalesRefunds = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';
  const location = (payload.location || []).map((dt) => dt.value);

  return await axios.get(`${urlSalesRefunds}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: location.length ? location : [''],
      serviceType: payload.serviceType || '',
      status: payload.refundStatus !== undefined && payload.refundStatus !== '' ? payload.refundStatus : ''
    }
  });
};
