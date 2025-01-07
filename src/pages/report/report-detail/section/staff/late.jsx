import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';
import { useMemo } from 'react';

import ReactApexChart from 'react-apexcharts';

export default function StaffLate({ data, setFilter }) {
  const chartsData = data?.charts;
  const tablesData = data?.table;

  const options = {
    chart: {
      type: 'line',
      dropShadow: { enabled: true, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2 },
      zoom: { enabled: false },
      toolbar: { show: false }
    },
    dataLabels: { enabled: true },
    stroke: { curve: 'smooth' },
    title: { text: '', align: 'left' },
    grid: {
      borderColor: '#e7e7e7',
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5
      }
    },
    markers: { size: 1 },
    xaxis: {
      categories: chartsData?.categories || [],
      title: { text: '' }
    },
    yaxis: { title: { text: '' } },
    legend: { position: 'bottom', horizontalAlign: 'center', floating: false }
  };

  const tableColumns = useMemo(
    () => [
      { Header: <FormattedMessage id="name" />, accessor: 'name' },
      { Header: <FormattedMessage id="shift" />, accessor: 'shift' },
      { Header: <FormattedMessage id="day" />, accessor: 'day' },
      { Header: <FormattedMessage id="attendance-time" />, accessor: 'attendanceTime' },
      { Header: <FormattedMessage id="homecoming-time" />, accessor: 'homecomingTime' }
    ],
    []
  );

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <ReactApexChart options={options} series={chartsData?.series || []} type="line" height={350} />
      </div>
      <ReactTable
        columns={tableColumns}
        onOrder={(event) => {
          setFilter((e) => ({ ...e, orderValue: event.order, orderColumn: event.column }));
        }}
        data={tablesData?.data || []}
      />
    </>
  );
}
