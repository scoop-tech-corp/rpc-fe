import { Container, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useFormSecurityGroupStore } from './form-security-group-store';
import { useMemo } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { DeleteFilled } from '@ant-design/icons';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';

const FormSecurityGroupBody = () => {
  const roleName = useFormSecurityGroupStore((state) => state.roleName);
  const status = useFormSecurityGroupStore((state) => state.status);

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="name" />, accessor: 'name', isNotSorting: true },
      { Header: <FormattedMessage id="role" />, accessor: 'roleName', isNotSorting: true },
      { Header: <FormattedMessage id="branch" />, accessor: 'branchName', isNotSorting: true },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        Cell: (data) => {
          const onDeleteRoleList = (dt) => {
            useFormSecurityGroupStore.setState((prevState) => {
              const newData = [...prevState.roleList];
              newData.splice(dt.row.index, 1);

              return { roleList: newData };
            });
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

  return (
    <MainCard border={false} boxShadow>
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="role-name">{<FormattedMessage id="role-name" />}</InputLabel>
              <TextField
                fullWidth
                id="roleName"
                name="roleName"
                value={roleName}
                onChange={(e) => {
                  useFormSecurityGroupStore.setState({
                    roleName: e.target.value,
                    formSecurityGroupTouch: true
                  });
                }}
                // error={Boolean(productRestockErr.costPerItemErr && productRestockErr.costPerItemErr.length > 0)}
                // helperText={productRestockErr.costPerItemErr}
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
                  }}
                  placeholder="Select status"
                >
                  <MenuItem value="">
                    <em>
                      <FormattedMessage id="select-status" />
                    </em>
                  </MenuItem>
                  <MenuItem value={'active'}>
                    <FormattedMessage id="active" />
                  </MenuItem>
                  <MenuItem value={'nonActive'}>
                    <FormattedMessage id="non-active" />
                  </MenuItem>
                </Select>
                {/* {productRestockErr.productTypeErr.length > 0 && <FormHelperText error> {productRestockErr.productTypeErr} </FormHelperText>} */}
              </FormControl>
            </Stack>
          </Grid>

          <Grid item xs={12} md={12}>
            <ReactTable columns={columns} data={[]} />
          </Grid>
        </Grid>
      </Container>
    </MainCard>
  );
};

export default FormSecurityGroupBody;
