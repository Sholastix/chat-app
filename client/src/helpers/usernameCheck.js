import axios from 'axios';

// Check if username is available.
export const usernameCheck = async (username) => {
  try {
    const user = await axios.get(`http://localhost:5000/api/user/username/${username}`);

    return user.data === null ? true : false;
  } catch (err) {
    console.error(err);
  };
};