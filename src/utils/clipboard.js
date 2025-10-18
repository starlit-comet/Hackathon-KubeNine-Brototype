/**
 * Utility functions for clipboard operations
 */

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return {
      success: true,
      message: 'Text copied to clipboard!'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to copy text to clipboard'
    };
  }
};

/**
 * Read text from clipboard
 * @returns {Promise<{success: boolean, text?: string, message?: string}>}
 */
export const readFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText();
    return {
      success: true,
      text
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to read from clipboard'
    };
  }
};
