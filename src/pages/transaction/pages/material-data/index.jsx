import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { Button, Stack, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IndeterminateCheckbox, ReactTable } from 'components/third-party/ReactTable';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { GlobalFilter } from 'utils/react-table';
import { deleteTransactionDataStatic, getTransactionDataStatic } from './service';

import HeaderCustom from 'components/@extended/HeaderPageCustom';
import ConfirmationC from 'components/ConfirmationC';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import FormTransactionMaterialData from './form/FormTransactionMaterialData';

let paramDataStaticList = {};

const TransactionDataStatic = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const intl = useIntl();

  const [staticData, setStaticData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [dialog, setDialog] = useState(false);
  const [openFormTransactionMaterialData, setOpenFormTransactionMaterialData] = useState(false);

  const onnAddTransactionMaterialData = () => setOpenFormTransactionMaterialData(true);

  const onCloseFormTransactionMaterialData = async (val) => {
    if (val) {
      setOpenFormTransactionMaterialData(false);
      const resp = await getTransactionDataStatic(paramDataStaticList);
      setStaticData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
    }
  };

  const columns = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: (header) => {
          useEffect(() => {
            const selectRows = header.selectedFlatRows.map(({ original }) => ({ id: +original.id, type: original.type }));
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
        Header: <FormattedMessage id="type" />,
        accessor: 'type',
        Cell: (data) => {
          switch (data.value) {
            case 'weight':
              return intl.formatMessage({ id: 'weight' });
            case 'temperature':
              return intl.formatMessage({ id: 'temperature-body' });
            case 'breath':
              return intl.formatMessage({ id: 'breath' });
            case 'sound':
              return intl.formatMessage({ id: 'sound' });
            case 'heart':
              return intl.formatMessage({ id: 'heart' });
            case 'vaginal':
              return intl.formatMessage({ id: 'vaginal' });
            case 'paymentmethod':
              return intl.formatMessage({ id: 'payment-method' });
            default:
              return data.value;
          }
        }
      },
      {
        Header: <FormattedMessage id="name" />,
        accessor: 'name'
      }
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
      await deleteTransactionDataStatic(selectedRow)
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

  const fetchData = async () => {
    const resp = await getTransactionDataStatic(paramDataStaticList);
    setStaticData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  };

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
      <HeaderCustom title={<FormattedMessage id="material-data" />} isBreadcrumb={true} />
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
                  style={{ height: '36.5px' }}
                />
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onnAddTransactionMaterialData}>
                  <FormattedMessage id="new" />
                </Button>

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
              setPageRow={paramDataStaticList.rowPerPage}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
            />
          </Stack>
        </ScrollX>
      </MainCard>

      <FormTransactionMaterialData open={openFormTransactionMaterialData} onClose={onCloseFormTransactionMaterialData} />

      <ConfirmationC
        open={dialog}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={(response) => onConfirm(response)}
        btnTrueText="Ok"
      />
    </>
  );
};

export default TransactionDataStatic;
