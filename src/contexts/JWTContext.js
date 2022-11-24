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

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       const serviceToken = window.localStorage.getItem('serviceToken');
  //       if (serviceToken && verifyToken(serviceToken)) {
  //         setSession(serviceToken);
  //         const resp = await axios.get('login');
  //         console.log('RESP', resp);

  //         dispatch({
  //           type: LOGIN,
  //           payload: {
  //             isLoggedIn: true,
  //             user: {
  //               id: 1,
  //               email: 'adiyansyahdwiputra@gmail.com',
  //               name: 'Adiyansyah',
  //               role: 'Front End Developer'
  //             }
  //           }
  //         });
  //       } else {
  //         dispatch({
  //           type: LOGOUT
  //         });
  //       }
  //     } catch (err) {
  //       console.error(err);
  //       dispatch({
  //         type: LOGOUT
  //       });
  //     }
  //   };

  //   init();
  // }, []);

  const logout = async () => {
    const getToken = localStorage.getItem('serviceToken');
    if (getToken) {
      await axios.post('logout', { token: getToken });
    }
    console.log('logout');
    setSession(null);
    dispatch({ type: LOGOUT });
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = window.localStorage.getItem('serviceToken');
        const userLogin = JSON.parse(window.localStorage.getItem('user'));

        if (serviceToken && verifyToken(serviceToken)) {
          setSession(serviceToken);

          console.log('userLogin', userLogin);
          const setUser = {
            id: userLogin.id,
            email: userLogin.email,
            name: userLogin.name,
            role: userLogin.role
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

    init();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('login', { email, password });
    console.log('response ADIIIII', response);
    const { token, userEmail, userId, userName } = response.data;
    setSession(token);

    const setUser = {
      id: +userId,
      email: userEmail,
      name: userName,
      role: 'Front End Developer'
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
