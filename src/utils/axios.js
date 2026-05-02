import axios from 'axios';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import configGlobal from '../../src/config';

const axiosServices = axios.create({
  baseURL: configGlobal.apiUrl + '/api/'
});

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.request.use(
  (config) => {
    const isManualLoader = loaderService.manualLoader;

    if (!isManualLoader) {
      loaderGlobalConfig.setLoader(true);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosServices.interceptors.response.use(
  (response) => {
    const isManualLoader = loaderService.manualLoader;
    if (!isManualLoader) {
      loaderGlobalConfig.setLoader(false);
    }

    return response;
  },
  (error) => {
    const isManualLoader = loaderService.manualLoader;
    const removeBasedLocalStorage = () => {
      localStorage.removeItem('user');
      localStorage.removeItem('mantis-ts-cart');
      localStorage.removeItem('pusherTransportTLS');
      localStorage.removeItem('serviceToken');
    };
    if (!isManualLoader) loaderGlobalConfig.setLoader(false);

    if (error.code === 'ECONNABORTED' && error.message === 'timeout exceeded' && error.name === 'AxiosError') {
      removeBasedLocalStorage();
      window.location.href = `/login`;
    }

    if (error.response.status === 401 && ['Token is Expired', 'Token is Invalid'].includes(error.response?.data.status)) {
      removeBasedLocalStorage();
      window.location.href = `/login?islogout=1`;
    } else if (error.response.status === 403) {
      window.location.href = `/403`;
    } else {
      const elementSnackbar = document.getElementById('snackbar-custom');
      const title = document.getElementById('snackbar-custom__title');
      const desc = document.getElementById('snackbar-custom__desc');

      if (error.response.status === 500) {
        elementSnackbar.className = 'show';
        elementSnackbar.style.backgroundColor = '#ff4d4f';
        title.innerText = error.message;
        desc.innerText = error.response?.data.message;
      }

      setTimeout(() => {
        elementSnackbar.className = elementSnackbar.className.replace('show', '');
        title.innerText = '';
        desc.innerText = '';

        elementSnackbar.style = '';
        title.style = '';
        desc.style = '';
      }, 3000);
    }

    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;
