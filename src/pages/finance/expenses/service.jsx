import axios from 'utils/axios';

export const TabList = {
  pending: 0,
  approved: 1,
  rejected: 2
};

const url = 'finance/expense';

export const getFinanceExpensesIndex = async (payload) => {
  return await axios.get(url, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      search: payload.search,
      statusApproval: payload.status,
      locationId: payload.locationId,
      dateFrom: payload.dateFrom,
      dateTo: payload.dateTo
    }
  });
};

export const exportFinanceExpenses = async (payload) => {
  return await axios.get(url + '/export', {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      search: payload.search,
      statusApproval: payload.status,
      locationId: payload.locationId,
      dateFrom: payload.dateFrom,
      dateTo: payload.dateTo
    },
    responseType: 'blob'
  });
};

export const deleteFinanceExpense = async (id) => {
  return await axios.delete(url, {
    data: { id }
  });
};

export const getFinanceExpenseDetail = async (id) => {
  return await axios.get(`${url}/detail`, {
    params: {
      id
    }
  });
};

export const approvalFinanceExpense = async (payload) => {
  return await axios.post(`${url}/approval`, {
    id: payload.id,
    statusApproval: payload.statusApproval
  });
};

export const createFinanceExpense = async (payload) => {
  console.log('payload', payload);
  const formData = new FormData();
  formData.append('transactionDate', payload.transactionDate);
  formData.append('referenceNo', payload.referenceNo);
  formData.append('vendorId', payload.vendorId);
  formData.append('locationId', payload.locationId);
  formData.append('subTotal', payload.subTotal);
  formData.append('tax', payload.tax);
  formData.append('pph', payload.pph);
  formData.append('grandTotal', payload.grandTotal);
  formData.append('categoryId', payload.categoryId);
  formData.append('expenseTypeId', payload.expenseTypeId);
  formData.append('departmentId', payload.departmentId);
  formData.append('paymentStatusId', payload.paymentStatusId);
  formData.append('dueDate', payload.dueDate);
  formData.append('paymentMethodId', payload.paymentMethodId);
  formData.append('description', payload.description);
  if (payload.image) formData.append('image', payload.image);

  return await axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// Dropdown list APIs
const mapDropdownData = (data, labelKey) => (Array.isArray(data) ? data : []).map((dt) => ({ label: dt[labelKey], value: +dt.id }));

export const getFinanceVendorList = async () => {
  const resp = await axios.get('finance/vendor');
  return mapDropdownData(resp.data?.data || resp.data || [], 'vendorName');
};

export const getFinanceCategoryList = async () => {
  const resp = await axios.get('finance/category');
  return mapDropdownData(resp.data?.data || resp.data || [], 'categoryName');
};

export const getFinanceExpenseTypeList = async () => {
  const resp = await axios.get('finance/expense-type');
  return mapDropdownData(resp.data?.data || resp.data || [], 'expenseType');
};

export const getFinanceDepartmentList = async () => {
  const resp = await axios.get('finance/department');
  return mapDropdownData(resp.data?.data || resp.data || [], 'departmentName');
};

export const getFinancePaymentStatusList = async () => {
  const resp = await axios.get('finance/payment-status');
  return mapDropdownData(resp.data?.data || resp.data || [], 'paymentStatus');
};

export const getFinancePaymentMethodList = async () => {
  const resp = await axios.get('finance/payment-method');
  return mapDropdownData(resp.data?.data || resp.data || [], 'paymentMethod');
};

// Quick create APIs
export const createFinanceVendor = async (payload) => await axios.post('finance/vendor', payload);
export const createFinanceCategory = async (payload) => await axios.post('finance/category', payload);
export const createFinanceExpenseType = async (payload) => await axios.post('finance/expense-type', payload);
export const createFinanceDepartment = async (payload) => await axios.post('finance/department', payload);
export const createFinancePaymentStatus = async (payload) => await axios.post('finance/payment-status', payload);
export const createFinancePaymentMethod = async (payload) => await axios.post('finance/payment-method', payload);
