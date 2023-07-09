import { Autocomplete, Container, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFormSecurityGroupStore } from './form-security-group-store';
import { useEffect, useMemo, useState } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { DeleteFilled } from '@ant-design/icons';
import { validationFormSecurityGroup } from '../service';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';

const configCoreErr = {
  roleErr: '',
  statusErr: ''
};

const FormSecurityGroupBody = () => {
  const role = useFormSecurityGroupStore((state) => state.role);
  const status = useFormSecurityGroupStore((state) => state.status);
  const userList = useFormSecurityGroupStore((state) => state.userList);
  const usersId = useFormSecurityGroupStore((state) => state.usersId);
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
      { Header: <FormattedMessage id="name" />, accessor: 'data.customerName', isNotSorting: true },
      { Header: <FormattedMessage id="role" />, accessor: 'data.jobName', isNotSorting: true },
      { Header: <FormattedMessage id="branch" />, accessor: 'data.locationName', isNotSorting: true },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        Cell: (data) => {
          const onDeleteRoleList = (dt) => {
            useFormSecurityGroupStore.setState((prevState) => {
              const newData = [...prevState.usersId];
              newData.splice(dt.row.index, 1);

              return { usersId: newData };
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
              onChange={(_, value) => {
                useFormSecurityGroupStore.setState({
                  usersId: value,
                  formSecurityGroupTouch: true
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
            <ReactTable columns={columns} data={usersId} />
          </Grid>
        </Grid>
      </Container>
    </MainCard>
  );
};

export default FormSecurityGroupBody;
