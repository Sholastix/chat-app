import DOMPurify from 'dompurify';

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

// Check if message is the first message in chat.
export const isFirstMessageInChat = (messages, index) => {
  try {
    // Is previous message exists (returns "true" if no).
    return !messages[index - 1];
  } catch (err) {
    console.error(err);
  };
};

// Check if message is the last message in chat.
export const isLastMessageInChat = (messages, index) => {
  try {
    // Is index of current message equal to number of messages in chat (returns "true" if yes).
    return index === messages.length - 1;
  } catch (err) {
    console.error(err);
  };
};

// Check if current message is the first message in block of consecutive messages from specific user (returns "true" if yes).
export const isFirstMessageInBlock = (messages, index) => {
  try {
    // Is previous message from different sender (returns "true" if yes).
    return messages[index - 1]?.sender._id !== messages[index].sender._id;
  } catch (err) {
    console.error(err);
  };
};

// Check if current message is the last message in block of consecutive messages from specific user (returns "true" if yes).
export const isLastMessageInBlock = (messages, index) => {
  try {
    // Is next message from different sender (returns "true" if yes).
    return messages[index + 1]?.sender._id !== messages[index].sender._id;
  } catch (err) {
    console.error(err);
  };
};

// Check if sender is currently logged in user (returns "true" if yes).
export const isMyMessage = (messages, index, userId) => {
  try {
    return messages[index].sender._id === userId;
  } catch (err) {
    console.error(err);
  };
};

// Check if new day already started after last message in chat.
// If true - then add a divider between group of messages from each day.
export const isNewDay = (messages, message, index) => {
  try {
    const previousMessageCreatedAt = new Date(messages[index - 1]?.createdAt)
      .toLocaleDateString();

    const currentMessageCreatedAt = new Date(message.createdAt)
      .toLocaleDateString();

    return (
      // Check if it is not the first message in chat ('true' if it is).
      messages[index - 1]
      &&
      // Check if the creation date of the current message is different from the creation date of the previous message ('true' if it is).
      currentMessageCreatedAt !== previousMessageCreatedAt
    );
  } catch (err) {
    console.error(err);
  };
};

// Check if at least 1 minute passed after previous message in chat.
export const isSameTime = (messages, message, index) => {
  try {
    const previousMessageTime = new Date(messages[index - 1]?.createdAt)
      .toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });

    const currentMessageTime = new Date(message.createdAt)
      .toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });

    return (
      previousMessageTime
      &&
      // Check if the creation time of the current message is the same as the creation time of the previous message ('true' if it is).
      currentMessageTime === previousMessageTime
    );
  } catch (err) {
    console.error(err);
  };
};

/////////////////////////////////////////////////////   SAFE HYPERLINKS IN CHAT   /////////////////////////////////////////////////////

// Create safe hyperlinks in chat.
export const linkifyAndSanitize = (text) => {
  const urlRegex = /((https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?)/gi;

  const htmlWithLinks = text.replace(urlRegex, (url) => {
    let hyperlink = url;

    if (!hyperlink.match(/^https?:\/\//)) {
      hyperlink = 'http://' + hyperlink;
    };

    return `<a href="${hyperlink}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });

  return DOMPurify.sanitize(htmlWithLinks);
};
