import { ExportOutlined } from '@ant-design/icons';
import { Button, Stack } from '@mui/material';
import { getTypeIdList, getPetCategoryList } from 'pages/customer/service';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  createMessageBackend,
  getCustomerGroupList,
  getLocationList,
  getServiceList,
  getStaffJobTitleList,
  getStaffList,
  processDownloadExcel
} from 'service/service-global';
import { snackbarError } from 'store/reducers/snackbar';
import {
  exportReportBookingByDiagnosisSpeciesGender,
  exportReportCustomerGrowth,
  exportReportCustomerGrowthGroup,
  exportReportCustomerLeaving,
  exportReportCustomerList,
  exportReportCustomerReferralSpend,
  exportReportCustomerSubAccount,
  exportReportCustomerTotal,
  exportReportDepositList,
  exportReportDepositSummary,
  exportReportExpensesList,
  exportReportExpensesSummary,
  exportReportProductsCost,
  exportReportProductsLowStock,
  exportReportProductsNoStock,
  exportReportProductsReminders,
  exportReportProductsBatches,
  exportReportProductsExpiry,
  exportReportProductsStockCount,
  exportReportSalesByProduct,
  exportReportSalesByService,
  exportReportSalesDailyAudit,
  exportReportSalesDetails,
  exportReportSalesItems,
  exportReportSalesPaymentList,
  exportReportSalesStaffServiceSales,
  exportReportSalesSummary,
  exportReportSalesUnpaid,
  exportReportStaffLate,
  exportReportStaffLeave,
  exportReportStaffLogin,
  exportReportStaffPerformance,
  getReportBookingByCancellationReason,
  getReportBookingByDiagnosisSpeciesGender,
  getReportBookingDiagnoseOptions,
  getReportBookingByStatus,
  getReportBookingDiagnosisList,
  getReportBookingList,
  getReportCustomerGrowth,
  getReportCustomerGrowthGroup,
  getReportCustomerLeaving,
  getReportCustomerList,
  getReportCustomerReferralSpend,
  getReportCustomerSubAccount,
  getReportCustomerTotal,
  getReportDepositList,
  getReportDepositSummary,
  getReportExpensesList,
  getReportExpensesSummary,
  getExpensesOptionPayment,
  getExpensesOptionStatus,
  getExpensesOptionSubmiter,
  getExpensesOptionRecipient,
  getExpensesOptionCategory,
  getExpensesOptionSupplier,
  getReportProductsCost,
  getReportProductsLowStock,
  getReportProductsNoStock,
  getReportProductsReminders,
  getReportProductsBatches,
  getReportProductsExpiry,
  getReportProductsStockCount,
  getReportSalesByProduct,
  getReportSalesByService,
  getReportSalesDailyAudit,
  getReportSalesDetails,
  getReportSalesDiscountSummary,
  getReportSalesItems,
  getReportSalesNetIncome,
  getReportSalesPaymentList,
  getReportSalesPaymentSummary,
  getReportSalesStaffServiceSales,
  getReportSalesSummary,
  getReportSalesUnpaid,
  getReportStaffLate,
  getReportStaffLeave,
  getReportStaffLogin,
  getReportStaffPerformance
} from '../service';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import useAuth from 'hooks/useAuth';
import { getBrandList, getSupplierList } from 'pages/product/product-list/service';
import FilterBooking from './filter/bookings';
import FilterCustomer from './filter/customer';
import FilterDeposit from './filter/deposit';
import FilterProducts from './filter/products';
import FilterSales from './filter/sales';
import FilterStaff from './filter/staff';
import SalesByProduct from './sales/by-product';
import SalesByService from './sales/by-service';
import SalesDailyAudit from './sales/daily-audit';
import SalesDetails from './sales/details';
import SalesDiscountSummary from './sales/discount-summary';
import SalesItems from './sales/items';
import SalesNetIncome from './sales/net-income';
import SalesPaymentList from './sales/payment-list';
import SalesPaymentSummary from './sales/payment-summary';
import SalesSummary from './sales/summary';
import SalesUnpaid from './sales/unpaid';
import BookingByCancelationReason from './section/bookings/by-cancelation-reason';
import BookingByDiagnosisList from './section/bookings/by-diagnosis-list';
import BookingByList from './section/bookings/by-list';
import BookingByLocation from './section/bookings/by-location';
import BookingByStatus from './section/bookings/by-status';
import CustomerGrowthByGroup from './section/customer/growt-by-group';
import CustomerGrowth from './section/customer/growth';
import CustomerLeaving from './section/customer/leaving';
import CustomerList from './section/customer/list';
import CustomerReferralSpend from './section/customer/referral-spend';
import CustomerSubAccountList from './section/customer/sub-account-list';
import CustomerTotal from './section/customer/total';
import DepositList from './section/deposit/list';
import DepositSummary from './section/deposit/summary';
import ProductsCost from './section/products/cost';
import ProductsLowStock from './section/products/low-stock';
import ProductsNoStock from './section/products/no-stock ';
import ProductsReminders from './section/products/reminders';
import ProductsBatches from './section/products/batches';
import ProductExpiry from './section/products/expiry';
import ProductsStockCount from './section/products/stock-count';
import StaffLate from './section/staff/late';
import StaffLeave from './section/staff/leave';
import StaffLogin from './section/staff/login';
import StaffPerformance from './section/staff/performance';
import BookingByDiagnosisSpeciesGender from './section/bookings/by-diagnosis-species-gender';
import FilterExpenses from './filter/expenses';
import ExpensesList from './section/expenses/list';
import ExpensesSummary from './section/expenses/summary';
import SalesStaffServiceSales from './sales/staff-service-sales';

