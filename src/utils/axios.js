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
    return response;
  },
  (error) => {
    loaderGlobalConfig.setLoader(false);
    if (error.response.status === 401 && error.response?.data.status === 'Token is Expired') {
      console.log('di lempar ke login');
      // navigate('/login', { state: { isLogout: true }, replace: true });
      window.location.href = `/login?islogout=1`;
      return true;
    }

    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;
