import * as yup from 'yup';
import { checkEmail, checkPassword, checkUsername } from '../helpers/checkCredentials';

// Validation schema for 'Signin' component.
export const signinSchema = yup.object({
  email: yup
    .string()
    .required('Email is required.')
    .email('Please enter a valid email.')
    // If function 'checkEmail' return 'true' - test passed successfully, if 'false' - message 'This email is already taken.' will be displayed.
    .test('Unique email.', 'User with this email not found.', async function () {
      const email = this.parent.email;

      if (email && email !== '') {
        const result = await checkEmail(email);
        return result === false ? true : false; // simplified version: return result === !result;
      }

      return true;
    }),
  password: yup
    .string()
    .required('Password is required.')
    .min(5, 'Password must be at least 5 characters long.')
    .matches(checkPassword, { message: 'Password must contain letters and numbers.' }),
});

// Validation schema for 'Signup' component.
export const signupSchema = yup.object({
  username: yup
    .string()
    .required('Username is required.')
    .min(3, 'Username must be at least 3 characters long.')
    .max(30, 'Username must be at most 30 characters long.')
    // If function 'checkUsername' return 'true' - test passed successfully, if 'false' - message 'This username is already taken.' will be displayed.
    .test('Unique username.', 'This username is already taken.', async function () {
      const username = this.parent.username;

      if (username && username !== '') {
        const result = await checkUsername(username);
        return result === false ? false : true; // simplified version: return result === result;
      }

      return true;
    }),
  email: yup
    .string()
    .required('Email is required.')
    .email('Please enter a valid email.')
    // If function 'checkEmail' return 'true' - test passed successfully, if 'false' - message 'This email is already taken.' will be displayed.
    .test('Unique email.', 'This email is already taken.', async function () {
      const email = this.parent.email;

      if (email && email !== '') {
        const result = await checkEmail(email);
        return result === false ? false : true; // simplified version: return result === result;
      }

      return true;
    }),
  password: yup
    .string()
    .required('Password is required.')
    .min(5, 'Password must be at least 5 characters long.')
    .matches(checkPassword, { message: 'Password must contain letters and numbers.' }),
  confirmPassword: yup
    .string()
    .required('Password confirmation is required.')
    .oneOf([yup.ref('password'), null], "Passwords don't match!"),
});
