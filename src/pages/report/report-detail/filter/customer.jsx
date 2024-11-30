import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Button, Stack, useMediaQuery } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { AlignCenterOutlined, UndoOutlined } from '@ant-design/icons';

import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import MultiSelectAll from 'components/MultiSelectAll';

export default function FilterCustomer({ extData, filter, setFilter }) {
  const theme = useTheme();
  const [isReset, setIsReset] = useState(false);
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

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
            key={'filter-location'}
            selectAllLabel="Select All"
            onChange={(val) => setFilter((e) => ({ ...e, location: val }))}
            isReset={isReset}
            setIsReset={setIsReset}
            label={<FormattedMessage id="location" />}
          />
          <MultiSelectAll
            items={extData?.customerGroup || []}
            style={{ width: '25%', height: '100%' }}
            limitTags={1}
            value={filter?.customerGroup}
            key={'filter-customer-group'}
            selectAllLabel="Select All"
            onChange={(val) => setFilter((e) => ({ ...e, customerGroup: val }))}
            isReset={isReset}
            setIsReset={setIsReset}
            label={<FormattedMessage id="customer-group" />}
          />
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<UndoOutlined />}
            onClick={() => {
              setFilter(() => ({ location: [], customerGroup: [], date: '' }));
              setIsReset(true);
            }}
          >
            <FormattedMessage id="reset" />
          </Button>
          <Button variant="outlined" startIcon={<AlignCenterOutlined />}>
            <FormattedMessage id="filter" />
          </Button>
        </Stack>
      </Stack>
    </>
  );
}
