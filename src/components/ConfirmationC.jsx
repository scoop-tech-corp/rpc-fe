import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Slide } from '@mui/material';
import { forwardRef } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ConfirmationC = (props) => {
  const { open, title, content, onClose, btnTrueText, btnFalseText } = props;

  const handleTrue = () => {
    onClose(true);
  };

  const handleFalse = () => {
    onClose(false);
  };

  return (
    <Dialog open={open} TransitionComponent={Transition} maxWidth="md" fullWidth={false}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers={false}>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="error" onClick={handleFalse}>
          {btnFalseText || <FormattedMessage id="cancel" />}
        </Button>
        <Button variant="contained" onClick={handleTrue} autoFocus>
          {btnTrueText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ConfirmationC.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  btnTrueText: PropTypes.string,
  btnFalseText: PropTypes.string,
  onClose: PropTypes.func
};

export default ConfirmationC;
