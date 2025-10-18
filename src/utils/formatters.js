/**
 * Utility functions for formatting data
 */

/**
 * Format timestamp to time string
 * @param {number|string} timestamp - The timestamp to format
 * @returns {string} Formatted time string
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format timestamp to date string
 * @param {number|string} timestamp - The timestamp to format
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Get message date string
 * @param {number|string} timestamp - The timestamp to format
 * @returns {string} Date string
 */
export const getMessageDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toDateString();
};

/**
 * Check if date should be shown for current message
 * @param {Object} currentMessage - Current message object
 * @param {Object} previousMessage - Previous message object
 * @returns {boolean} Whether to show date
 */
export const shouldShowDate = (currentMessage, previousMessage) => {
  if (!previousMessage) return true;
  
  const currentDate = getMessageDate(currentMessage.ts);
  const previousDate = getMessageDate(previousMessage.ts);
  
  return currentDate !== previousDate;
};

/**
 * Format room name
 * @param {Object} room - Room object
 * @returns {string} Formatted room name
 */
export const formatRoomName = (room) => {
  return room.name || room.fname || 'Unnamed Room';
};

/**
 * Format room topic or last message
 * @param {Object} room - Room object
 * @returns {string} Formatted topic or last message
 */
export const formatRoomTopic = (room) => {
  return room.topic || room.lastMessage?.msg || 'No recent messages';
};
