import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';

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
        Header: <FormattedMessage id="returned-rp" />,
        accessor: 'returnedAmount',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="used-rp" />,
        accessor: 'usedAmount',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="remaining-rp" />,
        accessor: 'remainingAmount',
        Cell: (data) => formatThousandSeparator(data.value)
      }
    ],
    []
  );
  const dataDummy = [
    {
      locationName: 'Location 1',
      returnedAmount: 4000,
      usedAmount: 0,
      remainingAmount: 4000
    },
    {
      locationName: 'Location 2',
      returnedAmount: 4000,
      usedAmount: 0,
      remainingAmount: 4000
    },
    {
      locationName: 'Location 3',
      returnedAmount: 4000,
      usedAmount: 0,
      remainingAmount: 4000
    }
    // Add more data as needed
  ];

  return (
    <div>
      <ReactTable
        columns={columns}
        data={tablesData}
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
