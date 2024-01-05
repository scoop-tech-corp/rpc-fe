import { useTheme } from '@mui/material/styles';
import { Autocomplete, Button, Stack, TextField, useMediaQuery } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import moment from 'moment';
import { AlignCenterOutlined, UndoOutlined } from '@ant-design/icons';

export default function FilterBooking({ dateRange, filter }) {
  const theme = useTheme();

  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent="space-between" alignItems="center" spacing={1} sx={{ p: 3, pb: 0 }}>
        <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: '100%' }}>
          <TextField
            id="date"
            name="date"
            sx={{ width: '25%', height: '100%' }}
            placeholder="Select Date"
            InputProps={{
              readOnly: true
            }}
            value={
              dateRange ? `${moment(dateRange?.startDate).format('DD/MM/YYYY')} - ${moment(dateRange?.endDate).format('DD/MM/YYYY')}` : ''
            }
            onClick={() => setOpen(true)}
          />
          <Autocomplete
            id="location"
            multiple
            options={[]}
            sx={{ width: '25%', height: '100%' }}
            limitTags={2}
            value={filter.location_id}
            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
            onChange={(e, val) => setFilter({ ...filter, location_id: val })}
            renderInput={(params) => <TextField {...params} label={<FormattedMessage id="location" />} />}
          />
          <Autocomplete
            id="category"
            sx={{ width: '25%', height: '100%' }}
            options={[]}
            value={filter.status}
            onChange={(e, val) => setFilter({ ...filter, status: val })}
            renderInput={(params) => <TextField {...params} label={<FormattedMessage id="staff" />} />}
          />
          <Autocomplete
            id="category"
            sx={{ width: '25%', height: '100%' }}
            options={[]}
            value={filter.status}
            onChange={(e, val) => setFilter({ ...filter, status: val })}
            renderInput={(params) => <TextField {...params} label={<FormattedMessage id="facility" />} />}
          />
        </Stack>{' '}
      </Stack>
      <Stack direction={matchDownSM ? 'column' : 'row'} spacing={1} sx={{ p: 3, pt: 0, pb: 0, mt: '10px !important' }}>
        <Autocomplete
          id="category"
          sx={{ width: '25%', height: '100%' }}
          options={[]}
          value={filter.status}
          onChange={(e, val) => setFilter({ ...filter, status: val })}
          renderInput={(params) => <TextField {...params} label={<FormattedMessage id="service" />} />}
        />
        <Button variant="outlined" color="secondary" startIcon={<UndoOutlined />}>
          <FormattedMessage id="reset" />
        </Button>
        <Button variant="outlined" startIcon={<AlignCenterOutlined />}>
          <FormattedMessage id="filter" />
        </Button>
      </Stack>
    </>
  );
}
