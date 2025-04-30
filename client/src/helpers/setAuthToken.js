import axios from 'axios';

// If there is token in LocalStorage, then we put it in global header.
const setAuthToken = () => {
  // 'Authorization' - that's how we named this variable on server side ('middleware' dir -> 'authMdw.js').
  if (localStorage.token) {
    axios.defaults.headers.common['Authorization'] = localStorage.token;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  };
};

export default setAuthToken;