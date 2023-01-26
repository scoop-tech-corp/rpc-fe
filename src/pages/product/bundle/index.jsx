import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Stack, useMediaQuery, Button, Link, Chip } from '@mui/material';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DeleteFilled, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';
import { getProductBundle } from './service';
import { createMessageBackend } from 'service/service-global';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import IconButton from 'components/@extended/IconButton';
import ProductBundleDetail from './detail';

let paramProductBundleList = {};

const ProductBundle = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [productBundleData, setProductBundleData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [dialog, setDialog] = useState(false);
  const [openDetail, setOpenDetail] = useState({ isOpen: false, id: null });

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
        disableSortBy: true,
        style: {
          width: '10px'
        }
      },
      {
        Header: <FormattedMessage id="name" />,
        accessor: 'name',
        Cell: (data) => {
          const getId = data.row.original.id;
          return (
            <Link href="#" onClick={() => setOpenDetail({ isOpen: true, id: getId })}>
              {data.value}
            </Link>
          );
        }
      },
      { Header: <FormattedMessage id="category" />, accessor: 'categoryName' },
      { Header: <FormattedMessage id="location" />, accessor: 'locationName' },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: (data) => {
          switch (+data.value) {
            case 0:
              return <Chip color="error" label="Disabled" size="small" variant="light" />;
            case 1:
              return <Chip color="success" label="Active" size="small" variant="light" />;
          }
        }
      },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        Cell: (data) => {
          return (
            <IconButton size="large" color="warning" onClick={() => onEditBundle(data.row)}>
              <EditOutlined />
            </IconButton>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onEditBundle = (dataRow) => navigate(`/product/bundle/form/${+dataRow.original.id}`, { replace: true });

  const onOrderingChange = (event) => {
    paramProductBundleList.orderValue = event.order;
    paramProductBundleList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramProductBundleList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramProductBundleList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramProductBundleList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onClickAdd = () => {
    navigate('/product/bundle/form', { replace: true });
  };

  async function fetchData() {
    const resp = await getProductBundle(paramProductBundleList);
    setProductBundleData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  }

  const clearParamFetchData = () => {
    paramProductBundleList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '' };
    setKeywordSearch('');
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteProductBundle(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success delete data'));
            clearParamFetchData();
            fetchData();
          }
        })
        .catch((err) => {
          if (err) {
            setDialog(false);
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    } else {
      setDialog(false);
    }
  };

  useEffect(() => {
    clearParamFetchData();
    fetchData();
  }, []);

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="product-bundle" />} isBreadcrumb={true} />
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
                  style={{ height: '36.5px' }}
                />
                {selectedRow.length > 0 && (
                  <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                    <FormattedMessage id="delete" />
                  </Button>
                )}
              </Stack>

              <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                <FormattedMessage id="add-product-bundle" />
              </Button>
            </Stack>
            <ReactTable
              columns={columns}
              data={productBundleData.data}
              totalPagination={productBundleData.totalPagination}
              setPageNumber={paramProductBundleList.goToPage}
              setPageRow={paramProductBundleList.rowPerPage}
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
      <ProductBundleDetail
        open={openDetail.isOpen}
        id={openDetail.id}
        onClose={(e) => {
          setOpenDetail({ isOpen: !e.isClose, id: null });
          if (e.isCloseWithHitIndex) {
            fetchData();
          }
        }}
      />
    </>
  );
};

export default ProductBundle;
