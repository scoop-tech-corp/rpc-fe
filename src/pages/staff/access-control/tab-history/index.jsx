import { useMemo, useState, useEffect } from 'react';
import { getAccesControlHistory } from '../service';
import { ReactTable } from 'components/third-party/ReactTable';
import { Stack, useMediaQuery } from '@mui/material';
import { GlobalFilter } from 'utils/react-table';
import { FormattedMessage, useIntl } from 'react-intl';
import { useTheme } from '@mui/material/styles';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

let paramAccessControlHistory = {};

const TabAccessControlHistory = () => {
  const [getAcessControlHistoryData, setAcessControlHistoryData] = useState({ data: [], totalPagination: 0 });
  const [keywordSearch, setKeywordSearch] = useState('');
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();

  const columns = useMemo(
    () => [
      {
        Header: 'Menu',
        accessor: 'menuName'
      },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action'
      },
      {
        Header: <FormattedMessage id="role" />,
        accessor: 'roleName'
      },
      {
        Header: <FormattedMessage id="created-by" />,
        accessor: 'createdBy'
      },
      {
        Header: <FormattedMessage id="created-at" />,
        accessor: 'createdAt'
      }
    ],
    []
  );

  const onOrderingChange = (event) => {
    paramAccessControlHistory.orderValue = event.order;
    paramAccessControlHistory.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramAccessControlHistory.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramAccessControlHistory.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramAccessControlHistory.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const fetchData = async () => {
    const getData = await getAccesControlHistory(paramAccessControlHistory);
    setAcessControlHistoryData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
  };

  const clearParamFetchData = () => {
    paramAccessControlHistory = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '' };
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
            <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
              <GlobalFilter
                placeHolder={intl.formatMessage({ id: 'search' })}
                globalFilter={keywordSearch}
                setGlobalFilter={onSearch}
                style={{ height: '41.3px' }}
              />
            </Stack>
          </Stack>
          <ReactTable
            columns={columns}
            data={getAcessControlHistoryData.data}
            totalPagination={getAcessControlHistoryData.totalPagination}
            setPageNumber={paramAccessControlHistory.goToPage}
            setPageRow={paramAccessControlHistory.rowPerPage}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </Stack>
      </ScrollX>
    </MainCard>
  );
};

export default TabAccessControlHistory;
