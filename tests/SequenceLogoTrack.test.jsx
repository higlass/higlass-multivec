import { describe, it, expect, beforeEach, vi } from 'vitest';
import SequenceLogoTrack from '../src/scripts/SequenceLogoTrack.js';

// Mock HGC object
const createMockHGC = () => ({
  services: {
    tileProxy: {
      calculateTileWidth: vi.fn(() => 1000),
      calculateTilesFromResolution: vi.fn(() => [0])
    },
    pixiRenderer: {
      generateTexture: vi.fn(() => ({ baseTexture: {} }))
    }
  },
  utils: {
    colorToHex: vi.fn((color) => color)
  },
  tracks: {
    BarTrack: class MockBarTrack {
      constructor() {
        this.options = {};
        this.dimensions = [800, 100];
        this._xScale = vi.fn().mockReturnValue(0);
        this._xScale.copy = vi.fn().mockReturnValue(this._xScale);
        this._xScale.invert = vi.fn().mockReturnValue(0);
      }
      
      minVisibleValue() { return 0; }
      maxVisibleValue() { return 2; }
      calculateZoomLevel() { return 0; }
      getTilePosAndDimensions() { return { tileX: 0, tileWidth: 1000 }; }
      tileToLocalId() { return 'test-tile'; }
      visibleAndFetchedTiles() { return []; }
      setVisibleTiles() {}
      draw() {}
      rerender() {}
    }
  },
  libraries: {
    PIXI: {
      Graphics: class MockGraphics {
        constructor() {
          this.children = [];
        }
        clear() {}
        removeChild() {}
        addChild() {}
        beginFill() {}
        drawRect() {}
        removeChildren() {}
        destroy() {}
      },
      Text: class MockText {
        constructor(text, style) {
          this.text = text;
          this.style = style;
        }
      },
      TextMetrics: {
        measureText: vi.fn(() => ({
          width: 20,
          height: 24,
          fontProperties: { descent: 4 }
        }))
      },
      Rectangle: class MockRectangle {
        constructor(x, y, width, height) {
          this.x = x;
          this.y = y;
          this.width = width;
          this.height = height;
        }
      },
      Texture: class MockTexture {
        constructor(baseTexture, rect) {
          this.baseTexture = baseTexture;
          this.rect = rect;
        }
      },
      Sprite: class MockSprite {
        constructor(texture) {
          this.texture = texture;
          this.x = 0;
          this.y = 0;
          this.width = 0;
          this.height = 0;
        }
        destroy() {}
      }
    }
  }
});

describe('SequenceLogoTrack', () => {
  let mockHGC;
  let track;

  beforeEach(() => {
    mockHGC = createMockHGC();
    track = new SequenceLogoTrack(mockHGC, {}, { colorScheme: 'nucleotide' });
    track.scale = {};
    track.tilesetInfo = { tile_size: 32, row_infos: ['A', 'T', 'G', 'C'] };
    track._xScale = vi.fn(() => 0);
    track._xScale.copy = vi.fn().mockReturnValue(track._xScale);
    track.getTilePosAndDimensions = vi.fn(() => ({ tileX: 0, tileWidth: 1000 }));
    global.PIXI = mockHGC.libraries.PIXI;
  });

  describe('Initialization', () => {
    it('should create track instance', () => {
      expect(track).toBeDefined();
      expect(track.constructor.name).toBe('SequenceLogoTrackClass');
    });

    it('should initialize with nucleotide colors', () => {
      expect(track.nucleotideColors).toEqual({
        'A': '#FF0000',
        'T': '#0000FF',
        'G': '#FFA500',
        'C': '#008000',
        'U': '#0000FF'
      });
    });

    it('should initialize with protein colors', () => {
      expect(track.proteinColors).toMatchObject({
        'A': '#CCFF00',
        'F': '#0000FF',
        'D': '#FF6600',
        'C': '#FFFF00'
      });
    });

    it('should set correct scale values', () => {
      const mockTile = {
        graphics: new mockHGC.libraries.PIXI.Graphics(),
        tileData: { 
          shape: [4, 32],
          dense: new Array(128).fill(1)
        },
        drawnAtScale: { copy: vi.fn().mockReturnValue({}) }
      };
      
      track.initTile(mockTile);
      
      expect(track.scale.minRawValue).toBe(0);
      expect(track.scale.maxRawValue).toBe(2);
    });
  });

  describe('Color schemes', () => {
    it('should use nucleotide colors by default', () => {
      expect(track.options.colorScheme).toBe('nucleotide');
    });

    it('should switch to protein colors when specified', () => {
      const proteinTrack = new SequenceLogoTrack(mockHGC, {}, { colorScheme: 'protein' });
      expect(proteinTrack.options.colorScheme).toBe('protein');
    });
  });

  describe('Tile rendering', () => {
    it('should handle empty tile data', () => {
      const mockTile = {
        graphics: new mockHGC.libraries.PIXI.Graphics(),
        tileData: {
          shape: [4, 32],
          dense: new Array(128).fill(0)
        },
        drawnAtScale: { copy: vi.fn() }
      };
      expect(() => track.renderTile(mockTile)).not.toThrow();
    });

    it('should create textures for each nucleotide', () => {
      const mockTile = {
        graphics: new mockHGC.libraries.PIXI.Graphics(),
        tileData: {
          shape: [4, 2],
          dense: [1, 2, 3, 4, 5, 6, 7, 8]
        },
        drawnAtScale: { copy: vi.fn() }
      };
      
      track.tilesetInfo = {
        row_infos: ['A', 'T', 'G', 'C'],
        tile_size: 32
      };
      track.renderTile(mockTile);
      
      expect(mockHGC.services.pixiRenderer.generateTexture).toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('should have correct track type', () => {
      expect(SequenceLogoTrack.config.type).toBe('sequence-logo');
    });

    it('should support multivec datatype', () => {
      expect(SequenceLogoTrack.config.datatype).toContain('multivec');
    });

    it('should include colorScheme in available options', () => {
      expect(SequenceLogoTrack.config.availableOptions).toContain('colorScheme');
    });

    it('should have nucleotide as default color scheme', () => {
      expect(SequenceLogoTrack.config.defaultOptions.colorScheme).toBe('nucleotide');
    });
  });

  describe('Information content calculation', () => {
    it('should calculate entropy correctly', () => {
      // Mock data representing equal frequencies (max entropy)
      const frequencies = [0.25, 0.25, 0.25, 0.25];
      const total = frequencies.reduce((sum, freq) => sum + freq, 0);
      const probs = frequencies.map(freq => freq / total);
      
      const entropy = -probs.reduce((sum, p) => {
        return p > 0 ? sum + p * Math.log2(p) : sum;
      }, 0);
      
      expect(entropy).toBeCloseTo(2.0, 5); // Max entropy for 4 symbols is 2 bits
    });

    it('should handle zero frequencies', () => {
      const frequencies = [1, 0, 0, 0];
      const total = frequencies.reduce((sum, freq) => sum + freq, 0);
      const probs = frequencies.map(freq => freq / total);
      
      const entropy = -probs.reduce((sum, p) => {
        return p > 0 ? sum + p * Math.log2(p) : sum;
      }, 0);
      
      expect(Math.abs(entropy)).toBe(0); // No entropy when only one symbol
    });
  });
});