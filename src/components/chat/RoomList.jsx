import React from 'react';
import PushPinIcon from '@mui/icons-material/PushPin';
import './RoomList.css';

const RoomList = ({ rooms, currentRoom, onRoomSelect, authToken, userId, onMessageClick, onToggleAllPinned, showAllPinned }) => {

  return (
    <div className="room-list">
      <div className="room-list-header">
        <h3>Channels</h3>
        <div className="header-actions">
          <span className="room-count">{rooms.length}</span>
          {authToken && userId && (
            <button 
              className={`pin-button ${showAllPinned ? 'active' : ''}`}
              onClick={onToggleAllPinned}
              title={showAllPinned ? 'Hide All Pinned Messages' : 'Show All Pinned Messages'}
            >
              <PushPinIcon />
            </button>
          )}
        </div>
      </div>

      <div className="room-list-content">
        {rooms.length === 0 ? (
          <div className="no-rooms">
            <p>No rooms available</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room._id}
              className={`room-item ${currentRoom?._id === room._id ? 'active' : ''}`}
              onClick={() => onRoomSelect(room)}
            >
              <div className="room-icon">
                {room.t === 'c' ? '#' : room.t === 'd' ? '@' : '🔒'}
              </div>
              <div className="room-info">
                <div className="room-name">
                  {room.name || room.fname || 'Unnamed Room'}
                </div>
                <div className="room-topic">
                  {room.topic || room.lastMessage?.msg || 'No recent messages'}
                </div>
              </div>
              {room.unread > 0 && (
                <div className="unread-badge">
                  {room.unread}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RoomList;
