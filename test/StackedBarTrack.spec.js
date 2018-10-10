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


const viewconf = 
{
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
const viewconfAlex1 = 
{
  "editable": true,
  "zoomFixed": false,
  "trackSourceServers": [
    "http://explorer.altius.org/api/v1",
    "http://higlass.io/api/v1"
  ],
  "exportViewUrl": "http://explorer.altius.org/api/v1/viewconfs/",
  "views": [
    {
      "tracks": {
        "top": [
          {
            "type": "combined",
            "uid": "aa",
            "height": 168,
            "width": 770,
            "contents": [
              {
                "name": "locus_reg_comp_maj_dist10000.bedGraph.binned.mtx.qcat.multires.mv5",
                "created": "2018-08-30T23:23:44.875875Z",
                "server": "http://explorer.altius.org/api/v1",
                "tilesetUid": "Flm-wUf_QgKLkeZ5GqlTXQ",
                "uid": "PoEMRREZQrSJ3Ps2QnixUw",
                "type": "horizontal-stacked-bar",
                "options": {
                  "labelPosition": "topLeft",
                  "labelColor": "black",
                  "labelTextOpacity": 0.4,
                  "valueScaling": "linear",
                  "trackBorderWidth": 0,
                  "trackBorderColor": "black",
                  "backgroundColor": "white",
                  "barBorder": true,
                  "scaledHeight": false,
                  "sortLargestOnTop": true,
                  "colorScale": [
                    "#C3C3C3",
                    "#BB2DD4",
                    "#05C1D9",
                    "#7A00FF",
                    "#FE8102",
                    "#4A6876",
                    "#FFE500",
                    "#0467FD",
                    "#07AF00",
                    "#692108",
                    "#B9461D",
                    "#4C7D14",
                    "#009588",
                    "#414613",
                    "#FF0000",
                    "#08245B"
                  ],
                  "name": "locus_reg_comp_maj_dist10000.bedGraph.binned.mtx.qcat.multires.mv5"
                },
                "width": 770,
                "height": 168,
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
                ],
                "position": "top"
              },
              {
                "uid": "Yc90UhFDTDeFWMc_Oe4O0g",
                "type": "viewport-projection-horizontal",
                "fromViewUid": "N0uHVmRERtWIarBP1GZXHA",
                "options": {
                  "projectionFillColor": "#777",
                  "projectionStrokeColor": "#777",
                  "projectionFillOpacity": 0.3,
                  "projectionStrokeOpacity": 0.7,
                  "strokeWidth": 1
                },
                "name": "ViewportProjection",
                "position": "top",
                "width": 770,
                "height": 168
              }
            ],
            "position": "top",
            "options": {}
          }
        ],
        "left": [],
        "center": [],
        "right": [],
        "bottom": [],
        "whole": [],
        "gallery": []
      },
      "initialXDomain": [
        2917504168.8394694,
        2917516595.0753956
      ],
      "initialYDomain": [
        2924149066.47558,
        2924149389.234955
      ],
      "layout": {
        "w": 12,
        "h": 6,
        "x": 0,
        "y": 0,
        "i": "V4Zyes86TQOdh4j8UV7D_A",
        "moved": false,
        "static": false
      },
      "uid": "aa",
      "genomePositionSearchBoxVisible": true,
      "genomePositionSearchBox": {
        "autocompleteServer": "http://higlass.io/api/v1",
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
}

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
        viewConfig={viewconfAlex1}
      />, { attachTo: div });

      hgc.update();
      console.log('waitForTilesLoaded:', waitForTilesLoaded);

      waitForTilesLoaded(hgc.instance(), done);
      // done();
    });

    it ("Exports to SVG", (done) => {
      //hgc.instance().handleExportSVG();

      done();
    })

    it ("Zooms to another location", (done) => {
      hgc.instance().zoomTo('aa', 0, 2400000, 0, 2500000)

      setTimeout(() => {
        hgc.instance().handleExportSVG();
      }, 1000)
    })
  });
  return;

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
    return;

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
