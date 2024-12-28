import { useEffect, useMemo, useState } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';
import { getDashboardRecentActivity } from '../service';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

const DashboardRecentActivity = () => {
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

  const fetchData = async () => {
    await getDashboardRecentActivity()
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
    fetchData();
  }, []);

  return (
    <>
      <MainCard content={true}>
        <ScrollX>
          <ReactTable columns={columns} data={recentActivityData.data} totalPagination={recentActivityData.totalPagination} />
        </ScrollX>
      </MainCard>
    </>
  );
};

export default DashboardRecentActivity;
