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
    if (!isManualLoader) {
      loaderGlobalConfig.setLoader(false);
    }

    if (error.response.status === 401 && error.response?.data.status === 'Token is Expired') {
      window.location.href = `/login?islogout=1`;
      return true;
    }

    if (error.response.status === 500) {
      const elementSnackbar = document.getElementById('snackbar-500');
      const title = document.getElementById('snackbar-500__title');
      const desc = document.getElementById('snackbar-500__desc');

      elementSnackbar.className = 'show';
      title.innerText = error.message;
      desc.innerText = error.response?.data.message;
      setTimeout(() => {
        elementSnackbar.className = elementSnackbar.className.replace('show', '');
        title.innerText = '';
        desc.innerText = '';
      }, 3000);
    }

    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;
