import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
// ONLY FOR DEVELOPMENT.
import { DevTool } from '@hookform/devtools';

// Styles.
import styles from './Signup.module.css';

// Components.
import Spinner from '../../../components/Spinner/Spinner';

// Functions.
import { signup } from '../authSlice';
import { checkEmail, checkPassword, checkUsername } from '../../../helpers/checkCredentials';

const Signup = () => {
  // 'useSelector' hook used to get hold of any STATE that is maintained in the Redux STORE.
  // This hook accepts a selector function as its parameter. Selector function receives Redux STATE as argument.
  const authState = useSelector((state) => {
    return state.authReducer;
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
      // If function 'checkUsername' return 'true' - test passed successfully, if 'false' - message 'This username is already taken.' will be displayed.
      .test('Unique username.', 'This username is already taken.', () => {
        const username = form.getValues('username');

        if (username && username !== '') {
          return checkUsername(username);
        }
      }),
    email: yup
      .string()
      .required('Email is required.')
      .email('Please enter a valid email.')
      // If function 'checkEmail' return 'true' - test passed successfully, if 'false' - message 'This email is already taken.' will be displayed.
      .test('Unique email.', 'This email is already taken.', () => {
        const email = form.getValues('email');

        if (email && email !== '') {
          return checkEmail(email);
        }
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

  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },

    // Connect Yup schema.
    resolver: yupResolver(signupSchema),
  });

  const { register, handleSubmit, formState, reset, control } = form;
  const { errors, isSubmitSuccessful } = formState;

  useEffect(() => {
    isSubmitSuccessful && reset();
  }, [isSubmitSuccessful]);

  // Redirect if user signed up.
  if (!authState.loading && authState.isAuthenticated) {
    return <Navigate to='/chat' replace={true} />;
  }

  const onSubmit = (formData) => {
    try {
      dispatch(
        signup({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const onError = (errors) => {
    console.log('FORM_ERRORS:', errors);
  };

  return (
    <div>
      {!authState.loading ? (
        <div className={styles.container}>
          <div className={styles.header}>Chitchat App</div>

          <div className={styles.info}>
            <p className={styles.infoIcon}>&#x1F512;</p>
            <p>Create a new account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit, onError)}>
            <div className={styles.inputOuter}>
              <div className={styles.inputIcon}>&#x1F465;</div>
              <input
                className={styles.input}
                type='text'
                name='username'
                placeholder='Enter the username...'
                {...register('username')}
              />
            </div>
            {errors.username?.message && <p className={styles.errorMessage}>{errors.username?.message}</p>}

            <div className={styles.inputOuter}>
              <div className={styles.inputIcon}>&#x1F4E7;</div>
              <input
                className={styles.input}
                type='email'
                name='email'
                placeholder='Enter the email...'
                {...register('email')}
              />
            </div>
            {errors.email?.message && <p className={styles.errorMessage}>{errors.email?.message}</p>}

            <div className={styles.inputOuter}>
              <div className={styles.inputIcon}>&#x1F511;</div>
              <input
                className={styles.input}
                type='password'
                name='password'
                placeholder='Enter the password...'
                {...register('password')}
              />
            </div>
            {errors.password?.message && <p className={styles.errorMessage}>{errors.password?.message}</p>}

            <div className={styles.inputOuter}>
              <div className={styles.inputIcon}>&#x1F511;</div>
              <input
                className={styles.input}
                type='password'
                name='confirmPassword'
                placeholder='Confirm the password...'
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword?.message && (
              <p className={styles.errorMessage}>{errors.confirmPassword?.message}</p>
            )}

            <div>
              <button type='submit' className={styles.button}>
                Sign Up
              </button>
            </div>
          </form>

          <p className={styles.footer}>
            Already have an account?&nbsp;&nbsp;
            <Link to='/signin' className={styles.link}>
              SignIn
            </Link>
          </p>

          {import.meta.env.DEV && <DevTool control={control} />}
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default Signup;
