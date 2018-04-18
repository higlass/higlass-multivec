import register from 'higlass-register';

import StackedBarTrack from './scripts/StackedBarTrack';
import BasicMultipleLineChart from './scripts/BasicMultipleLineChart';
import BasicMultipleBarChart from './scripts/BasicMultipleBarChart';

register({
  name: 'StackedBarTrack',
  track: StackedBarTrack,
  config: StackedBarTrack.config,
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