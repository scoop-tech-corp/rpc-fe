import axios from 'utils/axios';

export const getFinanceDashboard = async () => {
  return await axios.get('finance/dashboard');
};
