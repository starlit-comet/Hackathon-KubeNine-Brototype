import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Menu, 
  MenuItem, 
  Typography, 
  Chip,
  Divider,
  Button,
  CircularProgress
} from '@mui/material';
import { 
  getUserStatus, 
  setUserStatus, 
  getStatusDisplayInfo, 
  getAvailableStatusOptions 
} from '../../services/api/userStatus';
import { notificationService } from '../../services';
import './UserStatus.css';

const UserStatus = ({ authToken, userId, onStatusChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(() => {
    // Load status from localStorage on component mount
    return notificationService.getStoredUserStatus() || 'online';
  });
  const [connectionStatus, setConnectionStatus] = useState('online');
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  // Fetch user status on component mount
  useEffect(() => {
    if (authToken && userId) {
      fetchUserStatus();
    }
  }, [authToken, userId]);

  const fetchUserStatus = async () => {
    if (!authToken || !userId) return;

    setLoading(true);
    try {
      const result = await getUserStatus(null, authToken, userId);
      if (result.success) {
        setCurrentStatus(result.status || 'online');
        setConnectionStatus(result.connectionStatus || 'online');
      }
    } catch (error) {
      console.error('Error fetching user status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (!authToken || !userId || loading) return;

    setLoading(true);
    try {
      const result = await setUserStatus(newStatus, '', authToken, userId);
      
      if (result.success) {
        setCurrentStatus(newStatus);
        
        // Store status in localStorage
        notificationService.storeUserStatus(newStatus);
        
        // Play status change sound
        notificationService.playStatusChangeSound();
        
        // Show browser notification if user is not actively viewing
        if (!notificationService.isUserActivelyViewing()) {
          notificationService.showStatusChangeNotification(newStatus);
        }
        
        // Notify parent component of status change
        if (onStatusChange) {
          onStatusChange({
            status: newStatus,
            message: '',
            connectionStatus: connectionStatus
          });
        }
        
        handleClose();
      } else {
        console.error('Failed to set status:', result.error);
        notificationService.playErrorSound();
      }
    } catch (error) {
      console.error('Error setting status:', error);
      notificationService.playErrorSound();
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = getAvailableStatusOptions();
  const currentStatusInfo = getStatusDisplayInfo(currentStatus);

  return (
    <Box className="user-status-container">
      {/* Status Display Button */}
      <Button
        variant="contained"
        className="status-colored-button"
        onClick={handleClick}
        disabled={loading}
        sx={{
          borderRadius: '20px',
          textTransform: 'none',
          fontWeight: 500,
          minWidth: '80px',
          backgroundColor: currentStatusInfo.bgColor,
          color: 'white',
          borderColor: currentStatusInfo.borderColor,
          '&:hover': {
            backgroundColor: currentStatusInfo.bgColor,
            opacity: 0.9,
            color: 'white',
          },
          '&:disabled': {
            backgroundColor: currentStatusInfo.bgColor,
            opacity: 0.6,
            color: 'white',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <span>{currentStatusInfo.icon}</span>
          <span>{currentStatusInfo.label}</span>
        </Box>
      </Button>

      {/* Status Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        className="status-menu"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {/* Current Status Display */}
        <Box className="current-status-display">
          <Box className="current-status-info">
            <span className="current-status-icon">{currentStatusInfo.icon}</span>
            <Typography variant="subtitle2" className="current-status-text">
              Current: {currentStatusInfo.label}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Status Options */}
        <Box className="status-options">
          {statusOptions.map((option) => {
            const isCurrentStatus = option.value === currentStatus;
            const optionInfo = getStatusDisplayInfo(option.value);
            
            return (
              <MenuItem
                key={option.value}
                onClick={() => !isCurrentStatus && handleStatusChange(option.value)}
                className={`status-option ${isCurrentStatus ? 'current' : ''}`}
                disabled={isCurrentStatus || loading}
              >
                <Box className="status-option-content">
                  <span className="status-option-icon">{option.icon}</span>
                  <Box className="status-option-text">
                    <Typography variant="body2" className="status-option-label">
                      {option.label}
                    </Typography>
                    <Typography variant="caption" className="status-option-description">
                      {option.description}
                    </Typography>
                  </Box>
                  {isCurrentStatus && (
                    <Chip 
                      label="Current" 
                      size="small" 
                      className="current-chip"
                      style={{ backgroundColor: optionInfo.bgColor, color: optionInfo.color }}
                    />
                  )}
                </Box>
              </MenuItem>
            );
          })}
        </Box>


        {/* Loading Overlay */}
        {loading && (
          <Box className="loading-overlay">
            <CircularProgress size={20} />
            <Typography variant="caption">Updating status...</Typography>
          </Box>
        )}
      </Menu>
    </Box>
  );
};

export default UserStatus;
