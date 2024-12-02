import ReactApexChart from 'react-apexcharts';
import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

export default function CustomerGrowthByGroup({ data }) {
  const options = {
    chart: {
      width: 350,
      type: 'pie'
    },
    labels: ['VIP', 'Pecinta Alam', 'Cat Lover'],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ]
  };
  const series = [44, 55, 13];

  const tableColumns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="reporting-group" />,
        accessor: 'reporting_group'
      },
      { Header: 'Total', accessor: 'total' },
      { Header: <FormattedMessage id="new" />, accessor: 'new' },
      { Header: <FormattedMessage id="inactive" />, accessor: 'inactive' },
      { Header: <FormattedMessage id="deleted" />, accessor: 'deleted' }
    ],
    []
  );

  const tableData = useMemo(
    () => [
      {
        reporting_group: 'VIP',
        total: 200,
        new: 250,
        inactive: 0,
        deleted: 0
      },
      {
        reporting_group: 'Pecinta Alam',
        total: 300,
        new: 350,
        inactive: 0,
        deleted: 0
      },
      {
        reporting_group: 'Cat Lover',
        total: 300,
        new: 350,
        inactive: 0,
        deleted: 0
      }
    ],
    []
  );

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <ReactApexChart options={options} series={series} type="pie" height={350} />
      </div>
      <ReactTable
        columns={tableColumns}
        data={[
          ...tableData,
          {
            reporting_group: <strong>Total</strong>,
            total: <strong>500</strong>,
            new: <strong>600</strong>,
            inactive: <strong>0</strong>,
            deleted: <strong>0</strong>
          }
        ]}
      />
    </>
  );
}
