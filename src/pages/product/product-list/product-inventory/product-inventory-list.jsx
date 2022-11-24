
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
              {/* rows => jumlah data, pageSize => 5, 10 */}
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

const paramProductInventoryList = {
  rowPerPage: 5,
  goToPage: 1,
  orderValue: '',
  orderColumn: '',
  keyword: ''
};

const ProductInventoryList = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // setProductInventoryData
  const [getProductInventoryData] = useState({
    data: [
      {
        id: 1,
        requirementName: 'Gunting',
        totalProduct: 5,
        locationProduct: 'RPC Condet',
        status: 3,
        createdBy: 'Agus',
        createdAt: '19/10/2022'
      },
      {
        id: 2,
        requirementName: 'Pelontar Pil',
        totalProduct: 2,
        locationProduct: 'RPC Kelapa Gading',
        status: 1,
        createdBy: 'Tono',
        createdAt: '15/06/2022'
      }
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
        Header: <FormattedMessage id="requirement-name" />,
        accessor: 'requirementName',
        Cell: (data) => {
          const getId = data.row.original.id;
          return <Link href={`/product/list/product-inventory/${getId}`}>{data.value}</Link>;
        }
      },
      { Header: <FormattedMessage id="total-product" />, accessor: 'totalProduct' },
      { Header: <FormattedMessage id="location-product" />, accessor: 'locationProduct' },
      {
        Header: 'Status',
        accessor: 'status',
        // className: 'cell-right',
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
    console.log('onOrderingChange', event);
    paramProductInventoryList.orderValue = event.order;
    paramProductInventoryList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    console.log('event', event);
    paramProductInventoryList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramProductInventoryList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramProductInventoryList.keyword = event;

    fetchData();
  };

  const onClickAdd = () => {
    navigate('/product/list/product-inventory/add', { replace: true });
  };

  async function fetchData() {
    // const getData = await axios.get('fasilitas', {
    //   params: {
    //     rowPerPage: paramProductInventoryList.rowPerPage,
    //     goToPage: paramProductInventoryList.goToPage,
    //     orderValue: paramProductInventoryList.orderValue,
    //     orderColumn: paramProductInventoryList.orderColumn,
    //     search: paramProductInventoryList.keyword
    //   }
    // });
    // console.log('getData', getData);
    // setProductInventoryData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
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
              <FormattedMessage id="add-product-inventory" />
            </Button>
          </Stack>
          <ReactTable
            columns={columns}
            data={getProductInventoryData.data}
            totalPagination={getProductInventoryData.totalPagination}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </Stack>
      </ScrollX>
    </MainCard>
  );
};

export default ProductInventoryList;
