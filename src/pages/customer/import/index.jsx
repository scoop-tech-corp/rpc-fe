import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import { Button, Stack, useMediaQuery } from '@mui/material';
import { getCustomerImportList, importCustomerImport } from './service';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import ScrollX from 'components/ScrollX';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import useGetList from 'hooks/useGetList';
import ModalImport from 'pages/product/product-list/components/ModalImport';

const CustomerImport = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isModalImport, setModalImport] = useState(false);

  const { list, totalPagination, params, setParams, goToPage, orderingChange, keyword, changeKeyword, changeLimit } = useGetList(
    getCustomerImportList,
    {},
    'search'
  );

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="file-name" />, accessor: 'fileName' },
      { Header: <FormattedMessage id="name" />, accessor: 'totalData' },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' }
    ],
    []
  );

  const onImportFile = async (file) => {
    await importCustomerImport(file)
      .then((resp) => {
        if (resp.status === 200) {
          dispatch(snackbarSuccess('Success import file'));
          setModalImport(false);
          setParams((_params) => ({ ..._params }));
        }
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="customer-import" />} isBreadcrumb={true} />
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
              </Stack>
              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                <IconButton
                  size="medium"
                  variant="contained"
                  aria-label="refresh"
                  color="primary"
                  onClick={() => setParams((_params) => ({ ..._params }))}
                >
                  <RefreshIcon />
                </IconButton>
                <Button variant="contained" startIcon={<FileUploadIcon />} onClick={() => setModalImport(true)}>
                  <FormattedMessage id="import" />
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
      {isModalImport && (
        <ModalImport isTemplate={false} open={isModalImport} onImport={(e) => onImportFile(e)} onClose={(e) => setModalImport(!e)} />
      )}
    </>
  );
};

export default CustomerImport;
