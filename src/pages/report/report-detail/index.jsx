import { Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ExportOutlined } from '@ant-design/icons';
import { getLocationList, getStaffList, getServiceList, getCustomerGroupList } from 'service/service-global';
import { useSearchParams } from 'react-router-dom';
import { getTypeIdList } from 'pages/customer/service';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import FilterBooking from './filter/bookings';
import BookingByLocation from './section/bookings/by-location';
import BookingByStatus from './section/bookings/by-status';
import BookingByCancelationReason from './section/bookings/by-cancelation-reason';
import BookingByList from './section/bookings/by-list';
import BookingByDiagnosisList from './section/bookings/by-diagnosis-list';
import useAuth from 'hooks/useAuth';
import FilterCustomer from './filter/customer';
import CustomerGrowth from './section/customer/growth';
import CustomerGrowthByGroup from './section/customer/growt-by-group';
import CustomerTotal from './section/customer/total';
import CustomerLeaving from './section/customer/leaving';
import CustomerList from './section/customer/list';
import CustomerReferralSpend from './section/customer/referral-spend';
import CustomerSubAccountList from './section/customer/sub-account-list';

export default function Index() {
  let [searchParams] = useSearchParams();
  let type = searchParams.get('type');
  let detail = searchParams.get('detail');
  const { user } = useAuth();

  const [extData, setExtData] = useState({
    location: []
  });

  const [filter, setFilter] = useState(() => {
    if (type === 'booking') return { location: [], staff: [], service: [], category: [], facility: [], date: '' };
    if (type === 'customer') {
      return { location: [], customerGroup: [], date: '', status: '', search: '', gender: '', sterile: '', typeId: [] };
    }
  });

  const checkAccess = (item, title) => {
    const tempUrl = `report-detail?type=${item}&detail=${title}`;
    const checkIfExist = user?.reportMenu?.items?.find((e) => e.url === tempUrl);

    return checkIfExist;
  };

  useEffect(() => {
    const thisAccess = checkAccess(type, detail);
    if (!thisAccess) return (window.location.href = '/report');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!type || !detail) return (window.location.href = '/report');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (type === 'booking') getPrepareDataForBooking();
    if (type === 'customer') getPrepareDataForCustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function fetchData() {}

    fetchData();
  }, []);

  const onExport = async () => {
    // const paramsExport = {
    //   orderValue: params.orderValue,
    //   orderColumn: params.orderColumn,
    //   search: params.search
    // };
    // return await exportData(exportTreatment, paramsExport);
  };

  const getPrepareDataForBooking = async () => {
    const getLoc = await getLocationList();
    const getStaff = await getStaffList();
    const getService = await getServiceList();

    setExtData((prevState) => ({ ...prevState, location: getLoc, staff: getStaff, service: getService }));
  };

  const getPrepareDataForCustomer = async () => {
    const getLoc = await getLocationList();
    const getCustomerGroup = await getCustomerGroupList();

    let getTypeId = [];
    if (detail === 'list') getTypeId = await getTypeIdList();

    setExtData((prevState) => ({ ...prevState, location: getLoc, customerGroup: getCustomerGroup, typeId: getTypeId }));
  };

  const getTitle = () => {
    if (type === 'booking' && detail === 'by-location') return 'booking-by-location';
    if (type === 'booking' && detail === 'by-status') return 'booking-by-status';
    if (type === 'booking' && detail === 'by-cancellation-reason') return 'booking-by-cancellation-reason';
    if (type === 'booking' && detail === 'list') return 'booking-list';
    if (type === 'booking' && detail === 'diagnosis-list') return 'booking-diagnosis-list';
    if (type === 'booking' && detail === 'by-diagnosis-species-gender') return 'booking-by-diagnosis-species-gender';

    if (type === 'customer' && detail === 'growth') return 'customer-growth';
    if (type === 'customer' && detail === 'growth-by-group') return 'customer-growth-by-group';
    if (type === 'customer' && detail === 'total') return 'customer-total';
    if (type === 'customer' && detail === 'leaving') return 'customer-leaving';
    if (type === 'customer' && detail === 'list') return 'customer-list';
    if (type === 'customer' && detail === 'referral-spend') return 'customer-referral-spend';
    if (type === 'customer' && detail === 'sub-account-list') return 'customer-sub-account-list';

    return '-';
  };

  const getFilter = () => {
    if (type === 'booking') return <FilterBooking extData={extData} filter={filter} setFilter={setFilter} />;
    if (type === 'customer') return <FilterCustomer extData={extData} filter={filter} setFilter={setFilter} />;

    return '';
  };

  const getSections = () => {
    if (type === 'booking' && detail === 'by-location') return <BookingByLocation data={[]} />;
    if (type === 'booking' && detail === 'by-status') return <BookingByStatus data={[]} />;
    if (type === 'booking' && detail === 'by-cancellation-reason') return <BookingByCancelationReason data={[]} />;
    if (type === 'booking' && detail === 'list') return <BookingByList data={[]} />;
    if (type === 'booking' && detail === 'diagnosis-list') return <BookingByDiagnosisList data={[]} />;
    if (type === 'booking' && detail === 'by-diagnosis-species-gender') return 'booking-by-diagnosis-species-gender';

    if (type === 'customer' && detail === 'growth') return <CustomerGrowth data={[]} />;
    if (type === 'customer' && detail === 'growth-by-group') return <CustomerGrowthByGroup data={[]} />;
    if (type === 'customer' && detail === 'total') return <CustomerTotal data={[]} />;
    if (type === 'customer' && detail === 'leaving') return <CustomerLeaving data={[]} />;
    if (type === 'customer' && detail === 'list') return <CustomerList data={[]} />;
    if (type === 'customer' && detail === 'referral-spend') return <CustomerReferralSpend data={[]} />;
    if (type === 'customer' && detail === 'sub-account-list') return <CustomerSubAccountList data={[]} />;

    return '';
  };

  return (
    <>
      <HeaderPageCustom
        title={<FormattedMessage id={getTitle()} />}
        isBreadcrumb={false}
        locationBackConfig={{ setLocationBack: true, customUrl: '/report' }}
        action={
          <>
            <Button variant="contained" startIcon={<ExportOutlined />} onClick={onExport}>
              <FormattedMessage id="export" />
            </Button>
          </>
        }
      />

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
