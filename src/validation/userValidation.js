const yup = require('yup');

// Import RegEx for password validation.
const { checkPassword } = require('../helpers/checkCredentials');

// Signup validation
const signupSchema = yup.object({
  username: yup
    .string()
    .required('Username is required.')
    .min(3, 'Username must be at least 3 characters long.')
    .max(30, 'Username must be at most 30 characters long.'),
  email: yup
    .string()
    .required('Email is required.')
    .email('Please enter a valid email.'),
  password: yup
    .string()
    .required('Password is required.')
    .min(5, 'Password must be at least 5 characters long.')
    .matches(checkPassword, { message: 'Password must contain letters and numbers.' }),
  confirmPassword: yup
    .string()
    .required('Password confirmation is required.')
    .oneOf([yup.ref('password'), null], 'Passwords don\'t match!'),
});

// Signin validation.
const signinSchema = yup.object({
  email: yup
    .string()
    .required('Email is required.')
    .email('Please enter a valid email.'),
  password: yup
    .string()
    .required('Password is required.')
    .min(5, 'Password must be at least 5 characters long.')
    .matches(checkPassword, { message: 'Password must contain letters and numbers.' }),
});

module.exports = {
  signinSchema,
  signupSchema
};
