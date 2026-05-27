import axios from 'utils/axios';
const url = 'product/dashboard';

export const getProductDashboard = async (params) => {
  return await axios.get(url, { params });
};
