import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { createMessageBackend } from 'service/service-global';
import { getLastOrderMenu, updateMenuGroupChildren, createMenuGroupChildren, getDetailMenuGroupChildren } from '../service';
import { getMenuGroupList } from 'pages/menus/group/service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const FormMenuGroupChildren = (props) => {
  const [formValue, setFormValue] = useState({
    groupId: null,
    menuName: '',
    identify: '',
    title: '',
    type: '',
    icon: '',
    orderMenu: '',
    isActive: 1,
    menuGroupList: []
  });
  const dispatch = useDispatch();

  const onSubmit = async () => {
    const actionForm = () => {
      let setParam = {
        groupId: typeof formValue.groupId === 'number' ? formValue.groupId : formValue.groupId.value,
        menuName: formValue.menuName,
        identify: formValue.identify,
        title: formValue.title,
        type: formValue.type,
        icon: formValue.icon,
        orderMenu: formValue.orderMenu,
        isActive: formValue.isActive
      };

      if (props.id) {
        setParam = { id: props.id, ...setParam };
        return updateMenuGroupChildren(setParam);
      } else {
        return createMenuGroupChildren(setParam);
      }
    };

    await actionForm()
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`Menu group children has been ${props.id ? 'updated' : 'created'} successfully`));
          props.setParams((_params) => ({ ..._params }));
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => props.onClose();
  const renderTitle = () => (props.id ? 'update-menu-group-children' : 'create-menu-group-children');

  const onDisabledForm = () =>
    Boolean(
      !formValue.groupId ||
        !formValue.orderMenu ||
        !formValue.menuName ||
        !formValue.identify ||
        !formValue.title ||
        !formValue.type ||
        !formValue.icon
    );

  const prefillLastOrderMenu = async () => {
    const getResp = await getLastOrderMenu();
    setFormValue((prev) => ({ ...prev, orderMenu: getResp.data }));
  };

  const prefillForm = async () => {
    await getDetailMenuGroupChildren({ id: props.id }).then((resp) => {
      const getDetail = resp.data;

      setFormValue((prev) => ({
        ...prev,
        groupId: prev.menuGroupList.find((dt) => +dt.value === +getDetail.groupId),
        menuName: getDetail.menuName,
        identify: getDetail.identify,
        title: getDetail.title,
        type: getDetail.type,
        icon: getDetail.icon,
        orderMenu: getDetail.orderMenu
      }));
    });
  };

  const loadMenuGroupList = () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const respList = await getMenuGroupList();
      setFormValue((prev) => ({ ...prev, menuGroupList: respList }));
      resolve(true);
    });
  };

  const initForm = async () => {
    await loadMenuGroupList();

    if (props.id) {
      prefillForm();
    } else {
      prefillLastOrderMenu();
    }
  };

  useEffect(() => {
    initForm();
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
            <InputLabel htmlFor="group-name">{<FormattedMessage id="group-name" />}</InputLabel>
            <Autocomplete
              id="groupName"
              options={formValue.menuGroupList}
              value={formValue.groupId}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(_, value) => setFormValue((prev) => ({ ...prev, groupId: value }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(!formValue.groupId)}
                  helperText={!formValue.groupId ? <FormattedMessage id="group-name-is-required" /> : ''}
                  variant="outlined"
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="menu-name">{<FormattedMessage id="menu-name" />}</InputLabel>
            <TextField
              fullWidth
              id="menuName"
              name="menuName"
              value={formValue.menuName}
              onChange={(event) => setFormValue((prevState) => ({ ...prevState, menuName: event.target.value }))}
              error={Boolean(!formValue.menuName)}
              helperText={!formValue.menuName ? <FormattedMessage id="menu-name-is-required" /> : ''}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="identify">{<FormattedMessage id="identify" />}</InputLabel>
            <TextField
              fullWidth
              id="identify"
              name="identify"
              value={formValue.identify}
              onChange={(event) => setFormValue((prevState) => ({ ...prevState, identify: event.target.value }))}
              error={Boolean(!formValue.identify)}
              helperText={!formValue.identify ? <FormattedMessage id="identify-is-required" /> : ''}
            />
          </Stack>
        </Grid>

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
            <InputLabel htmlFor="type">{<FormattedMessage id="type" />}</InputLabel>
            <TextField
              fullWidth
              id="type"
              name="type"
              value={formValue.type}
              onChange={(event) => setFormValue((prevState) => ({ ...prevState, type: event.target.value }))}
              error={Boolean(!formValue.type)}
              helperText={!formValue.type ? <FormattedMessage id="type-is-required" /> : ''}
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

        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="order-menu">{<FormattedMessage id="order-menu" />}</InputLabel>
            <TextField
              fullWidth
              type="number"
              id="orderMenu"
              name="orderMenu"
              inputProps={{ min: 0, readOnly: !props.id }}
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

FormMenuGroupChildren.propTypes = {
  id: PropTypes.number,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  setParams: PropTypes.func
};

export default FormMenuGroupChildren;
