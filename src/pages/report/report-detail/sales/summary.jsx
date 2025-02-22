import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';

export default function SalesSummary({ data, filter, setFilter }) {
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'locationName',
        Cell: ({ value }) => (React.isValidElement(value) ? value : value)
      },
      {
        Header: <FormattedMessage id="gross-amount" />,
        accessor: 'grossAmount',
        Cell: ({ value }) => (React.isValidElement(value) ? value : formatThousandSeparator(value))
      },
      {
        Header: <FormattedMessage id="discount" />,
        accessor: 'discountAmount',
        Cell: ({ value }) => (React.isValidElement(value) ? value : formatThousandSeparator(value))
      },
      {
        Header: <FormattedMessage id="net-amount" />,
        accessor: 'netAmount',
        Cell: ({ value }) => (React.isValidElement(value) ? value : formatThousandSeparator(value))
      },
      {
        Header: <FormattedMessage id="taxes" />,
        accessor: 'taxAmount',
        Cell: ({ value }) => (React.isValidElement(value) ? value : formatThousandSeparator(value))
      },
      {
        Header: <FormattedMessage id="charges" />,
        accessor: 'chargeAmount',
        Cell: ({ value }) => (React.isValidElement(value) ? value : formatThousandSeparator(value))
      },
      {
        Header: <FormattedMessage id="total" />,
        accessor: 'totalAmount',
        Cell: ({ value }) => (React.isValidElement(value) ? value : formatThousandSeparator(value))
      }
    ],
    []
  );

  // Dummy data for the table
  const dummyTableData = useMemo(
    () => [
      {
        locationName: 'RPC SUMATERA UTARA',
        grossAmount: 100,
        discountAmount: 10,
        netAmount: 1_500_000,
        taxAmount: 0,
        chargeAmount: 0,
        totalAmount: 0
      },
      {
        locationName: 'RPC ACEH',
        grossAmount: 200,
        discountAmount: 15,
        netAmount: 3_000_000,
        taxAmount: 0,
        chargeAmount: 0,
        totalAmount: 0
      },
      {
        locationName: 'RPC HANKAM',
        grossAmount: 200,
        discountAmount: 15,
        netAmount: 3_000_000,
        taxAmount: 0,
        chargeAmount: 0,
        totalAmount: 0
      }
    ],
    []
  );

  // Dummy data for the chart
  const dummyChartData = {
    series: [
      {
        name: 'RPC ACEH',
        data: [10, 10, 10, 10, 30, 20, 10]
      },
      {
        name: 'RPC SUMATERA UTARA',
        data: [20, 40, 20, 10, 80, 30, 10]
      },
      {
        name: 'RPC HANKAM',
        data: [25, 20, 40, 20, 90, 10, 20]
      }
    ],
    categories: ['1 May', '2 May', '3 May', '4 May', '5 May', '6 May', '7 May']
  };

  useEffect(() => {
    // Create the chart options using dummyChartData
    const options = {
      series: dummyChartData.series,
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
        categories: dummyChartData.categories,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div id="chart" style={{ marginBottom: 20 }} />

      <ReactTable
        columns={columns}
        data={[
          ...dummyTableData,
          {
            locationName: <strong>Total</strong>,
            grossAmount: <strong>500</strong>,
            discountAmount: <strong>40</strong>,
            netAmount: <strong>7.500.000</strong>,
            taxAmount: <strong>0</strong>,
            chargeAmount: <strong>0</strong>,
            totalAmount: <strong>0</strong>
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
