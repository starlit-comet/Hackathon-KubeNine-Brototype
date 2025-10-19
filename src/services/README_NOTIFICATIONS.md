# Enhanced Notification Service

## Overview

The enhanced notification service now supports user status-based notification preferences, localStorage persistence, and intelligent notification handling based on user activity and status.

## Features

### 1. User Status Persistence
- User status is automatically stored in localStorage
- Status persists across browser sessions
- Status is loaded during login process
- Status is cleared on logout

### 2. Status-Based Notification Preferences

#### Online Status
- ✅ Sound notifications enabled
- ✅ Web notifications enabled
- ✅ Message sounds enabled
- ✅ Status change sounds enabled
- Priority: High

#### Away Status
- ✅ Sound notifications enabled
- ✅ Web notifications enabled
- ✅ Message sounds enabled
- ✅ Status change sounds enabled
- Priority: Normal

#### Busy Status
- ❌ Sound notifications disabled
- ❌ Web notifications disabled
- ❌ Message sounds disabled
- ✅ Status change sounds enabled (for user's own changes)
- Priority: Low

#### Offline Status
- ❌ Sound notifications disabled
- ❌ Web notifications disabled
- ❌ Message sounds disabled
- ❌ Status change sounds disabled
- Priority: Low

### 3. Smart Notification Handling
- Notifications respect user's current status
- Web notifications only show when user is not actively viewing
- Sound notifications are muted when user is busy or offline
- Connection status notifications with appropriate sounds

## Usage Examples

### Basic Usage

```javascript
import { notificationService } from '../services';

// Update user status
notificationService.updateUserStatus('busy');

// Check current status
const currentStatus = notificationService.getCurrentUserStatus();

// Get notification preferences
const preferences = notificationService.getNotificationPreferences();

// Show status-based notification
notificationService.showStatusBasedNotification('message', {
  message: 'Hello!',
  sender: 'John Doe',
  roomName: 'General'
});
```

### In React Components

```javascript
import React, { useEffect } from 'react';
import { notificationService } from '../services';

const MyComponent = () => {
  useEffect(() => {
    // Get current notification settings
    const settings = notificationService.getStatusNotificationSettings();
    console.log('Current settings:', settings);
  }, []);

  const handleMessage = (message) => {
    // This will automatically respect user status preferences
    notificationService.showStatusBasedNotification('message', {
      message: message.text,
      sender: message.sender,
      roomName: message.roomName
    });
  };

  return (
    <div>
      {/* Your component content */}
    </div>
  );
};
```

### In AuthContext Integration

```javascript
// During login
const login = (authData) => {
  // ... existing login logic
  
  // Load and set user status from localStorage
  const storedStatus = notificationService.getStoredUserStatus();
  if (storedStatus) {
    notificationService.updateUserStatus(storedStatus);
  } else {
    notificationService.updateUserStatus('online');
  }
};

// During logout
const logout = () => {
  // ... existing logout logic
  
  // Clear user status and reset to default
  notificationService.clearStoredUserStatus();
  notificationService.updateUserStatus('offline');
};
```

## API Reference

### Core Methods

#### `updateUserStatus(status)`
Updates the user status and stores it in localStorage.

#### `getCurrentUserStatus()`
Returns the current user status.

#### `getNotificationPreferences()`
Returns notification preferences based on current status.

#### `showStatusBasedNotification(type, data)`
Shows notifications based on user status preferences.

### Utility Methods

#### `areNotificationsEnabled()`
Checks if notifications are enabled for current status.

#### `areSoundNotificationsEnabled()`
Checks if sound notifications are enabled.

#### `areWebNotificationsEnabled()`
Checks if web notifications are enabled.

#### `getStatusNotificationSettings()`
Returns comprehensive notification settings for external components.

### Sound Methods

#### `playNewMessageSound()`
Plays new message sound (respects user preferences).

#### `playStatusChangeSound()`
Plays status change sound (respects user preferences).

#### `playConnectionSound(isConnected)`
Plays connection/disconnection sound.

#### `playSuccessSound()`
Plays success sound.

#### `playErrorSound()`
Plays error sound.

### Notification Methods

#### `showNewMessageNotification(message, sender, roomName)`
Shows new message notification (respects user preferences).

#### `showStatusChangeNotification(newStatus)`
Shows status change notification.

#### `showConnectionNotification(isConnected)`
Shows connection status notification.

## Status Types

- `online`: User is available and active
- `away`: User is temporarily away
- `busy`: User is busy and should not be disturbed
- `offline`: User is completely offline

## localStorage Keys

- `chatApp_userStatus`: Stores user status with timestamp

## Browser Compatibility

- Requires modern browser with Notification API support
- Audio context support for sound notifications
- localStorage support for persistence

## Best Practices

1. Always check notification preferences before showing notifications
2. Respect user's busy/offline status
3. Use the status-based notification methods for consistent behavior
4. Handle errors gracefully when localStorage is unavailable
5. Request notification permissions early in the application lifecycle
