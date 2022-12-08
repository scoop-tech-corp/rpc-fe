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
import { getProductInventory, deleteProductInventory } from '../service';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';

let paramProductInventoryList = {};

const ProductInventoryList = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getProductInventoryData, setProductInventoryData] = useState({ data: [], totalPagination: 0 });
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
        Header: <FormattedMessage id="requirement-name" />,
        accessor: 'requirementName',
        Cell: (data) => {
          const getId = data.row.original.id;
          return <Link href={`/product/product-list/inventory/${getId}`}>{data.value}</Link>;
        }
      },
      { Header: <FormattedMessage id="total-product" />, accessor: 'totalProduct' },
      { Header: <FormattedMessage id="location-product" />, accessor: 'locationProduct' },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: (data) => {
          switch (+data.value) {
            case 1:
              return <Chip color="warning" label="Waiting for Appoval" size="small" variant="light" />;
            case 3:
              return <Chip color="success" label="Accept" size="small" variant="light" />;
          }
        }
      },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' }
    ],
    []
  );

  const onOrderingChange = (event) => {
    paramProductInventoryList.orderValue = event.order;
    paramProductInventoryList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramProductInventoryList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramProductInventoryList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramProductInventoryList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onClickAdd = () => {
    navigate('/product/product-list/inventory/add', { replace: true });
  };

  const fetchData = async () => {
    const getData = await getProductInventory(paramProductInventoryList);
    setProductInventoryData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
  };

  const clearParamFetchData = () => {
    paramProductInventoryList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '' };
    setKeywordSearch('');
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteProductInventory(selectedRow).then((resp) => {
        if (resp.status === 200) {
          setDialog(false);

          dispatch(
            openSnackbar({
              open: true,
              message: 'Success Delete product inventory',
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
                <FormattedMessage id="add-product-inventory" />
              </Button>
            </Stack>
            <ReactTable
              columns={columns}
              data={getProductInventoryData.data}
              totalPagination={getProductInventoryData.totalPagination}
              setPageNumber={getProductInventoryData.goToPage}
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

export default ProductInventoryList;
