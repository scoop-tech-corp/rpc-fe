import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Slide } from '@mui/material';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const ModalC = (props) => {
  const { open, title, children, okText, cancelText, onOk, onCancel, isModalAction = true, ...other } = props;

  return (
    <Dialog onClose={onCancel} open={open} TransitionComponent={Transition} {...other}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers={false}>{children}</DialogContent>
      {isModalAction && (
        <DialogActions>
          <Button variant="outlined" color="error" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant="contained" onClick={onOk}>
            {okText}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

ModalC.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  children: PropTypes.node,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  isModalAction: PropTypes.bool,
  other: PropTypes.any
};

export default ModalC;
