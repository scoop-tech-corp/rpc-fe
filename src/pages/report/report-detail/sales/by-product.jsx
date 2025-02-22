import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';

export default function SalesByProduct({ data, filter, setFilter }) {
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="product" />,
        accessor: 'product'
      },
      {
        Header: <FormattedMessage id="quantity" />,
        accessor: 'quantity'
      },
      {
        Header: <FormattedMessage id="total-rp" />,
        accessor: 'total',
        Cell: (data) => formatThousandSeparator(data.value)
      }
    ],
    []
  );

  // Dummy data for the table
  const dummyTableData = useMemo(
    () => [
      {
        product: 'Biodin Inj (1 ml)',
        quantity: 10,
        total: 13500000
      },
      {
        product: 'Biodin Inj (1 ml)',
        quantity: 10,
        total: 13500000
      },
      {
        product: 'Biodin Inj (1 ml)',
        quantity: 10,
        total: 13500000
      }
    ],
    []
  );

  return (
    <div>
      <ReactTable
        columns={columns}
        data={dummyTableData}
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
