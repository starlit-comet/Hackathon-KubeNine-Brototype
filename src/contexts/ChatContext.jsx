import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getRooms, getMessages } from '../services/api/rocketchat';
import { getPinnedMessages, getAllPinnedMessages } from '../services/api/messagePinning';

const ChatContext = createContext();

// Action types
const ACTIONS = {
  // Loading states
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Rooms
  SET_ROOMS: 'SET_ROOMS',
  SET_CURRENT_ROOM: 'SET_CURRENT_ROOM',
  UPDATE_ROOM: 'UPDATE_ROOM',
  
  // Messages
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  CLEAR_ROOM_MESSAGES: 'CLEAR_ROOM_MESSAGES',
  
  // Pinned messages
  SET_PINNED_MESSAGES: 'SET_PINNED_MESSAGES',
  SET_ALL_PINNED_MESSAGES: 'SET_ALL_PINNED_MESSAGES',
  ADD_PINNED_MESSAGE: 'ADD_PINNED_MESSAGE',
  REMOVE_PINNED_MESSAGE: 'REMOVE_PINNED_MESSAGE',
  
  // UI state
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
};

// Initial state
const initialState = {
  // Loading states
  loading: {
    rooms: false,
    messages: false,
    pinnedMessages: false,
  },
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
  messagesByRoom: {}, // { roomId: { messages: [], lastFetch: timestamp, hasMore: boolean } }
  
  // Pinned messages
  pinnedMessagesByRoom: {}, // { roomId: { messages: [], lastFetch: timestamp } }
  allPinnedMessages: [],
  allPinnedMessagesLastFetched: null,
  
  // UI state
  sidebarOpen: true,
  notifications: [],
};

// Reducer function
const chatReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: action.payload.loading,
        },
      };
      
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.type]: action.payload.error,
        },
      };
      
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: null,
        },
      };
      
    case ACTIONS.SET_ROOMS:
      return {
        ...state,
        rooms: action.payload,
        roomsLastFetched: Date.now(),
      };
      
    case ACTIONS.SET_CURRENT_ROOM:
      return {
        ...state,
        currentRoom: action.payload,
      };
      
    case ACTIONS.UPDATE_ROOM:
      return {
        ...state,
        rooms: state.rooms.map(room =>
          room._id === action.payload.roomId
            ? { ...room, ...action.payload.updates }
            : room
        ),
      };
      
    case ACTIONS.SET_MESSAGES:
      return {
        ...state,
        messagesByRoom: {
          ...state.messagesByRoom,
          [action.payload.roomId]: {
            messages: action.payload.messages,
            lastFetch: action.payload.lastFetch || Date.now(),
            hasMore: action.payload.hasMore || false,
          },
        },
      };
      
    case ACTIONS.ADD_MESSAGE: {
      const { roomId, message } = action.payload;
      const existingRoomMessages = state.messagesByRoom[roomId];
      
      if (!existingRoomMessages) {
        return {
          ...state,
          messagesByRoom: {
            ...state.messagesByRoom,
            [roomId]: {
              messages: [message],
              lastFetch: Date.now(),
              hasMore: false,
            },
          },
        };
      }
      
      // Check if message already exists to avoid duplicates
      const messageExists = existingRoomMessages.messages.some(
        msg => msg._id === message._id
      );
      
      if (!messageExists) {
        return {
          ...state,
          messagesByRoom: {
            ...state.messagesByRoom,
            [roomId]: {
              ...existingRoomMessages,
              messages: [...existingRoomMessages.messages, message],
            },
          },
        };
      }
      
      return state;
    }
      
    case ACTIONS.UPDATE_MESSAGE: {
      const { roomId: updateRoomId, messageId, updates } = action.payload;
      const roomMessages = state.messagesByRoom[updateRoomId];
      
      if (roomMessages) {
        return {
          ...state,
          messagesByRoom: {
            ...state.messagesByRoom,
            [updateRoomId]: {
              ...roomMessages,
              messages: roomMessages.messages.map(msg =>
                msg._id === messageId ? { ...msg, ...updates } : msg
              ),
            },
          },
        };
      }
      
      return state;
    }
      
    case ACTIONS.CLEAR_ROOM_MESSAGES:
      return {
        ...state,
        messagesByRoom: {
          ...state.messagesByRoom,
          [action.payload]: {
            messages: [],
            lastFetch: null,
            hasMore: false,
          },
        },
      };
      
    case ACTIONS.SET_PINNED_MESSAGES:
      return {
        ...state,
        pinnedMessagesByRoom: {
          ...state.pinnedMessagesByRoom,
          [action.payload.roomId]: {
            messages: action.payload.messages,
            lastFetch: action.payload.lastFetch || Date.now(),
          },
        },
      };
      
    case ACTIONS.SET_ALL_PINNED_MESSAGES:
      return {
        ...state,
        allPinnedMessages: action.payload.messages,
        allPinnedMessagesLastFetched: action.payload.lastFetch || Date.now(),
      };
      
    case ACTIONS.ADD_PINNED_MESSAGE: {
      const { roomId: pinRoomId, message: pinnedMessage } = action.payload;
      const existingPinnedMessages = state.pinnedMessagesByRoom[pinRoomId];
      
      if (!existingPinnedMessages) {
        return {
          ...state,
          pinnedMessagesByRoom: {
            ...state.pinnedMessagesByRoom,
            [pinRoomId]: {
              messages: [pinnedMessage],
              lastFetch: Date.now(),
            },
          },
          allPinnedMessages: [pinnedMessage, ...state.allPinnedMessages],
        };
      }
      
      // Check if already exists
      const pinnedExists = existingPinnedMessages.messages.some(
        msg => msg._id === pinnedMessage._id
      );
      
      if (!pinnedExists) {
        return {
          ...state,
          pinnedMessagesByRoom: {
            ...state.pinnedMessagesByRoom,
            [pinRoomId]: {
              ...existingPinnedMessages,
              messages: [...existingPinnedMessages.messages, pinnedMessage],
            },
          },
          allPinnedMessages: [pinnedMessage, ...state.allPinnedMessages],
        };
      }
      
      return state;
    }
      
    case ACTIONS.REMOVE_PINNED_MESSAGE: {
      const { roomId: removeRoomId, messageId } = action.payload;
      const roomPinnedMessages = state.pinnedMessagesByRoom[removeRoomId];
      
      if (roomPinnedMessages) {
        return {
          ...state,
          pinnedMessagesByRoom: {
            ...state.pinnedMessagesByRoom,
            [removeRoomId]: {
              ...roomPinnedMessages,
              messages: roomPinnedMessages.messages.filter(
                msg => msg._id !== messageId
              ),
            },
          },
          allPinnedMessages: state.allPinnedMessages.filter(
            msg => msg._id !== messageId
          ),
        };
      }
      
      return state;
    }
      
    case ACTIONS.SET_SIDEBAR_OPEN:
      return {
        ...state,
        sidebarOpen: action.payload,
      };
      
    case ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Date.now().toString(),
            timestamp: Date.now(),
            ...action.payload,
          },
        ],
      };
      
    case ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        ),
      };
      
    default:
      return state;
  }
};

