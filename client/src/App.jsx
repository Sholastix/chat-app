import { Fragment } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import styles from './App.module.css';

import Chat from './features/chat/Chat';
import ErrorPage from './components/ErrorPage/ErrorPage';
import ProtectedRoutes from './components/ProtectedRoutes/ProtectedRoutes';
import Signin from './features/signin/Signin';
import Signup from './features/signup/Signup';

const App = () => {
  return (
    <Fragment>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Navigate replace to='/signup' />} />
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
