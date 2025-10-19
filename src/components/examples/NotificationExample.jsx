import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  Chip,
  Grid,
  Divider
} from '@mui/material';
import { notificationService } from '../../services';

/**
 * Example component demonstrating the enhanced notification service
 * This component shows how to use status-based notifications
 */
const NotificationExample = () => {
  const [currentStatus, setCurrentStatus] = useState('online');
  const [notificationSettings, setNotificationSettings] = useState({});
  const [testMessage, setTestMessage] = useState('Hello, this is a test message!');

  useEffect(() => {
    // Get initial status and settings
    const status = notificationService.getCurrentUserStatus();
    const settings = notificationService.getStatusNotificationSettings();
    
    setCurrentStatus(status);
    setNotificationSettings(settings);
  }, []);

  const handleStatusChange = (newStatus) => {
    notificationService.updateUserStatus(newStatus);
    setCurrentStatus(newStatus);
    
    // Update settings
    const settings = notificationService.getStatusNotificationSettings();
    setNotificationSettings(settings);
    
    // Show status change notification
    notificationService.showStatusChangeNotification(newStatus);
  };

  const handleTestMessage = () => {
    notificationService.showStatusBasedNotification('message', {
      message: testMessage,
      sender: 'Test User',
      roomName: 'Test Room'
    });
  };

  const handleTestConnection = () => {
    notificationService.showStatusBasedNotification('connection', {
      isConnected: true
    });
  };

  const handleTestError = () => {
    notificationService.showStatusBasedNotification('error', {
      message: 'This is a test error notification'
    });
  };

  const handleTestSuccess = () => {
    notificationService.showStatusBasedNotification('success', {});
  };

  const statusColors = {
    online: 'success',
    away: 'warning',
    busy: 'error',
    offline: 'default'
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Enhanced Notification Service Example
      </Typography>
      
      <Grid container spacing={3}>
        {/* Current Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Status
              </Typography>
              <Chip 
                label={currentStatus.toUpperCase()} 
                color={statusColors[currentStatus]}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Status: {notificationSettings.status}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Priority: {notificationSettings.priority}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                User Active: {notificationSettings.isActive ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                User Viewing: {notificationSettings.isViewing ? 'Yes' : 'No'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Notifications Enabled: {notificationSettings.canReceiveNotifications ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sound Enabled: {notificationSettings.canReceiveSounds ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Web Notifications: {notificationSettings.canReceiveWebNotifications ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Message Sounds: {notificationSettings.preferences?.messageSound ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status Change Sounds: {notificationSettings.preferences?.statusChangeSound ? 'Yes' : 'No'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Controls */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Change Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['online', 'away', 'busy', 'offline'].map((status) => (
                  <Button
                    key={status}
                    variant={currentStatus === status ? 'contained' : 'outlined'}
                    onClick={() => handleStatusChange(status)}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {status}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Test Notifications */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These will respect your current status preferences
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleTestMessage}
                  disabled={!notificationSettings.canReceiveNotifications}
                >
                  Test Message Notification
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleTestConnection}
                  disabled={!notificationSettings.canReceiveSounds}
                >
                  Test Connection Sound
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleTestError}
                >
                  Test Error Notification
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleTestSuccess}
                  disabled={!notificationSettings.canReceiveSounds}
                >
                  Test Success Sound
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary">
                <strong>Note:</strong> 
                <br />• Busy status: Only status change sounds enabled
                <br />• Offline status: All notifications disabled
                <br />• Web notifications only show when not actively viewing
                <br />• Sound notifications respect user status preferences
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NotificationExample;
