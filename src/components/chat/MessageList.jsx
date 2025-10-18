import React, { useEffect, useRef } from 'react';
import Message from './Message';
import './MessageList.css';

const MessageList = ({ messages, currentUserId, authToken, userId, onMessagePinned }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="message-list">
        <div className="no-messages">
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages
      .filter((message) => message.t !== 'message_pinned') // filter pinned messages
      .map((message, index) => (
        
        <Message
          authToken={authToken}
          userId={userId}
          key={message._id || index}
          message={message}
          isOwn={message.u?._id === currentUserId}
          onMessagePinned={onMessagePinned}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
