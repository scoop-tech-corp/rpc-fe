import React from 'react';

import { Button, Stack } from '@mui/material';

import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ExportOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
// import { exportData } from 'utils/exportData.js';

import { useSearchParams } from 'react-router-dom';
import { DateRangePicker } from 'materialui-daterange-picker';
import FilterBooking from './filter/bookings';
import BookingByLocation from './section/bookings/by-location';
import BookingByStatus from './section/bookings/by-status';
import BookingByCancelationReason from './section/bookings/by-cancelation-reason';
import BookingByList from './section/bookings/by-list';
import BookingByDiagnosisList from './section/bookings/by-diagnosis-list';

export default function Index() {
  let [searchParams] = useSearchParams();

  const [filter, setFilter] = useState({
    location_id: '',
    status: '',
    category: [],
    facility: [],
    location: []
  });

  let type = searchParams.get('type');
  let detail = searchParams.get('detail');

  useEffect(() => {
    if (!type || !detail) return (window.location.href = '/report');
  }, []);

  const onExport = async () => {
    // const paramsExport = {
    //   orderValue: params.orderValue,
    //   orderColumn: params.orderColumn,
    //   search: params.search
    // };
    // return await exportData(exportTreatment, paramsExport);
  };

  useEffect(() => {
    async function fetchData() {}

    fetchData();
  }, []);

  const getTitle = () => {
    if (type === 'booking' && detail === 'by-location') return 'booking-by-location';
    if (type === 'booking' && detail === 'by-status') return 'booking-by-status';
    if (type === 'booking' && detail === 'by-cancellation-reason') return 'booking-by-cancellation-reason';
    if (type === 'booking' && detail === 'list') return 'booking-list';
    if (type === 'booking' && detail === 'diagnosis-list') return 'booking-diagnosis-list';
    if (type === 'booking' && detail === 'by-diagnosis-species-gender') return 'booking-by-diagnosis-species-gender';

    return '-';
  };

  const getFilter = () => {
    if (type === 'booking') return <FilterBooking dateRange={dateRange} filter={filter} />;

    return '';
  };

  const getSections = () => {
    if (type === 'booking' && detail === 'by-location') return <BookingByLocation data={[]} />;
    if (type === 'booking' && detail === 'by-status') return <BookingByStatus data={[]} />;
    if (type === 'booking' && detail === 'by-cancellation-reason') return <BookingByCancelationReason data={[]} />;
    if (type === 'booking' && detail === 'list') return <BookingByList data={[]} />;
    if (type === 'booking' && detail === 'diagnosis-list') return <BookingByDiagnosisList data={[]} />;
    if (type === 'booking' && detail === 'by-diagnosis-species-gender') return 'booking-by-diagnosis-species-gender';
    return '';
  };

  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  return (
    <>
      <HeaderPageCustom
        title={<FormattedMessage id={getTitle()} />}
        isBreadcrumb={true}
        locationBackConfig={{ setLocationBack: true, customUrl: '/report' }}
        action={
          <>
            <Button variant="contained" startIcon={<ExportOutlined />} onClick={onExport}>
              <FormattedMessage id="export" />
            </Button>
          </>
        }
      />
      <div
        style={{
          position: 'absolute',
          zIndex: 1000,
          marginTop: 180
        }}
      >
        <DateRangePicker
          open={openDatePicker}
          onChange={(range) => {
            setDateRange(range);
            setOpenDatePicker(false);
          }}
          closeOnClickOutside
        />
      </div>
      <MainCard content={false}>
        <div className="" style={{ margin: 20 }}>
          <ScrollX>
            <Stack spacing={3}>
              <MainCard content={false} sx={{ m: 3, pb: 0 }}>
                <ScrollX>
                  <Stack spacing={3}>
                    {getFilter()}

                    {getSections()}
                  </Stack>
                </ScrollX>
              </MainCard>
            </Stack>
          </ScrollX>
        </div>
      </MainCard>
    </>
  );
}
