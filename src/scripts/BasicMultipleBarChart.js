import {scaleLinear, scaleOrdinal, schemeCategory10} from 'd3-scale';

const BasicMultipleBarChart = (HGC, ...args) => {
  if (!new.target) {
    throw new Error(
      'Uncaught TypeError: Class constructor cannot be invoked without "new"',
    );
  }

  // Services
  const {tileProxy} = HGC.services;

  class BasicMultipleBarChartClass extends mix(HGC.tracks.BarTrack).with(HGC.tracks.OneDimensionalMixin) {
    constructor(context, options) {
      super(context, options);

      this.maxAndMin = {
        max: null,
        min: null
      };

    }

    /**
     * Draws exactly one tile.
     * @param tile
     */
    renderTile(tile) {
      const graphics = tile.graphics;
      graphics.clear();
      graphics.children.map(child => {graphics.removeChild(child)});
      tile.drawnAtScale = this._xScale.copy();

      let localGraphics = new PIXI.Graphics();

      // we're setting the start of the tile to the current zoom level
      const {tileX, tileWidth} = this.getTilePosAndDimensions(tile.tileData.zoomLevel,
        tile.tileData.tilePos, this.tilesetInfo.tile_size);

      if (this.options.barBorder) {
        localGraphics.lineStyle(0.1, 'black', 1);
        tile.barBorders = true;
      }

      const matrix = tile.matrix;
      const trackHeight = this.dimensions[1];
      const matrixDimensions = tile.tileData.shape;
      const colorScale = this.options.colorScale || scaleOrdinal(schemeCategory10);
      const width = this._xScale(tileX + (tileWidth / this.tilesetInfo.tile_size)) - this._xScale(tileX);
      const valueToPixels = scaleLinear()
        .domain([0, this.maxAndMin.max])
        .range([0, trackHeight / matrixDimensions[0]]);

      for (let i = 0; i < matrix[0].length; i++) { // 15
        localGraphics.beginFill(this.colorHexMap[colorScale[i]]);

        for (let j = 0; j < matrix.length; j++) { // 3000
          const x = this._xScale(tileX + (j * tileWidth / this.tilesetInfo.tile_size));
          const height = valueToPixels(matrix[j][i]);
          const y = ((trackHeight / matrixDimensions[0]) * (i + 1) - height);
          this.addSVGInfo(tile, x, y, width, height, colorScale[i]);
          localGraphics.drawRect(x, y, width, height);
        }

      }

      const texture = localGraphics.generateTexture(PIXI.SCALE_MODES.NEAREST);
      const sprite = new PIXI.Sprite(texture);
      sprite.width = this._xScale(tileX + tileWidth) - this._xScale(tileX);
      sprite.x = this._xScale(tileX);
      graphics.addChild(sprite);

    }

    /**
     * Here, rerender all tiles every time track size is changed
     *
     * @param newDimensions
     */
    setDimensions(newDimensions) {
      super.setDimensions(newDimensions);
      const visibleAndFetched = this.visibleAndFetchedTiles();
      visibleAndFetched.map(a => this.initTile(a));
    }

    /**
     * Here, rerender all tiles every time track size is changed
     *
     * @param newDimensions
     */
    setDimensions(newDimensions) {
      super.setDimensions(newDimensions);
      const visibleAndFetched = this.visibleAndFetchedTiles();
      visibleAndFetched.map(a => this.initTile(a));
    }

    /**
     * Stores x and y coordinates in 2d arrays in each tile to indicate new lines and line color.
     *
     * @param tile
     * @param x
     * @param y
     * @param width
     * @param height
     * @param color
     */
    addSVGInfo(tile, x, y, width, height, color) {
      if (tile.hasOwnProperty('svgData') && tile.svgData !== null) {
        tile.svgData.barXValues.push(x);
        tile.svgData.barYValues.push(y);
        tile.svgData.barWidths.push(width);
        tile.svgData.barHeights.push(height);
        tile.svgData.barColors.push(color);
      }
      else {
        // create entirely new 2d arrays for x y coordinates
        tile.svgData = {
          barXValues: [x],
          barYValues: [y],
          barWidths: [width],
          barHeights: [height],
          barColors: [color]
        };
      }
    }

    getMouseOverHtml(trackX, trackY) {
      //console.log(this.tilesetInfo);
      return '';
    }

  }
  return new BasicMultipleBarChartClass(...args);
};

const icon = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="598px" height="568px" viewBox="0 0 5980 5680" preserveAspectRatio="xMidYMid meet"> <g id="layer101" fill="#000000" stroke="none"> <path d="M0 2840 l0 -2840 2990 0 2990 0 0 2840 0 2840 -2990 0 -2990 0 0 -2840z"/> </g> <g id="layer102" fill="#ff1388" stroke="none"> <path d="M180 4780 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1700 4050 l0 -1470 550 0 550 0 0 1470 0 1470 -550 0 -550 0 0 -1470z"/> <path d="M3100 2990 l0 -2530 610 0 610 0 0 2530 0 2530 -610 0 -610 0 0 -2530z"/> <path d="M4580 3670 l0 -1850 610 0 610 0 0 1850 0 1850 -610 0 -610 0 0 -1850z"/> <path d="M0 1920 l0 -1920 2990 0 2990 0 0 810 0 810 -730 0 -730 0 0 -680 0 -680 -810 0 -810 0 0 1060 0 1060 -700 0 -700 0 0 730 0 730 -750 0 -750 0 0 -1920z"/> </g> <g id="layer103" fill="#ffffff" stroke="none"> <path d="M0 1920 l0 -1920 2990 0 2990 0 0 810 0 810 -730 0 -730 0 0 -680 0 -680 -810 0 -810 0 0 1060 0 1060 -700 0 -700 0 0 730 0 730 -750 0 -750 0 0 -1920z"/> </g> </svg>';

// default
BasicMultipleBarChart.config = {
  type: 'basic-multiple-bar-chart',
  datatype: ['multivec'],
  local: false,
  orientation: '1d-horizontal',
  thumbnail: new DOMParser().parseFromString(icon, 'text/xml').documentElement,
  availableOptions: ['labelPosition', 'labelColor', 'valueScaling', 'labelTextOpacity', 'labelBackgroundOpacity',
    'trackBorderWidth', 'trackBorderColor', 'trackType'],
  defaultOptions: {
    labelPosition: 'topLeft',
    labelColor: 'black',
    labelTextOpacity: 0.4,
    valueScaling: 'linear',
    trackBorderWidth: 0,
    trackBorderColor: 'black',
  },
};

export default BasicMultipleBarChart;

