/**
 * Notification Service
 * Handles sounds, browser notifications, and user activity detection
 */

class NotificationService {
  constructor() {
    this.audioContext = null;
    this.isUserActive = true;
    this.userStatus = 'online'; // Default status
    this.setupUserActivityDetection();
    this.requestNotificationPermission();
    
    // Load user status from localStorage on initialization
    const storedStatus = this.getStoredUserStatus();
    if (storedStatus) {
      this.userStatus = storedStatus;
    }
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
    const preferences = this.getNotificationPreferences();
    if (!preferences.statusChangeSound) return;

    // Play a pleasant chime for status change
    this.playTone(523.25, 150, 'sine', 0.2); // C5
    setTimeout(() => this.playTone(659.25, 150, 'sine', 0.2), 100); // E5
    setTimeout(() => this.playTone(783.99, 200, 'sine', 0.2), 200); // G5
  }

  /**
   * Play message sent sound
   */
  playMessageSentSound() {
    const preferences = this.getNotificationPreferences();
    if (!preferences.sound) return;

    // Play a short, satisfying sound for message sent
    this.playTone(800, 100, 'sine', 0.15);
    setTimeout(() => this.playTone(1000, 100, 'sine', 0.15), 50);
  }

  /**
   * Play new message received sound
   */
  playNewMessageSound() {
    const preferences = this.getNotificationPreferences();
    if (!preferences.messageSound) return;

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
    const preferences = this.getNotificationPreferences();
    if (!preferences.webNotification) return null;

    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: options.tag || 'chat-notification',
        requireInteraction: false,
        silent: !preferences.sound,
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
    const preferences = this.getNotificationPreferences();
    
    // Only show notification if user is not actively viewing and web notifications are enabled
    if (this.isUserActivelyViewing() || !preferences.webNotification) {
      return;
    }

    this.showNotification(
      `New message from ${sender}`,
      {
        body: message.length > 50 ? `${message.substring(0, 50)}...` : message,
        tag: `message-${Date.now()}`,
        data: { roomName, sender },
        priority: preferences.priority
      }
    );
  }

  /**
   * Show notification for different user status types
   */
  showStatusBasedNotification(type, data) {
    const preferences = this.getNotificationPreferences();
    
    switch (type) {
      case 'message':
        if (preferences.messageSound) {
          this.playNewMessageSound();
        }
        if (preferences.webNotification && !this.isUserActivelyViewing()) {
          this.showNewMessageNotification(data.message, data.sender, data.roomName);
        }
        break;
        
      case 'connection':
        if (preferences.sound) {
          this.playConnectionSound(data.isConnected);
        }
        if (preferences.webNotification) {
          this.showConnectionNotification(data.isConnected);
        }
        break;
        
      case 'error':
        this.playErrorSound();
        if (preferences.webNotification) {
          this.showNotification('Error', {
            body: data.message,
            tag: 'error-notification'
          });
        }
        break;
        
      case 'success':
        if (preferences.sound) {
          this.playSuccessSound();
        }
        break;
        
      default:
        break;
    }
  }

  /**
   * Play connection sound based on connection status
   */
  playConnectionSound(isConnected) {
    const preferences = this.getNotificationPreferences();
    if (!preferences.sound) return;

    if (isConnected) {
      // Play ascending tone for connection
      this.playTone(392, 150, 'sine', 0.2); // G4
      setTimeout(() => this.playTone(523.25, 150, 'sine', 0.2), 100); // C5
      setTimeout(() => this.playTone(659.25, 200, 'sine', 0.2), 200); // E5
    } else {
      // Play descending tone for disconnection
      this.playTone(659.25, 150, 'sine', 0.2); // E5
      setTimeout(() => this.playTone(523.25, 150, 'sine', 0.2), 100); // C5
      setTimeout(() => this.playTone(392, 200, 'sine', 0.2), 200); // G4
    }
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
   * Update user status and store in localStorage
   */
  updateUserStatus(status) {
    this.userStatus = status;
    this.storeUserStatus(status);
  }

  /**
   * Get current user status
   */
  getCurrentUserStatus() {
    return this.userStatus;
  }

  /**
   * Get notification preferences based on user status
   */
  getNotificationPreferences() {
    const preferences = {
      online: {
        sound: true,
        webNotification: true,
        messageSound: true,
        statusChangeSound: true,
        priority: 'high'
      },
      away: {
        sound: true,
        webNotification: true,
        messageSound: true,
        statusChangeSound: true,
        priority: 'normal'
      },
      busy: {
        sound: false,
        webNotification: false,
        messageSound: false,
        statusChangeSound: true,
        priority: 'low'
      },
      offline: {
        sound: false,
        webNotification: false,
        messageSound: false,
        statusChangeSound: false,
        priority: 'low'
      }
    };

    return preferences[this.userStatus] || preferences.online;
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

  /**
   * Check if notifications are enabled for current status
   */
  areNotificationsEnabled() {
    const preferences = this.getNotificationPreferences();
    return preferences.webNotification || preferences.sound;
  }

  /**
   * Check if sound notifications are enabled for current status
   */
  areSoundNotificationsEnabled() {
    const preferences = this.getNotificationPreferences();
    return preferences.sound;
  }

  /**
   * Check if web notifications are enabled for current status
   */
  areWebNotificationsEnabled() {
    const preferences = this.getNotificationPreferences();
    return preferences.webNotification;
  }

  /**
   * Get notification priority for current status
   */
  getNotificationPriority() {
    const preferences = this.getNotificationPreferences();
    return preferences.priority;
  }

  /**
   * Update notification preferences for current status
   */
  updateNotificationPreferences(updates) {
    // This could be extended to allow users to customize notification preferences
    // For now, preferences are fixed based on status
    console.log('Notification preferences are currently fixed based on user status');
  }

  /**
   * Handle automatic status updates based on user activity
   */
  handleUserActivity() {
    // If user is busy or offline, don't auto-update status
    if (this.userStatus === 'busy' || this.userStatus === 'offline') {
      return;
    }

    // If user becomes active and was away, consider updating to online
    if (this.userStatus === 'away' && this.isUserActive) {
      // Could automatically set to online, but for now just log
      console.log('User became active while away - consider auto-updating to online');
    }
  }

  /**
   * Handle user becoming inactive
   */
  handleUserInactivity() {
    // If user is online and becomes inactive, could auto-set to away
    if (this.userStatus === 'online' && !this.isUserActive) {
      // Could automatically set to away, but for now just log
      console.log('User became inactive while online - consider auto-updating to away');
    }
  }

  /**
   * Get status-based notification settings for external components
   */
  getStatusNotificationSettings() {
    return {
      status: this.userStatus,
      preferences: this.getNotificationPreferences(),
      isActive: this.isUserActive,
      isViewing: this.isUserActivelyViewing(),
      canReceiveNotifications: this.areNotificationsEnabled(),
      canReceiveSounds: this.areSoundNotificationsEnabled(),
      canReceiveWebNotifications: this.areWebNotificationsEnabled(),
      priority: this.getNotificationPriority()
    };
  }
}

// Create and export a singleton instance
export const notificationService = new NotificationService();
export default notificationService;
