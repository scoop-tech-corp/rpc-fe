import { useTheme } from '@mui/material/styles';
import { Button, Stack, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { AlignCenterOutlined, UndoOutlined } from '@ant-design/icons';
import { getFacilityByLocationList } from 'service/service-global';

import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import MultiSelectAll from 'components/MultiSelectAll';
import useGetList from 'hooks/useGetList';

export default function FilterBooking({ extData, filter, setFilter }) {
  const theme = useTheme();
  const [isReset, setIsReset] = useState(false);
  // const MockServiceDropdownList = [
  //   { label: 'w', value: 28 },
  //   { label: 'Scalling Anjing Extra Care1', value: 27 },
  //   { label: 'Operasi Pyometria', value: 26 },
  //   { label: 'coba input service', value: 23 },
  //   { label: 'Infus NACL', value: 16 },
  //   { label: 'Nebu Ventolin', value: 15 },
  //   { label: 'Scalling Anjing Extra Care', value: 14 },
  //   { label: 'Scalling Anjing', value: 12 },
  //   { label: 'Klinik Virus', value: 11 },
  //   { label: 'Klinik Untuk Melahirkan', value: 10 },
  //   { label: 'Titip Sehat', value: 9 },
  //   { label: 'Grooming Anjing', value: 6 }
  // ];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            key={'filter-location'}
            selectAllLabel="Select All"
            onChange={(val) => setFilter((e) => ({ ...e, location: val }))}
            isReset={isReset}
            setIsReset={setIsReset}
            label={<FormattedMessage id="location" />}
          />
          <MultiSelectAll
            items={extData?.staff || []}
            style={{ width: '25%', height: '100%' }}
            limitTags={1}
            value={filter?.staff}
            key={'filter-staff'}
            selectAllLabel="Select All"
            onChange={(val) => setFilter((e) => ({ ...e, staff: val }))}
            isReset={isReset}
            setIsReset={setIsReset}
            label={<FormattedMessage id="staff" />}
          />

          <MultiSelectAll
            items={facilityList.list || []}
            style={{ width: '25%', height: '100%' }}
            limitTags={1}
            key={'filter-facility'}
            value={filter?.facility}
            selectAllLabel="Select All"
            onChange={(val) => setFilter((e) => ({ ...e, facility: val }))}
            isReset={isReset}
            setIsReset={setIsReset}
            label={<FormattedMessage id="facility" />}
          />
        </Stack>{' '}
      </Stack>
      <Stack direction={matchDownSM ? 'column' : 'row'} spacing={1} sx={{ p: 3, pt: 0, pb: 0, mt: '10px !important' }}>
        <MultiSelectAll
          items={extData?.service || []}
          style={{ width: '25%', height: '100%' }}
          limitTags={1}
          key={'filter-service'}
          value={filter?.service}
          selectAllLabel="Select All"
          onChange={(val) => setFilter((e) => ({ ...e, service: val }))}
          isReset={isReset}
          setIsReset={setIsReset}
          label={<FormattedMessage id="service" />}
        />
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<UndoOutlined />}
          onClick={() => {
            setFilter(() => ({ location: [], staff: [], service: [], category: [], facility: [], date: '' }));
            setIsReset(true);
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
