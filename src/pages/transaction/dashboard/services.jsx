import axios from 'utils/axios';

export const getTransactionDashboard = async (params = {}) => {
  return await axios.get('transaction/dashboard', { params });
};
