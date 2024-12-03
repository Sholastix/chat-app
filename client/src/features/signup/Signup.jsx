// 'useSelector' hook used to get hold of any STATE that is maintained in the Redux STORE.
import { useSelector, useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';

import styles from './Signup.module.css';

import { registerUser } from './signupSlice';
import { usernameCheck, emailCheck } from '../../validation/userValidation';

// Password must contain minimum five characters. At least one of them must be letter and another one - number.
const passwordRules = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;

export const Signup = () => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const signupState = useSelector((state) => {
    return state.signupReducer
  });

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  // Validation schema for 'Signup' component.
  const signupSchema = yup.object({
    username: yup
      .string()
      .required('Username is required.')
      .min(3, 'Username must be at least 3 characters long.')
      .max(30, 'Username must be at most 30 characters long.')
      // If function 'usernameCheck' return 'true' - test passed successfully, if 'false' - message 'This username is already taken.' will be displayed.
      .test('Unique username.', 'This username is already taken.', () => {
        return usernameCheck(formik.values.username);
      }),
    email: yup
      .string()
      .required('Email is required.')
      .email('Please enter a valid email.')
      // If function 'emailCheck' return 'true' - test passed successfully, if 'false' - message 'This email is already taken.' will be displayed.
      .test('Unique email.', 'This email is already taken.', () => {
        return emailCheck(formik.values.email);
      }),
    password: yup
      .string()
      .required('Password is required.')
      .min(5, 'Password must be at least 5 characters long.')
      .matches(passwordRules, { message: 'Password must contain letters and numbers.' }),
    confirmPassword: yup.string()
      .required('Password confirmation is required.')
      .oneOf([yup.ref('password'), null], 'Passwords don\'t match!'),
  });

  // useFormik() hook with initial form values, validation schema from YUP and submit function, which will be called when the form is submitted.
  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },

    validationSchema: signupSchema,
    // Disable 'onBlur' validation.
    validateOnBlur: false,
    // Disable real-time validation.
    validateOnChange: false,

    onSubmit: (values, actions) => {
      try {
        dispatch(registerUser({
          username: values.username,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword
        }));

        // Clear input fields after submitting the form.
        actions.resetForm();
      } catch (err) {
        console.error(err);
      };
    },
  });

  return (
    <div>
      {
        !signupState.loading ? (
          <div className={styles.container}>
            <div className={styles.header}>
              Chitchat App
            </div>
            <div className={styles.info}>
              <p className={styles.infoIcon}>&#x1F512;</p>
              <p>Create a new account</p>
            </div>
            <form onSubmit={formik.handleSubmit}>
              <div className={formik.errors.username && formik.touched.username ? styles.inputError : styles.inputOuter}>
                <div className={styles.inputIcon}>&#x1F465;</div>
                <input
                  className={styles.input}
                  type='text'
                  name='username'
                  value={formik.values.username}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder='Enter the username...'
                />
              </div>
              {formik.errors.username && formik.touched.username && <p className={styles.errorMessage}>{formik.errors.username}</p>}

              <div className={formik.errors.email && formik.touched.email ? styles.inputError : styles.inputOuter}>
                <div className={styles.inputIcon}>&#x1F4E7;</div>
                <input
                  className={styles.input}
                  type='email'
                  name='email'
                  value={formik.values.email}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder='Enter the email...'
                />
              </div>
              {formik.errors.email && formik.touched.email && <p className={styles.errorMessage}>{formik.errors.email}</p>}

              <div className={formik.errors.password && formik.touched.password ? styles.inputError : styles.inputOuter}>
                <div className={styles.inputIcon}>&#x1F511;</div>
                <input
                  className={styles.input}
                  type='password'
                  name='password'
                  value={formik.values.password}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder='Enter the password...'
                />
              </div>
              {formik.errors.password && formik.touched.password && <p className={styles.errorMessage}>{formik.errors.password}</p>}

              <div className={formik.errors.confirmPassword && formik.touched.confirmPassword ? styles.inputError : styles.inputOuter}>
                <div className={styles.inputIcon}>&#x1F511;</div>
                <input
                  className={styles.input}
                  type='password'
                  name='confirmPassword'
                  value={formik.values.confirmPassword}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder='Confirm the password...'
                />
              </div>
              {formik.errors.confirmPassword && formik.touched.confirmPassword && <p className={styles.errorMessage}>{formik.errors.confirmPassword}</p>}

              <div>
                <button type='submit' className={styles.button}>Sign Up</button>
              </div>
            </form>
          </div>
        ) : <div>Loading...</div>
      }
    </div>
  )
};