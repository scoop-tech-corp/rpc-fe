import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Slide, Stack } from '@mui/material';
import { forwardRef } from 'react';
import { FormattedMessage } from 'react-intl';

import PropTypes from 'prop-types';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const ModalC = (props) => {
  const {
    open,
    title,
    children,
    okText,
    cancelText,
    onOk,
    onCancel,
    action,
    otherDialogAction,
    positionButton = 'end',
    disabledOk = false,
    isModalAction = true,
    styleButtonContainer = {},
    ...other
  } = props;

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
        <DialogActions
          style={{
            display: 'flex',
            justifyContent: positionButton,
            ...styleButtonContainer
          }}
        >
          {otherDialogAction}
          <Button variant="contained" className="button__submit" color="error" type="button" onClick={onCancel}>
            {cancelText || <FormattedMessage id="cancel" />}
          </Button>
          <Button variant="contained" className="button__primary button__submit" onClick={onOk} disabled={disabledOk}>
            {okText || <FormattedMessage id="submit" />}
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
  cancelText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  disabledOk: PropTypes.bool,
  action: PropTypes.shape({ element: PropTypes.node, justifyContent: PropTypes.string, alignItems: PropTypes.string }),
  otherDialogAction: PropTypes.node,
  isModalAction: PropTypes.bool,
  other: PropTypes.any,
  positionButton: PropTypes.string,
  styleButtonContainer: PropTypes.object
};

export default ModalC;
