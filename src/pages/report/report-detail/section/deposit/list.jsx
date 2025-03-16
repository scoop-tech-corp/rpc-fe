import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatDateString, formatThousandSeparator } from 'utils/func';

export default function DepositList({ data, filter, setFilter }) {
  const { locale } = useIntl();
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="reference" />,
        accessor: 'referenceNo'
      },
      {
        Header: <FormattedMessage id="customer" />,
        accessor: 'customerName'
      },
      {
        Header: <FormattedMessage id="date" />,
        accessor: 'date',
        Cell: (data) => formatDateString(data.value, locale)
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'locationName'
      },
      {
        Header: <FormattedMessage id="method" />,
        accessor: 'paymentMethod'
      },
      {
        Header: <FormattedMessage id="received-rp" />,
        accessor: 'receivedAmount',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="used-as-payment-rp" />,
        accessor: 'usedAmount',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="returned-rp" />,
        accessor: 'returnedAmount',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="remaining-rp" />,
        accessor: 'remainingAmount',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="invoice" />,
        accessor: 'invoiceNo'
      }
    ],
    [locale]
  );
  const dataDummy = [
    {
      referenceNo: '#00357357',
      customerName: 'Customer 1',
      date: '12 May 2024',
      locationName: 'Location 1',
      paymentMethod: 'Debit Card',
      receivedAmount: 4000,
      usedAmount: 0,
      returnedAmount: 4000,
      remainingAmount: 4000,
      invoiceNo: 'INV-1515153'
    },
    {
      referenceNo: '#00357357',
      customerName: 'Customer 1',
      date: '12 May 2024',
      locationName: 'Location 1',
      paymentMethod: 'Debit Card',
      receivedAmount: 4000,
      usedAmount: 0,
      returnedAmount: 4000,
      remainingAmount: 4000,
      invoiceNo: 'INV-1515153'
    },
    {
      referenceNo: '#00357357',
      customerName: 'Customer 1',
      date: '12 May 2024',
      locationName: 'Location 1',
      paymentMethod: 'Debit Card',
      receivedAmount: 4000,
      usedAmount: 0,
      returnedAmount: 4000,
      remainingAmount: 4000,
      invoiceNo: 'INV-1515153'
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
