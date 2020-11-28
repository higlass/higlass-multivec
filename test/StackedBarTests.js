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

  it('Ensures that the selectRows option is correctly processed', (done) => {

    const [div, hgc] = mountHGComponentLocalTiles(null, null, viewConfSelectRows, 
      
      () => {
        const trackObj = getTrackObjectFromHGC(hgc.instance(), 'view-uid', 'track-uid');
        
        expect(trackObj.numCategories).to.be.eql(5);

        const matrix = trackObj.simpleUnFlatten(
          { tileData: { shape: [15, 1] } },
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
        )
        // selectRows: [[14, 1], [2, 3], [4, 5], [6, 7, 8, 9, 10, 11, 12, 13], [0]]
        expect(matrix).to.be.eql([[15, 5, 9, 76, 0]]);
        
        done();
      });
      
  });

});
