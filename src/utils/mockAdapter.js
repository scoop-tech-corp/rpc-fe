// import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import axios from './axiosMock';

// ==============================|| AXIOS - MOCK ADAPTER ||============================== //

const services = new AxiosMockAdapter(axios, { delayResponse: 0 });
export default services;
