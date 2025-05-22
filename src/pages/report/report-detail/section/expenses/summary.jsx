import { Link } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';

export default function ExpensesSummary({ data, filter, setFilter }) {
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const generateHeader = (startYear = 2024) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-indexed (Jan = 0, Dec = 11)

    let headers = [];
    for (let year = startYear; year <= currentYear; year++) {
      let startMonth = year === startYear ? 0 : 0; // January
      let endMonth = year === currentYear ? currentMonth : 11; // Until current month

      for (let month = startMonth; month <= endMonth; month++) {
        const monthName = new Date(year, month).toLocaleString('en-US', { month: 'short' });
        headers.push(`${monthName} ${year.toString().slice(2)}`); // Format: "Jan 24"
      }
    }
    return headers;
  };

  const getMonthColumns = () => {
    const headers = generateHeader(2024);
    return headers.map((month, index) => ({
      Header: month,
      accessor: `month${index + 1}`,
      Cell: (data) => {
        console.log(data.value);
        return formatThousandSeparator(data?.value || 0);
      }
    }));
  };

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="category" />,
        accessor: 'category',
        Cell: (data) => {
          const onClickDetail = () => {};

          return <Link onClick={() => onClickDetail()}>{data.value}</Link>;
        }
      },
      ...getMonthColumns()
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const dataDummy = [
    {
      category: 'Kasbon',
      month1: 0,
      month2: 0,
      month3: 0,
      month4: 0,
      month5: 0,
      month6: 0,
      month7: 0,
      month8: 0,
      month9: 0,
      month10: 3292950,
      month11: 8825250,
      month12: 5149000
    },
    {
      category: 'Klinik',
      month1: 0,
      month2: 0,
      month3: 0,
      month4: 0,
      month5: 0,
      month6: 0,
      month7: 0,
      month8: 0,
      month9: 1558100,
      month10: 6386725,
      month11: 19660603,
      month12: 22154200
    }
  ];

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
