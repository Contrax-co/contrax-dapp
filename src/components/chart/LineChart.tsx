import React from 'react';
import { Chart } from 'react-google-charts';
import * as colors from '../../theme/colors';

const chartOptions = {
  title: '',
  legend: { position: 'none' },
  hAxis: { textPosition: 'none' },
  tooltip: {
    showColorCode: true,
  },
  chartArea: {
    left: 0,
    top: 0,
    width: '100%',
    height: '80%',
  },
  fontName: 'Roboto',
  colors: [colors.primary],
};

export default function LineChart(props: any) {
  const { chartData } = props;
  return (
    <div className="App">
      <Chart
        chartType="Line"
        width="100%"
        height="400px"
        data={chartData}
        options={chartOptions}
      />
    </div>
  );
}
