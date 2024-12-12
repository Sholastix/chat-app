const yup = require('yup');

// Password must contain minimum five characters. At least one of them must be letter and another one - number.
const passwordRules = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;

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
    .matches(passwordRules, { message: 'Password must contain letters and numbers.' }),
  confirmPassword: yup
    .string()
    .required('Password confirmation is required.')
    .oneOf([yup.ref('password'), null], 'Passwords don\'t match!')
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
    .matches(passwordRules, { message: 'Password must contain letters and numbers.' })
});

module.exports = {
  signinSchema,
  signupSchema
};