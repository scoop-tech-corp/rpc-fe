import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

export default function DepositList({ data, filter, setFilter }) {
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="reference" />,
        accessor: 'reference'
      },
      {
        Header: <FormattedMessage id="customer" />,
        accessor: 'customerName'
      },
      {
        Header: <FormattedMessage id="date" />,
        accessor: 'date'
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'locationName'
      },
      {
        Header: <FormattedMessage id="method" />,
        accessor: 'method'
      },
      {
        Header: <FormattedMessage id="received" />,
        accessor: 'received'
      },
      {
        Header: <FormattedMessage id="used-as-payment" />,
        accessor: 'usedAsPayment'
      },
      {
        Header: <FormattedMessage id="returned" />,
        accessor: 'returned'
      },
      {
        Header: <FormattedMessage id="remaining" />,
        accessor: 'remaining'
      },
      {
        Header: <FormattedMessage id="invoice" />,
        accessor: 'invoice'
      }
    ],
    []
  );
  const dataDummy = [
    {
      reference: '#00357357',
      customerName: 'Customer 1',
      date: '12 May 2024',
      locationName: 'Location 1',
      method: 'Debit Card',
      received: 4000,
      usedAsPayment: 0,
      returned: 4000,
      remaining: 4000,
      invoice: 'INV-1515153'
    },
    {
      reference: '#00357357',
      customerName: 'Customer 1',
      date: '12 May 2024',
      locationName: 'Location 1',
      method: 'Debit Card',
      received: 4000,
      usedAsPayment: 0,
      returned: 4000,
      remaining: 4000,
      invoice: 'INV-1515153'
    },
    {
      reference: '#00357357',
      customerName: 'Customer 1',
      date: '12 May 2024',
      locationName: 'Location 1',
      method: 'Debit Card',
      received: 4000,
      usedAsPayment: 0,
      returned: 4000,
      remaining: 4000,
      invoice: 'INV-1515153'
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
