import { useState } from 'react';
// 'useSelector' hook used to get hold of any STATE that is maintained in the Redux STORE.
import { useSelector, useDispatch } from 'react-redux';

import styles from './Signup.module.css';

import { registerUser } from './signupSlice';

export const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const signupState = useSelector((state) => {
    return state.signupReducer
  });

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();

      dispatch(registerUser({ username, email, password, confirmPassword }));
    } catch (err) {
      console.error(err);
    };
  };

  return (
    <div>
      {
        !signupState.loading ? (
          <form onSubmit={handleSubmit}>
            <input
              type='text'
              name='username'
              value={username}
              onChange={(event) => { setUsername(event.target.value) }}
              placeholder='Enter the username...'
            />
            <br />
            <br />
            <input
              type='email'
              name='email'
              value={email}
              onChange={(event) => { setEmail(event.target.value) }}
              placeholder='Enter the email...'
            />
            <br />
            <br />
            <input
              type='password'
              name='password'
              value={password}
              onChange={(event) => { setPassword(event.target.value) }}
              placeholder='Enter the password...'
            />
            <br />
            <br />
            <input
              type='password'
              name='confirmPassword'
              value={confirmPassword}
              onChange={(event) => { setConfirmPassword(event.target.value) }}
              placeholder='Confirm the password...'
            />
            <br />
            <br />
            <button type='submit'>Submit</button>
          </form>
        ) : <div>Loading...</div>
      }
    </div>
  )
};