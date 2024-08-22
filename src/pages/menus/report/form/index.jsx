import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField, FormControl, Select, MenuItem } from '@mui/material';
import { createMessageBackend } from 'service/service-global';
import { updateMenuReport, createMenuReport, getDetailMenuReport } from '../service';
import { getRolesIdList } from 'pages/staff/staff-list/service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const FormMenuReport = (props) => {
  const [formValue, setFormValue] = useState({
    groupName: '',
    menuName: '',
    url: '',
    roleId: '',
    accessTypeId: ''
  });
  const dispatch = useDispatch();
  const [roleList, setRoleList] = useState([]);

  const onSubmit = async () => {
    const actionForm = () => {
      let setParam = {
        groupName: formValue.groupName,
        menuName: formValue.menuName,
        url: formValue.url,
        roleId: formValue.roleId,
        accessTypeId: formValue.accessTypeId
      };

      if (props.id) {
        setParam = { id: props.id, ...setParam };
        return updateMenuReport(setParam);
      } else {
        return createMenuReport(setParam);
      }
    };

    await actionForm()
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`Menu report has been ${props.data?.id ? 'updated' : 'created'} successfully`));
          props.setParams((_params) => ({ ..._params }));
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const loadListRoles = () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const getResp = await getRolesIdList();
      setRoleList(getResp);

      resolve(true);
    });
  };

  const onCancel = () => props.onClose();
  const renderTitle = () => (props.data?.id ? 'update-menu-report' : 'create-menu-report');

  const onDisabledForm = () => Boolean(!formValue.groupName || !formValue.menuName || !formValue.url);

  const prefillForm = async () => {
    await getDetailMenuReport(props.id).then((resp) => {
      const getDetail = resp.data;

      setFormValue({
        groupName: getDetail.groupName,
        menuName: getDetail.menuName,
        url: getDetail.url,
        roleId: getDetail.roleId,
        accessTypeId: getDetail.accessTypeId
      });
    });
  };

  const loadData = async () => {
    await loadListRoles();
    if (props.id) prefillForm();
  };

  useEffect(() => {
    loadData();
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
            <TextField
              fullWidth
              id="groupName"
              name="groupName"
              value={formValue.groupName}
              onChange={(event) => setFormValue((prevState) => ({ ...prevState, groupName: event.target.value }))}
              error={Boolean(!formValue.groupName)}
              helperText={!formValue.groupName ? <FormattedMessage id="title-is-required" /> : ''}
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
            <InputLabel htmlFor="role">Role</InputLabel>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select
                id="role"
                name="role"
                value={formValue.roleId}
                onChange={(event) => setFormValue((prevState) => ({ ...prevState, roleId: event.target.value }))}
                placeholder="Select role"
              >
                <MenuItem value="">
                  <em>Select Role</em>
                </MenuItem>

                {roleList.map((dt, i) => {
                  return (
                    <MenuItem key={i} value={dt.value}>
                      {dt.label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="access-type">{<FormattedMessage id="access-type" />}</InputLabel>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select
                id="accessType"
                name="accessType"
                value={formValue.accessTypeId}
                onChange={(event) => setFormValue((prevState) => ({ ...prevState, accessTypeId: event.target.value }))}
                placeholder="Select access type"
              >
                <MenuItem value="">
                  <em>Select Access Type</em>
                </MenuItem>
                <MenuItem value={1}>{<FormattedMessage id="read" />}</MenuItem>
                <MenuItem value={3}>{<FormattedMessage id="full" />}</MenuItem>
                <MenuItem value={4}>{<FormattedMessage id="none" />}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormMenuReport.propTypes = {
  id: PropTypes.number,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  setParams: PropTypes.func
};

export default FormMenuReport;
