import {
  Box,
  Button,
  ClickAwayListener,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Transitions from 'components/@extended/Transitions';
// import { useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';

const TransactionDetailAction = (props) => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const anchorRef = useRef(null);
  // const navigate = useNavigate();
  // const dispatch = useDispatch();

  const [open, setOpen] = useState(false);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleToggle = () => setOpen((prevOpen) => !prevOpen);

  return (
    <Box sx={{ ml: 2 }}>
      <Button
        variant="contained"
        ref={anchorRef}
        aria-controls={open ? 'quick-access' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <FormattedMessage id="action" />
      </Button>
      <Popper
        placement="bottom-start"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        style={{ zIndex: 1 }}
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
                  <ListItemButton
                    onClick={() => {
                      props.onAction('edit');
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography color="textPrimary">
                          <FormattedMessage id="edit" />
                        </Typography>
                      }
                    />
                  </ListItemButton>
                  <ListItemButton onClick={() => {}}>
                    <ListItemText
                      primary={
                        <Typography color="textPrimary">
                          <FormattedMessage id="accept-patient" />
                        </Typography>
                      }
                    />
                  </ListItemButton>

                  <ListItemButton onClick={() => {}}>
                    <ListItemText
                      primary={
                        <Typography color="textPrimary">
                          <FormattedMessage id="cancel-patient" />
                        </Typography>
                      }
                    />
                  </ListItemButton>

                  <ListItemButton onClick={() => {}}>
                    <ListItemText
                      primary={
                        <Typography color="textPrimary">
                          <FormattedMessage id="delete-transaction" />
                        </Typography>
                      }
                    />
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

TransactionDetailAction.propTypes = {
  onAction: PropTypes.func
};

export default TransactionDetailAction;
