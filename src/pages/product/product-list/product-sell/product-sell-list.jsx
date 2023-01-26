import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Chip, Stack, useMediaQuery, Button, Link, Autocomplete, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { getProductSell, deleteProductSell, exportProductSell } from '../service';
import { createMessageBackend, getLocationList } from 'service/service-global';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';
import ModalExport from '../components/ModalExport';

let paramProductSellList = {};

const ProductSellList = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getProductSellData, setProductSellData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [facilityLocationList, setFacilityLocationList] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [isModalExport, setModalExport] = useState(false);

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
          return <Link href={`/product/product-list/sell/${getId}`}>{data.value}</Link>;
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

  const onSearch = (event) => {
    paramProductSellList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onClickAdd = () => {
    navigate('/product/product-list/sell/add', { replace: true });
  };

  const fetchData = async () => {
    const getData = await getProductSell(paramProductSellList);
    setProductSellData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
  };

  const clearParamFetchData = () => {
    paramProductSellList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: [] };
    setKeywordSearch('');
  };

  const getDataFacilityLocation = async () => {
    const data = await getLocationList();
    setFacilityLocationList(data);
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

    setModalExport(false);
  };

  useEffect(() => {
    getDataFacilityLocation();
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
                  placeHolder={'Search...'}
                  globalFilter={keywordSearch}
                  setGlobalFilter={onSearch}
                  style={{ height: '41.3px' }}
                />
                <Autocomplete
                  id="filterLocation"
                  multiple
                  options={facilityLocationList}
                  value={selectedFilterLocation}
                  sx={{ width: 300 }}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onFilterLocation(value)}
                  renderInput={(params) => <TextField {...params} label="Filter location" />}
                />
                {selectedRow.length > 0 && (
                  <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                    <FormattedMessage id="delete" />
                  </Button>
                )}
              </Stack>
              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                <Button variant="contained" startIcon={<VerticalAlignTopOutlined />} onClick={() => setModalExport(true)} color="success">
                  <FormattedMessage id="export" />
                </Button>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                  <FormattedMessage id="add-product-sell" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={getProductSellData.data}
              totalPagination={getProductSellData.totalPagination}
              setPageNumber={paramProductSellList.goToPage}
              setPageRow={paramProductSellList.rowPerPage}
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
    </>
  );
};

export default ProductSellList;
