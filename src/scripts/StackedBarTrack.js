import {mix} from 'mixwith';
import {scaleLinear, scaleOrdinal, schemeCategory10} from 'd3-scale';

const StackedBarTrack = (HGC, ...args) => {
  if (!new.target) {
    throw new Error(
      'Uncaught TypeError: Class constructor cannot be invoked without "new"',
    );
  }

  // Services
  const {tileProxy} = HGC.services;

  class StackedBarTrackClass extends mix(HGC.tracks.BarTrack).with(HGC.tracks.OneDimensionalMixin) {
    constructor(scene, trackConfig, dataConfig, handleTilesetInfoReceived, animate, onValueScaleChanged) {
      super(scene, dataConfig, handleTilesetInfoReceived, trackConfig.options, animate, onValueScaleChanged);

      this.maxAndMin = {
        max: null,
        min: null
      };

    }

    /**
     * Draws exactly one tile.
     *
     * @param tile
     */
    renderTile(tile) {
      const graphics = tile.graphics;

      // remove all of this graphic's children
      for (let i = graphics.children.length - 1; i >= 0; i--) {
        graphics.removeChild(graphics.children[i]);
      }
      graphics.clear();
      tile.drawnAtScale = this._xScale.copy();

      // we're setting the start of the tile to the current zoom level
      const {tileX, tileWidth} = this.getTilePosAndDimensions(tile.tileData.zoomLevel,
        tile.tileData.tilePos, this.tilesetInfo.tile_size);

      const matrix = this.unFlatten(tile);

      this.oldDimensions = this.dimensions; // for mouseover

      this.drawVerticalBars(this.mapOriginalColors(matrix), tileX, tileWidth,
        this.maxAndMin.max, this.maxAndMin.min, tile);
      graphics.addChild(tile.sprite);

      this.makeMouseOverData(tile);
    }

    /**
     * Rescales the sprites of all visible tiles when zooming and panning.
     */
    rescaleTiles() {
      const visibleAndFetched = this.visibleAndFetchedTiles();

      visibleAndFetched.map(a => {
        const valueToPixels = scaleLinear()
          .domain([0, this.maxAndMin.max + this.maxAndMin.min])
          .range([0, this.dimensions[1]]);
        const newZero = this.dimensions[1] - valueToPixels(this.maxAndMin.min);
        const height = valueToPixels(a.minValue + a.maxValue);
        const sprite = a.sprite;
        const y = newZero - valueToPixels(a.maxValue);
        if (sprite) {
          sprite.height = height;
          sprite.y = y;
        }
      });
    }

    /**
     * Map each value in every array in the matrix to a color depending on position in the array
     * Divides each array into positive and negative sections and sorts them
     *
     * @param matrix 2d array of numbers representing nucleotides
     * @return
     */
    mapOriginalColors(matrix) {
      const colorScale = this.options.colorScale || scaleOrdinal(schemeCategory10);

      // mapping colors to unsorted values
      const matrixWithColors = [];
      for (let j = 0; j < matrix.length; j++) {
        const columnColors = [];
        for (let i = 0; i < matrix[j].length; i++) {
          columnColors[i] = {
            value: matrix[j][i],
            color: colorScale[i]
          }
        }

        // separate positive and negative array values
        const positive = [];
        const negative = [];
        for (let i = 0; i < columnColors.length; i++) {
          if (columnColors[i].value >= 0) {
            positive.push(columnColors[i]);
          }
          else if (columnColors[i].value < 0) {
            negative.push(columnColors[i]);
          }
        }

        if (this.options.sortLargestOnTop) {
          positive.sort((a, b) => a.value - b.value);
          negative.sort((a, b) => b.value - a.value);
        }
        else {
          positive.sort((a, b) => b.value - a.value);
          negative.sort((a, b) => a.value - b.value);
        }

        matrixWithColors.push([positive, negative]);
      }
      return matrixWithColors;
    }

    /**
     * Draws graph without normalizing values.
     *
     * @param graphics PIXI.Graphics instance
     * @param matrix 2d array of numbers representing nucleotides
     * @param tileX starting position of tile
     * @param tileWidth pre-scaled width of tile
     * @param positiveMax the height of the tallest bar in the positive part of the graph
     * @param negativeMax the height of the tallest bar in the negative part of the graph
     * @param tile
     */
    drawVerticalBars(matrix, tileX, tileWidth, positiveMax, negativeMax, tile) {
      let graphics = new PIXI.Graphics();
      const trackHeight = this.dimensions[1];

      // get amount of trackHeight reserved for positive and for negative
      const unscaledHeight = positiveMax + negativeMax;
      const positiveTrackHeight = (positiveMax * trackHeight) / unscaledHeight;
      const negativeTrackHeight = (negativeMax * trackHeight) / unscaledHeight;

      let start = null;
      let lowestY = this.dimensions[1];

      const width = 10;

      // if (this.options.barBorder && tile.tileData.zoomLevel === (this.tilesetInfo.resolutions.length - 1)) {
      //   //tile.barBorders = true;
      //graphics.lineStyle(1, 0x000000, 1);
      // }

      for (let j = 0; j < matrix.length; j++) { // jth vertical bar in the graph
        const x = (j * width);
        (j === 0) ? start = x : start;

        // draw positive values
        const positive = matrix[j][0];
        const valueToPixelsPositive = scaleLinear()
          .domain([0, positiveMax])
          .range([0, positiveTrackHeight]);
        let positiveStackedHeight = 0;
        for (let i = 0; i < positive.length; i++) {
          const height = valueToPixelsPositive(positive[i].value);
          const y = positiveTrackHeight - (positiveStackedHeight + height);
          this.addSVGInfo(tile, x, y, width, height, positive[i].color);
          graphics.beginFill(this.colorHexMap[positive[i].color]);
          graphics.drawRect(x, y, width, height);
          positiveStackedHeight = positiveStackedHeight + height;

          if (lowestY > y)
            lowestY = y;
        }
        //draw negative values
        const negative = matrix[j][1];
        const valueToPixelsNegative = scaleLinear()
          .domain([-Math.abs(negativeMax), 0])
          .range([negativeTrackHeight, 0]);
        let negativeStackedHeight = 0;
        for (let i = 0; i < negative.length; i++) {
          const height = valueToPixelsNegative(negative[i].value);
          const y = positiveTrackHeight + negativeStackedHeight;
          this.addSVGInfo(tile, x, y, width, height, negative[i].color);
          graphics.beginFill(this.colorHexMap[negative[i].color]);
          graphics.drawRect(x, y, width, height);
          negativeStackedHeight = negativeStackedHeight + height;
        }

        // todo this background is hacky. try doing it with sprites?
        // // sets background to black if black option enabled
        // const backgroundColor = this.options.backgroundColor;
        // if (backgroundColor === 'black') {
        //   this.options.labelColor = 'white';
        //   graphics.beginFill(backgroundColor);
        //   graphics.drawRect(x, 0, width, trackHeight - positiveStackedHeight); // positive background
        //   graphics.drawRect(x, negativeStackedHeight + positiveTrackHeight,    // negative background
        //     width, negativeTrackHeight - negativeStackedHeight);
        //
        //   this.addSVGInfo(tile, x, 0, width, trackHeight - positiveStackedHeight, 'black'); // positive
        //   this.addSVGInfo(tile, x, negativeStackedHeight + positiveTrackHeight, width,
        //     negativeTrackHeight - negativeStackedHeight, 'black'); // negative
        //
        //   positiveStackedHeight = 0;
        //   negativeStackedHeight = 0;
        // }

      }
      const texture = graphics.generateTexture(PIXI.SCALE_MODES.NEAREST);
      const sprite = new PIXI.Sprite(texture);
      sprite.width = this._xScale(tileX + tileWidth) - this._xScale(tileX);
      sprite.x = this._xScale(tileX);
      tile.sprite = sprite;
    }

    /**
     * Adds information to recreate the track in SVG to the tile
     *
     * @param tile
     * @param x x value of bar
     * @param y y value of bar
     * @param width width of bar
     * @param height height of bar
     * @param color color of bar (not converted to hex)
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
        tile.svgData = {
          barXValues: [x],
          barYValues: [y],
          barWidths: [width],
          barHeights: [height],
          barColors: [color]
        };
      }
    }

    /**
     * Here, rerender all tiles every time track size is changed
     *
     * @param newDimensions
     */
    setDimensions(newDimensions) {
      this.oldDimensions = this.dimensions;
      super.setDimensions(newDimensions);
      const visibleAndFetched = this.visibleAndFetchedTiles();
      visibleAndFetched.map(a => this.initTile(a));
    }

    /**
     * Sorts relevant data for mouseover for easy iteration later
     *
     * @param tile
     */
    makeMouseOverData(tile) {
      const shapeX = tile.tileData.shape[0]; // 15 number of different nucleotides in each bar
      const shapeY = tile.tileData.shape[1]; // 3840 number of bars
      const barYValues = tile.svgData.barYValues;
      const barColors = tile.svgData.barColors;
      const barHeights = tile.svgData.barHeights;
      let mouseOverData = [];

      for (let i = 0; i < shapeX; i++) {
        for (let j = 0; j < shapeY; j++) {
          const index = (j * shapeX) + i;
          let dataPoint = {
            y: barYValues[index],
            color: barColors[index],
            height: barHeights[index]
          };
          (mouseOverData[j] === undefined) ? mouseOverData[j] = [dataPoint] : mouseOverData[j].push(dataPoint);
        }
      }
      for (let i = 0; i < mouseOverData.length; i++) {
        mouseOverData[i] = mouseOverData[i].sort((a, b) => {
          return a.y - b.y
        });
      }

      tile.mouseOverData = mouseOverData;

    }

    /**
     * Scales y values and heights for one row of mouseover matrix at a time to match tile scaling
     */
    scaleRow(row) {
      const scaledRow = row;
      const yScale = scaleLinear()
        .domain([0, this.oldDimensions[1]])
        .range([0, this.dimensions[1]]);
      for(let i = 0; i < row.length; i++) {
        let prevUnscaledHeight = null;
        let prevScaledHeight = null;
        const currentHeight = yScale(row[i].height);
        if(i === 0) {
          scaledRow[i].height = currentHeight;
          prevUnscaledHeight = row[i].height;
          prevScaledHeight = currentHeight;
        }
        else {
          if(prevScaledHeight < prevUnscaledHeight) {
            scaledRow[i].y = scaledRow[i].y - (prevUnscaledHeight - prevScaledHeight);
            scaledRow[i].height = currentHeight;
            prevUnscaledHeight = row[i - 1].height;
            prevScaledHeight = scaledRow[i - 1].height;
          }
          else if (prevScaledHeight > prevUnscaledHeight) {
            scaledRow[i].y = scaledRow[i].y +  (prevScaledHeight - prevUnscaledHeight);
            scaledRow[i].height = currentHeight;
            prevUnscaledHeight = row[i - 1].height;
            prevScaledHeight = scaledRow[i - 1].height;
          }
          else {
            prevUnscaledHeight = row[i - 1].height;
            prevScaledHeight = scaledRow[i - 1].height;
          }
        }
      }

      return scaledRow;
    }

    /**
     * Shows value and type for each bar
     *
     * @param trackX x coordinate of mouse
     * @param trackY y coordinate of mouse
     * @returns string with embedded values and svg square for color
     */
    getMouseOverHtml(trackX, trackY) {
      if (!this.tilesetInfo)
        return '';

      const colorScale = this.options.colorScale || scaleOrdinal(schemeCategory10);

      const zoomLevel = this.calculateZoomLevel();
      const tileWidth = tileProxy.calculateTileWidth(this.tilesetInfo, zoomLevel, this.tilesetInfo.tile_size);

      // the position of the tile containing the query position
      const tilePos = this._xScale.invert(trackX) / tileWidth;

      const posInTileX = Math.floor(this.tilesetInfo.tile_size * (tilePos - Math.floor(tilePos)));

      const tileId = this.tileToLocalId([zoomLevel, Math.floor(tilePos)]);
      const fetchedTile = this.fetchedTiles[tileId];

      if (!fetchedTile)
        return '';

      const matrixRow = fetchedTile.matrix[posInTileX];
      let row = fetchedTile.mouseOverData[posInTileX];
      row = this.scaleRow(row); // TODO FIX to accommodate

      //use color to map back to the array index for correct data
      const colorScaleMap = {};
      for (let i = 0; i < colorScale.length; i++) {
        colorScaleMap[colorScale[i]] = i;
      }

      // // if mousing over a blank area
      if (trackY < row[0].y || trackY >= (row[row.length - 1].y + row[row.length - 1].height)) {
        return '';
      }
      else {
        for (let i = 0; i < row.length; i++) {
          const y = row[i].y;
          const height = row[i].height;
          if (trackY > y && trackY <= (y + height)) {
            const color = row[i].color;
            const value = Number.parseFloat(matrixRow[colorScaleMap[color]]).toPrecision(4).toString();
            const type = this.tilesetInfo.row_infos[colorScaleMap[color]];

            return `<svg width="10" height="10"><rect width="10" height="10" rx="2" ry="2"
            style="fill:${color};stroke:black;stroke-width:2;"></svg>`
              + ` ${type}` + `<br>` + `${value}`;

          }
        }
      }

    }

    draw() {
      super.draw();
    }

  }
  return new StackedBarTrackClass(...args);
};

