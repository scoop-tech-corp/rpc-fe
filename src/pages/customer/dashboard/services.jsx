import axios from 'utils/axios';

export const getCustomerDashboard = async (params = {}) => {
  return await axios.get('customer/dashboard', { params });
};
