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
			viewConf,

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

const viewConf = {
   "editable":true,
   "zoomFixed":false,
   "trackSourceServers":[
      "//higlass.io/api/v1"
   ],
   "exportViewUrl":"/api/v1/viewconfs",
   "views":[
      {
         "tracks":{
            "top":[
               {
                  "type":"top-axis",
                  "local":true,
                  "orientation":"1d-horizontal",
                  "name":"Top Axis",
                  "thumbnail":{

                  },
                  "defaultOptions":{

                  },
                  "uid":"Ou8AWfgjTS24c6ls5LcR0w",
                  "options":{

                  },
                  "width":20,
                  "height":20,
                  "position":"top"
               },
               {
                  "type":"combined",
                  "uid":"XzUV-Yk0S520fLEBgCM-SA",
                  "height":30,
                  "width":1711,
                  "contents":[
                     {
                        "name":"ChromosomeAxis",
                        "created":"2017-07-17T14:16:45.346835Z",
                        "server":"http://higlass.io/api/v1",
                        "tilesetUid":"NyITQvZsS_mOFNlz5C2LJg",
                        "uid":"UqbmiMzqRmu21UHxZ4nVnA",
                        "type":"horizontal-chromosome-labels",
                        "options":{
                           "showMousePosition":false,
                           "mousePositionColor":"#999999"
                        },
                        "width":1711,
                        "height":30,
                        "position":"top"
                     }
                  ],
                  "position":"top",
                  "options":{

                  }
               },
               {
                  "type":"combined",
                  "uid":"B-8YI-7ART6hLvth3pl6EA",
                  "height":55,
                  "width":1711,
                  "contents":[
                     {
                        "name":"Gene Annotations (hg38)",
                        "created":"2017-07-14T15:27:46.989053Z",
                        "server":"http://higlass.io/api/v1",
                        "tilesetUid":"P0PLbQMwTYGy-5uPIQid7A",
                        "uid":"IhMLwYPAQFS8Pc64KThWDg",
                        "type":"horizontal-gene-annotations",
                        "options":{
                           "labelColor":"black",
                           "labelPosition":"hidden",
                           "plusStrandColor":"blue",
                           "minusStrandColor":"red",
                           "trackBorderWidth":0,
                           "trackBorderColor":"black",
                           "showMousePosition":false,
                           "mousePositionColor":"#999999",
                           "name":"GeneAnnotations(hg38)"
                        },
                        "width":1711,
                        "height":55,
                        "header":"1\t2\t3\t4\t5\t6\t7\t8\t9\t10\t11\t12\t13\t14",
                        "position":"top"
                     }
                  ],
                  "position":"top",
                  "options":{

                  }
               },
               {
                  "type":"combined",
                  "uid":"AhhvfB7vTrK210oytPcGcQ",
                  "height":178,
                  "width":1711,
                  "contents":[
                     {
                        "name":"hg38.all.KL.bed.multires.mv5",
                        "created":"2018-08-30T22:53:24.984599Z",
                        "server":"http://explore.altius.org/api/v1",
                        "tilesetUid":"T6fMrq_zSNa4-ZoJGEMfaw",
                        "uid":"e7d_4xXsR2SXdT1YddXz9g",
                        "type":"horizontal-stacked-bar",
                        "options":{
                           "labelPosition":"topLeft",
                           "labelColor":"black",
                           "labelTextOpacity":0.4,
                           "valueScaling":"exponential",
                           "trackBorderWidth":0,
                           "trackBorderColor":"black",
                           "backgroundColor":"white",
                           "barBorder":true,
                           "scaledHeight":false,
                           "sortLargestOnTop":true,
                           "colorScale":[
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
                           "name":"hg38.all.KL.bed.multires.mv5"
                        },
                        "resolutions":[
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
                        "position":"top",
                        "width":1711,
                        "height":178
                     }
                  ],
                  "position":"top",
                  "options":{

                  }
               }
            ],
            "left":[

            ],
            "center":[

            ],
            "right":[

            ],
            "bottom":[

            ],
            "whole":[

            ],
            "gallery":[

            ]
         },
         "initialXDomain":[
            2923741823.1925197,
            2923841741.318184
         ],
         "initialYDomain":[
            2923771110.316968,
            2923825649.3107076
         ],
         "layout":{
            "w":12,
            "h":12,
            "x":0,
            "y":0,
            "i":"V4Zyes86TQOdh4j8UV7D_A",
            "moved":false,
            "static":false
         },
         "uid":"V4Zyes86TQOdh4j8UV7D_A",
         "genomePositionSearchBoxVisible":true,
         "genomePositionSearchBox":{
            "autocompleteServer":"//higlass.io/api/v1",
            "chromInfoServer":"http://higlass.io/api/v1",
            "visible":true,
            "chromInfoId":"hg38",
            "autocompleteId":"P0PLbQMwTYGy-5uPIQid7A"
         }
      }
   ],
   "zoomLocks":{
      "locksByViewUid":{

      },
      "locksDict":{

      }
   },
   "locationLocks":{
      "locksByViewUid":{

      },
      "locksDict":{

      }
   },
   "valueScaleLocks":{
      "locksByViewUid":{

      },
      "locksDict":{

      }
   }
}