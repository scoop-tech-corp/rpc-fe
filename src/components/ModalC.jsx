import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Slide, Stack } from '@mui/material';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const ModalC = (props) => {
  const { open, title, children, okText, cancelText, onOk, onCancel, action, disabledOk = false, isModalAction = true, ...other } = props;

  return (
    <Dialog onClose={onCancel} open={open} TransitionComponent={Transition} {...other}>
      <DialogTitle>
        <Stack direction={'row'} justifyContent={action?.justifyContent || 'space-between'} alignItems={action?.alignItems || 'center'}>
          {title}
          {action?.element}
        </Stack>
      </DialogTitle>
      <DialogContent dividers={false}>{children}</DialogContent>
      {isModalAction && (
        <DialogActions>
          <Button variant="outlined" color="error" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant="contained" onClick={onOk} disabled={disabledOk}>
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
  okText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  cancelText: PropTypes.string,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  disabledOk: PropTypes.bool,
  action: PropTypes.shape({ element: PropTypes.node, justifyContent: PropTypes.string, alignItems: PropTypes.string }),
  isModalAction: PropTypes.bool,
  other: PropTypes.any
};

export default ModalC;
