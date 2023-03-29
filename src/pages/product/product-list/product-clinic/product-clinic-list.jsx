import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Chip, Stack, useMediaQuery, Button, Link, TextField, Autocomplete } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { deleteProductClinic, exportProductClinic, getProductClinic, getProductClinicDetail } from '../service';
import { createMessageBackend } from 'service/service-global';
import { formatThousandSeparator } from 'utils/func';

import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';
import ModalExport from '../components/ModalExport';
import ProductClinicDetail from './detail';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from 'components/@extended/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';

let paramProductClinicList = {};

const ProductClinicList = (props) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const intl = useIntl();

  const [getProductClinicData, setProductClinicData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [isModalExport, setModalExport] = useState(false);
  const [openDetail, setOpenDetail] = useState({ isOpen: false, name: '', detailData: null });

  const columns = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: (header) => {
          useEffect(() => {
            const selectRows = header.selectedFlatRows.map(({ original }) => original.id);
            setSelectedRow(selectRows);
          }, [header.selectedFlatRows]);

          return <IndeterminateCheckbox indeterminate {...header.getToggleAllRowsSelectedProps()} />;
        },
        accessor: 'selection',
        Cell: (cell) => <IndeterminateCheckbox {...cell.row.getToggleRowSelectedProps()} />,
        disableSortBy: true
      },
      {
        Header: <FormattedMessage id="name" />,
        accessor: 'fullName',
        Cell: (data) => {
          const getId = data.row.original.id;
          const getName = data.row.original.fullName;

          const onClickDetail = async () => {
            await getProductClinicDetail(getId)
              .then((resp) => {
                let categories = '';
                if (resp.data.details.categories.length) {
                  resp.data.details.categories.map((dt, idx) => {
                    categories += dt.categoryName + (idx + 1 !== resp.data.details.categories.length ? ',' : '');
                  });
                }

                let reminders = '';
                if (resp.data.reminders.length) {
                  resp.data.reminders.map((dt, idx) => {
                    reminders += dt.timing + `(${dt.unit})` + (idx + 1 !== resp.data.reminders.length ? ',' : '');
                  });
                }

                const detailData = {
                  id: getId,
                  fullName: resp.data.fullName,
                  dosages: resp.data.dosages,
                  details: {
                    sku: resp.data.details.sku,
                    status: +resp.data.details.status,
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
                  description: {
                    introduction: resp.data.introduction,
                    description: resp.data.description
                  },
                  inventory: {
                    locationName: resp.data.location.locationName,
                    stock: resp.data.location.inStock,
                    status: resp.data.location.status.toLowerCase()
                  },
                  location: {
                    id: resp.data.location.locationId
                  },
                  pricing: {
                    price: `Rp ${formatThousandSeparator(resp.data.price)}`,
                    pricingStatus: resp.data.pricingStatus,
                    marketPrice: resp.data.marketPrice,
                    priceLocations: resp.data.priceLocations,
                    customerGroups: resp.data.customerGroups,
                    quantities: resp.data.quantities
                  },
                  settings: {
                    isCustomerPurchase: +resp.data.setting.isCustomerPurchase ? true : false,
                    isCustomerPurchaseOnline: +resp.data.setting.isCustomerPurchaseOnline ? true : false,
                    isCustomerPurchaseOutStock: +resp.data.setting.isCustomerPurchaseOutStock ? true : false,
                    isStockLevelCheck: +resp.data.setting.isStockLevelCheck ? true : false,
                    isNonChargeable: +resp.data.setting.isNonChargeable ? true : false,
                    isOfficeApproval: +resp.data.setting.isOfficeApproval ? true : false,
                    isAdminApproval: +resp.data.setting.isAdminApproval ? true : false
                  }
                };

                setOpenDetail({ isOpen: true, name: getName, detailData });
              })
              .catch((err) => {
                if (err) {
                  dispatch(snackbarError(createMessageBackend(err)));
                }
              });
          };

          return <Link onClick={() => onClickDetail()}>{data.value}</Link>; // href={`/product/product-list/sell/${getId}`}
        }
      },
      { Header: 'Sku', accessor: 'sku' },
      { Header: <FormattedMessage id="brand" />, accessor: 'brandName' },
      { Header: <FormattedMessage id="price" />, accessor: 'price' },
      {
        Header: <FormattedMessage id="shipping-status" />,
        accessor: 'isShipped',
        Cell: (data) => {
          switch (+data.value) {
            case 1:
              return <Chip color="success" label="Yes" size="small" variant="light" />;
            default:
              return <Chip color="error" label="No" size="small" variant="light" />;
          }
        }
      },
      { Header: <FormattedMessage id="location" />, accessor: 'locationName' },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: (data) => {
          switch (+data.value) {
            case 1:
              return <Chip color="success" label="Active" size="small" variant="light" />;
            default:
              return <Chip color="error" label="Not Active" size="small" variant="light" />;
          }
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onOrderingChange = (event) => {
    paramProductClinicList.orderValue = event.order;
    paramProductClinicList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramProductClinicList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramProductClinicList.rowPerPage = event;
    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramProductClinicList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const onSearch = (event) => {
    paramProductClinicList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onClickAdd = () => {
    navigate('/product/product-list/clinic/add', { replace: true });
  };

  const fetchData = async () => {
    const getData = await getProductClinic(paramProductClinicList);
    setProductClinicData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
  };

  const clearParamFetchData = () => {
    paramProductClinicList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: [] };
    setKeywordSearch('');
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteProductClinic(selectedRow).then((resp) => {
        if (resp.status === 200) {
          setDialog(false);

          dispatch(snackbarSuccess('Success Delete product clinic'));
          clearParamFetchData();
          fetchData();
        }
      });
    } else {
      setDialog(false);
    }
  };

  const onExport = async (event) => {
    await exportProductClinic({ ...paramProductClinicList, allData: event.allData, onlyItem: event.onlyItem })
      .then((resp) => {
        let blob = new Blob([resp.data], { type: resp.headers['content-type'] });
        let downloadUrl = URL.createObjectURL(blob);
        let a = document.createElement('a');
        const fileName = resp.headers['content-disposition'].split('filename=')[1].split(';')[0];

        a.href = downloadUrl;
        a.download = fileName.replace('.xlsx', '').replaceAll('"', '');
        document.body.appendChild(a);
        a.click();
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  useEffect(() => {
    clearParamFetchData();
    fetchData();
  }, []);

  return (
    <>
      <MainCard content={false}>
        <ScrollX>
          <Stack spacing={3}>
            <Stack
              direction={matchDownSM ? 'column' : 'row'}
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
              sx={{ p: 3, pb: 0 }}
            >
              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                <GlobalFilter
                  placeHolder={intl.formatMessage({ id: 'search' })}
                  globalFilter={keywordSearch}
                  setGlobalFilter={onSearch}
                  style={{ height: '41.3px' }}
                />
                <Autocomplete
                  id="filterLocation"
                  multiple
                  options={props.facilityLocationList}
                  value={selectedFilterLocation}
                  sx={{ width: 300 }}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onFilterLocation(value)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
                />
                {selectedRow.length > 0 && (
                  <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                    <FormattedMessage id="delete" />
                  </Button>
                )}
              </Stack>

              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={() => fetchData()}>
                  <RefreshIcon />
                </IconButton>
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => setModalExport(true)} color="success">
                  <FormattedMessage id="export" />
                </Button>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                  <FormattedMessage id="add-product-clinic" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={getProductClinicData.data}
              totalPagination={getProductClinicData.totalPagination}
              setPageNumber={paramProductClinicList.goToPage}
              setPageRow={paramProductClinicList.rowPerPage}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
            />
          </Stack>

          {selectedRow.length > 0 && (
            <Stack style={{ marginBottom: '20px' }} justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ p: 3, pb: 0 }}>
              <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                <FormattedMessage id="delete" />
              </Button>
            </Stack>
          )}
        </ScrollX>
      </MainCard>
      <ConfirmationC
        open={dialog}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={(response) => onConfirm(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
      <ModalExport isModalExport={isModalExport} onExport={(e) => onExport(e)} onClose={(e) => setModalExport(!e)} />
      <ProductClinicDetail
        title={openDetail.name}
        open={openDetail.isOpen}
        data={openDetail.detailData}
        onClose={(e) => {
          setOpenDetail({ isOpen: !e.isOpen, name: '', detailData: null });
          if (e.isRefreshIndex) fetchData();
        }}
      />
    </>
  );
};

ProductClinicList.propTypes = {
  facilityLocationList: PropTypes.array
};

export default ProductClinicList;
