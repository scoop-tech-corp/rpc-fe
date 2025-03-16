import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatDateString, formatThousandSeparator } from 'utils/func';

export default function SalesItems({ data, filter, setFilter }) {
  const { locale } = useIntl();
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="sales-id" />,
        accessor: 'saleId'
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'location'
      },
      {
        Header: <FormattedMessage id="sale-date" />,
        accessor: 'saleDate',
        Cell: (data) => formatDateString(data.value, locale)
      },
      {
        Header: <FormattedMessage id="status" />,
        accessor: 'status'
      },
      {
        Header: <FormattedMessage id="items" />,
        accessor: 'items'
      },
      {
        Header: <FormattedMessage id="quantity" />,
        accessor: 'quantity'
      },
      {
        Header: <FormattedMessage id="unit-price-rp" />,
        accessor: 'price',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="total-rp" />,
        accessor: 'totalAmount',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="payment" />,
        accessor: 'payment'
      }
    ],
    [locale]
  );

  // Dummy data for the table
  const dummyTableData = useMemo(
    () => [
      {
        saleId: 'INV-0001',
        location: 'RPC Duren',
        saleDate: '12-05-2024',
        status: 'Active',
        items: 'Proplan Sachet',
        quantity: 2,
        price: 25000,
        totalAmount: 29000,
        payment: 'Paid'
      },
      {
        saleId: 'INV-0001',
        location: 'RPC Duren',
        saleDate: '12-05-2024',
        status: 'Active',
        items: 'Proplan Sachet',
        quantity: 2,
        price: 25000,
        totalAmount: 25000,
        payment: 'Paid'
      },
      {
        saleId: 'INV-0001',
        location: 'RPC Duren',
        saleDate: '12-05-2024',
        status: 'Active',
        items: 'Proplan Sachet',
        quantity: 2,
        price: 25000,
        totalAmount: 25000,
        payment: 'Paid'
      }
    ],
    []
  );

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
