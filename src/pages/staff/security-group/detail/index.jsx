import { useState, useMemo } from 'react';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ReactTable } from 'components/third-party/ReactTable';
import { useNavigate } from 'react-router';

import ModalC from 'components/ModalC';
import MainCard from 'components/MainCard';
import PropTypes from 'prop-types';

const SecurityGroupDetail = (props) => {
  const navigate = useNavigate();
  const [role] = useState(props.data.roleName);
  const [status] = useState(+props.data.status);
  const [users] = useState(props.data.users);

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="name" />, accessor: 'customerName', isNotSorting: true },
      { Header: <FormattedMessage id="role" />, accessor: 'jobName', isNotSorting: true },
      { Header: <FormattedMessage id="branch" />, accessor: 'locationName', isNotSorting: true }
    ],
    []
  );

  return (
    <ModalC
      title={<FormattedMessage id="detail-security-group" />}
      open={props.open}
      isModalAction={false}
      onCancel={() => props.onClose(false)}
      sx={{ '& .MuiDialog-paper': { width: '50%', maxHeight: 650 } }}
      maxWidth="md"
      action={{
        element: (
          <Button variant="contained" onClick={() => navigate(`/staff/security-group/form/${props.data.id}`, { replace: true })}>
            <FormattedMessage id="edit" />
          </Button>
        )
        // justifyContent: 'flex-start',
        // alignItems: 'center'
      }}
    >
      <MainCard border={false}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="role-name">{<FormattedMessage id="role-name" />}</InputLabel>
              <TextField fullWidth id="role" name="role" value={role} inputProps={{ readOnly: true }} />
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="status">Status</InputLabel>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select id="status" name="status" value={status} placeholder="Select status" inputProps={{ readOnly: true }}>
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
              </FormControl>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <ReactTable columns={columns} data={users} />
          </Grid>
        </Grid>
      </MainCard>
    </ModalC>
  );
};

SecurityGroupDetail.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.any
};

export default SecurityGroupDetail;
