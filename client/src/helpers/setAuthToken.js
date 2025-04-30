import axios from 'axios';

// If there is token in LocalStorage, then we put it in global header.
const setAuthToken = () => {
  const token = localStorage.getItem('token');

  // 'Authorization' - that's how we named this variable on server side ('middleware' dir -> 'authMdw.js').
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  };
};

export default setAuthToken;