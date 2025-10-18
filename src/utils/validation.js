/**
 * Utility functions for validation
 */

/**
 * Validate if required parameters are present
 * @param {Object} params - Parameters to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result
 */
export const validateRequiredParams = (params, requiredFields) => {
  const missingFields = requiredFields.filter(field => !params[field]);
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `Missing required parameters: ${missingFields.join(', ')}`
    };
  }
  
  return { isValid: true };
};

/**
 * Validate authentication parameters
 * @param {string} authToken - Authentication token
 * @param {string} userId - User ID
 * @returns {Object} Validation result
 */
export const validateAuthParams = (authToken, userId) => {
  return validateRequiredParams({ authToken, userId }, ['authToken', 'userId']);
};

/**
 * Validate message parameters
 * @param {string} messageId - Message ID
 * @param {string} authToken - Authentication token
 * @param {string} userId - User ID
 * @returns {Object} Validation result
 */
export const validateMessageParams = (messageId, authToken, userId) => {
  return validateRequiredParams({ messageId, authToken, userId }, ['messageId', 'authToken', 'userId']);
};

/**
 * Validate room parameters
 * @param {string} roomId - Room ID
 * @param {string} authToken - Authentication token
 * @param {string} userId - User ID
 * @returns {Object} Validation result
 */
export const validateRoomParams = (roomId, authToken, userId) => {
  return validateRequiredParams({ roomId, authToken, userId }, ['roomId', 'authToken', 'userId']);
};
