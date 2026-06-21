import axios from 'utils/axios';

export const getSupportRequestList = async (params) => {
  return await axios.get('customer/support-request', { params });
};

export const createSupportRequest = async (payload) => {
  return await axios.post('customer/support-request', payload);
};

export const updateSupportRequest = async (payload) => {
  return await axios.put('customer/support-request', payload);
};

export const deleteSupportRequest = async (ids) => {
  return await axios.delete('customer/support-request', { data: { supportRequestId: ids } });
};

export const getSupportRequestHistory = async (supportRequestId) => {
  return await axios.get('customer/support-request/history', { params: { supportRequestId } });
};

export const selfSubmitSupportRequest = async (payload) => {
  return await axios.post('customer/support-request/self-submit', payload);
};

export const getMyRequests = async (params) => {
  return await axios.get('customer/support-request/my-requests', { params });
};
