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


const viewconf = {
  "editable": true,
  "zoomFixed": false,
  "trackSourceServers": [
    "//higlass.io/api/v1"
  ],
  "exportViewUrl": "/api/v1/viewconfs",
  "views": [
    {
      "initialXDomain": [
        2708582463.087155,
        2708584448.338146
      ],
      "initialYDomain": [
        1768071816.405876,
        1768071785.4668996
      ],
      "tracks": {
        "top": [
          {
            "type": "horizontal-stacked-bar",
            "tilesetUid": "GIoMpzT4RlOQZ2_7m394Uw",
            "server": "http://resgen.io/api/v1",
            "height": 200,
            "width": 470,
            "options": {
              "labelPosition": "topLeft",
              "labelColor": "black",
              "labelTextOpacity": 0.4,
              "valueScaling": "exponential",
              "trackBorderWidth": 0,
              "trackBorderColor": "black",
              "heatmapValueScaling": "log",
              "name": "all.KL.bed.multires.mv5",
              "scaledHeight": false,
              "backgroundColor": "black",
              "sortLargestOnTop": true,
              "colorScale": [
                "#FF0000",
                "#FF4500",
                "#32CD32",
                "#008000",
                "#006400",
                "#C2E105",
                "#FFFF00",
                "#66CDAA",
                "#8A91D0",
                "#CD5C5C",
                "#E9967A",
                "#BDB76B",
                "#808080",
                "#C0C0C0",
                "#075eea"
              ],
              "barBorder": true
            },
            "position": "top",
            "uid": "Wf5wXtmISKiszukAdGuCsw",
            "name": "Epilogos (hg19)",
            "resolutions": [
              13107200,
              6553600,
              3276800,
              1638400,
              819200,
              409600,
              204800,
              102400,
              51200,
              25600,
              12800,
              6400,
              3200,
              1600,
              800,
              400,
              200
            ]
          }
        ],
        "left": [],
        "center": [],
        "bottom": [],
        "right": [],
        "whole": [],
        "gallery": []
      },
      "layout": {
        "w": 12,
        "h": 6,
        "x": 0,
        "y": 0,
        "i": "MiApsjfbQTeRT02rLYDFYQ",
        "moved": false,
        "static": false
      },
      "uid": "aa",
      "genomePositionSearchBoxVisible": true,
      "genomePositionSearchBox": {
        "autocompleteServer": "//higlass.io/api/v1",
        "chromInfoServer": "http://higlass.io/api/v1",
        "visible": true,
        "chromInfoId": "hg38",
        "autocompleteId": "P0PLbQMwTYGy-5uPIQid7A"
      }
    }
  ],
  "zoomLocks": {
    "locksByViewUid": {},
    "locksDict": {}
  },
  "locationLocks": {
    "locksByViewUid": {},
    "locksDict": {}
  },
  "valueScaleLocks": {
    "locksByViewUid": {},
    "locksDict": {}
  }
};

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

      div.setAttribute('style', 'width:800px;background-color: lightgreen');
      div.setAttribute('id', 'simple-hg-component');

      hgc = mount(<HiGlassComponent
        options={{ bounded: false }}
        viewConfig={viewconf}
      />, { attachTo: div });

      hgc.update();
      console.log('waitForTilesLoaded:', waitForTilesLoaded);

      waitForTilesLoaded(hgc.instance(), done);
      // done();
    });

    it('Exports a zoomed in SVG and then zooms out', (done) => {
      // hgc.instance().handleExportSVG();
      hgc.instance().api.on('location', (data) => {
        console.log('location:', data);
      });
      const svgText = hgc.instance().api.exportAsSvg();
      const rectHeightIndex = svgText.indexOf('87.1567759');
      expect(rectHeightIndex).to.be.above(0);

      hgc.instance().api.zoomTo('aa', 
        2708563090.788466, 
        2708609338.8635907, 
        1768077217.7076137, 
        1768076496.9583907);

      console.log('test1');
      waitForTilesLoaded(hgc.instance(), done);
    });

    it ('Exports to SVG again', (done) => {
      console.log('test2');
      // hgc.instance().handleExportSVG();
      const svgText = hgc.instance().api.exportAsSvg();
      const rectHeightIndex = svgText.indexOf('87.1567759');

      console.log('rectHeightIndex:', rectHeightIndex);
      expect(rectHeightIndex).to.be.below(0);

      // make sure the background is black
      expect(svgText.indexOf('black')).to.be.above(0);

      done();
    })

  });
});
