import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';

export default function SalesSummary({ data, filter, setFilter }) {
  const tablesData = data?.table.data || [];
  const tableTotalData = data?.table.totalData;
  const totalPagination = data?.totalPagination;

  const chartSeries = useMemo(() => data?.charts.series || [], [data]);
  const chartCategories = useMemo(() => data?.charts.categories || [], [data]);

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'location',
        Cell: ({ value }) => (React.isValidElement(value) ? value : value)
      },
      {
        Header: <FormattedMessage id="gross-amount-rp" />,
        accessor: 'grossAmount',
        Cell: ({ value }) => (React.isValidElement(value) ? value : formatThousandSeparator(value))
      },
      {
        Header: <FormattedMessage id="discount-rp" />,
        accessor: 'discounts',
        Cell: ({ value }) => (React.isValidElement(value) ? value : formatThousandSeparator(value))
      },
      {
        Header: <FormattedMessage id="net-amount-rp" />,
        accessor: 'netAmount',
        Cell: ({ value }) => (React.isValidElement(value) ? value : formatThousandSeparator(value))
      },
      {
        Header: <FormattedMessage id="taxes-rp" />,
        accessor: 'taxesAmount',
        Cell: ({ value }) => (React.isValidElement(value) ? value : formatThousandSeparator(value))
      },
      {
        Header: <FormattedMessage id="charges-rp" />,
        accessor: 'chargesAmount',
        Cell: ({ value }) => (React.isValidElement(value) ? value : formatThousandSeparator(value))
      },
      {
        Header: <FormattedMessage id="total-rp" />,
        accessor: 'totalAmount',
        Cell: ({ value }) => (React.isValidElement(value) ? value : formatThousandSeparator(value))
      }
    ],
    []
  );

  useEffect(() => {
    // Create the chart options using dummyChartData
    const options = {
      series: chartSeries,
      chart: {
        height: 350,
        type: 'line',
        dropShadow: {
          enabled: true,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2
        },
        toolbar: {
          show: false
        }
      },
      colors: ['#77B6EA', '#545454'],
      dataLabels: {
        enabled: true
      },
      stroke: {
        curve: 'smooth'
      },
      title: {
        text: '',
        align: 'left'
      },
      grid: {
        borderColor: '#e7e7e7',
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      markers: {
        size: 1
      },
      xaxis: {
        categories: chartCategories,
        title: {
          text: 'Month'
        }
      },
      yaxis: {
        title: {
          text: 'Temperature'
        }
        // min: 5,
        // max: 40
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5
      }
    };

    const chart = new ApexCharts(document.querySelector('#chart'), options);
    chart.render();

    // Cleanup function
    return () => {
      chart.destroy();
    };
  }, [chartSeries, chartCategories]);

  return (
    <div>
      <div id="chart" style={{ marginBottom: 20 }} />

      <ReactTable
        columns={columns}
        data={[
          ...tablesData,
          {
            location: <strong>Total</strong>,
            grossAmount: <strong>{formatThousandSeparator(tableTotalData?.grossAmount || 0)}</strong>,
            discounts: <strong>{tableTotalData?.discounts}</strong>,
            netAmount: <strong>{formatThousandSeparator(tableTotalData?.netAmount || 0)}</strong>,
            taxesAmount: <strong>{tableTotalData?.taxesAmount}</strong>,
            chargesAmount: <strong>{tableTotalData?.chargesAmount}</strong>,
            totalAmount: <strong>{formatThousandSeparator(tableTotalData?.totalAmount || 0)}</strong>
          }
        ]}
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
