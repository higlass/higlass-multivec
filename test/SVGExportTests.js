import {
  configure,
  // render,
} from 'enzyme';

import Adapter from 'enzyme-adapter-react-16';


configure({ adapter: new Adapter() });

import { expect } from 'chai';
import register from 'higlass-register';

import {
  HiGlassComponent,
  waitForTilesLoaded,
  mountHGComponent,
  getTrackObjectFromHGC,
} from 'higlass';

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
			'http://higlass.io/api/v1/viewconfs/?d=Y7FtjugjR6OIV_P2DRqCSg',
        () => {

        	done();
        });

		//document.body.removeChild(div);
		//done();
	})
});