import { useMemo } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

const DashboardRecentActivity = () => {
  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="date" />, accessor: 'date', isNotSorting: true },
      { Header: <FormattedMessage id="staff" />, accessor: 'staff', isNotSorting: true },
      { Header: <FormattedMessage id="module" />, accessor: 'module', isNotSorting: true },
      { Header: <FormattedMessage id="event" />, accessor: 'event', isNotSorting: true },
      { Header: <FormattedMessage id="detail" />, accessor: 'detail', isNotSorting: true }
    ],
    []
  );

  const data = [
    {
      date: '19 Nov, 2022 12:00 AM',
      staff: 'Junaidi',
      module: 'Booking',
      event: 'Change Data',
      detail: 'Change data booking'
    },
    {
      date: '22 Dec, 2024 12:00 AM',
      staff: 'Junaidi 2',
      module: 'Booking',
      event: 'Change Data',
      detail: 'Change data booking'
    }
  ];

  return (
    <>
      <MainCard content={true}>
        <ScrollX>
          <ReactTable columns={columns} data={data} />
        </ScrollX>
      </MainCard>
    </>
  );
};

export default DashboardRecentActivity;
