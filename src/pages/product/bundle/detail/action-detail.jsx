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
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { deleteProductBundle, updateProductBundleStatus } from '../service';
import { FormattedMessage } from 'react-intl';

import PropTypes from 'prop-types';
import Transitions from 'components/@extended/Transitions';
import ConfirmationC from 'components/ConfirmationC';

const ProductBundleDetailAction = (props) => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const anchorRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState({ isDialogDelete: false, isDialogDisabled: false, msg: '' });

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleToggle = () => setOpen((prevOpen) => !prevOpen);

  const resetDialog = () => setDialog({ isDialogDelete: false, isDialogDisabled: false, msg: '' });

  const onConfirm = async (value) => {
    const respError = (err) => {
      if (err) {
        resetDialog();
        dispatch(snackbarError(createMessageBackend(err, true, true)));
      }
    };

    const respSuccess = (resp) => {
      if (resp.status === 200) {
        resetDialog();
        dispatch(snackbarSuccess(`Success ${dialog.isDialogDelete ? 'delete' : dialog.isDialogDisabled ? 'disabled' : ''} data`));
        if (dialog.isDialogDisabled) {
          props.getDetail();
          props.onRefreshIndex(true);
        } else if (dialog.isDialogDelete) {
          props.onCancelDetail();
        }
      }
    };

    if (value) {
      if (dialog.isDialogDelete) await deleteProductBundle([props.id]).then(respSuccess).catch(respError);
      else if (dialog.isDialogDisabled) await updateProductBundleStatus({ id: props.id, status: '0' }).then(respSuccess).catch(respError);
    } else {
      resetDialog();
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
                  <ListItemButton onClick={() => navigate(`/product/bundle/form/${+props.id}`, { replace: true })}>
                    <ListItemText
                      primary={
                        <Typography color="textPrimary">
                          <FormattedMessage id="edit" />
                        </Typography>
                      }
                    />
                  </ListItemButton>
                  <ListItemButton
                    disabled={props.status === '0'}
                    onClick={() =>
                      setDialog({
                        isDialogDisabled: true,
                        isDialogDelete: false,
                        msg: <FormattedMessage id="are-you-sure-you-want-to-disabled-this-data" />
                      })
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography color="textPrimary">
                          <FormattedMessage id="disabled" />
                        </Typography>
                      }
                    />
                  </ListItemButton>
                  <ListItemButton
                    onClick={() =>
                      setDialog({
                        isDialogDisabled: false,
                        isDialogDelete: true,
                        msg: <FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />
                      })
                    }
                  >
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
        open={dialog.isDialogDelete || dialog.isDialogDisabled}
        title={dialog.isDialogDelete ? <FormattedMessage id="delete" /> : dialog.isDialogDisabled ? <FormattedMessage id="disabled" /> : ''}
        content={dialog.msg}
        onClose={(response) => onConfirm(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
    </Box>
  );
};

ProductBundleDetailAction.propTypes = {
  id: PropTypes.string,
  status: PropTypes.any,
  getDetail: PropTypes.func,
  onCancelDetail: PropTypes.func,
  onRefreshIndex: PropTypes.func
};

export default ProductBundleDetailAction;
