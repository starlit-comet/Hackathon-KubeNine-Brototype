import React from 'react';
import './Message.css';
import { LongMenu } from '../common';
import { pinMessage } from '../../services';
import { formatTime, formatDate, getMessageDate, shouldShowDate } from '../../utils';

const Message = ({ message, isOwn, authToken, userId, onMessagePinned }) => {
  // console.log(message,'message component')
  
  // Message-specific menu options
  const messageOptions = [
    {
      label: 'Pin Message',
      action: async () => {
        if (!message._id || !authToken || !userId) {
          return {
            success: false,
            message: 'Missing authentication or message ID!'
          };
        }

        const result = await pinMessage(message._id, authToken, userId);
        if (result.success && onMessagePinned) {
          onMessagePinned();
        }
        return {
          success: result.success,
          message: result.success 
            ? 'Message pinned successfully!' 
            : `Failed to pin message: ${result.error}`
        };
      }
    },
    {
      label: 'Copy Message',
      action: async () => {
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
    },
    {
      label: 'Reply',
      action: async () => {
        // This would trigger a reply action in the parent component
        // For now, just show a success message
        return {
          success: true,
          message: 'Reply functionality would be implemented here'
        };
      }
    }
  ];


  return (
    <div className={`message-container ${isOwn ? 'own' : 'other'}`}>
      <div className="message-bubble">
        <div className="message-header">
          <span className="sender-name">
            {message.u?.name || message.u?.username || 'Unknown User'}
          </span>
          <span className="message-time">
            {formatTime(message.ts)}
          </span>
        <LongMenu 
          options={messageOptions} 
          menuId={`message-menu-${message._id}`}
          ariaLabel="message options"
        />
        </div>
        
        <div className="message-content">
          {message.msg}
        </div>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="message-attachments">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="attachment">
                {attachment.image_url && (
                  <img 
                    src={attachment.image_url} 
                    alt="Attachment" 
                    className="attachment-image"
                  />
                )}
                {attachment.title && (
                  <div className="attachment-title">{attachment.title}</div>
                )}
                {attachment.description && (
                  <div className="attachment-description">{attachment.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
