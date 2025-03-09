import { Fragment, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import './App.css';

import Chat from '../features/chat/Chat';
import ErrorPage from '../components/ErrorPage/ErrorPage';
import ProtectedRoutes from '../components/ProtectedRoutes/ProtectedRoutes';
import Signin from '../features/auth/signin/Signin';
import Signup from '../features/auth/signup/Signup';

import { isUserSignedIn } from '../features/auth/authSlice';

const App = () => {
  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  // Every time the page reloads, we check if the user is logged in.
  useEffect(() => {
    dispatch(isUserSignedIn());
  }, []);

  return (
    <Fragment>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Navigate replace to='/chat' />} />
          <Route element={<ProtectedRoutes />}>
            <Route path='/chat' element={<Chat />} />
          </Route>
          <Route path='/signin' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='*' element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </Fragment>
  )
};

export default App;
