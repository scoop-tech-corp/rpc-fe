import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
// import axios from './axios';

// ==============================|| AXIOS - MOCK ADAPTER ||============================== //

const services = new AxiosMockAdapter(axios.create(), { delayResponse: 0 });
export default services;
