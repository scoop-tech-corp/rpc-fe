import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Chip,
  Stack,
  useMediaQuery,
  Button,
  Link,
  Autocomplete,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import {
  getProductSell,
  deleteProductSell,
  exportProductSell,
  getProductSellDetail,
  getProductCategoryList,
  downloadTemplateProductSell,
  importProductSell
} from '../service';
import { createMessageBackend, processDownloadExcel } from 'service/service-global';
import { formatThousandSeparator } from 'utils/func';

import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';
import ModalExport from '../components/ModalExport';
import ProductSellDetail from './detail';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import IconButton from 'components/@extended/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import ModalImport from '../components/ModalImport';

let paramProductSellList = {};

const ProductSellList = (props) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const intl = useIntl();

  const [getProductSellData, setProductSellData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [selectedStock, setStock] = useState('');
  const [selectedFilterCategory, setFilterCategory] = useState([]);
  const [filterCategoryList, setFilterCategoryList] = useState([]);

  const [dialog, setDialog] = useState(false);
  const [isModalExport, setModalExport] = useState(false);
  const [isModalImport, setModalImport] = useState(false);
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
            await getProductSellDetail(getId)
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
                  description: {
                    introduction: resp.data.introduction,
                    description: resp.data.description
                  },
                  inventory: {
                    locationName: resp.data.location.locationName,
                    stock: resp.data.location.inStock,
                    lowStock: resp.data.location.lowStock,
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
      },
      {
        Header: <FormattedMessage id="created-at" />,
        accessor: 'createdAt'
      },
      {
        Header: <FormattedMessage id="created-by" />,
        accessor: 'createdBy'
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onOrderingChange = (event) => {
    paramProductSellList.orderValue = event.order;
    paramProductSellList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramProductSellList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramProductSellList.rowPerPage = event;
    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramProductSellList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const onFilterCategory = (selected) => {
    paramProductSellList.category = selected.map((dt) => dt.value);
    setFilterCategory(selected);
    fetchData();
  };

  const onSearch = (event) => {
    paramProductSellList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onSelectedStock = (event) => {
    paramProductSellList.stock = event.target.value;
    setStock(event.target.value);

    fetchData();
  };

  const onClickAdd = () => {
    navigate('/product/product-list/sell/form', { replace: true });
  };

  const fetchData = async () => {
    const getData = await getProductSell(paramProductSellList);
    setProductSellData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
  };

  const clearParamFetchData = () => {
    paramProductSellList = {
      rowPerPage: 5,
      goToPage: 1,
      orderValue: '',
      orderColumn: '',
      keyword: '',
      locationId: [],
      stock: '',
      category: []
    };
    setKeywordSearch('');
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteProductSell(selectedRow).then((resp) => {
        if (resp.status === 200) {
          setDialog(false);
          dispatch(snackbarSuccess('Success Delete product sell'));
          clearParamFetchData();
          fetchData();
        }
      });
    } else {
      setDialog(false);
    }
  };

  const onExport = async (event) => {
    await exportProductSell({ ...paramProductSellList, allData: event.allData, onlyItem: event.onlyItem })
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });

    setModalExport(false);
  };

  const onDownloadTemplate = async () => {
    await downloadTemplateProductSell()
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

  const onImportFile = async (file) => {
    await importProductSell(file)
      .then((resp) => {
        if (resp.status === 200) {
          dispatch(snackbarSuccess('Success import file'));
          setModalImport(false);
          fetchData();
        }
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const getCategoryProduct = async () => {
    const getCategory = await getProductCategoryList();
    setFilterCategoryList(getCategory);
  };

  useEffect(() => {
    getCategoryProduct();
    clearParamFetchData();
    fetchData();
  }, []);

  return (
    <>
      <Stack
        spacing={1}
        direction={matchDownSM ? 'column' : 'row'}
        style={{ width: matchDownSM ? '100%' : '', marginBottom: '24px' }}
        justifyContent={'flex-end'}
      >
        <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={() => fetchData()}>
          <RefreshIcon />
        </IconButton>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => setModalExport(true)} color="success">
          <FormattedMessage id="export" />
        </Button>
        <Button variant="contained" startIcon={<FileUploadIcon />} onClick={() => setModalImport(true)}>
          <FormattedMessage id="import" />
        </Button>
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
          <FormattedMessage id="add-product-sell" />
        </Button>
      </Stack>
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
                  limitTags={1}
                  options={props.facilityLocationList}
                  value={selectedFilterLocation}
                  sx={{ width: 280 }}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onFilterLocation(value)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
                />
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel htmlFor="stock">
                    <FormattedMessage id="stock" />
                  </InputLabel>
                  <Select id="stock" name="stock" value={selectedStock} onChange={onSelectedStock}>
                    <MenuItem value="">
                      <em>
                        <FormattedMessage id="select-stock" />
                      </em>
                    </MenuItem>
                    <MenuItem value={'lowStock'}>
                      <FormattedMessage id="low-stock" />
                    </MenuItem>
                    <MenuItem value={'highStock'}>
                      <FormattedMessage id="high-stock" />
                    </MenuItem>
                  </Select>
                </FormControl>
                <Autocomplete
                  id="filterCategory"
                  multiple
                  limitTags={1}
                  options={filterCategoryList}
                  value={selectedFilterCategory}
                  sx={{ width: 280 }}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onFilterCategory(value)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-category" />} />}
                />
                {selectedRow.length > 0 && (
                  <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                    <FormattedMessage id="delete" />
                  </Button>
                )}
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={getProductSellData.data}
              totalPagination={getProductSellData.totalPagination}
              setPageNumber={paramProductSellList.goToPage}
              setPageRow={paramProductSellList.rowPerPage}
              colSpanPagination={9}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
            />
          </Stack>
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
      {isModalImport && (
        <ModalImport
          open={isModalImport}
          onTemplate={onDownloadTemplate}
          onImport={(e) => onImportFile(e)}
          onClose={(e) => setModalImport(!e)}
        />
      )}
      <ProductSellDetail
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

ProductSellList.propTypes = {
  facilityLocationList: PropTypes.array
};

export default ProductSellList;
