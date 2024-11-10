import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import { Stack, useMediaQuery } from '@mui/material';
import { downloadCustomerTemplate, getCustomerTemplate } from './service';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend, processDownloadExcel } from 'service/service-global';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import ScrollX from 'components/ScrollX';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import useGetList from 'hooks/useGetList';

const CustomerTemplate = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();

  const { list, totalPagination, params, setParams, goToPage, orderingChange, keyword, changeKeyword, changeLimit } = useGetList(
    getCustomerTemplate,
    {},
    'search'
  );

  const onDownload = async (fileType) => {
    await downloadCustomerTemplate(fileType)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="file-name" />, accessor: 'fileName' },
      { Header: <FormattedMessage id="last-change" />, accessor: 'lastChange' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      {
        Header: <FormattedMessage id="download" />,
        accessor: 'download',
        Cell: (data) => (
          <IconButton
            size="medium"
            variant="contained"
            aria-label="refresh"
            color="primary"
            onClick={() => onDownload(data.row.original.fileType)}
          >
            <DownloadIcon />
          </IconButton>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="customer-template" />} isBreadcrumb={true} />
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
    </>
  );
};

export default CustomerTemplate;
