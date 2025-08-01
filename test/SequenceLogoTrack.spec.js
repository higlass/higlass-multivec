import { expect } from 'chai';
import register from 'higlass-register';
import { HiGlassComponent, getTrackObjectFromHGC } from 'higlass';
import { SequenceLogoTrack } from '../src';

import { mountHGComponentLocalTiles, removeHGComponent } from './test-helpers';

register({
  name: 'SequenceLogoTrack',
  track: SequenceLogoTrack,
  config: SequenceLogoTrack.config,
});

const viewconf = {
  editable: false,
  views: [{
    uid: "view.1",
    tracks: {
      uid: "track.1",
      top: [{
        type: 'sequence-logo',
        data: {
          type: 'local-tiles',
          tilesetInfo: {
            x: {
              "DGUAgCGqTDOLrgJGrwEsCg": {
                  "resolutions": [
                      512,
                      256,
                      128,
                      64,
                      32,
                      16,
                      8,
                      4,
                      2,
                      1
                  ],
                  "min_pos": [
                      0
                  ],
                  "max_pos": [
                      10000
                  ],
                  "tile_size": 32,
                  "shape": [
                      32,
                      5
                  ],
                  "row_infos": [
                      "A",
                      "C",
                      "G",
                      "T",
                      "N"
                  ],
                  "datatype": "multivec",
                  "name": "blah.multires.h5 (32 resolution)",
                  "coordSystem": ""
              }
            },
          },
          tiles: {
            'x.0.0': [
              {
                "DGUAgCGqTDOLrgJGrwEsCg.9.0": {
                    "dense": "4jsrOtU3qzmNKjUnAjgCOjA7fzuSIHoyWzNlN0A06TspM20trzNzNG40jDRDOBw5Sjh7NIMwoTl7ODE3gzlkOdM6LDTLO9I6GTttKhg1hy1/NuU5yTWlObI7CznXOvQ0jzAXOgs37jkTObM5ETgdOeAwhDFhOyE0cjfFMEg1LzRrN8s4XDZXOVAsyTldOEg4jCRvMGM7AzjsOvs66jnAO08w+jpuOLY6djguM0s3nzN+OrszyznTLLE0yDhfMjI55TnXM0Y4MjmqKfktqDlFODQtBTG/OG46CjqtNLo5jzsJOYc29TCdMjsmBzkfNbU2kDijOac6ojVyNFowWjnLNF43kTkYOp43FzajOw8msDgQMOQ3nTGdOhYzLzspNOA5CjmTOBoz1jXELcQ5JCm0Oj04hThSNMc7wzS7NeQ5zzc=",
                    "dtype": "float16",
                    "shape": [
                        5,
                        32
                    ]
                }
            }
            ],
          },
        },
        options: {
          colorScheme: 'nucleotide'
        },
        height: 100,
        width: 400
      }]
    }
  }]
};

describe('SequenceLogoTrack', () => {
  let hgc = null;
  let div = null;

  describe('Basic functionality', () => {
    beforeAll((done) => {
      [div, hgc] = mountHGComponentLocalTiles(div, hgc, viewconf, done);
    });

    afterAll(() => {
      removeHGComponent(div);
    });

    it('should create track instance', () => {
      expect(hgc).to.not.be.null;
      if (hgc && hgc.instance()) {
        const trackObj = getTrackObjectFromHGC(hgc.instance(), 'view.1', 'track.1');
        expect(trackObj).to.not.be.null;
        expect(trackObj.constructor.name).to.equal('SequenceLogoTrackClass');
      }
    });

    it('should initialize with correct color schemes', () => {
      if (hgc && hgc.instance()) {
        const trackObj = getTrackObjectFromHGC(hgc.instance(), 'view.1', 'track.1');
        
        expect(trackObj.nucleotideColors).to.deep.equal({
          'A': '#FF0000',
          'T': '#0000FF',
          'G': '#FFA500',
          'C': '#008000',
          'U': '#0000FF'
        });
        
        expect(trackObj.proteinColors).to.have.property('A', '#CCFF00');
        expect(trackObj.proteinColors).to.have.property('F', '#0000FF');
        expect(trackObj.proteinColors).to.have.property('D', '#FF6600');
      }
    });

    it('should use nucleotide colors by default', () => {
      if (hgc && hgc.instance()) {
        const trackObj = getTrackObjectFromHGC(hgc.instance(), 'view.1', 'track.1');
        expect(trackObj.options.colorScheme).to.equal('nucleotide');
      }
    });
  });

  describe('Color scheme switching', () => {
    beforeAll((done) => {
      const newViewconf = JSON.parse(JSON.stringify(viewconf))
      newViewconf.views[0].tracks.top[0].options.colorScheme = 'protein';

      [div, hgc] = mountHGComponentLocalTiles(div, hgc, newViewconf, done);
    });

    afterAll(() => {
      removeHGComponent(div);
    });

    it('should use protein colors when specified', () => {
      if (hgc && hgc.instance()) {
        const trackObj = getTrackObjectFromHGC(hgc.instance(), 'view.1', 'track.1');
        expect(trackObj.options.colorScheme).to.equal('protein');
      }
    });
  });

  describe('Track configuration', () => {
    it('should have correct track type', () => {
      expect(SequenceLogoTrack.config.type).to.equal('sequence-logo');
    });

    it('should support multivec datatype', () => {
      expect(SequenceLogoTrack.config.datatype).to.include('multivec');
    });

    it('should include colorScheme in available options', () => {
      expect(SequenceLogoTrack.config.availableOptions).to.include('colorScheme');
    });

    it('should have nucleotide as default color scheme', () => {
      expect(SequenceLogoTrack.config.defaultOptions.colorScheme).to.equal('nucleotide');
    });
  });
});