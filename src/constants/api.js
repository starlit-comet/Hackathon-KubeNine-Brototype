/**
 * API Constants and Configuration
 */

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/login',
  LOGOUT: '/logout',
  ME: '/me',
  
  // Rooms
  ROOMS_GET: '/rooms.get',
  ROOMS_INFO: '/rooms.info',
  
  // Messages
  CHANNELS_HISTORY: '/channels.history',
  CHAT_SEND_MESSAGE: '/chat.sendMessage',
  
  // Message Pinning
  CHAT_PIN_MESSAGE: '/chat.pinMessage',
  CHAT_UNPIN_MESSAGE: '/chat.unPinMessage',
  CHAT_GET_PINNED_MESSAGES: '/chat.getPinnedMessages',
};

export const API_CONFIG = {
  DEFAULT_MESSAGE_COUNT: 50,
  POLL_INTERVAL: 3000, // 3 seconds
  REQUEST_TIMEOUT: 10000, // 10 seconds
};

export const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
};
