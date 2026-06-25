import { Link } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';
import { useNavigate } from 'react-router-dom';

export default function ExpensesSummary({ data, filter, setFilter }) {
  const navigate = useNavigate();
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const generateHeader = () => {
    const now = new Date();
    // Mulai dari bulan yang sama, 2 tahun ke belakang
    const start = new Date(now.getFullYear() - 2, now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);

    let headers = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const monthName = cursor.toLocaleString('en-US', { month: 'short' });
      headers.push(`${monthName} ${cursor.getFullYear().toString().slice(2)}`); // "Jun 24"
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return headers;
  };

  const getMonthColumns = () => {
    const headers = generateHeader();
    return headers.map((month, index) => ({
      Header: month,
      accessor: `month${index + 1}`,
      Cell: (data) => formatThousandSeparator(data?.value ?? 0)
    }));
  };

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="category" />,
        accessor: 'category',
        Cell: (data) => {
          const categoryId = data.row.original.categoryId;
          const categoryName = data.value;

          return (
            <Link
              onClick={() =>
                navigate('/report-detail?type=expenses&detail=list', {
                  state: { prefilterCategory: [{ value: categoryId, label: categoryName }] }
                })
              }
              sx={{ cursor: 'pointer' }}
            >
              {categoryName}
            </Link>
          );
        }
      },
      ...getMonthColumns()
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div>
      <ReactTable
        columns={columns}
        data={tablesData}
        totalPagination={totalPagination || 0}
        colSpanPagination={columns.length}
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
