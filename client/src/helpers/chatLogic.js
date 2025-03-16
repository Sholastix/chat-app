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

// Check if the next message is from the same sender as previous message.
export const isSameSender = (messages, message, index, userId) => {
  try {
    return (
      // Check if current message is the last message ('true' if it isn't).
      index < messages.length - 1
      &&
      // Check if sender is currently logged in user (if 'true' then it's not and we rendering avatar for this message).
      messages[index].sender._id !== userId
      &&
      // Check if the next message has the same sender as the current message ('true' if it isn't).
      messages[index + 1].sender._id !== message.sender._id
    );
  } catch (err) {
    console.error(err);
  };
};

// Check if message is the last message in chat.
export const isLastMessage = (messages, index, userId) => {
  try {
    return (
      // Check if current message is the last message  ('true' if it is).
      index === messages.length - 1
      &&
      // Check if current message's sender not the currently logged in user ('true' if it isn't).
      messages[messages.length - 1].sender._id !== userId
    );
  } catch (err) {
    console.error(err);
  };
};

// Check where is the end of each users message block (we need to know this to add a larger bottom margin after the messages block).
export const isEndOfMessagesBlock = (messages, message, index) => {
  try {
    return (
      // Check if the next message has the same sender as the current message ('true' if it isn't).
      messages[index + 1].sender._id !== message.sender._id
    );
  } catch (err) {
    console.error(err);
  };
};