import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatDateString, formatThousandSeparator } from 'utils/func';

export default function SalesDetails({ data, filter, setFilter }) {
  const { locale } = useIntl();
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="sale-id" />,
        accessor: 'saleId'
      },
      {
        Header: <FormattedMessage id="reference" />,
        accessor: 'refNumber'
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
        accessor: 'items',
        Cell: (data) => (
          <div>
            <ul style={{ padding: 0 }}>
              {data.value.map((item, index) => (
                <li key={item + index}>{item}</li>
              ))}
            </ul>
          </div>
        )
      },
      {
        Header: <FormattedMessage id="total-rp" />,
        accessor: 'totalAmount',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="payments" />,
        accessor: 'paymentMethod',
        Cell: (data) => (
          <div>
            <ul style={{ padding: 0 }}>
              {data.value.map((item, index) => (
                <li key={item + index}>
                  {item.amount} {item.method} {item.date}
                </li>
              ))}
            </ul>
          </div>
        )
      },
      {
        Header: <FormattedMessage id="payment" />,
        accessor: 'payment'
      }
    ],
    [locale]
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
