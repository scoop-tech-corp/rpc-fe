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
import { exportProductRestockPdf } from '../service';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { useNavigate } from 'react-router';

import PropTypes from 'prop-types';
import useAuth from 'hooks/useAuth';
import Transitions from 'components/@extended/Transitions';
import ModalExport from './ModalExport';
import ProductRestockApproval from '../approval';

const ProductRestockDetailAction = (props) => {
  const { data } = props;
  const roleCanApprove = ['administrator', 'office'];

  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const anchorRef = useRef(null);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [isModalExport, setModalExport] = useState({ isOpen: false, id: null });
  const [openApprove, setOpenApprove] = useState({ isOpen: false, id: null });

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleToggle = () => setOpen((prevOpen) => !prevOpen);

  const onExport = async (event) => {
    const selectedSupplier = event.selectedSupplier.map((dt) => dt.value);

    await exportProductRestockPdf({ id: data.id, isExportAll: event.exportType === 'allSupplier' ? 1 : 0, supplierId: selectedSupplier })
      .then((resp) => {
        let blob = new Blob([resp.data], { type: resp.headers['content-type'] });
        let downloadUrl = URL.createObjectURL(blob);
        let a = document.createElement('a');
        const fileName = resp.headers['content-disposition'].split('filename=')[1].split(';')[0];

        a.href = downloadUrl;
        a.download = fileName.replace('.zip', '').replaceAll('"', '');
        document.body.appendChild(a);
        a.click();

        setModalExport({ isOpen: false, id: null });
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  return (
    <>
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
                    <ListItemButton onClick={() => setModalExport({ isOpen: true, id: +data.id })}>
                      <ListItemText
                        primary={
                          <Typography color="textPrimary">
                            <FormattedMessage id="export" />
                          </Typography>
                        }
                      />
                    </ListItemButton>
                    {data.numberId == 'draft' && (
                      <ListItemButton onClick={() => navigate(`/product/restock/form/${data.id}`, { replace: true })}>
                        <ListItemText
                          primary={
                            <Typography color="textPrimary">
                              <FormattedMessage id="edit" />
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    )}
                    {roleCanApprove.includes(user?.role) && (
                      <ListItemButton onClick={() => setOpenApprove({ isOpen: true, id: +data.id })}>
                        <ListItemText
                          primary={
                            <Typography color="textPrimary">
                              <FormattedMessage id="approve" />
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    )}
                  </List>
                </ClickAwayListener>
              </Paper>
            </Transitions>
          )}
        </Popper>
      </Box>
      {isModalExport.isOpen && (
        <ModalExport
          isOpen={isModalExport.isOpen}
          id={isModalExport.id}
          onExport={(e) => onExport(e)}
          onClose={(e) => setModalExport({ isOpen: !e, id: null })}
        />
      )}
      {openApprove.isOpen && (
        <ProductRestockApproval
          open={openApprove.isOpen}
          id={openApprove.id}
          onClose={(resp) => {
            setOpenApprove({ isOpen: false, id: null });
            if (resp) props.output('trigerIndex');
          }}
        />
      )}
    </>
  );
};

ProductRestockDetailAction.propTypes = {
  data: PropTypes.object,
  output: PropTypes.func
};

export default ProductRestockDetailAction;
