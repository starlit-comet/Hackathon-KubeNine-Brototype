# Context API Implementation

This document outlines the Context API implementation for the chat application, including state management, localStorage persistence, and optimized message fetching.

## 📁 Context Structure

```
src/contexts/
├── AuthContext.jsx          # Authentication context
├── ChatContext.jsx          # Chat data management context
└── README.md               # This file
```

## 🏗️ Architecture Overview

### ChatContext Features

**1. Centralized State Management:**
- All chat data (rooms, messages, pinned messages) in one context
- Optimized message fetching with change detection
- Automatic localStorage persistence
- Efficient re-renders with smart state updates

**2. localStorage Persistence:**
- Automatic saving of important state
- Restore state on app reload
- Smart persistence triggers
- Error handling for storage operations

**3. Optimized Message Fetching:**
- Change detection to prevent unnecessary re-renders
- Only adds new messages, doesn't replace entire arrays
- Maintains message history across room switches
- Efficient polling with localStorage comparison

## 🔧 State Structure

```javascript
{
  // Loading states
  loading: {
    rooms: false,
    messages: false,
    pinnedMessages: false,
  },
  
  // Error states
  errors: {
    rooms: null,
    messages: null,
    pinnedMessages: null,
  },
  
  // Rooms data
  rooms: [],
  currentRoom: null,
  roomsLastFetched: null,
  
  // Messages data - optimized structure
  messagesByRoom: {
    [roomId]: {
      messages: [...],      // Array of messages
      lastFetch: timestamp, // Last fetch timestamp
      hasMore: boolean      // Whether more messages available
    }
  },
  
  // Pinned messages
  pinnedMessagesByRoom: {
    [roomId]: {
      messages: [...],
      lastFetch: timestamp
    }
  },
  allPinnedMessages: [],
  allPinnedMessagesLastFetched: null,
  
  // UI state
  sidebarOpen: true,
  notifications: [],
}
```

## 🎯 Key Optimizations

### 1. Message Fetching Optimization

**Problem Solved:**
- Previous implementation replaced entire message arrays on every fetch
- Caused unnecessary re-renders of all message components
- Lost scroll position and user experience

**Solution Implemented:**
```javascript
const fetchMessagesOptimized = useCallback(async (roomId, authToken, userId, count = 50) => {
  // Fetch messages from API
  const result = await getMessages(roomId, authToken, userId, count);
  const newMessages = result.messages.reverse();
  
  // Check for existing data
  const existingRoomData = state.messagesByRoom[roomId];
  
  if (!existingRoomData || existingRoomData.messages.length === 0) {
    // First load - set all messages
    dispatch({
      type: ACTIONS.SET_MESSAGES,
      payload: { roomId, messages: newMessages, hasMore: newMessages.length === count }
    });
  } else {
    // Check for new messages and only add what's new
    const existingMessageIds = new Set(existingRoomData.messages.map(msg => msg._id));
    const newMessagesOnly = newMessages.filter(msg => !existingMessageIds.has(msg._id));
    
    // Add only new messages
    newMessagesOnly.forEach(message => {
      dispatch({
        type: ACTIONS.ADD_MESSAGE,
        payload: { roomId, message }
      });
    });
  }
}, [state.messagesByRoom]);
```

**Benefits:**
- ✅ Only new messages trigger re-renders
- ✅ Maintains scroll position
- ✅ Preserves message history
- ✅ Efficient memory usage

### 2. localStorage Persistence

**What Gets Saved:**
```javascript
const STORAGE_KEYS = {
  ROOMS: 'chatApp_rooms',
  CURRENT_ROOM: 'chatApp_currentRoom',
  MESSAGES: 'chatApp_messages',
  PINNED_MESSAGES: 'chatApp_pinnedMessages',
  ALL_PINNED_MESSAGES: 'chatApp_allPinnedMessages',
  UI_STATE: 'chatApp_uiState',
};
```

**Persistence Triggers:**
- Room list changes
- Current room selection
- Message updates
- Pinned message changes
- UI state changes

**Benefits:**
- ✅ App state persists across browser sessions
- ✅ Faster app loading
- ✅ Better user experience
- ✅ Offline capability (with cached data)

### 3. Smart State Updates

**Reducer Pattern:**
```javascript
case ACTIONS.ADD_MESSAGE:
  const { roomId, message } = action.payload;
  const existingRoomMessages = state.messagesByRoom[roomId];
  
  if (!existingRoomMessages) {
    // Create new room message structure
    return {
      ...state,
      messagesByRoom: {
        ...state.messagesByRoom,
        [roomId]: { messages: [message], lastFetch: Date.now(), hasMore: false }
      }
    };
  }
  
  // Check for duplicates
  const messageExists = existingRoomMessages.messages.some(msg => msg._id === message._id);
  
  if (!messageExists) {
    return {
      ...state,
      messagesByRoom: {
        ...state.messagesByRoom,
        [roomId]: {
          ...existingRoomMessages,
          messages: [...existingRoomMessages.messages, message]
        }
      }
    };
  }
  
  return state; // No changes needed
```

