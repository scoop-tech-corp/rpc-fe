import axios from 'axios';
import { loaderGlobalConfig } from 'components/LoaderGlobal';
import configGlobal from '../../src/config';

const axiosServices = axios.create({
  baseURL: configGlobal.apiUrl + '/api/'
});

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.request.use(
  (config) => {
    loaderGlobalConfig.setLoader(true);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosServices.interceptors.response.use(
  (response) => {
    loaderGlobalConfig.setLoader(false);
    // if (response.data && response.data.status === 'Token is Expired') {
    //   console.log('di lempar ke login');
    //   navigate('/login', { state: { isLogout: true }, replace: true });
    //   return true;
    // }
    return response;
  },
  (error) => {
    loaderGlobalConfig.setLoader(false);
    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;
