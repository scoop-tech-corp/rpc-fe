import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'utils/axios';
import { alpha, useTheme } from '@mui/material/styles';

import { Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, useMediaQuery, Button, Link } from '@mui/material';

import { useTable, useRowSelect } from 'react-table';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { FormattedMessage } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import { HeaderSort, IndeterminateCheckbox, TablePagination } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { openSnackbar } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';

function ReactTable({ columns, data, totalPagination, setPageNumber, onOrder, onGotoPage, onPageSize }) {
  const theme = useTheme();

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
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
                setPageNumber={setPageNumber}
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
  setPageNumber: PropTypes.number,
  onOrder: PropTypes.func,
  onGotoPage: PropTypes.func,
  onPageSize: PropTypes.func
};

let paramLocationList = {};

const LocationList = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getLocationData, setLocationData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');

  const columns = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: (header) => {
          useEffect(() => {
            const selectRows = header.selectedFlatRows.map(({ original }) => original.codeLocation);
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
        accessor: 'locationName',
        Cell: (data) => {
          const getCode = data.row.original.codeLocation;
          return <Link href={`/location/${getCode}`}>{data.value}</Link>;
        }
      },
      { Header: 'Address', accessor: 'addressName' },
      { Header: 'City', accessor: 'cityName' },
      { Header: 'Phone', accessor: 'phoneNumber' },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: (data) => {
          switch (data.value.toLowerCase()) {
            case 'active':
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
    paramLocationList.orderValue = event.order;
    paramLocationList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramLocationList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramLocationList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramLocationList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onClickAdd = () => {
    navigate('/location/add', { replace: true });
  };

  const onDeleteLocation = async () => {
    console.log('selectedRow', selectedRow);
    const resp = await axios.delete('location', {
      data: { codeLocation: selectedRow }
    });

    if (resp.status === 200 && resp.data.result === 'success') {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Success Delete location',
          variant: 'alert',
          alert: { color: 'success' },
          duration: 2000,
          close: true
        })
      );
      clearParamFetchData();
      fetchData();
    }
  };

  const onExport = async () => {
    const resp = await axios.get('exportlocation', {
      responseType: 'blob'
    });
    console.log('resp export', resp);
    // console.log('resp.headers content-disposition', resp.headers['content-disposition']);

    let blob = new Blob([resp.data], { type: resp.headers['content-type'] });
    let downloadUrl = URL.createObjectURL(blob);
    let a = document.createElement('a');

    a.href = downloadUrl;
    a.download = 'location';
    document.body.appendChild(a);
    a.click();
  };

  async function fetchData() {
    const resp = await axios.get('location', {
      params: {
        rowPerPage: paramLocationList.rowPerPage,
        goToPage: paramLocationList.goToPage,
        orderValue: paramLocationList.orderValue,
        orderColumn: paramLocationList.orderColumn,
        search: paramLocationList.keyword
      }
    });

    setLocationData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  }

  const clearParamFetchData = () => {
    paramLocationList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '' };
    setKeywordSearch('');
  };

  useEffect(() => {
    clearParamFetchData();
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
            <GlobalFilter placeHolder={'Search...'} globalFilter={keywordSearch} setGlobalFilter={onSearch} size="small" />

            <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'}>
              <Button variant="contained" startIcon={<VerticalAlignTopOutlined />} onClick={onExport} color="success">
                <FormattedMessage id="export" />
              </Button>
              <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                <FormattedMessage id="add-location" />
              </Button>
            </Stack>
          </Stack>
          <ReactTable
            columns={columns}
            data={getLocationData.data}
            totalPagination={getLocationData.totalPagination}
            setPageNumber={paramLocationList.goToPage}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </Stack>

        {selectedRow.length > 0 && (
          <Stack
            // direction={matchDownSM ? 'column' : 'row'}
            style={{ marginBottom: '20px' }}
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
            sx={{ p: 3, pb: 0 }}
          >
            <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={onDeleteLocation}>
              <FormattedMessage id="delete" />
            </Button>
          </Stack>
        )}
      </ScrollX>
    </MainCard>
  );
};

export default LocationList;
