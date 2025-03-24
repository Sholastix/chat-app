import { Fragment } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import './App.css';

import Chat from '../features/chat/Chat';
import ErrorPage from '../components/ErrorPage/ErrorPage';
import ProtectedRoutes from '../components/ProtectedRoutes/ProtectedRoutes';
import Signin from '../features/auth/signin/Signin';
import Signup from '../features/auth/signup/Signup';
import UserProfilePage from '../components/UserProfilePage/UserProfilePage';

const App = () => {
  return (
    <Fragment>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Navigate replace to='/chat' />} />
          <Route element={<ProtectedRoutes />}>
            <Route path='/chat' element={<Chat />} />
            <Route path='/profile' element={<UserProfilePage />} />
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
