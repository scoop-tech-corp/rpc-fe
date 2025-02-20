import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

export default function DepositSummary({ data, filter, setFilter }) {
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'locationName'
      },
      {
        Header: <FormattedMessage id="returned" />,
        accessor: 'returned'
      },
      {
        Header: <FormattedMessage id="used" />,
        accessor: 'used'
      },
      {
        Header: <FormattedMessage id="remaining" />,
        accessor: 'remaining'
      }
    ],
    []
  );
  const dataDummy = [
    {
      locationName: 'Location 1',
      returned: 4000,
      used: 0,
      remaining: 4000
    },
    {
      locationName: 'Location 2',
      returned: 4000,
      used: 0,
      remaining: 4000
    },
    {
      locationName: 'Location 3',
      returned: 4000,
      used: 0,
      remaining: 4000
    }
    // Add more data as needed
  ];

  return (
    <div>
      <ReactTable
        columns={columns}
        data={dataDummy}
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
    </div>
  );
}
