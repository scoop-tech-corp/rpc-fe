import { Button, Stack } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ExportOutlined } from '@ant-design/icons';
import {
  getLocationList,
  getStaffList,
  getServiceList,
  getCustomerGroupList,
  createMessageBackend,
  processDownloadExcel,
  getPaymentMethodList
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
  exportReportDepositList,
  exportReportDepositSummary,
  exportReportProductsCost,
  exportReportProductsLowStock,
  exportReportProductsNoStock,
  exportReportProductsStockCount,
  exportReportSalesByService,
  exportReportSalesItems,
  exportReportSalesSummary,
  exportReportStaffLate,
  exportReportStaffLeave,
  exportReportStaffLogin,
  exportReportStaffPerformance,
  getReportCustomerGrowth,
  getReportCustomerGrowthGroup,
  getReportCustomerLeaving,
  getReportCustomerList,
  getReportCustomerReferralSpend,
  getReportCustomerSubAccount,
  getReportCustomerTotal,
  getReportDepositList,
  getReportDepositSummary,
  getReportProductsCost,
  getReportProductsLowStock,
  getReportProductsNoStock,
  getReportProductsStockCount,
  getReportSalesByService,
  getReportSalesItems,
  getReportSalesSummary,
  getReportStaffLate,
  getReportStaffLeave,
  getReportStaffLogin,
  getReportStaffPerformance
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
import FilterStaff from './filter/staff';
import StaffLogin from './section/staff/login';
import StaffLate from './section/staff/late';
import StaffLeave from './section/staff/leave';
import StaffPerformance from './section/staff/performance';
import { getBrandList, getSupplierList } from 'pages/product/product-list/service';
import FilterProducts from './filter/products';
import ProductsStockCount from './section/products/stock-count';
import ProductsLowStock from './section/products/low-stock';
import ProductsCost from './section/products/cost';
import ProductsNoStock from './section/products/no-stock ';
import FilterDeposit from './filter/deposit';
import DepositList from './section/deposit/list';
import DepositSummary from './section/deposit/summary';
import FilterSales from './filter/sales';
import SalesSummary from './sales/summary';
import SalesItems from './sales/items';
import SalesByService from './sales/by-service';

export default function Index() {
  let [searchParams] = useSearchParams();
  let type = searchParams.get('type');
  let detail = searchParams.get('detail');
  const { user } = useAuth();
  const dispatch = useDispatch();
  const firstRender = useRef(true);

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
    if (type === 'staff')
      return {
        orderValue: '',
        orderColumn: '',
        goToPage: 1,
        rowPerPage: 5,
        date: '',
        location: [],
        staff: [],
        leaveType: []
      };

    if (type === 'products' && detail === 'cost') {
      return {
        orderValue: '',
        orderColumn: '',
        goToPage: 1,
        rowPerPage: 5,
        date: '',
        location: [],
        product: []
      };
    }

    if (type === 'products') {
      return {
        orderValue: '',
        orderColumn: '',
        goToPage: 1,
        rowPerPage: 5,
        search: '',
        brand: [],
        supplier: [],
        location: []
      };
    }

    if (type === 'deposit') {
      return {
        orderValue: '',
        orderColumn: '',
        goToPage: 1,
        rowPerPage: 5,
        date: '',
        search: '',
        location: [],
        method: []
      };
    }

    if (type === 'sales') {
      return {
        orderValue: '',
        orderColumn: '',
        goToPage: 1,
        rowPerPage: 5,
        date: '',
        search: '',
        location: [],
        status: [],
        payment: [],
        staff: [],
        itemType: [],
        productCategory: [],
        category: []
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
    if (type === 'staff') getPrepareDataForStaff();
    if (type === 'products') getPrepareDataForProducts();
    if (type === 'deposit') getPrepareDataForDeposit();
    if (type === 'sales') getPrepareDataForSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (!firstRender.current) fetchData();

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
    } else if (type === 'staff') {
      if (detail === 'login') respFetch = await getReportStaffLogin(filter);
      if (detail === 'late') respFetch = await getReportStaffLate(filter);
      if (detail === 'leave') respFetch = await getReportStaffLeave(filter);
      if (detail === 'performance') respFetch = await getReportStaffPerformance(filter);
    } else if (type === 'products') {
      if (detail === 'stock-count') respFetch = await getReportProductsStockCount(filter);
      if (detail === 'low-stock') respFetch = await getReportProductsLowStock(filter);
      if (detail === 'cost') respFetch = await getReportProductsCost(filter);
      if (detail === 'no-stock') respFetch = await getReportProductsNoStock(filter);
    } else if (type === 'deposit') {
      if (detail === 'list') respFetch = await getReportDepositList(filter);
      if (detail === 'summary') respFetch = await getReportDepositSummary(filter);
    } else if (type === 'sales') {
      if (detail === 'summary') respFetch = await getReportSalesSummary(filter);
      if (detail === 'items') respFetch = await getReportSalesItems(filter);
      if (detail === 'by-service') respFetch = await getReportSalesByService(filter);
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
      else if (type === 'staff' && detail === 'login') return await exportReportStaffLogin(filter);
      else if (type === 'staff' && detail === 'late') return await exportReportStaffLate(filter);
      else if (type === 'staff' && detail === 'leave') return await exportReportStaffLeave(filter);
      else if (type === 'staff' && detail === 'performance') return await exportReportStaffPerformance(filter);
      else if (type === 'products' && detail === 'stock-count') return await exportReportProductsStockCount(filter);
      else if (type === 'products' && detail === 'low-stock') return await exportReportProductsLowStock(filter);
      else if (type === 'products' && detail === 'cost') return await exportReportProductsCost(filter);
      else if (type === 'products' && detail === 'no-stock') return await exportReportProductsNoStock(filter);
      else if (type === 'deposit' && detail === 'list') return await exportReportDepositList(filter);
      else if (type === 'deposit' && detail === 'summary') return await exportReportDepositSummary(filter);
      else if (type === 'sales' && detail === 'summary') return await exportReportSalesSummary(filter);
      else if (type === 'sales' && detail === 'items') return await exportReportSalesItems(filter);
      else if (type === 'sales' && detail === 'by-service') return await exportReportSalesByService(filter);
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

  const getPrepareDataForStaff = async () => {
    const getLoc = await getLocationList();
    const getStaff = await getStaffList();

    setExtData((prevState) => ({
      ...prevState,
      location: getLoc,
      staff: getStaff,
      leaveType: [
        { label: 'Leave Allowance', value: 'Leave Allowance' },
        { label: 'Sick Allowance', value: 'Sick Allowance' }
      ]
    }));
  };

  const getPrepareDataForProducts = async () => {
    const getLoc = await getLocationList();
    const getBrand = await getBrandList();
    const getSupplier = await getSupplierList();

    setExtData((prevState) => ({
      ...prevState,
      location: getLoc,
      brand: getBrand,
      supplier: getSupplier
    }));
  };

  const getPrepareDataForDeposit = async () => {
    const getLoc = await getLocationList();
    const getPaymentMethod = await getPaymentMethodList();

    setExtData((prevState) => ({
      ...prevState,
      location: getLoc,
      method: getPaymentMethod
    }));
  };

  const getPrepareDataForSales = async () => {
    const getLoc = await getLocationList();
    const getStaff = await getStaffList();
    const getStatus = []; // need API
    const getPayment = []; // need API
    const getItemType = []; // need API
    const productCategory = []; // need API
    const category = []; // need API

    setExtData((prevState) => ({
      ...prevState,
      location: getLoc,
      staff: getStaff,
      status: getStatus,
      payment: getPayment,
      itemType: getItemType,
      productCategory: productCategory,
      category: category
    }));
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

    if (type === 'staff' && detail === 'login') return 'staff-login';
    if (type === 'staff' && detail === 'late') return 'staff-late';
    if (type === 'staff' && detail === 'leave') return 'staff-leave';
    if (type === 'staff' && detail === 'performance') return 'staff-performance';

    if (type === 'products' && detail === 'stock-count') return 'product-stock-count';
    if (type === 'products' && detail === 'low-stock') return 'product-low-stock';
    if (type === 'products' && detail === 'cost') return 'product-cost';
    if (type === 'products' && detail === 'no-stock') return 'product-no-stock';

    if (type === 'deposit' && detail === 'list') return 'deposit-list';
    if (type === 'deposit' && detail === 'summary') return 'deposit-summary';

    if (type === 'sales' && detail === 'summary') return 'sales-summary';
    if (type === 'sales' && detail === 'items') return 'sales-items';
    if (type === 'sales' && detail === 'by-service') return 'sales-by-service';

    return '-';
  };

  const getFilter = () => {
    if (type === 'booking') return <FilterBooking extData={extData} filter={filter} setFilter={setFilter} />;
    if (type === 'customer') return <FilterCustomer extData={extData} filter={filter} setFilter={setFilter} />;
    if (type === 'staff') return <FilterStaff extData={extData} filter={filter} setFilter={setFilter} />;
    if (type === 'products') return <FilterProducts extData={extData} filter={filter} setFilter={setFilter} />;
    if (type === 'deposit') return <FilterDeposit extData={extData} filter={filter} setFilter={setFilter} />;
    if (type === 'sales') return <FilterSales extData={extData} filter={filter} setFilter={setFilter} />;

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

    if (type === 'staff' && detail === 'login') return <StaffLogin data={mainData} setFilter={setFilter} filter={filter} />;
    if (type === 'staff' && detail === 'late') return <StaffLate data={mainData} setFilter={setFilter} />;
    if (type === 'staff' && detail === 'leave') return <StaffLeave data={mainData} setFilter={setFilter} />;
    if (type === 'staff' && detail === 'performance') return <StaffPerformance data={mainData} setFilter={setFilter} filter={filter} />;

    if (type === 'products' && detail === 'stock-count')
      return <ProductsStockCount data={mainData} setFilter={setFilter} filter={filter} />;
    if (type === 'products' && detail === 'low-stock') return <ProductsLowStock data={mainData} setFilter={setFilter} filter={filter} />;
    if (type === 'products' && detail === 'cost')
      return <ProductsCost data={mainData} setFilter={setFilter} filter={filter} extData={extData} />;
    if (type === 'products' && detail === 'no-stock')
      return <ProductsNoStock data={mainData} setFilter={setFilter} filter={filter} extData={extData} />;

    if (type === 'deposit' && detail === 'list') return <DepositList data={mainData} setFilter={setFilter} filter={filter} />;
    if (type === 'deposit' && detail === 'summary') return <DepositSummary data={mainData} setFilter={setFilter} filter={filter} />;

    if (type === 'sales' && detail === 'summary') return <SalesSummary data={mainData} setFilter={setFilter} filter={filter} />;
    if (type === 'sales' && detail === 'items') return <SalesItems data={mainData} setFilter={setFilter} filter={filter} />;
    if (type === 'sales' && detail === 'by-service') return <SalesByService data={mainData} setFilter={setFilter} filter={filter} />;

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
