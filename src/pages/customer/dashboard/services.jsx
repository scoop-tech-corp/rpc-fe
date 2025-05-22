import axios from 'utils/axios';

export const getCustomerDashboard = async () => {
  return await axios.get('customer/dashboard');
};
