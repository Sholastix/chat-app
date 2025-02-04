// We have 1-on-1 chat with two users. 
// One of the users is ourself when the other user is our collocutor.
// Basically, function returns our collocutor's name which will be the name of our 1-on-1 chat.
export const getSender = (loggedInUser, users) => {
  try {
    return users[0]._id === loggedInUser._id ? users[1].username : users[0].username;
  } catch (err) {
    console.error(err);
  };
};

// Function returns full info about our collocutor in our 1-on-1 chat.
export const getFullSender = (loggedInUser, users) => {
  try {
    return users[0]._id === loggedInUser._id ? users[1] : users[0];
  } catch (err) {
    console.error(err);
  };
};