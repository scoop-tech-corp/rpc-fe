import { useEffect, useMemo, useState } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';
import { getDashboardRecentActivity } from '../service';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

let paramRecentActivityList = {};
const DashboardRecentActivity = () => {
  const dispatch = useDispatch();
  const [recentActivityData, setRecentActivityData] = useState({ data: [], totalPagination: 0 });

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="date" />, accessor: 'date', isNotSorting: true },
      { Header: <FormattedMessage id="staff" />, accessor: 'staff', isNotSorting: true },
      { Header: <FormattedMessage id="module" />, accessor: 'module', isNotSorting: true },
      { Header: <FormattedMessage id="event" />, accessor: 'event', isNotSorting: true },
      { Header: <FormattedMessage id="details" />, accessor: 'detail', isNotSorting: true }
    ],
    []
  );

  const onGotoPageChange = (event) => {
    paramRecentActivityList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramRecentActivityList.rowPerPage = event;
    fetchData();
  };

  const fetchData = async () => {
    await getDashboardRecentActivity(paramRecentActivityList)
      .then((resp) => {
        setRecentActivityData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  useEffect(() => {
    clearParamFetchData();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearParamFetchData = () => {
    paramRecentActivityList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '' };
  };

  return (
    <>
      <MainCard content={true}>
        <ScrollX>
          <ReactTable
            columns={columns}
            data={recentActivityData.data}
            totalPagination={recentActivityData.totalPagination}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </ScrollX>
      </MainCard>
    </>
  );
};

export default DashboardRecentActivity;
