import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Stack, useMediaQuery, Button, Link } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { GlobalFilter } from 'utils/react-table';
import { getMenuGroup, deleteMenuGroup } from './service';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import FormMenuGroup from './form';

let paramMenuGroup = {};

const MenuGroup = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();

  const [getMenuGroupData, setMenuGroupData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [dialog, setDialog] = useState(false);
  const [openForm, setOpenForm] = useState({ isOpen: false, data: null });

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
        style: { width: '10px' }
      },
      {
        Header: <FormattedMessage id="group-name" />,
        accessor: 'groupName',
        Cell: (data) => {
          return (
            <Link href="#" onClick={() => setOpenForm({ isOpen: true, data: data.row.original })}>
              {data.value}
            </Link>
          );
        }
      },
      { Header: <FormattedMessage id="order-menu" />, accessor: 'orderMenu' },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' }
    ],
    []
  );

  const eventTable = (procedure, event) => {
    if (procedure === 'order') {
      paramMenuGroup.orderValue = event.order;
      paramMenuGroup.orderColumn = event.column;
    } else if (procedure === 'gotoPage') {
      paramMenuGroup.goToPage = event;
    } else if (procedure === 'pageSize') {
      paramMenuGroup.rowPerPage = event;
    }

    fetchData();
  };

  const onSearch = (event) => {
    paramMenuGroup.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const fetchData = async () => {
    await getMenuGroup(paramMenuGroup)
      .then((resp) => {
        console.log('resp', resp);
        setMenuGroupData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteMenuGroup(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success Delete Data'));
            clearParamFetchData();
            fetchData();
          }
        })
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    } else {
      setDialog(false);
    }
  };

  const clearParamFetchData = () => {
    paramMenuGroup = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: [] };
  };

  useEffect(() => {
    clearParamFetchData();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="menu-group" />} isBreadcrumb={true} />
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
                {selectedRow.length > 0 && (
                  <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                    <FormattedMessage id="delete" />
                  </Button>
                )}
              </Stack>
              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setOpenForm({ isOpen: true, data: null })}>
                  <FormattedMessage id="new" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={getMenuGroupData.data}
              totalPagination={getMenuGroupData.totalPagination}
              setPageNumber={paramMenuGroup.goToPage}
              setPageRow={paramMenuGroup.rowPerPage}
              onOrder={(e) => eventTable('order', e)}
              onGotoPage={(e) => eventTable('gotoPage', e)}
              onPageSize={(e) => eventTable('pageSize', e)}
              // colSpanPagination={8}
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
      {openForm.isOpen && (
        <FormMenuGroup
          open={openForm.isOpen}
          data={openForm.data}
          onClose={(e) => {
            setOpenForm({ isOpen: false, data: null });
            if (e) fetchData();
          }}
        />
      )}
    </>
  );
};

export default MenuGroup;