const icon = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="564px" height="542px" viewBox="0 0 5640 5420" preserveAspectRatio="xMidYMid meet"> <g id="layer101" fill="#000000" stroke="none"> <path d="M0 2710 l0 -2710 2820 0 2820 0 0 2710 0 2710 -2820 0 -2820 0 0 -2710z"/> </g> <g id="layer102" fill="#750075" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> <path d="M4340 2710 l0 -2510 560 0 560 0 0 2510 0 2510 -560 0 -560 0 0 -2510z"/> <path d="M200 1870 l0 -1670 630 0 630 0 0 1670 0 1670 -630 0 -630 0 0 -1670z"/> <path d="M1660 1810 l0 -1610 570 0 570 0 0 1610 0 1610 -570 0 -570 0 0 -1610z"/> <path d="M3000 840 l0 -640 570 0 570 0 0 640 0 640 -570 0 -570 0 0 -640z"/> </g> <g id="layer103" fill="#ffff04" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> </g> </svg>';

// default
StackedBarTrack.config = {
  type: 'horizontal-stacked-bar',
  datatype: ['multivec'],
  local: false,
  orientation: '1d-horizontal',
  thumbnail: new DOMParser().parseFromString(icon, 'text/xml').documentElement,
  availableOptions: ['labelPosition', 'labelColor', 'valueScaling',
    'labelTextOpacity', 'labelBackgroundOpacity', 'trackBorderWidth',
    'trackBorderColor', 'trackType', 'scaledHeight', 'backgroundColor',
    'colorScale', 'barBorder', 'sortLargestOnTop'],
  defaultOptions: {
    labelPosition: 'topLeft',
    labelColor: 'black',
    labelTextOpacity: 0.4,
    valueScaling: 'linear',
    trackBorderWidth: 0,
    trackBorderColor: 'black',
    backgroundColor: 'white',
    barBorder: true,
    sortLargestOnTop: true,
    colorScale: [
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
  }
};


export default StackedBarTrack;
