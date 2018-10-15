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
            "type": "top-axis"
          },
          {
            "type": "combined",
            "uid": "XzUV-Yk0S520fLEBgCM-SA",
            "height": 30,
            "width": 1811,
            "contents": [
              {
                "name": "ChromosomeAxis",
                "created": "2017-07-17T14:16:45.346835Z",
                "server": "http://higlass.io/api/v1",
                "tilesetUid": "NyITQvZsS_mOFNlz5C2LJg",
                "uid": "UqbmiMzqRmu21UHxZ4nVnA",
                "type": "horizontal-chromosome-labels",
                "options": {
                  "showMousePosition": false,
                  "mousePositionColor": "#999999"
                },
                "width": 1811,
                "height": 30,
                "position": "top"
              }
            ],
            "position": "top",
            "options": {}
          },
          {
            "type": "combined",
            "uid": "B-8YI-7ART6hLvth3pl6EA",
            "height": 55,
            "width": 1811,
            "contents": [
              {
                "name": "Gene Annotations (hg38)",
                "created": "2017-07-14T15:27:46.989053Z",
                "server": "http://higlass.io/api/v1",
                "tilesetUid": "P0PLbQMwTYGy-5uPIQid7A",
                "uid": "IhMLwYPAQFS8Pc64KThWDg",
                "type": "horizontal-gene-annotations",
                "options": {
                  "labelColor": "black",
                  "labelPosition": "hidden",
                  "plusStrandColor": "blue",
                  "minusStrandColor": "red",
                  "trackBorderWidth": 0,
                  "trackBorderColor": "black",
                  "showMousePosition": false,
                  "mousePositionColor": "#999999",
                  "name": "GeneAnnotations(hg38)"
                },
                "width": 1811,
                "height": 55,
                "header": "1\t2\t3\t4\t5\t6\t7\t8\t9\t10\t11\t12\t13\t14",
                "position": "top"
              }
            ],
            "position": "top",
            "options": {}
          },
          {
            "type": "combined",
            "uid": "AhhvfB7vTrK210oytPcGcQ",
            "height": 178,
            "width": 1811,
            "contents": [
              {
                "name": "hg38.all.KL.bed.multires.mv5",
                "created": "2018-08-30T22:53:24.984599Z",
                "server": "http://explorer.altius.org/api/v1",
                "tilesetUid": "T6fMrq_zSNa4-ZoJGEMfaw",
                "uid": "e7d_4xXsR2SXdT1YddXz9g",
                "type": "horizontal-stacked-bar",
                "options": {
                  "labelPosition": "topLeft",
                  "labelColor": "black",
                  "labelTextOpacity": 0.4,
                  "valueScaling": "exponential",
                  "trackBorderWidth": 0,
                  "trackBorderColor": "black",
                  "backgroundColor": "white",
                  "barBorder": true,
                  "scaledHeight": false,
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
                    "#FFFFFF"
                  ],
                  "name": "hg38.all.KL.bed.multires.mv5"
                },
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
                "position": "top",
                "width": 1811,
                "height": 178
              }
            ],
            "position": "top",
            "options": {}
          },
          {
            "type": "combined",
            "uid": "UzVmW1iYSaSmUGlAeev9fw",
            "height": 168,
            "width": 1811,
            "contents": [],
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
        672747068.96925,
        672952406.8776586
      ],
      "initialYDomain": [
        672829087.5364432,
        672880450.359474
      ],
      "layout": {
        "w": 12,
        "h": 12,
        "x": 0,
        "y": 0,
        "i": "V4Zyes86TQOdh4j8UV7D_A",
        "moved": false,
        "static": false
      },
      "uid": "V4Zyes86TQOdh4j8UV7D_A",
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
    "locksByViewUid": {
      "V4Zyes86TQOdh4j8UV7D_A": "BurowhwMTmSbp9x-aS-xEg"
    },
    "locksDict": {
      "BurowhwMTmSbp9x-aS-xEg": {
        "V4Zyes86TQOdh4j8UV7D_A": [
          2923791782.255352,
          2923798379.8138356,
          91.75218915939331
        ],
        "uid": "BurowhwMTmSbp9x-aS-xEg"
      }
    }
  },
  "locationLocks": {
    "locksByViewUid": {
      "LiiO1Fs-T7W78gKfD7gvWQ": "bv148xQ5TIihjK8vta2ZyQ",
      "XM-B2LPcTlGS5EhixxpX6A": "bv148xQ5TIihjK8vta2ZyQ",
      "N0uHVmRERtWIarBP1GZXHA": "P-BMOkUVQtKPyvMtNnprZA",
      "V4Zyes86TQOdh4j8UV7D_A": "P-BMOkUVQtKPyvMtNnprZA"
    },
    "locksDict": {
      "bv148xQ5TIihjK8vta2ZyQ": {
        "N0uHVmRERtWIarBP1GZXHA": [
          2266356132.2537093,
          2266341124.2021,
          19.305949211120605
        ],
        "XM-B2LPcTlGS5EhixxpX6A": [
          672870206.853404,
          672903745.59448,
          90.8034143447876
        ],
        "LiiO1Fs-T7W78gKfD7gvWQ": [
          2266362674.127864,
          2266329759.8567386,
          14.535412788391113
        ],
        "uid": "bv148xQ5TIihjK8vta2ZyQ"
      },
      "P-BMOkUVQtKPyvMtNnprZA": {
        "N0uHVmRERtWIarBP1GZXHA": [
          2923791947.5,
          2923791961,
          10.65656566619873
        ],
        "V4Zyes86TQOdh4j8UV7D_A": [
          2923791782.255352,
          2923798379.8138356,
          91.75218915939331
        ],
        "uid": "P-BMOkUVQtKPyvMtNnprZA"
      }
    }
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
      hgc.instance().handleExportSVG();

      done();
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
