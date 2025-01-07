import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import ScrollX from 'components/ScrollX';

export default function StaffPerformance({ data, filter, setFilter }) {
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const tableColumns = useMemo(
    () => [
      { Header: <FormattedMessage id="name" />, accessor: 'name' },
      { Header: <FormattedMessage id="bookings" />, accessor: 'booking' },
      { Header: <FormattedMessage id="services" />, accessor: 'services' },
      { Header: <FormattedMessage id="booking-duration" />, accessor: 'bookingDuration' },
      { Header: <FormattedMessage id="booking-value" />, accessor: 'bookingValue' },
      { Header: <FormattedMessage id="classes" />, accessor: 'classes' },
      { Header: <FormattedMessage id="attendance" />, accessor: 'attendees' },
      { Header: <FormattedMessage id="class-duration" />, accessor: 'classDuration' },
      { Header: <FormattedMessage id="class-value" />, accessor: 'classValue' },

      { Header: <FormattedMessage id="total-duration" />, accessor: 'totalDuration' },
      { Header: <FormattedMessage id="total-annual-leave" />, accessor: 'totalAnnualLeave' },
      { Header: <FormattedMessage id="total-sick-leave" />, accessor: 'totalSickLeave' },
      { Header: <FormattedMessage id="total-leave-remaining" />, accessor: 'totalLeaveRemaining' },
      { Header: <FormattedMessage id="total-late" />, accessor: 'totalLate' }
    ],
    []
  );

  return (
    <>
      <ScrollX>
        <ReactTable
          columns={tableColumns}
          data={tablesData || []}
          totalPagination={totalPagination || 0}
          colSpanPagination={14}
          setPageNumber={filter.goToPage}
          onGotoPage={(event) => setFilter((e) => ({ ...e, goToPage: event }))}
          setPageRow={filter.rowPerPage}
          onPageSize={(event) => setFilter((e) => ({ ...e, rowPerPage: event }))}
          onOrder={(event) => {
            setFilter((e) => ({ ...e, orderValue: event.order, orderColumn: event.column }));
          }}
        />
      </ScrollX>
    </>
  );
}
