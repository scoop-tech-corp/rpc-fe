import { useEffect, useMemo, useState } from 'react';
import axios from 'utils/axios';
import { useTheme } from '@mui/material/styles';
import { Stack, useMediaQuery, Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DeleteFilled } from '@ant-design/icons';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import HeaderCustom from 'components/@extended/HeaderPageCustom';
import ConfirmationC from 'components/ConfirmationC';

let paramDataStaticList = {};

const StaticDataList = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();

  const [staticData, setStaticData] = useState({ data: [], totalPagination: 0 });
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
        disableSortBy: true,
        style: {
          width: '10px'
        }
      },
      { Header: <FormattedMessage id="type" />, accessor: 'value' },
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
    setKeywordSearch(event);

    fetchData();
  };

  const onConfirm = async (value) => {
    if (value) {
      await axios
        .delete('datastatic', {
          data: { id: selectedRow }
        })
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success delete data'));
            initList();
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

  async function fetchData() {
    const resp = await axios.get('datastatic', {
      params: {
        rowPerPage: paramDataStaticList.rowPerPage,
        goToPage: paramDataStaticList.goToPage,
        orderValue: paramDataStaticList.orderValue,
        orderColumn: paramDataStaticList.orderColumn,
        search: paramDataStaticList.keyword
      }
    });
    setStaticData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  }

  const clearParamFetchData = () => {
    paramDataStaticList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '' };
    setKeywordSearch('');
  };

  const initList = () => {
    clearParamFetchData();
    fetchData();
  };

  useEffect(() => {
    initList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeaderCustom title={<FormattedMessage id="static-data" />} isBreadcrumb={true} />
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
            </Stack>
            <ReactTable
              columns={columns}
              data={staticData.data}
              totalPagination={staticData.totalPagination}
              setPageNumber={paramDataStaticList.goToPage}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
            />
          </Stack>
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

export default StaticDataList;
