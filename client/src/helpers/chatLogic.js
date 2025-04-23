import DOMPurify from 'dompurify';
import emoji from 'emoji-dictionary';
import linkifyHtml from 'linkify-html';

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

/////////////////////////////////////////////////////   EMOJI FUNCTIONALITY   /////////////////////////////////////////////////////

// Emoticon-to-emoji conversion map.
const emoticonMap = {
  // Happy / Laughing
  ':)': '😊',
  ':-)': '😊',
  ':]': '😊',
  '=)': '😊',
  ':D': '😄',
  ':-D': '😄',
  '=D': '😄',
  'XD': '😆',
  'xD': '😆',

  // Winking / Flirty
  ';)': '😉',
  ';-)': '😉',

  // Playful / Tongue out
  ':P': '😛',
  ':-P': '😛',
  '=P': '😛',
  ':p': '😛',
  ':-p': '😛',

  // Sad / Crying
  ':(': '☹️',
  ':-(': '☹️',
  '=(': '☹️',
  ":'(": '😢',
  ":'‑(": '😢',
  "T_T": '😭',

  // Angry / Annoyed
  '>:(': '😠',
  'D:': '😧',

  // Shock / Surprise
  ':O': '😮',
  ':-O': '😮',
  ':o': '😮',
  ':-o': '😮',

  // Love
  '<3': '❤️',
  '</3': '💔',

  // Cool / Sunglasses
  '8)': '😎',
  'B)': '😎',

  // Confused / Meh
  ':/': '😕',
  ':-/': '😕',
  ':\\': '😕',
  ':-\\': '😕',

  // Grinning / Mischievous
  ':3': '😺',

  // Nervous / Embarrassed
  ':$': '😳',

  // Kisses
  ':*': '😘',
  ':-*': '😘'
};

// Replace ASCII-style emoticons (e.g. :)) with emojis.
const replaceEmoticons = (text) => {
  const pattern = new RegExp(Object.keys(emoticonMap)
    .map((element) => element.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|'), 'g');

  return text.replace(pattern, match => emoticonMap[match] || match);
};

// Replace emoji shortcodes (e.g. :heart:) with emojis.
const replaceShortcodes = (text) => {
  return text.replace(/:([a-zA-Z0-9_+-]+):/g, (match, name) => {
    const emojiChar = emoji.getUnicode(name);

    // Fallback to original shortcode if not found.
    return emojiChar || match;
  });
};

/////////////////////////////////////////////////////   HYPERLINKS AND EMOJIS   /////////////////////////////////////////////////////

// Full parser with sanitizer, hyperlinks and emojis.
export const linkifyAndSanitize = (text) => {
  const linkified = linkifyHtml(text, {
    target: '_blank',
    rel: 'noopener noreferrer',
    defaultProtocol: 'https',
    attributes: {
      rel: 'nofollow noopener noreferrer',
    }
  });

  // Create a temporary DOM to selectively replace emojis.
  const container = document.createElement('div');
  container.innerHTML = linkified;

  // Walk through non-link nodes and apply emoji/emoticon replacement.
  const walk = (node) => {
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        // Replace emoji shortcodes and emoticons in plain text.
        let replaced = replaceShortcodes(replaceEmoticons(child.textContent));
        child.textContent = replaced;
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'A') {
        // Recurse into non-anchor elements.
        // For most chat messages the DOM tree is shallow and recursion is fine - stack overflow does not occur.
        walk(child);
      }
    });
  };

  walk(container);

  // // We can change 'walk()' function to iterative version without recursion.
  // const walk = (root) => {
  //   const stack = [root];

  //   while (stack.length > 0) {
  //     const node = stack.pop();

  //     node.childNodes.forEach(child => {
  //       if (child.nodeType === Node.TEXT_NODE) {
  //         child.textContent = replaceShortcodes(replaceEmoticons(child.textContent));
  //       } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'A') {
  //         stack.push(child);
  //       };
  //     });
  //   }
  // };

  // walk(container);

  // Sanitize final output.
  return DOMPurify.sanitize(container.innerHTML, {
    ALLOWED_TAGS: ['a', 'b', 'i', 'u', 'strong', 'em', 'br', 'span', 'code'],
    ADD_ATTR: ['target', 'rel']
  });
};

// Text truncation in hyperlinks.
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};