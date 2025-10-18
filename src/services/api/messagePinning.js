import axios from 'axios';
import { getAuthHeaders } from './rocketchat';
const BASE_URL = import.meta.env.VITE_ROCKETCHAT_URL;

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
});

// Pin a message
export const pinMessage = async (messageId, authToken, userId) => {
  try {
    const response = await api.post(
      '/chat.pinMessage',
      { messageId },
      {
        headers: getAuthHeaders(authToken, userId),
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error pinning message:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.error || 'Network error' };
  }
};

export const getPinnedMessages = async (roomId, authToken, userId) => {
  try {
    const response = await api.get('/chat.getPinnedMessages', {
      headers: getAuthHeaders(authToken, userId),
      params: { roomId },
    });
    if (response.data.success) {
      return { success: true, messages: response.data.messages };
    } else {
      return { success: false, error: response.data.error || 'Failed to fetch pinned messages' };
    }
  } catch (error) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
};

/**
 * Unpin a message
 * @param {string} messageId - ID of the message to unpin
 * @param {string} authToken - X-Auth-Token
 * @param {string} userId - X-User-Id
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const unPinMessage = async (messageId, authToken, userId) => {
  if (!messageId || !authToken || !userId) {
    return { success: false, error: 'Missing required parameters' };
  }

  try {
    const response = await api.post(
      '/chat.unPinMessage',
      { messageId },
      { headers: getAuthHeaders(authToken, userId) }
    );

    if (response.data.success) {
      return { success: true };
    } else {
      return { success: false, error: response.data.error || 'Failed to unpin message' };
    }
  } catch (error) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
};
