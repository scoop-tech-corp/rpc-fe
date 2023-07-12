import { Autocomplete, Container, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFormSecurityGroupStore } from './form-security-group-store';
import { useEffect, useMemo, useState } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { DeleteFilled } from '@ant-design/icons';
import { validationFormSecurityGroup } from '../service';
import { useParams } from 'react-router';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';

const configCoreErr = {
  roleErr: '',
  statusErr: ''
};

const FormSecurityGroupBody = () => {
  let { id } = useParams();
  const role = useFormSecurityGroupStore((state) => state.role);
  const status = useFormSecurityGroupStore((state) => state.status);
  const userList = useFormSecurityGroupStore((state) => state.userList);
  const usersId = useFormSecurityGroupStore((state) => state.usersId);
  const selectedUsers = useFormSecurityGroupStore((state) => state.selectedUsers);
  const isTouchForm = useFormSecurityGroupStore((state) => state.formSecurityGroupTouch);

  const [securityGroupErr, setSecurityGroupErr] = useState(configCoreErr);
  const intl = useIntl();

  const onCheckValidation = () => {
    const getRespValidForm = validationFormSecurityGroup();

    if (!getRespValidForm) {
      setSecurityGroupErr(configCoreErr);
      useFormSecurityGroupStore.setState({ formSecurityGroupError: false });
    } else {
      setSecurityGroupErr({
        roleErr: getRespValidForm.getRoleError,
        statusErr: getRespValidForm.getStatusError
      });
      useFormSecurityGroupStore.setState({ formSecurityGroupError: true });
    }
  };

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="name" />, accessor: 'customerName', isNotSorting: true },
      { Header: <FormattedMessage id="role" />, accessor: 'jobName', isNotSorting: true },
      { Header: <FormattedMessage id="branch" />, accessor: 'locationName', isNotSorting: true },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        Cell: (data) => {
          const onDeleteRoleList = (dt) => {
            useFormSecurityGroupStore.setState((prevState) => {
              const newData = [...prevState.selectedUsers];
              const getUsersId = [...prevState.usersId];
              const getIdxUsersId = getUsersId.findIndex((u) => +u.data.usersId === +dt.row.original.usersId);
              const getIdxSelectedUsers = newData.findIndex((u) => +u.usersId === +dt.row.original.usersId);

              if (getIdxUsersId > -1) getUsersId.splice(getIdxUsersId, 1);
              newData[getIdxSelectedUsers].status = 'del';

              return { selectedUsers: newData, usersId: getUsersId, formSecurityGroupTouch: true };
            });
            onCheckValidation();
          };
          return (
            <IconButton size="large" color="error" onClick={() => onDeleteRoleList(data)}>
              <DeleteFilled />
            </IconButton>
          );
        }
      }
    ],
    []
  );

  useEffect(() => {
    if (isTouchForm) onCheckValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTouchForm]);

  return (
    <MainCard border={false} boxShadow>
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="role-name">{<FormattedMessage id="role-name" />}</InputLabel>
              <TextField
                fullWidth
                id="role"
                name="role"
                value={role}
                onChange={(e) => {
                  useFormSecurityGroupStore.setState({
                    role: e.target.value,
                    formSecurityGroupTouch: true
                  });
                  onCheckValidation();
                }}
                inputProps={{ readOnly: Boolean(id) }}
                error={Boolean(securityGroupErr.roleErr && securityGroupErr.roleErr.length > 0)}
                helperText={securityGroupErr.roleErr ? intl.formatMessage({ id: securityGroupErr.roleErr }) : ''}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="status">Status</InputLabel>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select
                  id="status"
                  name="status"
                  value={status}
                  onChange={(event) => {
                    useFormSecurityGroupStore.setState({
                      status: event.target.value,
                      formSecurityGroupTouch: true
                    });
                    onCheckValidation();
                  }}
                  placeholder="Select status"
                >
                  <MenuItem value="">
                    <em>
                      <FormattedMessage id="select-status" />
                    </em>
                  </MenuItem>
                  <MenuItem value={1}>
                    <FormattedMessage id="active" />
                  </MenuItem>
                  <MenuItem value={0}>
                    <FormattedMessage id="non-active" />
                  </MenuItem>
                </Select>
                {securityGroupErr.statusErr.length > 0 && (
                  <FormHelperText error> {intl.formatMessage({ id: securityGroupErr.statusErr })} </FormHelperText>
                )}
              </FormControl>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              id="users"
              multiple
              limitTags={1}
              options={userList}
              value={usersId}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(_, allValue, eventName, selectedValue) => {
                useFormSecurityGroupStore.setState((prevState) => {
                  const prevSelectedUsers = prevState.selectedUsers;
                  const prevUsersId = prevState.usersId;
                  const newValue = [];

                  allValue.forEach((dt) => {
                    if (!prevSelectedUsers.find((su) => +su.usersId === +dt.data.usersId)) {
                      newValue.push({ ...dt.data, status: '' });
                    }
                  });

                  const newData = [...prevSelectedUsers, ...newValue];
                  if (eventName === 'removeOption') {
                    const findIdx = newData.findIndex((nd) => +nd.usersId === +selectedValue.option.data.usersId);
                    newData[findIdx].status = 'del';
                  } else if (eventName === 'clear') {
                    prevUsersId.forEach((puid) => {
                      const idx = newData.findIndex((nd) => +nd.usersId === +puid.data.usersId);
                      newData[idx].status = 'del';
                    });
                  }

                  return {
                    usersId: allValue,
                    selectedUsers: newData,
                    formSecurityGroupTouch: true
                  };
                });
                onCheckValidation();
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  // error={Boolean(positionErr.locationErr && positionErr.locationErr.length > 0)}
                  // helperText={positionErr.locationErr}
                  // variant="outlined"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <ReactTable columns={columns} data={selectedUsers.filter((dt) => dt.status !== 'del')} />
          </Grid>
        </Grid>
      </Container>
    </MainCard>
  );
};

export default FormSecurityGroupBody;
