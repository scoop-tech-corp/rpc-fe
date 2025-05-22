import axios from 'utils/axios';
const url = 'product/dashboard';

export const getProductDashboard = async () => {
  return await axios.get(url);
};
