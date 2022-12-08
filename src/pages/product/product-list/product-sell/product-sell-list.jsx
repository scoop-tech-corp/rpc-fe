import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Chip, Stack, useMediaQuery, Button, Link } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { openSnackbar } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { getProductSell, deleteProductSell } from '../service';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';

let paramProductSellList = {};

const ProductSellList = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getProductSellData, setProductSellData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [dialog, setDialog] = useState(false);

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
    paramProductSellList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '' };
    setKeywordSearch('');
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteProductSell(selectedRow).then((resp) => {
        if (resp.status === 200) {
          setDialog(false);

          dispatch(
            openSnackbar({
              open: true,
              message: 'Success Delete product sell',
              variant: 'alert',
              alert: { color: 'success' },
              duration: 2000,
              close: true
            })
          );
          clearParamFetchData();
          fetchData();
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
              <GlobalFilter placeHolder={'Search...'} globalFilter={keywordSearch} setGlobalFilter={onSearch} size="small" />

              <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                <FormattedMessage id="add-product-sell" />
              </Button>
            </Stack>
            <ReactTable
              columns={columns}
              data={getProductSellData.data}
              totalPagination={getProductSellData.totalPagination}
              setPageNumber={getProductSellData.goToPage}
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
        title="Delete"
        content="Are you sure you want to delete this data ?"
        onClose={(response) => onConfirm(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
    </>
  );
};

export default ProductSellList;
