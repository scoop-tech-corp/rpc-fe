import axios from 'utils/axios';

export const getFinanceDashboard = async (params) => {
  return await axios.get('finance/dashboard', { params });
};
