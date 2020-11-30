import { expect } from 'chai';
import register from 'higlass-register';

import {
  HiGlassComponent,
  waitForTilesLoaded,
  waitForTransitionsFinished,
  getTrackObjectFromHGC,
  removeHGComponent
} from 'higlass';

import {
  mountHGComponentLocalTiles
} from './test-helpers'

import StackedBarTrack from '../src/scripts/StackedBarTrack';

import viewConf from './view-configs/states-data';
import viewConfSelectRows from './view-configs/select-rows';


register({
  name: 'StackedBarTrack',
  track: StackedBarTrack,
  config: StackedBarTrack.config,
});

describe('Check bar track with states data', () => {

  it('Ensures that the bar height is correct', (done) => {

    const [div, hgc] = mountHGComponentLocalTiles(null, null, viewConf, 
      
      () => {
        const trackObj = getTrackObjectFromHGC(
          hgc.instance(),'aa','t1'
          );

        expect(trackObj.maxAndMin.max).to.be.eql(4);
        expect(trackObj.maxAndMin.min).to.be.eql(0);

        done();
      });
      
  });
});

describe('Ensure that selectRows options are correctly processed', () => {
  it('Default option (no filtering/aggregation)', (done) => {
    const [div, hgc] = mountHGComponentLocalTiles(null, null, viewConf, () => {

      const trackObj = getTrackObjectFromHGC(hgc.instance(), 'aa', 't1');

      expect(trackObj.numCategories).to.be.eql(2);
      
      const matrix = trackObj.simpleUnFlatten(
        { tileData: { shape: [2, 1] } },
        [10, 11] // data
      );
      expect(matrix).to.be.eql([[10, 11]]); // use the data as it is

      done();
    }); 
  });
  it('Aggregate all values', (done) => {
    const [div, hgc] = mountHGComponentLocalTiles(null, null, viewConfSelectRows, () => {  
      // selectRows: [[0, 1]]

      const trackObj = getTrackObjectFromHGC(hgc.instance(), 'selectrows-view-uid', 'selectrows-track-uid');

      expect(trackObj.numCategories).to.be.eql(1);
      
      const matrix = trackObj.simpleUnFlatten(
        { tileData: { shape: [2, 1] } },
        [10, 11] // data
      );
      expect(matrix).to.be.eql([[21]]); // two values are aggregated

      done();
    }); 
  });
});
