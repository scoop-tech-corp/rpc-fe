import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import ReactApexChart from 'react-apexcharts';

// project import
import useConfig from 'hooks/useConfig';
import PropTypes from 'prop-types';

// chart options
const columnChartOptions = {
  chart: {
    type: 'bar',
    height: 350
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      endingShape: 'rounded'
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
  },
  // yaxis: {
  //   title: {
  //     text: '$ (thousands)'
  //   }
  // },
  fill: {
    opacity: 1
  },
  // tooltip: {
  //   y: {
  //     formatter(val) {
  //       return `$ ${val} thousands`;
  //     }
  //   }
  // },
  legend: {
    show: true,
    fontFamily: `'Roboto', sans-serif`,
    position: 'bottom',
    offsetX: 10,
    offsetY: 10,
    labels: {
      useSeriesColors: false
    },
    markers: {
      width: 16,
      height: 16,
      radius: 5
    },
    itemMargin: {
      horizontal: 15,
      vertical: 8
    }
  },
  responsive: [
    {
      breakpoint: 600,
      options: {
        yaxis: {
          show: false
        }
      }
    }
  ]
};

// ==============================|| APEXCHART - COLUMN ||============================== //

const ApexColumnChart = (props) => {
  const { categoriesProps, seriesProps } = props;
  const theme = useTheme();
  const line = theme.palette.divider;
  const { mode } = useConfig();

  const [series, setSeries] = useState([
    {
      name: 'Net Profit',
      data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
    },
    {
      name: 'Revenue',
      data: [76, 85, 101, 98, 87, 105, 91, 114, 94]
    }
  ]);

  const [options, setOptions] = useState(columnChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [],
      xaxis: { categories: categoriesProps || prevState.xaxis.categories },
      grid: { borderColor: line },
      tooltip: { theme: mode === 'dark' ? 'dark' : 'light' }
    }));
  }, [mode, line, categoriesProps]);

  useEffect(() => {
    setSeries((prevState) => seriesProps || prevState);
  }, [seriesProps]);

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

ApexColumnChart.propTypes = {
  categoriesProps: PropTypes.array, // PropTypes.arrayOf(PropTypes.string)
  seriesProps: PropTypes.array
};

export default ApexColumnChart;
