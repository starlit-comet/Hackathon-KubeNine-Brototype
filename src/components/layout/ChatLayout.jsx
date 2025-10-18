import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { RoomList, MessageList, MessageInput, PinnedMessages, AllPinnedMessages } from '../chat';
import { UserStatus } from '../common';
import { notificationService } from '../../services';
import './ChatLayout.css';

const   ChatLayout = () => {
  const [showAllPinned, setShowAllPinned] = useState(false);
  const [userStatus, setUserStatus] = useState({ status: 'online', message: '', connectionStatus: 'online' });
  const { authToken, userId, user, logout } = useAuth();
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
    fetchAllPinnedMessages,
    removePinnedMessage,
  } = useChat();

  // Get messages for current room
  const messages = currentRoom ? getMessagesForRoom(currentRoom._id) : [];
// console.log('rooms',rooms)
// console.log('chats',messages)
  // Load rooms on mount and handle login
  useEffect(() => {
    if (authToken && userId) {
      fetchRooms(authToken, userId);
      
      // Load stored user status on login
      const storedStatus = notificationService.getStoredUserStatus();
      if (storedStatus) {
        setUserStatus(prev => ({ ...prev, status: storedStatus }));
        // Play success sound for login
        notificationService.playSuccessSound();
      }
    }
  }, [authToken, userId, fetchRooms]);

  // Load messages when room changes
  useEffect(() => {
    if (currentRoom && authToken && userId) {
      fetchMessagesOptimized(currentRoom._id, authToken, userId);
    }
  }, [currentRoom, authToken, userId, fetchMessagesOptimized]);

  // Poll for new messages every 3 seconds (optimized)
  useEffect(() => {
    if (!currentRoom || !authToken || !userId) return;

    const interval = setInterval(() => {
      fetchMessagesOptimized(currentRoom._id, authToken, userId);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentRoom, authToken, userId, fetchMessagesOptimized]);

  const handleRoomSelect = (room) => {
    selectRoom(room);
  };

  const handleNewMessage = (message) => {
    // This will be handled by the context when message is sent
  };

  const handleMessageClick = (messageId, roomId) => {
    // Find the room and switch to it, then scroll to the message
    const targetRoom = rooms.find(room => room._id === roomId);
    if (targetRoom) {
      selectRoom(targetRoom);
      // Hide AllPinnedMessages when navigating to a specific message
      setShowAllPinned(false);
      // Scroll to message after a short delay to allow room to load
      setTimeout(() => {
        const element = document.getElementById(`message-${messageId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  };

  const toggleAllPinned = () => {
    setShowAllPinned(!showAllPinned);
    // Clear current room when showing all pinned messages
    if (!showAllPinned) {
      selectRoom(null);
    }
  };

  const handleLogout = () => {
    // Clear stored user status on logout
    notificationService.clearStoredUserStatus();
    logout();
  };

  const handleStatusChange = (newStatus) => {
    setUserStatus(newStatus);
  };

  // Only show loader if rooms haven't been loaded yet (initial load)
  if (loading.rooms && rooms.length === 0) {
    return (
      <div className="chat-layout">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  if (errors.rooms) {
    return (
      <div className="chat-layout">
        <div className="error-container">
          <h2>Error</h2>
          <p>{errors.rooms}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <div className="chat-header">
        <div className="user-info">
          <span className="user-name">{user?.name || user?.username}</span>
          <UserStatus 
            authToken={authToken}
            userId={userId}
            onStatusChange={handleStatusChange}
          />
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <div className="chat-content">
            <div className="sidebar">
              <RoomList 
                rooms={rooms} 
                currentRoom={currentRoom} 
                onRoomSelect={handleRoomSelect}
                authToken={authToken}
                userId={userId}
                onMessageClick={handleMessageClick}
                onToggleAllPinned={toggleAllPinned}
                showAllPinned={showAllPinned}
              />
            </div>
        
        {/* <div className="chat-area">
          {currentRoom ? (
            <>
              <div className="chat-header-room">
                <h3>#{currentRoom.name}</h3>
                <p>{currentRoom.topic || 'No topic set'}</p>
              </div>
              
              <MessageList 
                authToken={authToken}
                userId={userId}
                messages={messages} 
                currentUserId={userId}
              />
              
              <MessageInput 
                roomId={currentRoom._id}
                onNewMessage={handleNewMessage}
              />
            </>
          ) : (
            <div className="no-room-selected">
              <h3>Select a room to start chatting</h3>
              <p>Choose a room from the sidebar to view messages</p>
            </div>
          )}

        </div> */}

        <div className="chat-area">
          {showAllPinned ? (
            <AllPinnedMessages 
              authToken={authToken}
              userId={userId}
              onMessageClick={handleMessageClick}
              onClose={() => setShowAllPinned(false)}
            />
          ) : currentRoom ? (
            <>
              <div className="chat-header-room">
                <h3>#{currentRoom.name}</h3>
                <p>{currentRoom.topic || 'No topic set'}</p>
              </div>

              {/* Pinned messages just below header */}
              <PinnedMessages
                roomId={currentRoom._id}
                authToken={authToken}
                userId={userId}
                scrollToMessage={(messageId) => {
                  const element = document.getElementById(`message-${messageId}`);
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                onMessageUnpinned={(messageId) => {
                  // Remove from context
                  removePinnedMessage(currentRoom._id, messageId);
                }}
                key={`pinned-${currentRoom._id}`} // Force re-render when room changes
              />

              <MessageList
                authToken={authToken}
                userId={userId}
                messages={messages}
                currentUserId={userId}
                onMessagePinned={() => {
                  // Refresh pinned messages
                  fetchAllPinnedMessages(rooms, authToken, userId);
                }}
              />

              <MessageInput roomId={currentRoom._id} onNewMessage={handleNewMessage} />
            </>
          ) : (
            <div className="no-room-selected">
              <h3>Select a room to start chatting</h3>
              <p>Choose a room from the sidebar to view messages</p>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default ChatLayout;
