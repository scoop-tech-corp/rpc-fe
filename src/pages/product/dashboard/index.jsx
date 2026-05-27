import { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, Button, FormControl, Grid, InputLabel, Link, MenuItem, Select, Stack, TextField, useMediaQuery } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTheme } from '@mui/material/styles';
import { getLocationList, createMessageBackend } from 'service/service-global';
import { ReactTable } from 'components/third-party/ReactTable';
import { getProductDashboard } from './service';
import { getProductSellDetail, getProductClinicDetail } from 'pages/product/product-list/service';
import { formatThousandSeparator } from 'utils/func';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import dayjs from 'dayjs';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import AnalyticEcommerce from 'components/dashboard/card';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ApexColumnChart from 'components/dashboard/column';
import ApexPieChart from 'components/dashboard/pie';
import ProductSellDetail from 'pages/product/product-list/product-sell/detail';
import ProductClinicDetail from 'pages/product/product-list/product-clinic/detail';
import SearchIcon from '@mui/icons-material/Search';

const buildFilterParams = ({ selectedLocation, filterType, startDate, endDate, selectedMonth }) => {
  const params = {
    branchesId: selectedLocation.map((l) => l.value),
    dateRange: filterType === 'monthly' ? 'month' : 'dateRange',
    chartGroupBy: 'date'
  };
  if (filterType === 'monthly') {
    params.month = selectedMonth.month() + 1;
    params.year = selectedMonth.year();
  } else {
    params.dateFrom = startDate ? startDate.format('YYYY-MM-DD') : undefined;
    params.dateTo = endDate ? endDate.format('YYYY-MM-DD') : undefined;
  }
  return params;
};

const DEFAULT_FILTER = {
  selectedLocation: [],
  filterType: 'date-range',
  startDate: dayjs().startOf('month'),
  endDate: dayjs(),
  selectedMonth: dayjs()
};

const buildSellDetailData = (id, resp) => {
  let categories = '';
  if (resp.data.details.categories.length) {
    resp.data.details.categories.forEach((dt, idx) => {
      categories += dt.categoryName + (idx + 1 !== resp.data.details.categories.length ? ',' : '');
    });
  }
  let reminders = '';
  if (resp.data.reminders.length) {
    resp.data.reminders.forEach((dt, idx) => {
      reminders += dt.timing + `(${dt.unit})` + (idx + 1 !== resp.data.reminders.length ? ',' : '');
    });
  }
  return {
    id,
    fullName: resp.data.fullName,
    details: {
      sku: resp.data.details.sku,
      status: +resp.data.details.status,
      supplierId: +resp.data.details.productSupplierId,
      supplierName: resp.data.details.supplierName,
      brandName: resp.data.details.brandName,
      categories,
      reminders
    },
    shipping: {
      isShipped: +resp.data.isShipped,
      length: resp.data.length,
      height: resp.data.height,
      width: resp.data.width,
      weight: resp.data.weight
    },
    description: { introduction: resp.data.introduction, description: resp.data.description },
    inventory: {
      locationName: resp.data.location?.locationName,
      stock: resp.data.location?.inStock,
      lowStock: resp.data.location?.lowStock,
      status: resp.data.location?.status?.toLowerCase()
    },
    location: { id: resp.data.location?.locationId },
    pricing: {
      price: `Rp ${formatThousandSeparator(resp.data.price)}`,
      pricingStatus: resp.data.pricingStatus,
      marketPrice: resp.data.marketPrice,
      priceLocations: resp.data.priceLocations,
      customerGroups: resp.data.customerGroups,
      quantities: resp.data.quantities
    },
    settings: {
      isCustomerPurchase: !!+resp.data.setting.isCustomerPurchase,
      isCustomerPurchaseOnline: !!+resp.data.setting.isCustomerPurchaseOnline,
      isCustomerPurchaseOutStock: !!+resp.data.setting.isCustomerPurchaseOutStock,
      isStockLevelCheck: !!+resp.data.setting.isStockLevelCheck,
      isNonChargeable: !!+resp.data.setting.isNonChargeable,
      isOfficeApproval: !!+resp.data.setting.isOfficeApproval,
      isAdminApproval: !!+resp.data.setting.isAdminApproval
    }
  };
};

