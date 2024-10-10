import { useMemo, useState, useEffect } from 'react';
import { getAccesControlUser } from '../service';
import { ReactTable } from 'components/third-party/ReactTable';
import { Stack, useMediaQuery } from '@mui/material';
import { GlobalFilter } from 'utils/react-table';
import { FormattedMessage, useIntl } from 'react-intl';
import { useTheme } from '@mui/material/styles';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

let paramAccessControlUsers = {};

const TabAccessControlUsers = () => {
  const [getAcessControlUserData, setAcessControlUserData] = useState({ data: [], totalPagination: 0 });
  const [keywordSearch, setKeywordSearch] = useState('');
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="name" />,
        accessor: 'name'
      },
      {
        Header: <FormattedMessage id="access-control" />,
        accessor: 'roleName'
      },
      {
        Header: <FormattedMessage id="job-v2" />,
        accessor: 'jobName'
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
    paramAccessControlUsers.orderValue = event.order;
    paramAccessControlUsers.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramAccessControlUsers.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramAccessControlUsers.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramAccessControlUsers.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const fetchData = async () => {
    const getData = await getAccesControlUser(paramAccessControlUsers);
    setAcessControlUserData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
  };

  const clearParamFetchData = () => {
    paramAccessControlUsers = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '' };
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
            data={getAcessControlUserData.data}
            totalPagination={getAcessControlUserData.totalPagination}
            setPageNumber={paramAccessControlUsers.goToPage}
            setPageRow={paramAccessControlUsers.rowPerPage}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </Stack>
      </ScrollX>
    </MainCard>
  );
};

export default TabAccessControlUsers;
