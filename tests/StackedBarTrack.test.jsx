import React from 'react';

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
        -2.7939677238464355e-8,
        3100000000.0000005
      ],
      "initialYDomain": [
        1091458333.3333333,
        2008541666.6666665
      ],
      "tracks": {
        "top": [
          {
            "type": "horizontal-stacked-bar",
            "tilesetUid": "GIoMpzT4RlOQZ2_7m394Uw",
            "server": "https://resgen.io/api/v1",
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
            "uid": "Wf5wXtmISKiszukAdGuCsw"
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

const viewconfAlex1 = {
  "editable": true,
  "trackSourceServers": [
    "/api/v1",
    "http://higlass.io/api/v1"
  ],
  "exportViewUrl": "/api/v1/viewconfs",
  "views": [
    {
      "initialXDomain": [
        2824311717.9023447,
        2824664838.5004044
      ],
      "initialYDomain": [
        2824347231.9369316,
        2824475349.0584393
      ],
      "tracks": {
        "top": [
          {
            "type": "horizontal-chromosome-labels",
            "uid": "dWalpGmvQUW4YacLw1tYWQ",
            "tilesetUid": "ADfY_RtsQR6oKOMyrq6qhw",
            "server": "https://resgen.io/api/v1",
            "options": {
              "showMousePosition": false,
              "mousePositionColor": "#999999",
              "color": "#808080",
              "stroke": "#ffffff",
              "fontSize": 12,
              "fontIsLeftAligned": false,
              "reverseOrientation": false
            },
            "width": 20,
            "height": 30
          },
          {
            "type": "horizontal-stacked-bar",
            "uid": "NFWUa6VzRF2-vsoTNmfmfQ",
            "tilesetUid": "GIoMpzT4RlOQZ2_7m394Uw",
            "server": "https://resgen.io/api/v1",
            "options": {
              "labelPosition": "topLeft",
              "labelColor": "black",
              "labelTextOpacity": 0.4,
              "valueScaling": "exponential",
              "trackBorderWidth": 0,
              "trackBorderColor": "black",
              "backgroundColor": "white",
              "barBorder": true,
              "scaledHeight": true,
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
              "name": "all.KL.bed.multires.mv5",
              "selectRows": null
            },
            "width": 624,
            "height": 162
          },
          {
            "type": "horizontal-gene-annotations",
            "uid": "Cj3Owt-AT7WS5fXaSdpZvQ",
            "tilesetUid": "NCifnbrKQu6j-ohVWJLoJw",
            "server": "https://resgen.io/api/v1",
            "options": {
              "labelColor": "black",
              "labelPosition": "hidden",
              "plusStrandColor": "blue",
              "minusStrandColor": "red",
              "trackBorderWidth": 0,
              "trackBorderColor": "black",
              "showMousePosition": false,
              "name": "gene-annotations-hg19.db",
              "fontSize": 10,
              "labelBackgroundColor": "#ffffff",
              "labelLeftMargin": 0,
              "labelRightMargin": 0,
              "labelTopMargin": 0,
              "labelBottomMargin": 0,
              "minHeight": 24,
              "mousePositionColor": "#000000",
              "geneAnnotationHeight": 16,
              "geneLabelPosition": "outside",
              "geneStrandSpacing": 4
            },
            "width": 624,
            "height": 55
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
        "h": 12,
        "x": 0,
        "y": 0,
        "moved": false,
        "static": false
      },
      "uid": "aa"
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

  describe('', () => {
    it('Cleans up previously created instances and mounts a new component', async () => {
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

      await new Promise(resolve => waitForTilesLoaded(hgc.instance(), resolve));
    });

    it ("Exports to SVG", async () => {
      // console.log('exporting svg-----------------------------');
      hgc.instance().handleExportSVG();

      await new Promise(resolve => {
        setTimeout(() => {
          hgc.instance().zoomTo('aa', 672764000, 672778000, 672764000, 672778000);
          hgc.instance().handleExportSVG();

          const trackObject = getTrackObjectFromHGC(hgc.instance(), 'aa', 'xx');
          const maxAndMin = trackObject.maxAndMin;

          expect(maxAndMin.min).to.be.above(0);
          resolve();
        }, 500);
      });
    })
  });

  describe('', () => {
    it('Cleans up previously created instances and mounts a new component', async () => {
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

      await new Promise(resolve => waitForTilesLoaded(hgc.instance(), resolve));
    });

    // it('Exports a zoomed in SVG and then zooms out', async () => {
    //   // hgc.instance().handleExportSVG();
    //   hgc.instance().api.on('location', (data) => {
    //     // console.log('location:', data);
    //   });
    //   const svgText = hgc.instance().api.exportAsSvg();
    //   const rectHeightIndex = svgText.indexOf('87.1567759');
    //   expect(rectHeightIndex).to.be.above(0);

    //   hgc.instance().api.zoomTo('aa', 
    //     2708563090.788466, 
    //     2708609338.8635907, 
    //     1768077217.7076137, 
    //     1768076496.9583907);

    //   await new Promise(resolve => waitForTilesLoaded(hgc.instance(), resolve));
    // });

    it ('Exports to SVG again', async () => {
      // hgc.instance().handleExportSVG();
      const svgText = hgc.instance().api.exportAsSvg();
      const rectHeightIndex = svgText.indexOf('87.1567759');

      expect(rectHeightIndex).to.be.below(0);

      // make sure the background is black
      expect(svgText.indexOf('black')).to.be.above(0);
    })

  });
});
