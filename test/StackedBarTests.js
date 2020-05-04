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
  mountHGComponent
} from './test-helpers'

import StackedBarTrack from '../src/scripts/StackedBarTrack';

import viewConf from './view-configs/states-data';


register({
  name: 'StackedBarTrack',
  track: StackedBarTrack,
  config: StackedBarTrack.config,
});

describe('Check bar track with states data', () => {

  it('Ensures that the bar height is correct', (done) => {

    const [div, hgc] = mountHGComponent(null, null, viewConf, 
      
      () => {
        const trackObj = getTrackObjectFromHGC(
          hgc.instance(),'aa','t1'
          );
    
        waitForTilesLoaded(hgc.instance(), () => {
          expect(trackObj.maxAndMin.max).to.be.eql(8);
          expect(trackObj.maxAndMin.min).to.be.eql(0);
        });
        done();
      });
      
  });

});