export default function Index() {
  let [searchParams] = useSearchParams();
  let type = searchParams.get('type');
  let detail = searchParams.get('detail');
  const { user } = useAuth();
  const dispatch = useDispatch();
  const location = useLocation();

  // Jika ada prefilter dari navigasi (misal dari Summary → List),
  // skip firstRender guard agar fetchData langsung berjalan saat mount
  const hasPrefilter = !!location.state?.prefilterCategory;
  const firstRender = useRef(!hasPrefilter);

  const [mainData, setMainData] = useState();
  const [isFetching, setIsFetching] = useState(false);

  const [extData, setExtData] = useState({
    location: []
  });

  const [filter, setFilter] = useState(() => {
    if (type === 'booking') {
      return {
        orderValue: '',
        orderColumn: '',
        goToPage: 1,
        rowPerPage: 5,
        date: '',
        location: [],
        staff: [],
        service: [],
        category: [],
        facility: [],
        gender: [],
        diagnose: [],
        species: [],
        search: '',
        status: ''
      };
    }
    if (type === 'customer') {
      return {
        orderValue: '',
        orderColumn: '',
        goToPage: 1,
        rowPerPage: 5,
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
        leaveType: [],
        jobTitle: []
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
        location: [],
        customer: []
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
        service: [],
        itemType: [],
        productCategory: [],
        category: [],
        method: [],
        customer: [],
        invoiceCategory: []
      };
    }

    if (type === 'expenses') {
      return {
        orderValue: '',
        orderColumn: '',
        goToPage: 1,
        rowPerPage: 5,
        date: '',
        search: '',
        location: [],
        payment: [],
        status: [],
        staff: [],
        submiter: [],
        supplier: [],
        recipient: [],
        category: location.state?.prefilterCategory || []
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
    if (type === 'expenses') getPrepareDataForExpenses();
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
    setIsFetching(true);

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
        payload = { ...payload, status: filter.status, goToPage: filter.goToPage, rowPerPage: filter.rowPerPage };
        respFetch = await getReportCustomerLeaving(payload);
      } else if (detail === 'list') {
        payload = {
          ...payload,
          status: filter.status,
          search: filter.search,
          gender: filter.gender,
          typeId: filter.typeId,
          goToPage: filter.goToPage,
          rowPerPage: filter.rowPerPage
        };
        respFetch = await getReportCustomerList(payload);
      } else if (detail === 'referral-spend') {
        payload = { ...payload, search: filter.search, goToPage: filter.goToPage, rowPerPage: filter.rowPerPage };
        respFetch = await getReportCustomerReferralSpend(payload);
      } else if (detail === 'sub-account-list') {
        payload = {
          ...payload,
          search: filter.search,
          gender: filter.gender,
          sterile: filter.sterile,
          goToPage: filter.goToPage,
          rowPerPage: filter.rowPerPage
        };
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
      if (detail === 'reminders') respFetch = await getReportProductsReminders(filter);
      if (detail === 'batches') respFetch = await getReportProductsBatches(filter);
      if (detail === 'expiry') respFetch = await getReportProductsExpiry(filter);
    } else if (type === 'deposit') {
      if (detail === 'list') respFetch = await getReportDepositList(filter);
      if (detail === 'summary') respFetch = await getReportDepositSummary(filter);
    } else if (type === 'sales') {
      if (detail === 'summary') respFetch = await getReportSalesSummary(filter);
      if (detail === 'items') respFetch = await getReportSalesItems(filter);
      if (detail === 'by-service') respFetch = await getReportSalesByService(filter);
      if (detail === 'by-product') respFetch = await getReportSalesByProduct(filter);
      if (detail === 'payment-list') respFetch = await getReportSalesPaymentList(filter);
      if (detail === 'unpaid') respFetch = await getReportSalesUnpaid(filter);
      if (detail === 'net-income') respFetch = await getReportSalesNetIncome(filter);
      if (detail === 'discount-summary') respFetch = await getReportSalesDiscountSummary(filter);
      if (detail === 'payment-summary') respFetch = await getReportSalesPaymentSummary(filter);
      if (detail === 'daily-audit') respFetch = await getReportSalesDailyAudit(filter);
      if (detail === 'details') respFetch = await getReportSalesDetails(filter);
      if (detail === 'staff-service-sales') respFetch = await getReportSalesStaffServiceSales(filter);
    } else if (type === 'booking') {
      if (detail === 'by-cancellation-reason') respFetch = await getReportBookingByCancellationReason(filter);
      if (detail === 'by-diagnosis-species-gender') respFetch = await getReportBookingByDiagnosisSpeciesGender(filter);
      if (detail === 'by-status') respFetch = await getReportBookingByStatus(filter);
      if (detail === 'diagnosis-list') respFetch = await getReportBookingDiagnosisList(filter);
      if (detail === 'list') respFetch = await getReportBookingList(filter);
      // by-location fetches its own data internally (year selector inside component)
    } else if (type === 'expenses') {
      if (detail === 'list') respFetch = await getReportExpensesList(filter);
      if (detail === 'summary') respFetch = await getReportExpensesSummary(filter);
    }

    setMainData(respFetch?.data || []);
    setIsFetching(false);
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
      else if (type === 'products' && detail === 'reminders') return await exportReportProductsReminders(filter);
      else if (type === 'products' && detail === 'batches') return await exportReportProductsBatches(filter);
      else if (type === 'products' && detail === 'expiry') return await exportReportProductsExpiry(filter);
      else if (type === 'deposit' && detail === 'list') return await exportReportDepositList(filter);
      else if (type === 'deposit' && detail === 'summary') return await exportReportDepositSummary(filter);
      else if (type === 'sales' && detail === 'summary') return await exportReportSalesSummary(filter);
      else if (type === 'sales' && detail === 'items') return await exportReportSalesItems(filter);
      else if (type === 'sales' && detail === 'by-service') return await exportReportSalesByService(filter);
      else if (type === 'sales' && detail === 'by-product') return await exportReportSalesByProduct(filter);
      else if (type === 'sales' && detail === 'payment-list') return await exportReportSalesPaymentList(filter);
      else if (type === 'sales' && detail === 'unpaid') return await exportReportSalesUnpaid(filter);
      else if (type === 'sales' && detail === 'net-income') return;
      else if (type === 'sales' && detail === 'discount-summary') return;
      else if (type === 'sales' && detail === 'payment-summary') return;
      else if (type === 'sales' && detail === 'daily-audit') return await exportReportSalesDailyAudit(filter);
      else if (type === 'sales' && detail === 'details') return await exportReportSalesDetails(filter);
      else if (type === 'sales' && detail === 'staff-service-sales') return await exportReportSalesStaffServiceSales(filter);
      else if (type === 'booking' && detail === 'by-diagnosis-species-gender')
        return await exportReportBookingByDiagnosisSpeciesGender(filter);
      else if (type === 'expenses' && detail === 'list') return await exportReportExpensesList(filter);
      else if (type === 'expenses' && detail === 'summary') return await exportReportExpensesSummary(filter);
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

    // Static gender options
    const getGender = [
      { value: 'J', label: 'Jantan' },
      { value: 'B', label: 'Betina' }
    ];

    // Species (petCategory) and diagnose options — only needed for by-diagnosis-species-gender
    let getDiagnose = [];
    let getSpecies = [];
    if (detail === 'by-diagnosis-species-gender') {
      [getDiagnose, getSpecies] = await Promise.all([getReportBookingDiagnoseOptions(), getPetCategoryList()]);
    }

    setExtData((prevState) => ({
      ...prevState,
      location: getLoc,
      staff: getStaff,
      service: getService,
      gender: getGender,
      diagnose: getDiagnose,
      species: getSpecies
    }));
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
    const getStaffJob = await getStaffJobTitleList();

    setExtData((prevState) => ({
      ...prevState,
      location: getLoc,
      staff: getStaff,
      jobTitle: getStaffJob,
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
    const getCustomer = []; // need API

    setExtData((prevState) => ({
      ...prevState,
      location: getLoc,
      brand: getBrand,
      supplier: getSupplier,
      customer: getCustomer
    }));
  };

  const getPrepareDataForDeposit = async () => {
    const getLoc = await getLocationList();
    // const getPaymentMethod = await getPaymentMethodList();
    const getPaymentMethod = []; // need API;

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
    const getService = []; // need API
    const getPayment = []; // need API
    const getItemType = []; // need API
    const getProductCategory = []; // need API
    const getCategory = []; // need API
    const getMethod = []; // need API
    const getCustomer = []; // need API
    const getInvoiceCategory = []; // need API

    setExtData((prevState) => ({
      ...prevState,
      location: getLoc,
      staff: getStaff,
      service: getService,
      status: getStatus,
      payment: getPayment,
      itemType: getItemType,
      productCategory: getProductCategory,
      category: getCategory,
      method: getMethod,
      customer: getCustomer,
      invoiceCategory: getInvoiceCategory
    }));
  };

  const getPrepareDataForExpenses = async () => {
    const [getLoc, getPayment, getStatus, getSubmiter, getRecipient, getCategory, getSupplier] = await Promise.all([
      getLocationList(),
      getExpensesOptionPayment(),
      getExpensesOptionStatus(),
      getExpensesOptionSubmiter(),
      getExpensesOptionRecipient(),
      getExpensesOptionCategory(),
      getExpensesOptionSupplier()
    ]);

    setExtData((prevState) => ({
      ...prevState,
      location: getLoc,
      payment: getPayment,
      status: getStatus,
      staff: [],
      submiter: getSubmiter,
      supplier: getSupplier,
      recipient: getRecipient,
      category: getCategory
    }));

    // Re-apply prefilter setelah extData selesai load agar MultiSelectAll
    // dapat menerima value dari luar (saat navigasi dari Summary → List)
    if (location.state?.prefilterCategory) {
      setFilter((prev) => ({ ...prev, category: location.state.prefilterCategory }));
    }
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
    if (type === 'products' && detail === 'reminders') return 'product-reminders';
    if (type === 'products' && detail === 'batches') return 'product-batches';
    if (type === 'products' && detail === 'expiry') return 'product-expiry';

    if (type === 'deposit' && detail === 'list') return 'deposit-list';
    if (type === 'deposit' && detail === 'summary') return 'deposit-summary';

    if (type === 'expenses' && detail === 'list') return 'expenses-list';
    if (type === 'expenses' && detail === 'summary') return 'expenses-summary';

    if (type === 'sales' && detail === 'summary') return 'sales-summary';
    if (type === 'sales' && detail === 'items') return 'sales-items';
    if (type === 'sales' && detail === 'by-service') return 'sales-by-service';
    if (type === 'sales' && detail === 'by-product') return 'sales-by-product';
    if (type === 'sales' && detail === 'payment-list') return 'sales-payment-list';
    if (type === 'sales' && detail === 'unpaid') return 'sales-unpaid';
    if (type === 'sales' && detail === 'net-income') return 'sales-net-income';
    if (type === 'sales' && detail === 'discount-summary') return 'sales-discount-summary';
    if (type === 'sales' && detail === 'payment-summary') return 'sales-payment-summary';
    if (type === 'sales' && detail === 'daily-audit') return 'sales-daily-audit';
    if (type === 'sales' && detail === 'details') return 'sales-details';
    if (type === 'sales' && detail === 'staff-service-sales') return 'sales-staff-service-sales';

    return '-';
  };

  const getFilter = () => {
    if (type === 'booking') return <FilterBooking extData={extData} filter={filter} setFilter={setFilter} />;
    if (type === 'customer') return <FilterCustomer extData={extData} filter={filter} setFilter={setFilter} />;
    if (type === 'staff') return <FilterStaff extData={extData} filter={filter} setFilter={setFilter} />;
    if (type === 'products') return <FilterProducts extData={extData} filter={filter} setFilter={setFilter} />;
    if (type === 'deposit') return <FilterDeposit extData={extData} filter={filter} setFilter={setFilter} />;
    if (type === 'sales') return <FilterSales extData={extData} filter={filter} setFilter={setFilter} />;
    if (type === 'expenses') return <FilterExpenses extData={extData} filter={filter} setFilter={setFilter} />;

    return '';
  };
  const getSections = () => {
    if (type === 'booking' && detail === 'by-location') return <BookingByLocation />;
    if (type === 'booking' && detail === 'by-status') return <BookingByStatus data={mainData} loading={isFetching} />;
    if (type === 'booking' && detail === 'by-cancellation-reason')
      return <BookingByCancelationReason data={mainData} loading={isFetching} />;
    if (type === 'booking' && detail === 'list') return <BookingByList data={mainData} loading={isFetching} setFilter={setFilter} />;
    if (type === 'booking' && detail === 'diagnosis-list')
      return <BookingByDiagnosisList data={mainData} loading={isFetching} setFilter={setFilter} />;
    if (type === 'booking' && detail === 'by-diagnosis-species-gender')
      return <BookingByDiagnosisSpeciesGender data={mainData} loading={isFetching} setFilter={setFilter} filter={filter} />;

    if (type === 'customer' && detail === 'growth') return <CustomerGrowth data={mainData} setFilter={setFilter} />;
    if (type === 'customer' && detail === 'growth-by-group') return <CustomerGrowthByGroup data={mainData} setFilter={setFilter} />;
    if (type === 'customer' && detail === 'total') return <CustomerTotal data={mainData} setFilter={setFilter} />;
    if (type === 'customer' && detail === 'leaving') return <CustomerLeaving data={mainData} filter={filter} setFilter={setFilter} />;
    if (type === 'customer' && detail === 'list') return <CustomerList data={mainData} filter={filter} setFilter={setFilter} />;
    if (type === 'customer' && detail === 'referral-spend')
      return <CustomerReferralSpend data={mainData} filter={filter} setFilter={setFilter} />;
    if (type === 'customer' && detail === 'sub-account-list')
      return <CustomerSubAccountList data={mainData} filter={filter} setFilter={setFilter} />;

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
    if (type === 'products' && detail === 'reminders')
      return <ProductsReminders data={mainData} setFilter={setFilter} filter={filter} extData={extData} />;
    if (type === 'products' && detail === 'batches') return <ProductsBatches data={mainData} filter={filter} setFilter={setFilter} />;
    if (type === 'products' && detail === 'expiry') return <ProductExpiry data={mainData} filter={filter} setFilter={setFilter} />;

    if (type === 'deposit' && detail === 'list') return <DepositList data={mainData} setFilter={setFilter} filter={filter} />;
    if (type === 'deposit' && detail === 'summary') return <DepositSummary data={mainData} setFilter={setFilter} filter={filter} />;

    if (type === 'expenses' && detail === 'list') return <ExpensesList data={mainData} setFilter={setFilter} filter={filter} />;
    if (type === 'expenses' && detail === 'summary') return <ExpensesSummary data={mainData} setFilter={setFilter} filter={filter} />;

    if (type === 'sales' && detail === 'summary') return <SalesSummary data={mainData} setFilter={setFilter} filter={filter} />;
    if (type === 'sales' && detail === 'items') return <SalesItems data={mainData} setFilter={setFilter} filter={filter} />;
    if (type === 'sales' && detail === 'by-service') return <SalesByService data={mainData} setFilter={setFilter} filter={filter} />;
    if (type === 'sales' && detail === 'by-product') return <SalesByProduct data={mainData} setFilter={setFilter} filter={filter} />;
    if (type === 'sales' && detail === 'payment-list') return <SalesPaymentList data={mainData} setFilter={setFilter} filter={filter} />;
    if (type === 'sales' && detail === 'unpaid') return <SalesUnpaid data={mainData} setFilter={setFilter} filter={filter} />;
    if (type === 'sales' && detail === 'net-income') return <SalesNetIncome data={mainData} setFilter={setFilter} filter={filter} />;
    if (type === 'sales' && detail === 'discount-summary') {
      return <SalesDiscountSummary data={mainData} setFilter={setFilter} filter={filter} />;
    }
    if (type === 'sales' && detail === 'payment-summary') {
      return <SalesPaymentSummary data={mainData} setFilter={setFilter} filter={filter} />;
    }

    if (type === 'sales' && detail === 'daily-audit') {
      return <SalesDailyAudit data={mainData} setFilter={setFilter} filter={filter} />;
    }
    if (type === 'sales' && detail === 'details') return <SalesDetails data={mainData} setFilter={setFilter} filter={filter} />;
    if (type === 'sales' && detail === 'staff-service-sales')
      return <SalesStaffServiceSales data={mainData} setFilter={setFilter} filter={filter} />;

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
            {!['payment-summary', 'discount-summary', 'net-income'].includes(detail) && (
              <Button variant="contained" startIcon={<ExportOutlined />} onClick={onExport}>
                <FormattedMessage id="export" />
              </Button>
            )}
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
