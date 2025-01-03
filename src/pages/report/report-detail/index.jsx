import { Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ExportOutlined } from '@ant-design/icons';
import {
  getLocationList,
  getStaffList,
  getServiceList,
  getCustomerGroupList,
  createMessageBackend,
  processDownloadExcel
} from 'service/service-global';
import { useSearchParams } from 'react-router-dom';
import { getTypeIdList } from 'pages/customer/service';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import {
  exportReportCustomerGrowth,
  exportReportCustomerGrowthGroup,
  exportReportCustomerLeaving,
  exportReportCustomerList,
  exportReportCustomerReferralSpend,
  exportReportCustomerSubAccount,
  exportReportCustomerTotal,
  getReportCustomerGrowth,
  getReportCustomerGrowthGroup,
  getReportCustomerLeaving,
  getReportCustomerList,
  getReportCustomerReferralSpend,
  getReportCustomerSubAccount,
  getReportCustomerTotal
} from '../service';

import useAuth from 'hooks/useAuth';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import FilterBooking from './filter/bookings';
import BookingByLocation from './section/bookings/by-location';
import BookingByStatus from './section/bookings/by-status';
import BookingByCancelationReason from './section/bookings/by-cancelation-reason';
import BookingByList from './section/bookings/by-list';
import BookingByDiagnosisList from './section/bookings/by-diagnosis-list';
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
  const dispatch = useDispatch();

  const [mainData, setMainData] = useState();

  const [extData, setExtData] = useState({
    location: []
  });

  const [filter, setFilter] = useState(() => {
    if (type === 'booking') return { location: [], staff: [], service: [], category: [], facility: [], date: '' };
    if (type === 'customer') {
      return {
        orderValue: '',
        orderColumn: '',
        location: [],
        customerGroup: [],
        date: '',
        status: '',
        search: '',
        gender: '',
        sterile: '',
        typeId: []
      };
    }
  });

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
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchData = async () => {
    let respFetch;

    if (type === 'customer') {
      let payload = {
        orderValue: filter.orderValue,
        orderColumn: filter.orderColumn,
        date: filter.date,
        location: filter.location,
        customerGroup: filter.customerGroup
      };
      if (detail === 'growth') respFetch = await getReportCustomerGrowth(payload);
      else if (detail === 'growth-by-group') respFetch = await getReportCustomerGrowthGroup(payload);
      else if (detail === 'total') respFetch = await getReportCustomerTotal(payload);
      else if (detail === 'leaving') {
        payload = { ...payload, status: filter.status };
        respFetch = await getReportCustomerLeaving(payload);
      } else if (detail === 'list') {
        payload = { ...payload, status: filter.status, search: filter.search, gender: filter.gender, typeId: filter.typeId };
        respFetch = await getReportCustomerList(payload);
      } else if (detail === 'referral-spend') {
        payload = { ...payload, search: filter.search };
        respFetch = await getReportCustomerReferralSpend(payload);
      } else if (detail === 'sub-account-list') {
        payload = { ...payload, search: filter.search, gender: filter.gender, sterile: filter.sterile };
        respFetch = await getReportCustomerSubAccount(payload);
      }
    }

    setMainData(respFetch?.data || []);
  };

  const onExport = () => {
    const fetchExport = async () => {
      if (type === 'customer' && detail === 'growth')
        return await exportReportCustomerGrowth({ date: filter.date, location: filter.location, customerGroup: filter.customerGroup });
      else if (type === 'customer' && detail === 'growth-by-group')
        return await exportReportCustomerGrowthGroup({ date: filter.date, location: filter.location, customerGroup: filter.customerGroup });
      else if (type === 'customer' && detail === 'total')
        return await exportReportCustomerTotal({ date: filter.date, location: filter.location, customerGroup: filter.customerGroup });
      else if (type === 'customer' && detail === 'leaving')
        return await exportReportCustomerLeaving({
          date: filter.date,
          location: filter.location,
          customerGroup: filter.customerGroup,
          status: filter.status
        });
      else if (type === 'customer' && detail === 'list')
        return await exportReportCustomerList({
          date: filter.date,
          location: filter.location,
          customerGroup: filter.customerGroup,
          status: filter.status,
          search: filter.search,
          gender: filter.gender,
          typeId: filter.typeId
        });
      else if (type === 'customer' && detail === 'referral-spend')
        return await exportReportCustomerReferralSpend({
          date: filter.date,
          location: filter.location,
          search: filter.search
        });
      else if (type === 'customer' && detail === 'sub-account-list')
        return await exportReportCustomerSubAccount({
          date: filter.date,
          location: filter.location,
          customerGroup: filter.customerGroup,
          gender: filter.gender,
          sterile: filter.sterile,
          search: filter.search
        });
    };

    fetchExport()
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
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

    if (type === 'customer' && detail === 'growth') return <CustomerGrowth data={mainData} setFilter={setFilter} />;
    if (type === 'customer' && detail === 'growth-by-group') return <CustomerGrowthByGroup data={mainData} setFilter={setFilter} />;
    if (type === 'customer' && detail === 'total') return <CustomerTotal data={mainData} setFilter={setFilter} />;
    if (type === 'customer' && detail === 'leaving') return <CustomerLeaving data={mainData} setFilter={setFilter} />;
    if (type === 'customer' && detail === 'list') return <CustomerList data={mainData} setFilter={setFilter} />;
    if (type === 'customer' && detail === 'referral-spend') return <CustomerReferralSpend data={mainData} setFilter={setFilter} />;
    if (type === 'customer' && detail === 'sub-account-list') return <CustomerSubAccountList data={mainData} setFilter={setFilter} />;

    return '';
  };

  const checkAccess = (item, title) => {
    const tempUrl = `report-detail?type=${item}&detail=${title}`;
    const checkIfExist = user?.reportMenu?.items?.find((e) => e.url === tempUrl);

    return checkIfExist;
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
