import axios from 'axios';

// Check if password meets the requirements.
// REQUIREMENTS: password must contain minimum five characters. At least one of them must be letter and another one - number.
export const checkPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;

// Check if email is already in use.
export const checkEmail = async (email) => {
  try {
    const user = await axios.get(`http://localhost:5000/api/user/email/${email}`);

    return user.data === null ? true : false;
  } catch (err) {
    console.error(err);
  };
};

// Check if username is already in use.
export const checkUsername = async (username) => {
  try {
    const user = await axios.get(`http://localhost:5000/api/user/username/${username}`);

    return user.data === null ? true : false;
  } catch (err) {
    console.error(err);
  };
};