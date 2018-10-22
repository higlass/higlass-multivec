import {
  configure,
  mount,
  // render,
  ReactWrapper,
} from 'enzyme';

import {
  HiGlassComponent,
  waitForTilesLoaded
} from 'higlass';

import { expect } from 'chai';
import register from 'higlass-register';

import StackedBarTrack from '../src/scripts/StackedBarTrack';
import ScaledStackedBarTrack from '../src/scripts/ScaledStackedBarTrack';
import BasicMultipleLineChart from '../src/scripts/BasicMultipleLineChart';
import BasicMultipleBarChart from '../src/scripts/BasicMultipleBarChart';

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


export const getTrackObjectFromHGC = (hgc, viewUid, trackUid) => hgc
  .tiledPlots[viewUid].trackRenderer.getTrackObject(trackUid);

const viewconf = 'http://higlass.io/app/?config=UwLhj4bWTVKwzz5T02UiqQ';
const viewconfAlex1 = 'http://higlass.io/app/?config=Nj5K4ZxxRfOqCfbKg7SdiQ';

import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

describe('Test HiGlass Component', () => {
  let hgc = null;
  let div = null;

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 7000;
  describe('', () => {
    it('Cleans up previously created instances and mounts a new component', (done) => {
      if (hgc) {
        hgc.unmount();
        hgc.detach();
      }

      if (div) {
        global.document.body.removeChild(div);
      }

      div = global.document.createElement('div');
      global.document.body.appendChild(div);

      div.setAttribute('style', 'width:800px; height:800px; background-color: lightgreen');
      div.setAttribute('id', 'simple-hg-component');

      hgc = mount(<HiGlassComponent
        options={{ bounded: false }}
        viewConfig={viewconfAlex1}
      />, { attachTo: div });

      hgc.update();
      console.log('hgc:', hgc.instance());

      waitForTilesLoaded(hgc.instance(), done);
      // done();
    });

    it ("Exports to SVG", (done) => {
      // console.log('exporting svg-----------------------------');
      hgc.instance().handleExportSVG();

      setTimeout(() => {
        hgc.instance().zoomTo('aa', 672764000, 672778000, 672764000, 672778000);
        hgc.instance().handleExportSVG();

        const trackObject = getTrackObjectFromHGC(hgc.instance(), 'aa', 'xx');
        const maxAndMin = trackObject.maxAndMin;

        expect(maxAndMin.min).to.be.above(0);
        done();
      }, 500);
    })
  });

  describe('', () => {
    it('Cleans up previously created instances and mounts a new component', (done) => {
      if (hgc) {
        hgc.unmount();
        hgc.detach();
      }

      if (div) {
        global.document.body.removeChild(div);
      }

      div = global.document.createElement('div');
      global.document.body.appendChild(div);

      div.setAttribute('style', 'width:800px;background-color: lightgreen');
      div.setAttribute('id', 'simple-hg-component');

      hgc = mount(<HiGlassComponent
        options={{ bounded: false }}
        viewConfig={viewconf}
      />, { attachTo: div });

      hgc.update();

      waitForTilesLoaded(hgc.instance(), done);
      // done();
    });

    it('Exports a zoomed in SVG and then zooms out', (done) => {
      // hgc.instance().handleExportSVG();
      hgc.instance().api.on('location', (data) => {
        // console.log('location:', data);
      });
      const svgText = hgc.instance().api.exportAsSvg();
      const rectHeightIndex = svgText.indexOf('87.1567759');
      expect(rectHeightIndex).to.be.above(0);

      hgc.instance().api.zoomTo('aa', 
        2708563090.788466, 
        2708609338.8635907, 
        1768077217.7076137, 
        1768076496.9583907);

      waitForTilesLoaded(hgc.instance(), done);
    });

    it ('Exports to SVG again', (done) => {
      // hgc.instance().handleExportSVG();
      const svgText = hgc.instance().api.exportAsSvg();
      const rectHeightIndex = svgText.indexOf('87.1567759');

      expect(rectHeightIndex).to.be.below(0);

      // make sure the background is black
      expect(svgText.indexOf('black')).to.be.above(0);

      done();
    })

  });
});
