import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer } from 'react';

// third-party
import { Chance } from 'chance';
import jwtDecode from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT } from 'store/reducers/actions';
import authReducer from 'store/reducers/auth';

// project import
import Loader from 'components/Loader';
import axios from 'utils/axios';
// import useAuth from 'hooks/useAuth';

const chance = new Chance();

// constant
const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

const verifyToken = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }
  const decoded = jwtDecode(serviceToken);
  /**
   * Property 'exp' does not exist on type '<T = unknown>(token: string, options?: JwtDecodeOptions | undefined) => T'.
   */
  return decoded.exp > Date.now() / 1000;
};

const setSession = (serviceToken) => {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
    axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
  } else {
    localStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
  }
};

const extractUrls = (data) => {
  const urls = [];
  // Fungsi rekursif untuk menelusuri struktur JSON
  function extract(data) {
    if (Array.isArray(data)) {
      data.forEach((item) => extract(item));
    } else if (typeof data === 'object') {
      // eslint-disable-next-line no-prototype-builtins
      if (data.hasOwnProperty('url')) urls.push(data);
      // eslint-disable-next-line no-prototype-builtins
      if (data.hasOwnProperty('children')) extract(data['children']);
    }
  }

  // Memulai proses ekstraksi
  extract(data['items']);
  return urls;
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const logout = async () => {
    const getToken = localStorage.getItem('serviceToken');
    if (getToken) {
      await axios.post('logout', { token: getToken });
    }

    setSession(null);
    dispatch({ type: LOGOUT });
    localStorage.removeItem('user');
  };

  const init = async () => {
    try {
      const serviceToken = window.localStorage.getItem('serviceToken');
      const userLogin = JSON.parse(window.localStorage.getItem('user'));
      if (serviceToken && verifyToken(serviceToken)) {
        setSession(serviceToken);

        const setUser = {
          id: userLogin.id,
          email: userLogin.email,
          name: userLogin.name,
          role: userLogin.role,
          avatar: userLogin.avatar,
          isAbsent: userLogin.isAbsent,
          masterMenu: userLogin.masterMenu,
          profileMenu: userLogin.profileMenu,
          settingMenu: userLogin.settingMenu,
          extractMenu: userLogin.extractMenu,
          reportMenu: userLogin.reportMenu
        };
        dispatch({ type: LOGIN, payload: { isLoggedIn: true, user: setUser } });
      } else {
        logout();
      }
    } catch (err) {
      console.error(err);
      logout();
    }
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('login', { email, password });
    const { token, emailAddress, usersId, userName, role, imagePath, isAbsent, masterMenu, profileMenu, settingMenu, reportMenu } =
      response.data;
    setSession(token);

    const setUser = {
      id: +usersId,
      email: emailAddress,
      name: userName,
      avatar: imagePath,
      role: role.toLowerCase(),
      isAbsent: !!isAbsent,
      masterMenu,
      profileMenu,
      settingMenu,
      reportMenu,
      extractMenu: {
        masterMenu: extractUrls(masterMenu)
      }
    };

    dispatch({ type: LOGIN, payload: { isLoggedIn: true, user: setUser } });
    window.localStorage.setItem('user', JSON.stringify(setUser));
  };

  const register = async (email, password, firstName, lastName) => {
    // todo: this flow need to be recode as it not verified
    const id = chance.bb_pin();
    const response = await axios.post('/api/account/register', {
      id,
      email,
      password,
      firstName,
      lastName
    });
    let users = response.data;

    if (window.localStorage.getItem('users') !== undefined && window.localStorage.getItem('users') !== null) {
      const localUsers = window.localStorage.getItem('users');
      users = [
        ...JSON.parse(localUsers),
        {
          id,
          email,
          password,
          name: `${firstName} ${lastName}`
        }
      ];
    }

    window.localStorage.setItem('users', JSON.stringify(users));
  };

  const resetPassword = async () => {};

  const updateProfile = () => {};

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return (
    <JWTContext.Provider
      value={{
        ...state,
        init,
        login,
        logout,
        register,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </JWTContext.Provider>
  );
};

JWTProvider.propTypes = {
  children: PropTypes.node
};

export default JWTContext;
