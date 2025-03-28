require('dotenv').config();
export const drawerWidth = 260;

export const twitterColor = '#1DA1F2';
export const facebookColor = '#3b5998';
export const linkedInColor = '#0e76a8';

export const FIREBASE_API = {
  apiKey: 'AIzaSyC74w_JCigORyepa_esLkPt-B3HgtI_X3o',
  authDomain: 'mantis-4040b.firebaseapp.com',
  projectId: 'mantis-4040b',
  storageBucket: 'mantis-4040b.appspot.com',
  messagingSenderId: '1073498457348',
  appId: '1:1073498457348:web:268210e18c8f2cab30fc51',
  measurementId: 'G-7SP8EXFS48'
};

export const AWS_API = {
  poolId: 'us-east-1_AOfOTXLvD',
  appClientId: '3eau2osduslvb7vks3vsh9t7b0'
};

export const JWT_API = {
  secret: 'SECRET-KEY',
  timeout: '1 days'
};

export const AUTH0_API = {
  client_id: '7T4IlWis4DKHSbG8JAye4Ipk0rvXkH9V',
  domain: 'dev-w0-vxep3.us.auth0.com'
};

// API Production and UAT
const apiUrl = 'https://prod.radhiyanpetandcare.online';

// const apiUrl = process?.env?.REACT_APP_MODE === 'local' ? 'http://localhost:8000' : 'https://uat.radhiyanpetandcare.online/api';
// API LOCAL
// console.log(apiUrl);
// const apiUrl = 'http://localhost:8000';
// ==============================|| THEME CONFIG  ||============================== //

const config = {
  defaultPath: '/dashboard',
  fontFamily: `'Public Sans', sans-serif`,
  i18n: 'en',
  miniDrawer: false,
  container: false,
  mode: 'light',
  presetColor: 'default',
  themeDirection: 'ltr',
  apiUrl
};

export default config;
