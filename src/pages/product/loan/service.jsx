import axios from 'utils/axios';

const loanProductUrl = 'product/loan-product';

export const generateLoanNumber = async (locationId) => {
  return await axios.get(`${loanProductUrl}/generate-loan-number`, { params: { locationId } });
};

export const getLoanProductList = async (property) => {
  return await axios.get(loanProductUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      staffId: property.staffId,
      status: property.status,
      startDate: property.startDate,
      endDate: property.endDate
    }
  });
};

export const getLoanProductDetail = async (id) => {
  return await axios.get(`${loanProductUrl}/detail`, { params: { id } });
};

export const createLoanProduct = async (payload) => {
  return await axios.post(loanProductUrl, payload);
};

export const updateLoanProduct = async (payload) => {
  return await axios.put(loanProductUrl, payload);
};

export const deleteLoanProduct = async (id) => {
  return await axios.delete(loanProductUrl, { data: { id } });
};

export const submitLoanProduct = async (id) => {
  return await axios.post(`${loanProductUrl}/submit`, { id });
};

export const approvalLoanProduct = async (payload) => {
  return await axios.post(`${loanProductUrl}/approval`, payload);
};

export const loanOutProduct = async (payload) => {
  return await axios.post(`${loanProductUrl}/loan-out`, payload);
};

export const returnLoanProduct = async (payload) => {
  return await axios.post(`${loanProductUrl}/return`, payload);
};

export const downloadLoanProductPDF = async (id) => {
  return await axios.get(`${loanProductUrl}/download-pdf`, {
    params: { id },
    responseType: 'blob'
  });
};
