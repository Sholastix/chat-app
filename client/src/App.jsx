import { Fragment } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import styles from './App.module.css';

import { Signup } from './features/signup/Signup';
import ErrorPage from './components/ErrorPage/ErrorPage';

const App = () => {
  return (
    <Fragment>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Navigate replace to='/signup' />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='*' element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </Fragment>
  )
};

export default App;
