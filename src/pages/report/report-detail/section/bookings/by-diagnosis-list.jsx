import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

export default function BookingByDiagnosisList({ data }) {
  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="start-date" />,
        accessor: 'start-date'
      },
      {
        Header: <FormattedMessage id="start-time" />,
        accessor: 'start-time'
      },
      {
        Header: <FormattedMessage id="end-date" />,
        accessor: 'end-date'
      },
      {
        Header: <FormattedMessage id="end-time" />,
        accessor: 'end-time'
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'location'
      },
      {
        Header: <FormattedMessage id="customer" />,
        accessor: 'customer'
      },
      {
        Header: <FormattedMessage id="service" />,
        accessor: 'service'
      },
      {
        Header: <FormattedMessage id="status" />,
        accessor: 'status'
      },
      {
        Header: <FormattedMessage id="value-rp" />,
        accessor: 'value-rp'
      }
    ],
    []
  );

  return (
    <div>
      <ReactTable
        columns={columns}
        data={data || []}
        // totalPagination={totalPagination}
        // setPageNumber={params.goToPage}
        // setPageRow={params.rowPerPage}
        // onGotoPage={goToPage}
        // onOrder={orderingChange}
        // onPageSize={changeLimit}
      />
    </div>
  );
}
