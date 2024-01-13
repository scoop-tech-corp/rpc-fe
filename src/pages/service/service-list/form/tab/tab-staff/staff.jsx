import { FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useServiceFormStore } from '../../service-form-store';

import MainCard from 'components/MainCard';
import { ReactTable } from 'components/third-party/ReactTable';
import { DeleteFilled } from '@ant-design/icons';

import useGetList from 'hooks/useGetList';
import { getStaffByLocation } from '../../../service';
import NumberFormatCustom from 'utils/number-format';
import { useMemo } from 'react';

const TabDescription = () => {
  const listStaff = useServiceFormStore((state) => state.listStaff);
  const surcharges = useServiceFormStore((state) => state.surcharges);
  const isDetail = useServiceFormStore((state) => state.isDetail);
  const location = useServiceFormStore((state) => state.location);

  const listStaffByLocation = useGetList(getStaffByLocation, {
    locationId: '[' + location.map((item) => item.value).join(',') + ']',
    disabled: location.length === 0
  });
  const handleDeleteList = (id) => {
    useServiceFormStore.setState((prevState) => {
      const listStaff = prevState.listStaff.filter((item) => item.id !== id);
      return {
        ...prevState,
        listStaff
      };
    });
  };

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="full-name" />,
        accessor: 'fullName',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="job-title" />,
        accessor: 'jobName',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="surcharges" />,
        accessor: 'quantity',
        isNotSorting: true,
        Cell: (data) => {
          if (surcharges == 1) {
            return (
              <TextField
                fullWidth
                id="name"
                name="name"
                className="inputWithPrefix"
                InputProps={{
                  endAdornment: '%',
                  readOnly: isDetail,
                  disabled: isDetail,
                  inputComponent: NumberFormatCustom
                }}
                value={data.row.original.price}
                onChange={(e) => {
                  const value = e.target.value;
                  useServiceFormStore.setState((prevState) => {
                    const listStaff = prevState.listStaff.map((item) => {
                      if (item.id === data.row.original.id) {
                        return {
                          ...item,
                          price: value
                        };
                      }
                      return item;
                    });
                    return {
                      ...prevState,
                      listStaff
                    };
                  });
                }}
              />
            );
          } else {
            return (
              <TextField
                fullWidth
                value={data.row.original.price}
                onChange={(e) => {
                  const value = e.target.value;
                  useServiceFormStore.setState((prevState) => {
                    const listStaff = prevState.listStaff.map((item) => {
                      if (item.id === data.row.original.id) {
                        return {
                          ...item,
                          price: value
                        };
                      }
                      return item;
                    });
                    return {
                      ...prevState,
                      listStaff
                    };
                  });
                }}
                className="inputWithPrefix"
                InputProps={{
                  startAdornment: 'Rp',
                  readOnly: isDetail,
                  disabled: isDetail,
                  inputComponent: NumberFormatCustom
                }}
              />
            );
          }
        }
      },
      {
        Header: '',
        accessor: 'action',
        isNotSorting: true,
        Cell: (data) => {
          if (data.row.original.isCreate || isDetail) return null;
          return (
            <IconButton size="large" color="error" onClick={() => handleDeleteList(data.row.original.id)}>
              <DeleteFilled />
            </IconButton>
          );
        }
      }
    ],
    [surcharges]
  );
  const onFieldHandler = (event) => {
    useServiceFormStore.setState({ listStaff: [...listStaff, { id: Date.now(), ...event.target.value }] });
  };

  return (
    <MainCard title={<FormattedMessage id="staff" />}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="staff">
              <FormattedMessage id="staff" />
            </InputLabel>
            {!isDetail && (
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select id="staff" name="staff" placeholder="Select staff" onChange={onFieldHandler}>
                  {listStaffByLocation?.list
                    ?.filter((e) => !listStaff.find((item) => item.fullName === e.fullName))
                    ?.map((item, index) => (
                      <MenuItem value={item} key={index}>
                        {item.fullName}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <ReactTable columns={columns} data={listStaff} totalPagination={0} />
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default TabDescription;
