import { useEffect } from 'react';
import { Link } from 'react-router-dom';
// 'useSelector' hook used to get hold of any STATE that is maintained in the Redux STORE.
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
// ONLY FOR DEVELOPMENT.
import { DevTool } from '@hookform/devtools';

// Styles.
import styles from './Signin.module.css';

// Components.
import Spinner from '../../components/Spinner/Spinner';

// Functions.
import { authUser } from './signinSlice';
import { emailCheck } from '../../validation/userValidation';
import { passwordRules } from '../../helpers/passwordRules';

export const Signin = () => {
  // This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
  const signinState = useSelector((state) => {
    return state.signinReducer
  });

  // This constant will be used to dispatch ACTIONS when we need it.
  const dispatch = useDispatch();

  // Validation schema for 'Signup' component.
  const signinSchema = yup.object({
    email: yup
      .string()
      .required('Email is required.')
      .email('Please enter a valid email.')
      // If function 'emailCheck' return 'true' - test passed successfully, if 'false' - message 'This email is already taken.' will be displayed.
      .test('Unique email.', 'User with this email not found.', async () => {
        const email = form.getValues('email');

        if (email && email !== '') {
          const result = await emailCheck(email);
          
          return result === false ? true : false;
        };
      }),
    password: yup
      .string()
      .required('Password is required.')
      .min(5, 'Password must be at least 5 characters long.')
      .matches(passwordRules, { message: 'Password must contain letters and numbers.' }),
  });

  const form = useForm({
    defaultValues: {
      email: '',
      password: ''
    },

    // Connect Yup schema.
    resolver: yupResolver(signinSchema)
  });

  const { register, handleSubmit, formState, reset, control } = form;
  const { errors, isSubmitSuccessful } = formState;

  const onSubmit = (formData) => {
    try {
      dispatch(authUser({
        email: formData.email,
        password: formData.password
      }));
    } catch (err) {
      console.error(err);
    };
  };

  const onError = (errors) => {
    console.log('FORM_ERRORS:', errors);
  };

  useEffect(() => {
    isSubmitSuccessful && reset();
  }, [isSubmitSuccessful]);

  return (
    <div>
      {
        !signinState.loading ? (
          <div className={styles.container}>
            <div className={styles.header}>
              Chitchat App
            </div>

            <div className={styles.info}>
              <p className={styles.infoIcon}>&#x1F512;</p>
              <p>Enter</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit, onError)}>
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

              <div>
                <button type='submit' className={styles.button}>Sign In</button>
              </div>
            </form>

            <p className={styles.footer}>Don't have an account yet?&nbsp;&nbsp;<Link to='/signup' className={styles.link}>SignUp</Link></p>
            <DevTool control={control} />
          </div>
        ) : <Spinner />
      }
    </div>
  )
};