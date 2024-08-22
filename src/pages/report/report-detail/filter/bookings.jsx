import { useTheme } from '@mui/material/styles';
import { Autocomplete, Button, Stack, TextField, useMediaQuery } from '@mui/material';
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { AlignCenterOutlined, UndoOutlined } from '@ant-design/icons';
import MultiSelectAll from 'components/MultiSelectAll';
import useGetList from 'hooks/useGetList';
import { getFacilityByLocationList } from 'service/service-global';

export default function FilterBooking({ extData, filter, setFilter }) {
  const theme = useTheme();

  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const facilityList = useGetList(getFacilityByLocationList, {
    locationId: [],
    disabled: filter.location.length === 0
  });

  useEffect(() => {
    facilityList.setParams((e) => ({
      ...e,
      disabled: filter.location.length === 0,
      locationId: '[' + filter.location.map((item) => item.value).join(',') + ']'
    }));
  }, [filter.location]);

  return (
    <>
      <Stack
        direction={matchDownSM ? 'column' : 'row'}
        className="filterReport"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
        sx={{ p: 3, pb: 0 }}
      >
        <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: '100%' }}>
          <DateRangePicker onChange={(value) => setFilter((e) => ({ ...e, date: value }))} value={filter.date} format="dd/MM/yyy" />

          <MultiSelectAll
            items={extData?.location || []}
            style={{ width: '25%', height: '100%' }}
            limitTags={1}
            value={filter?.location}
            key={filter?.location?.length}
            selectAllLabel="Select All"
            onChange={(val) => setFilter((e) => ({ ...e, location: val }))}
            label={<FormattedMessage id="location" />}
          />
          <MultiSelectAll
            items={extData?.staff || []}
            style={{ width: '25%', height: '100%' }}
            limitTags={1}
            value={filter?.staff}
            key={filter?.staff?.length}
            selectAllLabel="Select All"
            onChange={(val) => setFilter((e) => ({ ...e, staff: val }))}
            label={<FormattedMessage id="staff" />}
          />

          <MultiSelectAll
            items={facilityList.list || []}
            style={{ width: '25%', height: '100%' }}
            limitTags={1}
            key={filter?.facility?.length}
            value={filter?.facility}
            selectAllLabel="Select All"
            onChange={(val) => setFilter((e) => ({ ...e, facility: val }))}
            label={<FormattedMessage id="facility" />}
          />
        </Stack>{' '}
      </Stack>
      <Stack direction={matchDownSM ? 'column' : 'row'} spacing={1} sx={{ p: 3, pt: 0, pb: 0, mt: '10px !important' }}>
        <MultiSelectAll
          items={extData?.service || []}
          style={{ width: '25%', height: '100%' }}
          limitTags={1}
          key={filter?.service?.length}
          value={filter?.service}
          selectAllLabel="Select All"
          onChange={(val) => setFilter((e) => ({ ...e, service: val }))}
          label={<FormattedMessage id="service" />}
        />
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<UndoOutlined />}
          onClick={() => {
            setFilter(() => ({ location: [], staff: [], category: [], facility: [], date: '' }));
          }}
        >
          <FormattedMessage id="reset" />
        </Button>
        <Button variant="outlined" startIcon={<AlignCenterOutlined />}>
          <FormattedMessage id="filter" />
        </Button>
      </Stack>
    </>
  );
}