// localStorage helpers
const STORAGE_KEYS = {
  ROOMS: 'chatApp_rooms',
  CURRENT_ROOM: 'chatApp_currentRoom',
  MESSAGES: 'chatApp_messages',
  PINNED_MESSAGES: 'chatApp_pinnedMessages',
  ALL_PINNED_MESSAGES: 'chatApp_allPinnedMessages',
  UI_STATE: 'chatApp_uiState',
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

const loadFromStorage = (key, defaultValue = null) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

// Chat Provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load initial data from localStorage
  useEffect(() => {
    console.log('Loading initial data from localStorage...');
    
    const savedRooms = loadFromStorage(STORAGE_KEYS.ROOMS, []);
    const savedCurrentRoom = loadFromStorage(STORAGE_KEYS.CURRENT_ROOM, null);
    const savedMessages = loadFromStorage(STORAGE_KEYS.MESSAGES, {});
    const savedPinnedMessages = loadFromStorage(STORAGE_KEYS.PINNED_MESSAGES, {});
    const savedAllPinnedMessages = loadFromStorage(STORAGE_KEYS.ALL_PINNED_MESSAGES, []);
    const savedUIState = loadFromStorage(STORAGE_KEYS.UI_STATE, {});

    console.log('Loaded from localStorage:', {
      rooms: savedRooms.length,
      currentRoom: !!savedCurrentRoom,
      messages: Object.keys(savedMessages).length,
      pinnedMessages: Object.keys(savedPinnedMessages).length,
      allPinnedMessages: savedAllPinnedMessages.length,
    });

    if (savedRooms.length > 0) {
      dispatch({ type: ACTIONS.SET_ROOMS, payload: savedRooms });
    }
    
    if (savedCurrentRoom) {
      dispatch({ type: ACTIONS.SET_CURRENT_ROOM, payload: savedCurrentRoom });
    }
    
    if (Object.keys(savedMessages).length > 0) {
      Object.entries(savedMessages).forEach(([roomId, data]) => {
        dispatch({
          type: ACTIONS.SET_MESSAGES,
          payload: { roomId, ...data },
        });
      });
    }
    
    if (Object.keys(savedPinnedMessages).length > 0) {
      Object.entries(savedPinnedMessages).forEach(([roomId, data]) => {
        dispatch({
          type: ACTIONS.SET_PINNED_MESSAGES,
          payload: { roomId, ...data },
        });
      });
    }
    
    if (savedAllPinnedMessages.length > 0) {
      dispatch({
        type: ACTIONS.SET_ALL_PINNED_MESSAGES,
        payload: { messages: savedAllPinnedMessages },
      });
    }
    
    if (savedUIState.sidebarOpen !== undefined) {
      dispatch({ type: ACTIONS.SET_SIDEBAR_OPEN, payload: savedUIState.sidebarOpen });
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ROOMS, state.rooms);
  }, [state.rooms]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_ROOM, state.currentRoom);
  }, [state.currentRoom]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MESSAGES, state.messagesByRoom);
  }, [state.messagesByRoom]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PINNED_MESSAGES, state.pinnedMessagesByRoom);
  }, [state.pinnedMessagesByRoom]);

  useEffect(() => {
    // console.log('Saving allPinnedMessages to localStorage:', state.allPinnedMessages.length);
    saveToStorage(STORAGE_KEYS.ALL_PINNED_MESSAGES, state.allPinnedMessages);
  }, [state.allPinnedMessages]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.UI_STATE, {
      sidebarOpen: state.sidebarOpen,
    });
  }, [state.sidebarOpen]);

  // Optimized message fetching with change detection
  const fetchMessagesOptimized = useCallback(async (roomId, authToken, userId, count = 50) => {
    if (!roomId || !authToken || !userId) return;

    // Only show loading if there's no existing data for this room
    const existingRoomData = state.messagesByRoom[roomId];
    if (!existingRoomData || existingRoomData.messages.length === 0) {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { type: 'messages', loading: true } });
    }
    dispatch({ type: ACTIONS.CLEAR_ERROR, payload: 'messages' });

    try {
      const result = await getMessages(roomId, authToken, userId, count);
      
      if (result.success) {
        const newMessages = result.messages.reverse(); // Reverse to show oldest first
        const existingRoomData = state.messagesByRoom[roomId];
        
        // If no existing data, set all messages
        if (!existingRoomData || existingRoomData.messages.length === 0) {
          dispatch({
            type: ACTIONS.SET_MESSAGES,
            payload: {
              roomId,
              messages: newMessages,
              hasMore: newMessages.length === count,
            },
          });
        } else {
          // Check for new messages and only add what's new
          const existingMessageIds = new Set(existingRoomData.messages.map(msg => msg._id));
          const newMessagesOnly = newMessages.filter(msg => !existingMessageIds.has(msg._id));
          
          // Add only new messages
          newMessagesOnly.forEach(message => {
            dispatch({
              type: ACTIONS.ADD_MESSAGE,
              payload: { roomId, message },
            });
          });
        }
      } else {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: { type: 'messages', error: result.error },
        });
      }
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: { type: 'messages', error: error.message },
      });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { type: 'messages', loading: false } });
    }
  }, [state.messagesByRoom]);

  // Fetch rooms
  const fetchRooms = useCallback(async (authToken, userId) => {
    if (!authToken || !userId) return;

    // Only show loading if no rooms are loaded yet
    if (state.rooms.length === 0) {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { type: 'rooms', loading: true } });
    }
    dispatch({ type: ACTIONS.CLEAR_ERROR, payload: 'rooms' });

    try {
      const result = await getRooms(authToken, userId);
      
      if (result.success) {
        dispatch({ type: ACTIONS.SET_ROOMS, payload: result.rooms });
        
        // Auto-select first room if no current room
        if (!state.currentRoom && result.rooms.length > 0) {
          dispatch({ type: ACTIONS.SET_CURRENT_ROOM, payload: result.rooms[0] });
        }
      } else {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: { type: 'rooms', error: result.error },
        });
      }
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: { type: 'rooms', error: error.message },
      });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { type: 'rooms', loading: false } });
    }
  }, [state.currentRoom]);

  // Fetch pinned messages for a room
  const fetchPinnedMessages = useCallback(async (roomId, authToken, userId) => {
    if (!roomId || !authToken || !userId) return;

    dispatch({ type: ACTIONS.SET_LOADING, payload: { type: 'pinnedMessages', loading: true } });
    dispatch({ type: ACTIONS.CLEAR_ERROR, payload: 'pinnedMessages' });

    try {
      const result = await getPinnedMessages(roomId, authToken, userId);
      
      if (result.success) {
        dispatch({
          type: ACTIONS.SET_PINNED_MESSAGES,
          payload: {
            roomId,
            messages: result.messages || [],
          },
        });
      } else {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: { type: 'pinnedMessages', error: result.error },
        });
      }
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: { type: 'pinnedMessages', error: error.message },
      });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { type: 'pinnedMessages', loading: false } });
    }
  }, []);

  // Fetch all pinned messages for dashboard
  const fetchAllPinnedMessages = useCallback(async (rooms, authToken, userId) => {
    if (!authToken || !userId || !rooms?.length) {
      console.log('Missing required parameters for fetchAllPinnedMessages:', { authToken: !!authToken, userId: !!userId, roomsLength: rooms?.length });
      return;
    }

    console.log('Fetching all pinned messages for rooms:', rooms.length);
    // Only show loading if no pinned messages are loaded yet
    if (state.allPinnedMessages.length === 0) {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { type: 'pinnedMessages', loading: true } });
    }
    dispatch({ type: ACTIONS.CLEAR_ERROR, payload: 'pinnedMessages' });

    try {
      const pinnedMessagesPromises = rooms.map(room => 
        getAllPinnedMessages(room._id, authToken, userId)
      );
      
      const results = await Promise.all(pinnedMessagesPromises);
      const allPinned = [];
      
      results.forEach((result, index) => {
        console.log(`Room ${rooms[index].name} pinned messages result:`, result);
        if (result.success && result.messages?.length > 0) {
          // Add room info to each pinned message
          const messagesWithRoom = result.messages.map(msg => ({
            ...msg,
            roomInfo: {
              id: rooms[index]._id,
              name: rooms[index].name || rooms[index].fname || 'Unnamed Room',
              type: rooms[index].t
            }
          }));
          allPinned.push(...messagesWithRoom);
        }
      });
      
      console.log('Total pinned messages found:', allPinned.length);
      
      // Sort by pinned date (most recent first)
      allPinned.sort((a, b) => new Date(b.pinnedAt) - new Date(a.pinnedAt));
      
      dispatch({
        type: ACTIONS.SET_ALL_PINNED_MESSAGES,
        payload: { messages: allPinned },
      });
    } catch (error) {
      console.error('Error fetching all pinned messages:', error);
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: { type: 'pinnedMessages', error: error.message },
      });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { type: 'pinnedMessages', loading: false } });
    }
  }, []);

  // Select room
  const selectRoom = useCallback((room) => {
    dispatch({ type: ACTIONS.SET_CURRENT_ROOM, payload: room });
  }, []);

  // Add message
  const addMessage = useCallback((roomId, message) => {
    dispatch({
      type: ACTIONS.ADD_MESSAGE,
      payload: { roomId, message },
    });
  }, []);

  // Get messages for room
  const getMessagesForRoom = useCallback((roomId) => {
    return state.messagesByRoom[roomId]?.messages || [];
  }, [state.messagesByRoom]);

  // Get pinned messages for room
  const getPinnedMessagesForRoom = useCallback((roomId) => {
    return state.pinnedMessagesByRoom[roomId]?.messages || [];
  }, [state.pinnedMessagesByRoom]);

  // Add pinned message
  const addPinnedMessage = useCallback((roomId, message) => {
    dispatch({
      type: ACTIONS.ADD_PINNED_MESSAGE,
      payload: { roomId, message },
    });
  }, []);

  // Remove pinned message
  const removePinnedMessage = useCallback((roomId, messageId) => {
    dispatch({
      type: ACTIONS.REMOVE_PINNED_MESSAGE,
      payload: { roomId, messageId },
    });
  }, []);

  // UI actions
  const toggleSidebar = useCallback(() => {
    dispatch({ type: ACTIONS.SET_SIDEBAR_OPEN, payload: !state.sidebarOpen });
  }, [state.sidebarOpen]);

  const addNotification = useCallback((notification) => {
    dispatch({ type: ACTIONS.ADD_NOTIFICATION, payload: notification });
  }, []);

  const removeNotification = useCallback((notificationId) => {
    dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: notificationId });
  }, []);

  const value = {
    // State
    ...state,
    
    // Actions
    fetchRooms,
    fetchMessagesOptimized,
    fetchPinnedMessages,
    fetchAllPinnedMessages,
    selectRoom,
    addMessage,
    getMessagesForRoom,
    getPinnedMessagesForRoom,
    addPinnedMessage,
    removePinnedMessage,
    toggleSidebar,
    addNotification,
    removeNotification,
    
    // Direct dispatch for complex actions
    dispatch,
    ACTIONS,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
