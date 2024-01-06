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
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { deleteStaffSchedule, getStaffScheduleDetail } from '../service';
import { FormattedMessage } from 'react-intl';

import PropTypes from 'prop-types';
import Transitions from 'components/@extended/Transitions';
import ConfirmationC from 'components/ConfirmationC';
import StaffScheduleForm from '../form';

const StaffScheduleDetailAction = (props) => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const anchorRef = useRef(null);

  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [openForm, setOpenForm] = useState({ isOpen: false, data: null });

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleToggle = () => setOpen((prevOpen) => !prevOpen);

  const onConfirm = async (value) => {
    if (value) {
      await deleteStaffSchedule([props.id])
        .then((resp) => {
          if (resp.status === 200) {
            dispatch(snackbarSuccess(`Success delete data`));
            setDialog(false);
            props.onRefreshIndex(true);
          }
        })
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err, true, true)));
          }
        });
    } else {
      setDialog(false);
    }
  };

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
                    onClick={async () => {
                      const getRespDetail = await getStaffScheduleDetail({ id: props.id, type: 'edit' });

                      setOpenForm({ isOpen: true, data: getRespDetail.data });
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
                  <ListItemButton onClick={() => setDialog(true)}>
                    <ListItemText
                      primary={
                        <Typography color="textPrimary">
                          <FormattedMessage id="delete" />
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
      <ConfirmationC
        open={dialog}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={(response) => onConfirm(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />

      {openForm.isOpen && (
        <StaffScheduleForm
          open={openForm.isOpen}
          data={openForm.data}
          onClose={(event) => {
            setOpenForm({ isOpen: false, data: null });
            if (event) props.onRefreshIndex(true);
          }}
        />
      )}
    </Box>
  );
};

StaffScheduleDetailAction.propTypes = {
  id: PropTypes.number,
  onRefreshIndex: PropTypes.func
};

export default StaffScheduleDetailAction;
