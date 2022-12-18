import { ThunderboltOutlined } from '@ant-design/icons';
import { Box, ClickAwayListener, List, ListItemButton, ListItemText, Paper, Popper, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState, useRef } from 'react';

import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';

const QuickMenu = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const anchorRef = useRef(null);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 1 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={{ color: 'text.primary' }}
        aria-label="open quick access"
        ref={anchorRef}
        aria-controls={open ? 'quick-access' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <ThunderboltOutlined />
      </IconButton>
      <Popper
        placement="bottom-start"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [matchesXs ? 0 : 0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={open} {...TransitionProps}>
            <Paper sx={{ boxShadow: theme.customShadows.z1 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <List
                  component="nav"
                  sx={{
                    p: 0,
                    width: '100%',
                    minWidth: 200,
                    maxWidth: 290,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 0.5,
                    [theme.breakpoints.down('md')]: {
                      maxWidth: 500
                    }
                  }}
                >
                  <ListItemButton>
                    <ListItemText primary={<Typography color="textPrimary">Product</Typography>} />
                  </ListItemButton>
                  <ListItemButton>
                    <ListItemText primary={<Typography color="textPrimary">Inventory Approval</Typography>} />
                  </ListItemButton>
                  <ListItemButton>
                    <ListItemText primary={<Typography color="textPrimary">Restock Approval</Typography>} />
                  </ListItemButton>
                </List>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default QuickMenu;
