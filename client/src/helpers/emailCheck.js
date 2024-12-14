import axios from 'axios';

// Check if email is available.
export const emailCheck = async (email) => {
  try {
    const user = await axios.get(`http://localhost:5000/api/user/email/${email}`);

    return user.data === null ? true : false;
  } catch (err) {
    console.error(err);
  };
};