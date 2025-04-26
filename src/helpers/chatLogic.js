// Truncate text in hyperlinks to maxLength without cutting mid-word.
const truncateWithoutCuttingWord = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  // If no space found (e.g., "cat,dog"), fallback to hard cut.
  return lastSpace === -1
    ? truncated + '...'
    : truncated.slice(0, lastSpace) + '...';
};

module.exports = {
  truncateWithoutCuttingWord
};