**Benefits:**
- ✅ Prevents duplicate messages
- ✅ Efficient state updates
- ✅ Maintains referential stability
- ✅ Reduces unnecessary re-renders

## 🎣 Usage Examples

### Using ChatContext in Components

```javascript
import { useChat } from '../../contexts/ChatContext';

const MyComponent = () => {
  const {
    // State
    rooms,
    currentRoom,
    loading,
    errors,
    
    // Actions
    fetchRooms,
    fetchMessagesOptimized,
    selectRoom,
    getMessagesForRoom,
    addMessage,
    fetchAllPinnedMessages,
    addPinnedMessage,
    removePinnedMessage,
    
    // UI actions
    toggleSidebar,
    addNotification,
  } = useChat();

  // Get messages for current room
  const messages = currentRoom ? getMessagesForRoom(currentRoom._id) : [];

  // Fetch rooms
  useEffect(() => {
    if (authToken && userId) {
      fetchRooms(authToken, userId);
    }
  }, [authToken, userId]);

  // Handle room selection
  const handleRoomSelect = (room) => {
    selectRoom(room);
  };

  // Send message
  const handleSendMessage = (message) => {
    addMessage(currentRoom._id, message);
  };

  return (
    // Component JSX
  );
};
```

### Message Fetching with Optimization

```javascript
// In ChatLayout component
useEffect(() => {
  if (currentRoom && authToken && userId) {
    fetchMessagesOptimized(currentRoom._id, authToken, userId);
  }
}, [currentRoom, authToken, userId, fetchMessagesOptimized]);

// Polling with optimization
useEffect(() => {
  if (!currentRoom || !authToken || !userId) return;

  const interval = setInterval(() => {
    fetchMessagesOptimized(currentRoom._id, authToken, userId);
  }, 3000);

  return () => clearInterval(interval);
}, [currentRoom, authToken, userId, fetchMessagesOptimized]);
```

## 📊 Performance Benefits

### Before (Component State):
- ❌ Data lost on room switching
- ❌ Entire message arrays replaced on every fetch
- ❌ Unnecessary re-renders of all message components
- ❌ Poor scroll position management
- ❌ No data persistence

### After (Context API):
- ✅ Persistent message cache across rooms
- ✅ Only new messages trigger re-renders
- ✅ Efficient state updates with change detection
- ✅ Maintains scroll position and user experience
- ✅ Automatic localStorage persistence
- ✅ Smart message deduplication

## 🔄 Data Flow

### 1. Initial Load
```
App Mount → Auth Check → Load from localStorage → Fetch Rooms → Select Room → Fetch Messages
```

### 2. Room Selection
```
User Clicks Room → selectRoom() → Context Updates → Component Re-renders with New Messages
```

### 3. Message Polling
```
Interval Trigger → fetchMessagesOptimized() → Check for Changes → Add Only New Messages → Update Context
```

### 4. Message Sending
```
User Sends Message → API Call → addMessage() → Context Updates → UI Updates Immediately
```

## 🛠️ Context Actions

### Room Management
- `fetchRooms(authToken, userId)` - Fetch all rooms
- `selectRoom(room)` - Select a room
- `getMessagesForRoom(roomId)` - Get messages for specific room

### Message Management
- `fetchMessagesOptimized(roomId, authToken, userId)` - Fetch messages with optimization
- `addMessage(roomId, message)` - Add new message
- `getMessagesForRoom(roomId)` - Get messages for room

### Pinned Messages
- `fetchPinnedMessages(roomId, authToken, userId)` - Fetch pinned messages for room
- `fetchAllPinnedMessages(rooms, authToken, userId)` - Fetch all pinned messages
- `addPinnedMessage(roomId, message)` - Add pinned message
- `removePinnedMessage(roomId, messageId)` - Remove pinned message

### UI Management
- `toggleSidebar()` - Toggle sidebar visibility
- `addNotification(notification)` - Add notification
- `removeNotification(notificationId)` - Remove notification

## 🔧 Error Handling

```javascript
// Loading states
const { loading, errors } = useChat();

if (loading.rooms) {
  return <LoadingSpinner />;
}

if (errors.rooms) {
  return <ErrorMessage error={errors.rooms} />;
}
```

## 📝 Best Practices

### 1. Use useCallback for Actions
```javascript
const fetchRooms = useCallback(async (authToken, userId) => {
  // Implementation
}, []);
```

### 2. Optimize Dependencies
```javascript
useEffect(() => {
  if (authToken && userId) {
    fetchRooms(authToken, userId);
  }
}, [authToken, userId, fetchRooms]); // Only include necessary dependencies
```

### 3. Handle Loading States
```javascript
const { loading, errors } = useChat();

if (loading.messages) {
  return <MessageLoadingSpinner />;
}
```

### 4. Error Boundaries
```javascript
<ErrorBoundary>
  <ChatProvider>
    <App />
  </ChatProvider>
</ErrorBoundary>
```

This Context API implementation provides a robust, performant, and user-friendly state management solution for the chat application without the complexity of Redux, while maintaining excellent performance through smart optimizations.
