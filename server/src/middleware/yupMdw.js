const validation = (schema) => async (req, res, next) => {
  try {
    // Validate object with help of validation schema. 
    // Option 'abortEarly: false' give us list of all existing errors. If this option is 'true' - 'yup' will give us the first error found. 
    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    console.log('\nVALIDATION_ERRORS: ', err.errors);
    res.status(500).json({ errors: err.errors });
  };
};

module.exports = validation;