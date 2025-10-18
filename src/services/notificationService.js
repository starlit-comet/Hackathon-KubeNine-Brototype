/**
 * Notification Service
 * Handles sounds, browser notifications, and user activity detection
 */

class NotificationService {
  constructor() {
    this.audioContext = null;
    this.isUserActive = true;
    this.setupUserActivityDetection();
    this.requestNotificationPermission();
  }

  /**
   * Request browser notification permission
   */
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.warn('Could not request notification permission:', error);
      }
    }
  }

  /**
   * Setup user activity detection
   */
  setupUserActivityDetection() {
    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.isUserActive = true;
        clearTimeout(this.inactiveTimeout);
        
        // Set user as inactive after 30 seconds of no activity
        this.inactiveTimeout = setTimeout(() => {
          this.isUserActive = false;
        }, 30000);
      }, true);
    });
  }

  /**
   * Check if user is actively viewing the page
   */
  isUserActivelyViewing() {
    return this.isUserActive && !document.hidden;
  }

  /**
   * Create audio context for playing sounds
   */
  getAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.warn('Audio context not supported:', error);
        return null;
      }
    }
    return this.audioContext;
  }

  /**
   * Generate a simple tone
   */
  playTone(frequency, duration = 200, type = 'sine', volume = 0.3) {
    const audioContext = this.getAudioContext();
    if (!audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Could not play tone:', error);
    }
  }

  /**
   * Play status change sound
   */
  playStatusChangeSound() {
    // Play a pleasant chime for status change
    this.playTone(523.25, 150, 'sine', 0.2); // C5
    setTimeout(() => this.playTone(659.25, 150, 'sine', 0.2), 100); // E5
    setTimeout(() => this.playTone(783.99, 200, 'sine', 0.2), 200); // G5
  }

  /**
   * Play message sent sound
   */
  playMessageSentSound() {
    // Play a short, satisfying sound for message sent
    this.playTone(800, 100, 'sine', 0.15);
    setTimeout(() => this.playTone(1000, 100, 'sine', 0.15), 50);
  }

  /**
   * Play new message received sound
   */
  playNewMessageSound() {
    // Play a notification sound for new messages
    this.playTone(440, 200, 'sine', 0.3); // A4
    setTimeout(() => this.playTone(554.37, 200, 'sine', 0.3), 150); // C#5
  }

  /**
   * Play error sound
   */
  playErrorSound() {
    // Play a descending tone for errors
    this.playTone(523.25, 200, 'sine', 0.25); // C5
    setTimeout(() => this.playTone(392, 300, 'sine', 0.25), 200); // G4
  }

  /**
   * Play success sound
   */
  playSuccessSound() {
    // Play an ascending tone for success
    this.playTone(392, 150, 'sine', 0.2); // G4
    setTimeout(() => this.playTone(523.25, 150, 'sine', 0.2), 100); // C5
    setTimeout(() => this.playTone(659.25, 200, 'sine', 0.2), 200); // E5
  }

  /**
   * Show browser notification
   */
  showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: options.tag || 'chat-notification',
        requireInteraction: false,
        silent: false,
        ...options
      });

      // Auto-close notification after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
    return null;
  }

  /**
   * Show status change notification
   */
  showStatusChangeNotification(newStatus) {
    const statusLabels = {
      online: 'Online',
      away: 'Away',
      busy: 'Busy',
      offline: 'Offline'
    };

    this.showNotification(
      `Status Updated`,
      {
        body: `You are now ${statusLabels[newStatus] || newStatus}`,
        tag: 'status-change'
      }
    );
  }

  /**
   * Show new message notification
   */
  showNewMessageNotification(message, sender, roomName) {
    this.showNotification(
      `New message from ${sender}`,
      {
        body: message.length > 50 ? `${message.substring(0, 50)}...` : message,
        tag: `message-${Date.now()}`,
        data: { roomName, sender }
      }
    );
  }

  /**
   * Show connection status notification
   */
  showConnectionNotification(isConnected) {
    this.showNotification(
      isConnected ? 'Connected' : 'Disconnected',
      {
        body: isConnected ? 'You are back online' : 'You are offline',
        tag: 'connection-status'
      }
    );
  }

  /**
   * Store user status in localStorage
   */
  storeUserStatus(status) {
    try {
      localStorage.setItem('chatApp_userStatus', JSON.stringify({
        status,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Could not store user status:', error);
    }
  }

  /**
   * Get stored user status from localStorage
   */
  getStoredUserStatus() {
    try {
      const stored = localStorage.getItem('chatApp_userStatus');
      if (stored) {
        const data = JSON.parse(stored);
        // Check if status is not too old (24 hours)
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return data.status;
        }
      }
    } catch (error) {
      console.warn('Could not retrieve stored user status:', error);
    }
    return null;
  }

  /**
   * Clear stored user status
   */
  clearStoredUserStatus() {
    try {
      localStorage.removeItem('chatApp_userStatus');
    } catch (error) {
      console.warn('Could not clear stored user status:', error);
    }
  }
}

// Create and export a singleton instance
export const notificationService = new NotificationService();
export default notificationService;
