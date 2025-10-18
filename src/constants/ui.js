/**
 * UI Constants and Configuration
 */

export const UI_MESSAGES = {
  // Success messages
  MESSAGE_PINNED: 'Message pinned successfully!',
  MESSAGE_UNPINNED: 'Message unpinned successfully!',
  MESSAGE_COPIED: 'Message copied to clipboard!',
  TEXT_COPIED: 'Text copied to clipboard!',
  SCROLLING_TO_MESSAGE: 'Scrolling to message...',
  
  // Error messages
  MISSING_AUTH: 'Missing authentication or message ID!',
  MISSING_PARAMS: 'Missing required parameters',
  PIN_FAILED: 'Failed to pin message',
  UNPIN_FAILED: 'Failed to unpin message',
  COPY_FAILED: 'Failed to copy message to clipboard',
  NETWORK_ERROR: 'Network error',
  UNEXPECTED_ERROR: 'An unexpected error occurred',
  ACTION_FAILED: 'Action failed!',
  
  // Loading messages
  SIGNING_IN: 'Signing in...',
  LOADING_CHAT: 'Loading chat...',
  SENDING_MESSAGE: 'Sending...',
  
  // Placeholder messages
  NO_MESSAGES: 'No messages yet. Start the conversation!',
  NO_ROOMS: 'No rooms available',
  SELECT_ROOM: 'Select a room to start chatting',
  CHOOSE_ROOM: 'Choose a room from the sidebar to view messages',
  TYPE_MESSAGE: 'Type a message...',
  ENTER_USERNAME: 'Enter your username or email',
  ENTER_PASSWORD: 'Enter your password',
  
  // Help messages
  SERVER_RUNNING: 'Make sure your Rocket.Chat server is running on localhost:3000',
  REPLY_PLACEHOLDER: 'Reply functionality would be implemented here',
};

export const UI_CONFIG = {
  SNACKBAR_DURATION: 4000,
  MENU_ITEM_HEIGHT: 48,
  MAX_MENU_HEIGHT: 216, // ITEM_HEIGHT * 4.5
  DEFAULT_MENU_WIDTH: '20ch',
  COMPACT_MENU_WIDTH: '15ch',
};

export const ROOM_TYPES = {
  CHANNEL: 'c',
  DIRECT_MESSAGE: 'd',
  PRIVATE_GROUP: 'p',
};

export const ROOM_ICONS = {
  [ROOM_TYPES.CHANNEL]: '#',
  [ROOM_TYPES.DIRECT_MESSAGE]: '@',
  [ROOM_TYPES.PRIVATE_GROUP]: '🔒',
};
