import { expect } from 'chai';
import register from 'higlass-register';

import {
  HiGlassComponent,
  waitForTilesLoaded,
  waitForTransitionsFinished,
  getTrackObjectFromHGC,
} from 'higlass';

import {
  mountHGComponent
} from './test-helpers'

import StackedBarTrack from '../src/scripts/StackedBarTrack';


register({
  name: 'StackedBarTrack',
  track: StackedBarTrack,
  config: StackedBarTrack.config,
});

describe('SVG export', () => {
	it ('exports SVG, moves to another location and then exports again', (done) => {
		const [div, hgc] = mountHGComponent(null, 
			null,
			'http://higlass.io/api/v1/viewconfs/?d=CnDAdbfQSfO9c5qR4SHpCA',

        () => {
          console.log('views:', hgc.instance().state.views);
          hgc.instance().handleExportSVG();

          hgc.instance().zoomTo('V4Zyes86TQOdh4j8UV7D_A',
            2923895000,
            2923900000)

          waitForTransitionsFinished(hgc.instance(), () => {
            waitForTilesLoaded(hgc.instance(), () => {
              console.log('transitions complete');

              // this test was intended to show that the
              // mouseover handler still works after zooming
              // and exporting SVG

              hgc.instance().handleExportSVG();
            })
          })
        	done();
        });

		//document.body.removeChild(div);
		//done();
	})
});