import React, { useEffect, useState } from 'react';
import { Paper, Stack, Typography, IconButton } from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import { getPinnedMessages, unPinMessage } from '../../services';
import { LongMenu } from '../common';
import './PinnedMessages.css'; // import the CSS

const PinnedMessages = ({ roomId, authToken, userId, scrollToMessage, onMessageUnpinned, refreshTrigger }) => {
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    if (!roomId) return;

    const fetchPinned = async () => {
      // console.log(roomId, authToken, userId, 'for pinned');
      const result = await getPinnedMessages(roomId, authToken, userId);
      if (result.success) {
        // console.log(result, 'pinned message result');
        setPinnedMessages(result.messages ?? []);
      } else {
        console.error('Failed to fetch pinned messages:', result.error);
      }
    };

    fetchPinned();
  }, [roomId, authToken, userId, refreshTrigger]);

  // Function to handle message unpinning
  const handleUnpinMessage = async (messageId) => {
    if (!messageId || !authToken || !userId) {
      return {
        success: false,
        message: 'Missing authentication or message ID!'
      };
    }

    const result = await unPinMessage(messageId, authToken, userId);
    if (result.success) {
      // Remove the unpinned message from the local state
      setPinnedMessages(prev => prev.filter(msg => msg._id !== messageId));
      
      // Notify parent component if callback provided
      if (onMessageUnpinned) {
        onMessageUnpinned(messageId);
      }
      
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
  const getPinnedMessageOptions = (messageId) => [
    {
      label: 'Unpin Message',
      action: () => handleUnpinMessage(messageId)
    },
    {
      label: 'Jump to Message',
      action: async () => {
        if (scrollToMessage) {
          scrollToMessage(messageId);
        }
        return {
          success: true,
          message: 'Scrolling to message...'
        };
      }
    },
    {
      label: 'Copy Message',
      action: async () => {
        const message = pinnedMessages.find(msg => msg._id === messageId);
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

  if (!pinnedMessages?.length) return null;

  return (
    <Stack className="pinned-messages-container">
      {pinnedMessages.map((msg) => {
        const isActive = activeMenu === msg._id;

        return (
          <Paper
            key={msg._id}
            className={`pinned-message${isActive ? ' pinned-message-active' : ''}`}
            // A simple style override, you might want to move this to CSS for maintainability
            style={{
              position: 'relative',
              backgroundColor: isActive ? 'rgba(0,0,0,0.08)' : undefined,
              transition: 'background 0.2s'
            }}
          >
            {/* Pin icon left */}
            <PushPinIcon className="pin-icon" />
            {/* LongMenu at the top-right */}
            <div style={{
              position: 'absolute',
              top: 4,
              right: 4,
              zIndex: 100
            }}>
              <LongMenu
                options={getPinnedMessageOptions(msg._id)}
                menuId={`pinned-menu-${msg._id}`}
                ariaLabel="pinned message options"
                width="15ch"
                // The LongMenu shows/hides based on anchorEl in its own state,
                // so we ask it to notify us when opened/closed:
                onMenuOpen={() => setActiveMenu(msg._id)}
                onMenuClose={() => setActiveMenu(null)}
              />
            </div>
            <div
              className="pinned-message-content"
              onClick={() => scrollToMessage && scrollToMessage(msg._id)}
              style={{
                cursor: scrollToMessage ? 'pointer' : 'default'
              }}
            >
              <Typography variant="body2" className="pinned-by">
                {msg.u?.name || msg.u?.username || 'Unknown User'} pinned
              </Typography>
              <Typography variant="body2" className="pinned-text" title={msg.msg}>
                {msg.msg}
              </Typography>
              <Typography variant="caption" className="pinned-date">
                {new Date(msg.ts).toLocaleString()}
              </Typography>
            </div>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default PinnedMessages;
