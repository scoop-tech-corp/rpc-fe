import { useEffect, useState } from 'react';

// material-ui
// import { useTheme } from '@mui/material/styles';

// third-party
import ReactApexChart from 'react-apexcharts';

// project import
// import useConfig from 'hooks/useConfig';
import PropTypes from 'prop-types';

// ==============================|| APEXCHART - PIE ||============================== //

const ApexPieChart = ({ labelsProps = null, seriesProps = null, height = 'auto' }) => {
  const [series, setSeries] = useState([44, 55, 13, 43, 22]);
  const [options, setOptions] = useState({
    chart: {
      type: 'pie',
      width: 450,
      height: 450
    },
    labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
    legend: {
      show: true,
      offsetX: 10,
      offsetY: 10,
      markers: {
        width: 12,
        height: 12,
        radius: 5
      },
      itemMargin: {
        horizontal: 25,
        vertical: 4
      }
    },
    responsive: [
      {
        breakpoint: 450,
        chart: {
          width: 280,
          height: 280
        },
        options: {
          legend: {
            show: false,
            position: 'bottom'
          }
        }
      }
    ]
  });

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      labels: labelsProps || prevState.labels
    }));
  }, [labelsProps]);

  useEffect(() => {
    setSeries((prevState) => seriesProps || prevState);
  }, [seriesProps]);

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="donut" height={height} />
    </div>
  );
};

ApexPieChart.propTypes = {
  labelsProps: PropTypes.arrayOf(PropTypes.string),
  seriesProps: PropTypes.arrayOf(PropTypes.number)
};

export default ApexPieChart;
