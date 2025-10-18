import React, { useState } from 'react';
import { Paper, Typography, Box, Chip, IconButton } from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import CloseIcon from '@mui/icons-material/Close';
import { useChat } from '../../contexts/ChatContext';
import { unPinMessage } from '../../services/api/messagePinning';
import { LongMenu } from '../common';
import './AllPinnedMessages.css';

const AllPinnedMessages = ({ authToken, userId, onMessageClick, onClose }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  
  const {
    allPinnedMessages,
    loading,
    fetchAllPinnedMessages,
    removePinnedMessage,
    rooms,
  } = useChat();

  // Debug: Log when component loads data
  React.useEffect(() => {
    console.log('AllPinnedMessages component loaded with:', {
      allPinnedMessagesCount: allPinnedMessages?.length || 0,
      loading: loading.pinnedMessages,
      authToken: !!authToken,
      userId: !!userId,
      roomsCount: rooms?.length || 0
    });
    
    // Debug localStorage data
    const localStorageData = localStorage.getItem('chatApp_allPinnedMessages');
    if (localStorageData) {
      try {
        const parsed = JSON.parse(localStorageData);
        console.log('localStorage allPinnedMessages:', {
          count: parsed?.length || 0,
          data: parsed
        });
      } catch (error) {
        console.error('Error parsing localStorage allPinnedMessages:', error);
      }
    } else {
      console.log('No localStorage data found for allPinnedMessages');
    }
  }, [allPinnedMessages, loading.pinnedMessages, authToken, userId, rooms]);

  // Function to handle message unpinning
  const handleUnpinMessage = async (messageId, roomId) => {
    if (!messageId || !authToken || !userId) {
      return {
        success: false,
        message: 'Missing authentication or message ID!'
      };
    }

    const result = await unPinMessage(messageId, authToken, userId);
    if (result.success) {
      // Remove from context
      removePinnedMessage(roomId, messageId);
      
      return {
        success: true,
        message: 'Message unpinned successfully!'
      };
    } else {
      return {
        success: false,
        message: `Failed to unpin message: ${result.error}`
      };
    }
  };

  // Pinned message-specific menu options
  const getPinnedMessageOptions = (messageId, roomId) => [
    {
      label: 'Unpin Message',
      action: () => handleUnpinMessage(messageId, roomId)
    },
    {
      label: 'Jump to Message',
      action: async () => {
        if (onMessageClick) {
          onMessageClick(messageId, roomId);
        }
        return {
          success: true,
          message: 'Navigating to message...'
        };
      }
    },
    {
      label: 'Copy Message',
      action: async () => {
        const message = allPinnedMessages.find(msg => msg._id === messageId);
        if (message) {
          try {
            await navigator.clipboard.writeText(message.msg);
            return {
              success: true,
              message: 'Message copied to clipboard!'
            };
          } catch (error) {
            return {
              success: false,
              message: 'Failed to copy message to clipboard'
            };
          }
        }
        return {
          success: false,
          message: 'Message not found'
        };
      }
    }
  ];

  // Function to refresh pinned messages
  const handleRefresh = () => {
    if (authToken && userId && rooms?.length > 0) {
      fetchAllPinnedMessages(rooms, authToken, userId);
    }
  };

  // Group pinned messages by room
  const groupedMessages = allPinnedMessages.reduce((acc, message) => {
    const roomId = message.roomInfo?.id || 'unknown';
    if (!acc[roomId]) {
      acc[roomId] = {
        roomName: message.roomInfo?.name || 'Unknown Room',
        messages: []
      };
    }
    acc[roomId].messages.push(message);
    return acc;
  }, {});

  // Only show loading if we're fetching for the first time and have no data
  if (loading.pinnedMessages && allPinnedMessages.length === 0 && !localStorage.getItem('chatApp_allPinnedMessages')) {
    return (
      <div className="all-pinned-messages-container">
        <div className="all-pinned-header">
          <div className="header-left">
            <PushPinIcon className="pin-icon" />
            <Typography variant="h6">All Pinned Messages</Typography>
          </div>
          {onClose && (
            <IconButton 
              onClick={onClose}
              size="small"
              className="close-button"
              title="Close All Pinned Messages"
            >
              <CloseIcon />
            </IconButton>
          )}
        </div>
        <div className="loading-container">
          <Typography variant="body2" color="textSecondary">
            Loading pinned messages...
          </Typography>
        </div>
      </div>
    );
  }

  if (allPinnedMessages.length === 0) {
    return (
      <div className="all-pinned-messages-container">
        <div className="all-pinned-header">
          <div className="header-left">
            <PushPinIcon className="pin-icon" />
            <Typography variant="h6">All Pinned Messages</Typography>
          </div>
          <div className="header-actions">
            <IconButton 
              onClick={handleRefresh}
              size="small"
              className="refresh-button"
              title="Refresh pinned messages"
            >
              🔄
            </IconButton>
            {onClose && (
              <IconButton 
                onClick={onClose}
                size="small"
                className="close-button"
                title="Close All Pinned Messages"
              >
                <CloseIcon />
              </IconButton>
            )}
          </div>
        </div>
        <div className="empty-container">
          <Typography variant="body2" color="textSecondary">
            No pinned messages found across all rooms.
          </Typography>
          <Typography variant="caption" color="textSecondary" style={{ marginTop: 8 }}>
            Pin messages in any chat to see them here.
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="all-pinned-messages-container">
      {/* Header */}
      <div className="all-pinned-header">
        <div className="header-left">
          <PushPinIcon className="pin-icon" />
          <Typography variant="h6">All Pinned Messages</Typography>
          <Chip 
            label={allPinnedMessages.length} 
            size="small" 
            color="primary"
            className="pinned-count"
          />
        </div>
        <div className="header-actions">
          <IconButton 
            onClick={handleRefresh}
            size="small"
            className="refresh-button"
            title="Refresh pinned messages"
          >
            🔄
          </IconButton>
          {onClose && (
            <IconButton 
              onClick={onClose}
              size="small"
              className="close-button"
              title="Close All Pinned Messages"
            >
              <CloseIcon />
            </IconButton>
          )}
        </div>
      </div>

      {/* Messages grouped by room */}
      <div className="all-pinned-content">
        {Object.entries(groupedMessages).map(([roomId, roomData]) => (
          <div key={roomId} className="room-section">
            <div className="room-header">
              <Typography variant="subtitle2" className="room-name">
                {roomData.roomName}
              </Typography>
              <Chip 
                label={roomData.messages.length} 
                size="small" 
                variant="outlined"
                className="room-count"
              />
            </div>
            
            <div className="room-messages">
              {roomData.messages.map((message) => {
                const isActive = activeMenu === message._id;
                
                return (
                  <Paper
                    key={message._id}
                    className={`pinned-message-item ${isActive ? 'active' : ''}`}
                    elevation={1}
                  >
                    <div className="message-header">
                      <Typography variant="caption" className="message-time">
                        {new Date(message.pinnedAt).toLocaleString()}
                      </Typography>
                      <div className="message-actions">
                        <LongMenu
                          options={getPinnedMessageOptions(message._id, roomId)}
                          menuId={`all-pinned-menu-${message._id}`}
                          ariaLabel="pinned message options"
                          width="15ch"
                          onMenuOpen={() => setActiveMenu(message._id)}
                          onMenuClose={() => setActiveMenu(null)}
                        />
                      </div>
                    </div>
                    
                    <div className="message-content">
                      <Typography variant="body2" className="message-text">
                        {message.msg}
                      </Typography>
                      <Typography variant="caption" className="message-author">
                        by {message.u?.name || message.u?.username || 'Unknown User'}
                      </Typography>
                    </div>
                  </Paper>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllPinnedMessages;
