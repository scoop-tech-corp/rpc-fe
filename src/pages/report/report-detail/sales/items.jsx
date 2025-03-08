import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';

export default function SalesItems({ data, filter, setFilter }) {
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
        accessor: 'saleDate'
      },
      {
        Header: <FormattedMessage id="status" />,
        accessor: 'status'
      },
      {
        Header: <FormattedMessage id="item" />,
        accessor: 'items'
      },
      {
        Header: <FormattedMessage id="quantity" />,
        accessor: 'quantity'
      },
      {
        Header: <FormattedMessage id="price" />,
        accessor: 'price',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="payment" />,
        accessor: 'payment'
      }
    ],
    []
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
