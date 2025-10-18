import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SnackBar from './SnackBar';

const ITEM_HEIGHT = 48;

/**
 * Higher-Order Component for creating context menus with customizable options
 * @param {Object} props - Component props
 * @param {Array} props.options - Array of menu options with structure: { label: string, action: function }
 * @param {string} props.ariaLabel - Aria label for the menu button (default: "more")
 * @param {string} props.menuId - Unique ID for the menu (default: "long-menu")
 * @param {number} props.maxHeight - Maximum height for the menu (default: ITEM_HEIGHT * 4.5)
 * @param {string} props.width - Width of the menu (default: '20ch')
 * @param {boolean} props.showSnackbar - Whether to show snackbar notifications (default: true)
 * @returns {JSX.Element} Context menu component
 */
export default function LongMenu({ 
  options = [], 
  ariaLabel = "more", 
  menuId = "long-menu",
  maxHeight = ITEM_HEIGHT * 4.5,
  width = '20ch',
  showSnackbar = true,
  onMenuOpen,
  onMenuClose
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  // State for SnackBar
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    type: 'success',
    message: '',
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (onMenuOpen) {
      onMenuOpen();
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    if (onMenuClose) {
      onMenuClose();
    }
  };

  const handleOptionClick = async (option) => {
    setAnchorEl(null);

    try {
      // Execute the option's action if it exists
      if (option.action && typeof option.action === 'function') {
        const result = await option.action();
        
        // Show snackbar if enabled and the action returns a result
        if (showSnackbar && result) {
          setSnackbar({
            open: true,
            type: result.success ? 'success' : 'error',
            message: result.message || (result.success ? 'Action completed successfully!' : 'Action failed!'),
          });
        }
      }
    } catch (error) {
      console.error('Error executing menu option:', error);
      if (showSnackbar) {
        setSnackbar({
          open: true,
          type: 'error',
          message: 'An error occurred while executing the action.',
        });
      }
    }
  };

  // Don't render if no options provided
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div>
      <IconButton
        aria-label={ariaLabel}
        id={`${menuId}-button`}
        aria-controls={open ? menuId : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            style: {
              maxHeight: maxHeight,
              width: width,
            },
          },
          list: {
            'aria-labelledby': `${menuId}-button`,
          },
        }}
      >
        {options.map((option, index) => (
          <MenuItem 
            key={option.label || option.key || index} 
            onClick={() => handleOptionClick(option)}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Show SnackBar only if enabled */}
      {showSnackbar && (
        <SnackBar
          open={snackbar.open}
          type={snackbar.type}
          message={snackbar.message}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        />
      )}
    </div>
  );
}