const buildClinicDetailData = (id, resp) => ({
  ...buildSellDetailData(id, resp),
  dosages: resp.data.dosages
});

const OPEN_DETAIL_DEFAULT = { isOpen: false, productType: '', name: '', detailData: null };

const ProductDashboard = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();

  const [data, setData] = useState({
    productSold: { total: '0', isLoss: false, percentage: 0 },
    productSoldQty: { total: '0', isLoss: false, percentage: 0 },
    productSoldValue: { total: '0', isLoss: false, percentage: 0 },
    barProductSales: { series: [], categories: [] },
    topSellers: [],
    pieSalesByCategory: { labels: [], series: [] },
    listed: { total: '442000', isLoss: false, percentage: 59.3 },
    lowStock: { total: '442000', isLoss: false, percentage: 59.3 },
    noStock: { total: '442000', isLoss: false, percentage: 59.3 }
  });

  const [locationList, setLocationList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [filterType, setFilterType] = useState('date-range');
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [openDetail, setOpenDetail] = useState(OPEN_DETAIL_DEFAULT);

  const filterParamsRef = useRef(buildFilterParams(DEFAULT_FILTER));

  const onClickProductDetail = async (productId, productName, productType) => {
    try {
      if (productType === 'sell') {
        const resp = await getProductSellDetail(productId);
        setOpenDetail({ isOpen: true, productType, name: productName, detailData: buildSellDetailData(productId, resp) });
      } else if (productType === 'clinic') {
        const resp = await getProductClinicDetail(productId);
        setOpenDetail({ isOpen: true, productType, name: productName, detailData: buildClinicDetailData(productId, resp) });
      }
    } catch (err) {
      if (err) dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const columnTopSellers = useMemo(
    () => [
      {
        Header: <FormattedMessage id="product" />,
        accessor: 'productName',
        isNotSorting: true,
        Cell: (data) => {
          const { productId, productName, productType } = data.row.original;
          return <Link onClick={() => onClickProductDetail(productId, productName, productType)}>{data.value}</Link>;
        }
      },
      { Header: <FormattedMessage id="location" />, accessor: 'locationName', isNotSorting: true },
      { Header: <FormattedMessage id="total" />, accessor: 'total', isNotSorting: true }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const fetchData = async (params) => {
    const resp = await getProductDashboard(params);
    const { productSold, productSoldQty, productSoldValue, topSeller, salesByCategory, charts } = resp.data;

    setData((prevState) => ({
      ...prevState,
      productSold: { isLoss: productSold.isLoss, percentage: productSold.percentage, total: productSold.total },
      productSoldQty: { isLoss: productSoldQty.isLoss, percentage: productSoldQty.percentage, total: productSoldQty.total },
      productSoldValue: { isLoss: productSoldValue.isLoss, percentage: productSoldValue.percentage, total: productSoldValue.total },
      pieSalesByCategory: { labels: salesByCategory.labels, series: salesByCategory.series },
      barProductSales: { categories: charts.categories, series: charts.series },
      topSellers: topSeller
    }));
  };

  useEffect(() => {
    getLocationList().then(setLocationList);
    fetchData(filterParamsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApplyFilter = () => {
    filterParamsRef.current = buildFilterParams({ selectedLocation, filterType, startDate, endDate, selectedMonth });
    fetchData(filterParamsRef.current);
  };

  const onCloseDetail = (e) => setOpenDetail((prev) => ({ ...prev, isOpen: !e.isOpen, name: '', detailData: null }));

  return (
    <>
      <HeaderPageCustom title={'Product Dashboard'} />

      <MainCard content={false} sx={{ mb: 2.5 }}>
        <ScrollX>
          <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent="space-between" alignItems="center" spacing={1} sx={{ p: 3 }}>
            <Stack
              spacing={1}
              direction={matchDownSM ? 'column' : 'row'}
              alignItems="flex-end"
              style={{ width: matchDownSM ? '100%' : '' }}
            >
              <Autocomplete
                multiple
                limitTags={1}
                options={locationList}
                value={selectedLocation}
                sx={{ width: 220 }}
                isOptionEqualToValue={(option, val) => option.value === val.value}
                onChange={(_, selected) => setSelectedLocation(selected)}
                renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-branch" />} />}
              />
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel htmlFor="product-dashboard-filter-type">
                  <FormattedMessage id="period" />
                </InputLabel>
                <Select
                  id="product-dashboard-filter-type"
                  value={filterType}
                  label={intl.formatMessage({ id: 'period' })}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="date-range">
                    <FormattedMessage id="date-range" />
                  </MenuItem>
                  <MenuItem value="monthly">
                    <FormattedMessage id="monthly" />
                  </MenuItem>
                </Select>
              </FormControl>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {filterType === 'date-range' ? (
                  <>
                    <DesktopDatePicker
                      label={<FormattedMessage id="start-date" />}
                      inputFormat="DD/MM/YYYY"
                      value={startDate}
                      onChange={(val) => setStartDate(val)}
                      renderInput={(params) => <TextField {...params} sx={{ width: 170 }} />}
                    />
                    <DesktopDatePicker
                      label={<FormattedMessage id="end-date" />}
                      inputFormat="DD/MM/YYYY"
                      value={endDate}
                      minDate={startDate}
                      onChange={(val) => setEndDate(val)}
                      renderInput={(params) => <TextField {...params} sx={{ width: 170 }} />}
                    />
                  </>
                ) : (
                  <DesktopDatePicker
                    label={<FormattedMessage id="monthly" />}
                    views={['year', 'month']}
                    inputFormat="MM/YYYY"
                    value={selectedMonth}
                    onChange={(val) => setSelectedMonth(val)}
                    renderInput={(params) => <TextField {...params} sx={{ width: 170 }} />}
                  />
                )}
              </LocalizationProvider>
              <Button variant="contained" startIcon={<SearchIcon />} onClick={onApplyFilter}>
                <FormattedMessage id="search" />
              </Button>
            </Stack>
          </Stack>
        </ScrollX>
      </MainCard>

      <Grid container spacing={3} sx={{ marginBottom: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title={<FormattedMessage id="product-sold" />}
            count={data?.productSold.total}
            isLoss={Boolean(data?.productSold.isLoss)}
            percentage={Number(data?.productSold.percentage)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title={<FormattedMessage id="product-sold-quantity" />}
            count={data?.productSoldQty.total}
            isLoss={Boolean(data?.productSoldQty.isLoss)}
            percentage={Number(data?.productSoldQty.percentage)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title={<FormattedMessage id="product-sold-value" />}
            count={data?.productSoldValue.total}
            isLoss={Boolean(data?.productSoldValue.isLoss)}
            percentage={Number(data?.productSoldValue.percentage)}
          />
        </Grid>
        <Grid item xs={12}>
          <MainCard title={<FormattedMessage id="product-sales-rp" />}>
            <ApexColumnChart categoriesProps={data.barProductSales.categories} seriesProps={data.barProductSales.series} />
          </MainCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MainCard title={<FormattedMessage id="top-sellers-rp" />} content={false}>
            <Stack spacing={3}>
              <Stack sx={{ p: 3 }}>
                <ReactTable columns={columnTopSellers} data={data?.topSellers || []} />
              </Stack>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <MainCard title={<FormattedMessage id="sales-by-category" />} content={false}>
            <ApexPieChart labelsProps={data.pieSalesByCategory.labels} seriesProps={data.pieSalesByCategory.series} />
          </MainCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title={<FormattedMessage id="listed" />}
            count={data?.listed.total}
            isLoss={Boolean(data?.listed.isLoss)}
            percentage={Number(data?.listed.percentage)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title={<FormattedMessage id="low-stock" />}
            count={data?.lowStock.total}
            isLoss={Boolean(data?.lowStock.isLoss)}
            percentage={Number(data?.lowStock.percentage)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title={<FormattedMessage id="no-stock" />}
            count={data?.noStock.total}
            isLoss={Boolean(data?.noStock.isLoss)}
            percentage={Number(data?.noStock.percentage)}
          />
        </Grid>
      </Grid>

      <ProductSellDetail
        title={openDetail.name}
        open={openDetail.isOpen && openDetail.productType === 'sell'}
        data={openDetail.detailData}
        onClose={onCloseDetail}
      />
      <ProductClinicDetail
        title={openDetail.name}
        open={openDetail.isOpen && openDetail.productType === 'clinic'}
        data={openDetail.detailData}
        onClose={onCloseDetail}
      />
    </>
  );
};

export default ProductDashboard;
