import { Fragment } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import styles from './App.module.css';

import ErrorPage from './components/ErrorPage/ErrorPage';
import Chat from './features/chat/Chat';
import Signin from './features/signin/Signin';
import Signup from './features/signup/Signup';

const App = () => {
  return (
    <Fragment>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Navigate replace to='/signup' />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='*' element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </Fragment>
  )
};

export default App;
