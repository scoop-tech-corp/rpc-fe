import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { createMessageBackend } from 'service/service-global';
import { updateMenuProfile, createMenuProfile } from '../service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const FormMenuProfile = (props) => {
  const [formValue, setFormValue] = useState({
    title: '',
    url: '',
    icon: ''
  });
  const dispatch = useDispatch();

  const onSubmit = async () => {
    const actionForm = () => {
      let setParam = {
        title: formValue.title,
        url: formValue.url,
        icon: formValue.icon
      };

      if (props.data?.id) {
        setParam = { id: props.data?.id, ...setParam };
        return updateMenuProfile(setParam);
      } else {
        return createMenuProfile(setParam);
      }
    };

    await actionForm()
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`Menu profile has been ${props.data?.id ? 'updated' : 'created'} successfully`));
          props.setParams((_params) => ({ ..._params }));
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => props.onClose();
  const renderTitle = () => (props.data?.id ? 'update-menu-profile' : 'create-menu-profile');

  const onDisabledForm = () => Boolean(!formValue.title || !formValue.url || !formValue.icon);

  const prefillForm = async () => {
    setFormValue({
      title: props.data?.title,
      url: props.data?.url,
      icon: props.data?.icon
    });
  };

  useEffect(() => {
    if (props.data?.id) prefillForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ModalC
      title={<FormattedMessage id={renderTitle()} />}
      cancelText="Cancel"
      open={props.open}
      onOk={onSubmit}
      onCancel={onCancel}
      disabledOk={onDisabledForm()}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="md"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="title">{<FormattedMessage id="title" />}</InputLabel>
            <TextField
              fullWidth
              id="title"
              name="title"
              value={formValue.title}
              onChange={(event) => setFormValue((prevState) => ({ ...prevState, title: event.target.value }))}
              error={Boolean(!formValue.title)}
              helperText={!formValue.title ? <FormattedMessage id="title-is-required" /> : ''}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="url">Url</InputLabel>
            <TextField
              fullWidth
              id="url"
              name="url"
              value={formValue.url}
              onChange={(event) => setFormValue((prevState) => ({ ...prevState, url: event.target.value }))}
              error={Boolean(!formValue.url)}
              helperText={!formValue.url ? <FormattedMessage id="url-is-required" /> : ''}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="icon">{<FormattedMessage id="icon" />}</InputLabel>
            <TextField
              fullWidth
              id="icon"
              name="icon"
              value={formValue.icon}
              onChange={(event) => setFormValue((prevState) => ({ ...prevState, icon: event.target.value }))}
              error={Boolean(!formValue.icon)}
              helperText={!formValue.icon ? <FormattedMessage id="icon-is-required" /> : ''}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormMenuProfile.propTypes = {
  data: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  setParams: PropTypes.func
};

export default FormMenuProfile;
