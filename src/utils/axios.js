import axios from 'axios';
import configGlobal from '../../src/config';

const axiosServices = axios.create({
  baseURL: configGlobal.apiUrl + '/api/'
});

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('error PERTAMAAA', error);
    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;
