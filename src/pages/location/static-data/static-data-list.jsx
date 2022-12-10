import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
// import axios from 'utils/axios';
import { alpha, useTheme } from '@mui/material/styles';

import { Stack, Table, TableBody, TableCell, TableHead, TableRow, useMediaQuery } from '@mui/material';

import { useTable, useRowSelect } from 'react-table';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { FormattedMessage } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import { HeaderSort, IndeterminateCheckbox, TablePagination, TableRowSelection } from 'components/third-party/ReactTable';
// import { PlusOutlined } from '@ant-design/icons';
// import { useNavigate } from 'react-router';

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

  const [selectedOrder, setOrder] = useState({
    column: '',
    order: ''
  });

  const clickHeader = (column) => {
    if (column.id === 'selection') return;

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

const paramDataStaticList = {
  rowPerPage: 5,
  goToPage: 1,
  orderValue: '',
  orderColumn: '',
  keyword: ''
};

const StaticDataList = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  // const navigate = useNavigate();

  // setStaticData
  const [getStaticData] = useState({
    data: [
      { id: 1, type: 'Contact Usages', name: 'Reza' },
      { id: 2, type: 'Address Usages', name: 'Tempat Tinggal' }
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
      { Header: <FormattedMessage id="type" />, accessor: 'type' },
      { Header: <FormattedMessage id="name" />, accessor: 'name' }
    ],
    []
  );

  const onOrderingChange = (event) => {
    paramDataStaticList.orderValue = event.order;
    paramDataStaticList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramDataStaticList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramDataStaticList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramDataStaticList.keyword = event;

    fetchData();
  };

  // const onClickAdd = () => {
  //   navigate('/location/facilities/add', { replace: true });
  // };

  async function fetchData() {
    // const getData = await axios.get('datastatic', {
    //   params: {
    //     rowPerPage: paramDataStaticList.rowPerPage,
    //     goToPage: paramDataStaticList.goToPage,
    //     orderValue: paramDataStaticList.orderValue,
    //     orderColumn: paramDataStaticList.orderColumn,
    //     search: paramDataStaticList.keyword
    //   }
    // });
    // setStaticData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
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
            {/* <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
              <FormattedMessage id="add-static-data" />
            </Button> */}
          </Stack>
          <ReactTable
            columns={columns}
            data={getStaticData.data}
            totalPagination={getStaticData.totalPagination}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </Stack>
      </ScrollX>
    </MainCard>
  );
};

export default StaticDataList;
