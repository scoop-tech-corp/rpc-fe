import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
// import axios from 'utils/axios';
import { alpha, useTheme } from '@mui/material/styles';

import { Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, useMediaQuery, Button, Link } from '@mui/material';

import { useTable, useRowSelect } from 'react-table';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { FormattedMessage } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import { HeaderSort, IndeterminateCheckbox, TablePagination, TableRowSelection } from 'components/third-party/ReactTable';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';

function ReactTable({ columns, data, totalPagination, onOrder, onGotoPage, onPageSize }) {
  const theme = useTheme();

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // selectedFlatRows,
    state: { selectedRowIds }
  } = useTable(
    {
      columns,
      data
    },
    useRowSelect
  );

  // console.log('selectedFlatRows', selectedFlatRows);

  const [selectedOrder, setOrder] = useState({
    column: '',
    order: ''
  });

  const clickHeader = (column) => {
    if (column.id === 'selection') return;

    console.log('click column', column);

    const setConfigOrder = {
      column: '',
      order: ''
    };

    setConfigOrder.column = column.id;

    if (selectedOrder.column === column.id) {
      setConfigOrder.order = selectedOrder.order === 'asc' ? 'desc' : 'asc';
    } else {
      setConfigOrder.order = 'asc';
    }

    setOrder(setConfigOrder);
    onOrder(setConfigOrder);
  };

  const onChangeGotoPage = (event) => {
    onGotoPage(event);
  };

  const onChangeSetPageSize = (event) => {
    onPageSize(event);
  };

  // console.log('rows', rows);

  return (
    <>
      <TableRowSelection selected={Object.keys(selectedRowIds).length} />
      <Table {...getTableProps()}>
        <TableHead>
          {headerGroups.map((headerGroup, i) => (
            <TableRow key={i} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, index) => (
                <TableCell key={index} {...column.getHeaderProps([{ className: column.className }])} onClick={() => clickHeader(column)}>
                  <HeaderSort column={column} selectedOrder={selectedOrder} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()} className="striped">
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <TableRow
                key={i}
                {...row.getRowProps()}
                onClick={() => {
                  row.toggleRowSelected();
                }}
                sx={{
                  cursor: 'pointer',
                  bgcolor: row.isSelected ? alpha(theme.palette.primary.lighter, 0.35) : 'inherit'
                }}
              >
                {row.cells.map((cell, i) => (
                  <TableCell key={i} {...cell.getCellProps([{ className: cell.column.className }])}>
                    {cell.render('Cell')}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
          {!rows.length && (
            <TableRow>
              <TableCell>No Data Found...</TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell sx={{ p: 2 }} colSpan={7}>
              <TablePagination
                gotoPage={onChangeGotoPage}
                changePageSize={onChangeSetPageSize}
                totalPagination={totalPagination}
                pageIndex={0}
                // pageSize={pageSizeChange}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  totalPagination: PropTypes.number,
  onOrder: PropTypes.func,
  onGotoPage: PropTypes.func,
  onPageSize: PropTypes.func
};

const paramProductSellList = {
  rowPerPage: 5,
  goToPage: 1,
  orderValue: '',
  orderColumn: '',
  keyword: ''
};

const ProductSellList = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // setProductSellData
  const [getProductSellData] = useState({
    data: [
      { id: 1, name: 'Vet Essent', sku: 123456, brand: 'PTS', price: 25000, shippingStatus: 1, status: 1 },
      { id: 2, name: 'Tali Hewan 50cm', sku: 234567, brand: 'EAN', price: 100000, shippingStatus: 0, status: 0 }
    ],
    totalPagination: 0
  });

  const columns = useMemo(
    () => [
      {
        title: 'Row Selection',
        // eslint-disable-next-line
        Header: ({ getToggleAllRowsSelectedProps }) => <IndeterminateCheckbox indeterminate {...getToggleAllRowsSelectedProps()} />,
        accessor: 'selection',
        // eslint-disable-next-line
        Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
        disableSortBy: true
      },
      {
        Header: <FormattedMessage id="name" />,
        accessor: 'name',
        Cell: (data) => {
          const getId = data.row.original.id;
          return <Link href={`/product/list/product-sell/${getId}`}>{data.value}</Link>;
        }
      },
      { Header: 'Sku', accessor: 'sku' },
      { Header: <FormattedMessage id="brand" />, accessor: 'brand' },
      { Header: <FormattedMessage id="price" />, accessor: 'price' },
      {
        Header: <FormattedMessage id="shipping-status" />,
        accessor: 'shippingStatus',
        // className: 'cell-right',
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
        // className: 'cell-right',
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
    console.log('onOrderingChange', event);
    paramProductSellList.orderValue = event.order;
    paramProductSellList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    console.log('event', event);
    paramProductSellList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramProductSellList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramProductSellList.keyword = event;

    fetchData();
  };

  const onClickAdd = () => {
    navigate('/product/product-list/sell/add', { replace: true });
  };

  async function fetchData() {
    // const getData = await axios.get('product-sell', {
    //   params: {
    //     rowPerPage: paramProductSellList.rowPerPage,
    //     goToPage: paramProductSellList.goToPage,
    //     orderValue: paramProductSellList.orderValue,
    //     orderColumn: paramProductSellList.orderColumn,
    //     search: paramProductSellList.keyword
    //   }
    // });
    // console.log('getData', getData);
    // setProductSellData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
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
            <GlobalFilter placeHolder={'Search...'} setGlobalFilter={onSearch} size="small" />
            <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
              <FormattedMessage id="add-product-sell" />
            </Button>
          </Stack>
          <ReactTable
            columns={columns}
            data={getProductSellData.data}
            totalPagination={getProductSellData.totalPagination}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </Stack>
      </ScrollX>
    </MainCard>
  );
};

export default ProductSellList;
