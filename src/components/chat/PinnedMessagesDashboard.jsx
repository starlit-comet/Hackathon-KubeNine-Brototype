import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Chip, IconButton } from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { getAllPinnedMessages, unPinMessage } from '../../services/api/messagePinning';
import { LongMenu } from '../common';
import './PinnedMessagesDashboard.css';

const PinnedMessagesDashboard = ({ authToken, userId, rooms, onMessageClick }) => {
  const [allPinnedMessages, setAllPinnedMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  // Fetch all pinned messages from all rooms
  const fetchAllPinnedMessages = async () => {
    if (!authToken || !userId || !rooms?.length) return;
    
    setLoading(true);
    try {
      const pinnedMessagesPromises = rooms.map(room => 
        getAllPinnedMessages(room._id, authToken, userId)
      );
      
      const results = await Promise.all(pinnedMessagesPromises);
      const allPinned = [];
      
      results.forEach((result, index) => {
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
      
      // Sort by pinned date (most recent first)
      allPinned.sort((a, b) => new Date(b.pinnedAt) - new Date(a.pinnedAt));
      
      setAllPinnedMessages(allPinned);
    } catch (error) {
      console.error('Error fetching all pinned messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPinnedMessages();
  }, [authToken, userId, rooms]);

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
      // Remove the unpinned message from the local state
      setAllPinnedMessages(prev => prev.filter(msg => msg._id !== messageId));
      
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

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const displayMessages = expanded ? allPinnedMessages : allPinnedMessages.slice(0, 3);
  const hasMoreMessages = allPinnedMessages.length > 3;

  if (!allPinnedMessages.length && !loading) {
    return null;
  }

  return (
    <Paper className="pinned-dashboard" elevation={2}>
      <Box className="pinned-dashboard-header">
        <Box className="pinned-dashboard-title">
          <PushPinIcon className="pin-icon" />
          <Typography variant="h6" className="dashboard-title">
            Pinned Messages
          </Typography>
          <Chip 
            label={allPinnedMessages.length} 
            size="small" 
            color="primary"
            className="pinned-count"
          />
        </Box>
        
        {hasMoreMessages && (
          <IconButton 
            onClick={toggleExpanded} 
            size="small"
            className="expand-button"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>

      {loading ? (
        <Box className="pinned-dashboard-loading">
          <Typography variant="body2" color="textSecondary">
            Loading pinned messages...
          </Typography>
        </Box>
      ) : (
        <Box className="pinned-dashboard-content">
          {displayMessages.map((message) => {
            const isActive = activeMenu === message._id;
            
            return (
              <Paper
                key={message._id}
                className={`pinned-dashboard-item ${isActive ? 'active' : ''}`}
              >
                {/* Room info chip */}
                <Box className="room-info">
                  <Chip
                    label={message.roomInfo.name}
                    size="small"
                    variant="outlined"
                    className="room-chip"
                  />
                  <Typography variant="caption" className="pinned-date">
                    {new Date(message.pinnedAt).toLocaleDateString()}
                  </Typography>
                </Box>

                {/* Message content */}
                <Box className="message-content">
                  <Typography variant="body2" className="pinned-text">
                    {message.msg}
                  </Typography>
                  <Typography variant="caption" className="pinned-by">
                    by {message.u?.name || message.u?.username || 'Unknown User'}
                  </Typography>
                </Box>

                {/* Menu button */}
                <Box className="message-actions">
                  <LongMenu
                    options={getPinnedMessageOptions(message._id, message.roomInfo.id)}
                    menuId={`dashboard-menu-${message._id}`}
                    ariaLabel="pinned message options"
                    width="15ch"
                    onMenuOpen={() => setActiveMenu(message._id)}
                    onMenuClose={() => setActiveMenu(null)}
                  />
                </Box>
              </Paper>
            );
          })}
          
          {hasMoreMessages && !expanded && (
            <Box className="show-more-container">
              <Typography 
                variant="body2" 
                color="primary" 
                className="show-more-text"
                onClick={toggleExpanded}
              >
                Show {allPinnedMessages.length - 3} more...
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default PinnedMessagesDashboard;
