import axios from 'utils/axios';

export const getStaffDashboard = async (params = {}) => {
  return await axios.get('staff/dashboard', { params });
};
