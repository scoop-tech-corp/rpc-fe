import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import { Stack, useMediaQuery, Button, Link } from '@mui/material';
import { deleteMenuReport, getMenuReport } from './service';
import { useDispatch } from 'react-redux';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import useGetList from 'hooks/useGetList';
import FormMenuReport from './form';

const MenuReport = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();

  const { list, totalPagination, params, goToPage, setParams, orderingChange, keyword, changeKeyword, changeLimit } = useGetList(
    getMenuReport,
    {},
    'search'
  );
  const [selectedRow, setSelectedRow] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [openForm, setOpenForm] = useState({ isOpen: false, id: null });

  const onConfirm = async (value) => {
    if (value) {
      await deleteMenuReport(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success delete data'));
            setParams((_params) => ({ ..._params }));
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
            <Link href="#" onClick={() => setOpenForm({ isOpen: true, id: +data.row.original.id })}>
              {data.value}
            </Link>
          );
        }
      },
      { Header: <FormattedMessage id="menu-name" />, accessor: 'menuName' },
      { Header: <FormattedMessage id="role" />, accessor: 'roleName' },
      { Header: <FormattedMessage id="access-type" />, accessor: 'accessType' },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' }
    ],
    []
  );

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="menu-report" />} isBreadcrumb={true} />
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
                  globalFilter={keyword}
                  setGlobalFilter={changeKeyword}
                  style={{ height: '41.3px' }}
                />
                {selectedRow.length > 0 && (
                  <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                    <FormattedMessage id="delete" />
                  </Button>
                )}
              </Stack>
              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setOpenForm({ isOpen: true, id: null })}>
                  <FormattedMessage id="new" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={list || []}
              totalPagination={totalPagination}
              setPageNumber={params.goToPage}
              setPageRow={params.rowPerPage}
              onGotoPage={goToPage}
              onOrder={orderingChange}
              onPageSize={changeLimit}
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
        <FormMenuReport
          id={openForm.id}
          open={openForm.isOpen}
          onClose={() => setOpenForm({ isOpen: false, id: null })}
          setParams={setParams}
        />
      )}
    </>
  );
};

export default MenuReport;
