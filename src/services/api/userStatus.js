import axios from 'axios';
import { getAuthHeaders } from './rocketchat';

const BASE_URL = import.meta.env.VITE_ROCKETCHAT_URL;

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
});

/**
 * Get user status
 * @param {string} userId - The user ID (optional, defaults to authenticated user)
 * @param {string} authToken - X-Auth-Token
 * @param {string} userAuthId - X-User-Id
 * @returns {Promise<{success: boolean, status?: string, message?: string, connectionStatus?: string, error?: string}>}
 */
export const getUserStatus = async (userId, authToken, userAuthId) => {
  try {
    const response = await api.get('/users.getStatus', {
      headers: getAuthHeaders(authToken, userAuthId),
      params: userId ? { userId } : {}
    });
    
    if (response.data.success) {
      return {
        success: true,
        status: response.data.status,
        message: response.data.message,
        connectionStatus: response.data.connectionStatus
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Failed to get user status'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

/**
 * Set user status
 * @param {string} status - The status (online, away, busy, offline, invisible)
 * @param {string} message - The status message
 * @param {string} authToken - X-Auth-Token
 * @param {string} userId - X-User-Id
 * @param {string} targetUserId - The user ID to set status for (optional, defaults to authenticated user)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const setUserStatus = async (status, message, authToken, userId, targetUserId = null) => {
  try {
    const payload = {
      status,
      message
    };

    // Add target user ID if provided (for setting status of another user)
    if (targetUserId) {
      payload.userId = targetUserId;
    }

    const response = await api.post('/users.setStatus', payload, {
      headers: getAuthHeaders(authToken, userId)
    });
    
    if (response.data.success) {
      return {
        success: true
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Failed to set user status'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

/**
 * Get status display information
 * @param {string} status - The status string
 * @returns {Object} Status display info with color, icon, and label
 */
export const getStatusDisplayInfo = (status) => {
  const statusMap = {
    online: {
      color: 'white',
      icon: '🟢',
      label: 'Online',
      bgColor: '#1e7e34',
      borderColor: '#1e7e34'
    },
    away: {
      color: 'white',
      icon: '🟡',
      label: 'Away',
      bgColor: '#e0a800',
      borderColor: '#e0a800'
    },
    busy: {
      color: 'white',
      icon: '🔴',
      label: 'Busy',
      bgColor: '#c82333',
      borderColor: '#c82333'
    },
    offline: {
      color: 'white',
      icon: '⚫',
      label: 'Offline',
      bgColor: '#495057',
      borderColor: '#495057'
    }
  };

  return statusMap[status] || statusMap.offline;
};

/**
 * Get available status options
 * @returns {Array} Array of available status options
 */
export const getAvailableStatusOptions = () => {
  return [
    { value: 'online', label: 'Online', icon: '🟢', description: 'Available to chat' },
    { value: 'away', label: 'Away', icon: '🟡', description: 'Away from keyboard' },
    { value: 'busy', label: 'Busy', icon: '🔴', description: 'Do not disturb' },
    { value: 'offline', label: 'Offline', icon: '⚫', description: 'Completely offline' }
  ];
};
