import register from 'higlass-register';

import { StackedBarTrack, ScaledStackedBarTrack, BasicMultipleLineChart, BasicMultipleBarChart } from './scripts';

register({
  name: 'StackedBarTrack',
  track: StackedBarTrack,
  config: StackedBarTrack.config,
});

register({
  name: 'ScaledStackedBarTrack',
  track: ScaledStackedBarTrack,
  config: ScaledStackedBarTrack.config,
});

register({
  name: 'BasicMultipleLineChart',
  track: BasicMultipleLineChart,
  config: BasicMultipleLineChart.config,
});

register({
  name: 'BasicMultipleBarChart',
  track: BasicMultipleBarChart,
  config: BasicMultipleBarChart.config,
});

export { StackedBarTrack, ScaledStackedBarTrack, BasicMultipleLineChart, BasicMultipleBarChart };