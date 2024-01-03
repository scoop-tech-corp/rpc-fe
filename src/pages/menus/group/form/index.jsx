import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { createMessageBackend } from 'service/service-global';
import { createMenuGroup, getLastOrderMenuGroup, updateMenuGroup } from '../service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const FormMenuGroup = (props) => {
  const [formValue, setFormValue] = useState({ groupName: '', orderMenu: '' });
  const dispatch = useDispatch();

  const onSubmit = async () => {
    const actionForm = () => {
      let setParam = { groupName: formValue.groupName, orderMenu: formValue.orderMenu };

      if (props.data?.id) {
        setParam = { id: props.data?.id, ...setParam };
        return updateMenuGroup(setParam);
      } else {
        return createMenuGroup(setParam);
      }
    };

    await actionForm()
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess('Menu group has been created successfully'));
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => props.onClose();
  const renderTitle = () => (props.data?.id ? 'update-menu-group' : 'create-menu-group');

  const prefillLastOrderMenu = async () => {
    const getResp = await getLastOrderMenuGroup();
    setFormValue({ groupName: '', orderMenu: getResp.data });
  };

  useEffect(() => {
    // prefill form
    if (props.data?.id) {
      setFormValue({ groupName: props.data.groupName, orderMenu: props.data.orderMenu });
    } else {
      prefillLastOrderMenu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ModalC
      title={<FormattedMessage id={renderTitle()} />}
      cancelText="Cancel"
      open={props.open}
      onOk={onSubmit}
      onCancel={onCancel}
      disabledOk={!formValue.groupName || !formValue.orderMenu}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="group-name">{<FormattedMessage id="group-name" />}</InputLabel>
            <TextField
              fullWidth
              id="groupName"
              name="groupName"
              value={formValue.groupName}
              onChange={(event) => setFormValue((prevState) => ({ ...prevState, groupName: event.target.value }))}
              error={Boolean(!formValue.groupName)}
              helperText={!formValue.groupName ? <FormattedMessage id="group-name-is-required" /> : ''}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="order-menu">{<FormattedMessage id="order-menu" />}</InputLabel>
            <TextField
              fullWidth
              type="number"
              id="orderMenu"
              name="orderMenu"
              inputProps={{ min: 0, readOnly: !props.data?.id }}
              value={formValue.orderMenu}
              onChange={(event) => setFormValue((prevState) => ({ ...prevState, orderMenu: event.target.value }))}
              error={Boolean(!formValue.orderMenu)}
              helperText={!formValue.orderMenu ? <FormattedMessage id="order-menu-is-required" /> : ''}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormMenuGroup.propTypes = {
  data: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default FormMenuGroup;
