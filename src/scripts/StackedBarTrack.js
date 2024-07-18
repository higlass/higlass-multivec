import {scaleLinear, scaleOrdinal, schemeCategory10} from 'd3-scale';

const StackedBarTrack = (HGC, ...args) => {
  if (!new.target) {
    throw new Error(
      'Uncaught TypeError: Class constructor cannot be invoked without "new"',
    );
  }

  // Services
  const { tileProxy, pixiRenderer } = HGC.services;

  // Utils
  const { colorToHex } = HGC.utils;

  class StackedBarTrackClass extends HGC.tracks.BarTrack {
    constructor(context, options) {
      super(context, options);
      this.initializeStackedBarTrack();
    }

    /** Factor out some initialization code for the track. This is
    necessary because we can now load tiles synchronously and so
    we have to check if the track is initialized in initTiles
    and not in the constructor */
    initializeStackedBarTrack() {
      if (this.stackedBarTrackInitialized) return;

      this.maxAndMin = {
        max: null,
        min: null
      };

      this.textureGraphics = new HGC.libraries.PIXI.Graphics();
      this.stackedBarTrackInitialized = true

    }

    createColorScale() {
      if (this.options.colorScale) return;

      if (this.tilesetInfo.row_infos && this.tilesetInfo.row_infos[0].color) {
        this.options.colorScale = this.tilesetInfo.row_infos.map(x => x.color);
      } else {
        const DEFAULT_HUMAN_EPILOGOS_COLORS = [
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
        ]
        this.options.colorScale = DEFAULT_HUMAN_EPILOGOS_COLORS
      }
    }

    initTile(tile) {
      this.createColorScale();
      this.initializeStackedBarTrack();

      // create the tile
      // should be overwritten by child classes
      this.scale.minRawValue = this.minVisibleValue();
      this.scale.maxRawValue = this.maxVisibleValue();

      this.scale.minValue = this.scale.minRawValue;
      this.scale.maxValue = this.scale.maxRawValue;

      this.maxAndMin.min = this.minValueInArray(tile.tileData.dense);
      this.maxAndMin.max = this.maxValueInArray(tile.tileData.dense);

      // Number of bars being stacked in each genomic position
      this.numCategories = this.options.selectRows ? this.options.selectRows.length : tile.tileData.shape[0];

      this.localColorToHexScale();

      this.unFlatten(tile);

      this.renderTile(tile);
      this.rescaleTiles();
    }

    destroyTile(tile) {
      tile.sprite.destroy(true);
      tile.graphics.destroy(true);

      tile.graphics = null;
      tile.sprite = null;
    }

    rerender(newOptions) {
      super.rerender(newOptions);

      this.options = newOptions;
      const visibleAndFetched = this.visibleAndFetchedTiles();

      for (let i = 0; i < visibleAndFetched.length; i++) {
        const tile = visibleAndFetched[i];
        tile.matrix = null;

        this.updateTile(tile);
      }

      for (let i = 0; i < visibleAndFetched.length; i++) {
        const tile = visibleAndFetched[i];

        this.renderTile(tile);
      }
      
      this.rescaleTiles();

      this.draw();
    }

    updateTile() {
      const visibleAndFetched = this.visibleAndFetchedTiles();

      for (let i = 0; i < visibleAndFetched.length; i++) {
        const tile = visibleAndFetched[i];
        this.unFlatten(tile);
      }

      this.rescaleTiles();
    }

    /**
     * Prevent BarTracks draw method from having an effect
     *
     * @param tile
     */
    drawTile(tile) {

    }

    calculateVisibleTiles() {
      if (!this.tilesetInfo) {
        return;
      }
      this.zoomLevel = this.calculateZoomLevel();
      if (this.tilesetInfo.resolutions) {
        const sortedResolutions = this.tilesetInfo.resolutions.map((x) => +x).sort((a, b) => b - a);
        const xTiles2 = tileProxy.calculateTilesFromResolution(sortedResolutions[this.zoomLevel], this._xScale, this.tilesetInfo.min_pos[0], this.tilesetInfo.max_pos[0], this.tilesetInfo.tile_size);
        const tiles2 = xTiles2.map((x) => [this.zoomLevel, x]);
        this.setVisibleTiles(tiles2);
        return;
      }
      const xTiles = api.calculateTiles(this.zoomLevel, this.relevantScale(), this.tilesetInfo.min_pos[0], this.tilesetInfo.max_pos[0], this.tilesetInfo.max_zoom, this.tilesetInfo.max_width);
      const tiles = xTiles.map((x) => [this.zoomLevel, x]);
      this.setVisibleTiles(tiles);
    }

    /**
     * Draws exactly one tile.
     *
     * @param tile
     */
    renderTile(tile) {
      tile.svgData = null;
      tile.mouseOverData = null;

      const graphics = tile.graphics;
      graphics.clear();
      graphics.children.map(child => {graphics.removeChild(child)});
      tile.drawnAtScale = this._xScale.copy();

      // we're setting the start of the tile to the current zoom level
      const {tileX, tileWidth} = this.getTilePosAndDimensions(tile.tileData.zoomLevel,
        tile.tileData.tilePos, this.tilesetInfo.tile_size);

      console.log('tile', tile);
      console.log('tileX', tileX);

      const matrix = this.unFlatten(tile);

      this.oldDimensions = this.dimensions; // for mouseover

      // creates a sprite containing all of the rectangles in this tile
      this.drawVerticalBars(this.mapOriginalColors(matrix), tileX, tileWidth,
        this.maxAndMin.max, this.maxAndMin.min, tile);

      graphics.addChild(tile.sprite);


      console.log('graphics.position', graphics.position)
      console.log('graphics.scale', graphics.scale)
      this.makeMouseOverData(tile);
    }

    /**
     * Share the scale of y-axis across tiles.
     */
    syncMaxAndMin() {
      const visibleAndFetched = this.visibleAndFetchedTiles();

      // Initialize min and max values so that the scale is properly calculated based on the current tile matrixes
      this.maxAndMin.min = 0;
      this.maxAndMin.max = 0;

      visibleAndFetched.map(tile => {
        if (tile.minValue + tile.maxValue > this.maxAndMin.min + this.maxAndMin.max) {
          this.maxAndMin.min = tile.minValue;
          this.maxAndMin.max = tile.maxValue;
        }
      });
    }

    /**
     * Rescales the sprites of all visible tiles when zooming and panning.
     */
    rescaleTiles() {
      const visibleAndFetched = this.visibleAndFetchedTiles();

      this.syncMaxAndMin();

      visibleAndFetched.map(a => {
        const valueToPixels = scaleLinear()
          .domain([0, this.maxAndMin.max + Math.abs(this.maxAndMin.min)])
          .range([0, this.dimensions[1]]);
        const newZero = this.dimensions[1] - valueToPixels(Math.abs(this.maxAndMin.min));
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
     * Converts all colors in a colorScale to Hex colors.
     */
    localColorToHexScale() {
      const colorScale = this.options.colorScale || scaleOrdinal(schemeCategory10);
      const colorHexMap = {};
      for (let i = 0; i < colorScale.length; i++) {
        colorHexMap[colorScale[i]] = colorToHex(colorScale[i]);
      }
      this.colorHexMap = colorHexMap;
    }

    /**
     * Find max and min heights for the given tile
     *
     * @param matrix 2d array of numbers representing one tile
     */
    findMaxAndMin(matrix) {
      // find max height of bars for scaling in the track
      const maxAndMin = {
        max: null,
        min: null
      };

      for (let i = 0; i < matrix.length; i++) {
        const temp = matrix[i];

        // find total heights of each positive column and each negative column
        // and compare to highest value so far for the tile
        const localPositiveMax = temp.filter(a => a >= 0).reduce((a, b) => a + b, 0);
        if (localPositiveMax > maxAndMin.max) {
          maxAndMin.max = localPositiveMax;
        }

        // When dealing with states data we have positive values including 0
        // maxAndMin.min should be 0 in this case
        let negativeValues = temp.filter(a => a <= 0);

        if (negativeValues.length > 0) {
          negativeValues = negativeValues.map(a => Math.abs(a));
          const localNegativeMax = negativeValues.reduce((a, b) => a + b, 0); // check
          if (maxAndMin.min === null || localNegativeMax > maxAndMin.min) {
            maxAndMin.min = localNegativeMax;
          }
        }
      }

      return maxAndMin;
    }


      /**
       * un-flatten data into matrix of tile.tileData.shape[0] x tile.tileData.shape[1]
       *
       * @param tile
       * @returns {Array} 2d array of numerical values for each column
       */
      unFlatten(tile) {
        if (tile.matrix) {
          return tile.matrix;
        }

        const flattenedArray = tile.tileData.dense;

        // if any data is negative, switch to exponential scale
        if (flattenedArray.filter(a => a < 0).length > 0 && this.options.valueScaling === 'linear') {
          console.warn('Negative values present in data. Defaulting to exponential scale.');
          this.options.valueScaling = 'exponential';
        }

        const matrix = this.simpleUnFlatten(tile, flattenedArray);

        const maxAndMin = this.findMaxAndMin(matrix);

        tile.matrix = matrix;
        tile.maxValue = maxAndMin.max;
        tile.minValue = maxAndMin.min;

        this.syncMaxAndMin();

        return matrix;
      }

      /**
       *
       * @param tile
       * @param data array of values to reshape
       * @returns {Array} 2D array representation of data
       */
      simpleUnFlatten(tile, data) {
        const shapeX = this.numCategories; // number of different categories on each genomic position
        const shapeY = tile.tileData.shape[1]; // number of genomic positions

        // matrix[0] will be [flattenedArray[0], flattenedArray[256], flattenedArray[512], etc.]
        // because of how flattenedArray comes back from the server.
        const matrix = [];
        for (let i = 0; i < shapeX; i++) { // 6
          for (let j = 0; j < shapeY; j++) { // 256
            let singleBar;
            if (matrix[j] === undefined) {
              singleBar = [];
            } else {
              singleBar = matrix[j];
            }
            if(this.options.selectRows) {
              // filter and/or aggregate bars based on the `selectRows` option
              const idx = this.options.selectRows[i];
              if(Array.isArray(idx)) {
                // calculate sum
                const sum = idx.reduce((cum, cur) => cum + data[(shapeY * cur) + j], 0);
                singleBar.push(sum);
              } else {
                // use the data as it is
                singleBar.push(data[(shapeY * idx) + j]);
              }
            } else {
              // no filter/aggregate
              singleBar.push(data[(shapeY * i) + j]);
            }
            matrix[j] = singleBar;
          }
        }

        if (this.options.valueScaling === 'log') {
          const pseudocount = this.options.pseudocount == undefined ? 1 : this.options.pseudocount;

          for (let j = 0; j < shapeY; j++) {
            const matrixMod = matrix[j].map(x => x + pseudocount)
            const total = matrixMod.reduce((x,y) => x + y, 0)

            const logs = matrixMod.map(x => Math.log(x));
            const logsTotal = logs.reduce((x,y) => x+y, 0)
            const totalLog = Math.log(total);
            const proportions = logs.map(x => (x / logsTotal) * totalLog)
            matrix[j] = proportions;
          }
        }

        return matrix;
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
            value: isNaN(matrix[j][i]) ? 0 : matrix[j][i],
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
      this.textureGraphics.clear();
      const trackHeight = this.dimensions[1];

        console.log('drawVerticalBars', tileX, tileWidth);

      // get amount of trackHeight reserved for positive and for negative
      const unscaledHeight = positiveMax + (Math.abs(negativeMax));

      // fraction of the track devoted to positive values
      const positiveTrackHeight = (positiveMax * trackHeight) / unscaledHeight;

      // fraction of the track devoted to negative values
      const negativeTrackHeight = (Math.abs(negativeMax) * trackHeight) / unscaledHeight;

      let start = null;
      let lowestY = this.dimensions[1];

      const width = 10;

      // calls drawBackground in PixiTrack.js
      this.drawBackground(matrix, this.textureGraphics);

      // borders around each bar
      if (this.options.barBorder) {
        this.textureGraphics.lineStyle(1, 0x000000, 1);
      }

      for (let j = 0; j < matrix.length; j++) { // jth vertical bar in the graph
        const x = (j * width);
        (j === 0) ? start = x : start;

        // draw positive values
        const positive = matrix[j][0];
        const valueToPixelsPositive = scaleLinear()
          .domain([0, positiveMax])
          .range([0, positiveTrackHeight]);
        let positiveStackedHeight = 0;

        if (j > 1024
  
        )
          continue;

        for (let i = 0; i < positive.length; i++) {
          const height = valueToPixelsPositive(positive[i].value);
          const y = positiveTrackHeight - (positiveStackedHeight + height);
          this.addSVGInfo(tile, x, y, width, height, positive[i].color);
          this.textureGraphics.beginFill(this.colorHexMap[positive[i].color]);
          this.textureGraphics.drawRect(x, y, width, height);

          positiveStackedHeight = positiveStackedHeight + height;
          if (lowestY > y)
            lowestY = y;
        }

        // draw negative values, if there are any

        if(Math.abs(negativeMax)>0){
          const negative = matrix[j][1];
          const valueToPixelsNegative = scaleLinear()
            .domain([-Math.abs(negativeMax), 0])
            .range([negativeTrackHeight, 0]);
          let negativeStackedHeight = 0;
          for (let i = 0; i < negative.length; i++) {
            const height = valueToPixelsNegative(negative[i].value);
            const y = positiveTrackHeight + negativeStackedHeight;
            this.addSVGInfo(tile, x, y, width, height, negative[i].color);
            this.textureGraphics.beginFill(this.colorHexMap[negative[i].color]);
            this.textureGraphics.drawRect(x, y, width, height);
            negativeStackedHeight = negativeStackedHeight + height;
          }
        }
      }

      // vertical bars are drawn onto the graphics object
      // and a texture is generated from that
      const texture = pixiRenderer.generateTexture(
        this.textureGraphics, HGC.libraries.PIXI.SCALE_MODES.NEAREST
      );
      const sprite = new HGC.libraries.PIXI.Sprite(texture);
      sprite.width = this._xScale(tileX + tileWidth) - this._xScale(tileX);
      sprite.x = this._xScale(tileX);

      console.log('sprite.x', sprite.x);
      console.log('sprite.width', sprite.width);

      tile.sprite = sprite;
      tile.lowestY = lowestY;
    }


    draw() {
      super.draw();
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
     * Get the minimum of an array
     *
     * @param {array} arr
     */
    minValueInArray(arr){

      let min = arr[0];

      for (let i = 1; i < arr.length; i++) {
        let value = arr[i];
        min = (value < min) ? value : min;
      }

      return min
    }

    /**
     * Get the maximum of an array
     *
     * @param {array} arr
     */
    maxValueInArray(arr){

      let max = arr[0];

      for (let i = 1; i < arr.length; i++) {
        let value = arr[i];
        max = (value > max) ? value : max;
      }

      return max
    }

    /**
     * Sorts relevant data for mouseover for easy iteration later
     *
     * @param tile
     */
    makeMouseOverData(tile) {
      const shapeX = this.numCategories; // 15 number of different nucleotides in each bar
      const shapeY = tile.tileData.shape[1]; // 3840 number of bars
      const barYValues = tile.svgData.barYValues;
      const barHeights = tile.svgData.barHeights;
      const barColors = tile.svgData.barColors;
      let mouseOverData = [];

      for (let i = 0; i < shapeX; i++) {
        for (let j = 0; j < shapeY; j++) {
          const index = (j * shapeX) + i;
          let dataPoint = {
            y: barYValues[index],
            height: barHeights[index],
            color: barColors[index]
          };
          (mouseOverData[j] === undefined) ? mouseOverData[j] = [dataPoint]
            : mouseOverData[j].push(dataPoint);
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
     * Realigns tiles when exporting to SVG
     */
     /*
    realignSVG() {
      const visibleAndFetched = this.visibleAndFetchedTiles();

      visibleAndFetched.map(tile => {
        const valueToPixels = scaleLinear()
          .domain([0, this.maxAndMin.max + Math.abs(this.maxAndMin.min)])
          .range([0, this.dimensions[1]]);
        const newZero = this.dimensions[1] - valueToPixels(Math.abs(this.maxAndMin.min));
        const realignment = newZero - valueToPixels(tile.maxValue);
        tile.svgData.barYValues = tile.svgData.barYValues.map(yVal => { return yVal - realignment});
      });
    }
    */

    exportSVG() {

      const visibleAndFetched = this.visibleAndFetchedTiles();
      visibleAndFetched.map((tile) => {
        this.initTile(tile);
        this.draw();
      });

      let track = null;
      let base = null;

      base = document.createElement('g');
      track = base;

      [base, track] = super.superSVG();

      const output = document.createElement('g');
      track.appendChild(output);

      output.setAttribute(
        'transform',
        `translate(${this.pMain.position.x},${this.pMain.position.y}) scale(${this.pMain.scale.x},${this.pMain.scale.y})`,
      );

      // this.realignSVG();

      for (const tile of this.visibleAndFetchedTiles()) {
        const rotation = 0;
        const g = document.createElement('g');



        // place each sprite
        g.setAttribute(
          'transform',
          ` translate(${tile.sprite.x},${tile.sprite.y}) rotate(${rotation}) scale(${tile.sprite.scale.x},${tile.sprite.scale.y}) `,
        );

        const data = tile.svgData;

        // add each bar
        for (let i = 0; i < data.barXValues.length; i++) {
          const rect = document.createElement('rect');
          rect.setAttribute('fill', data.barColors[i]);
          rect.setAttribute('stroke', data.barColors[i]);

          rect.setAttribute('x', data.barXValues[i]);
          rect.setAttribute('y', data.barYValues[i] - tile.lowestY);
          rect.setAttribute('height', data.barHeights[i]);
          rect.setAttribute('width', data.barWidths[i]);
          if (this.options.barBorder) {
            rect.setAttribute('stroke-width', '0.1');
            rect.setAttribute('stroke', 'black');
          }

          g.appendChild(rect);
        }

        output.appendChild(g);
      }

      return [base, base];
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
      const tileWidth = tileProxy.calculateTileWidth(this.tilesetInfo,
        zoomLevel,
        this.tilesetInfo.tile_size);

      // the position of the tile containing the query position
      const tilePos = this._xScale.invert(trackX) / tileWidth;

      const posInTileX = Math.floor(this.tilesetInfo.tile_size * (tilePos - Math.floor(tilePos)));

      const tileId = this.tileToLocalId([zoomLevel, Math.floor(tilePos)]);
      const fetchedTile = this.fetchedTiles[tileId];

      if (!fetchedTile)
        return '';

      const matrixRow = fetchedTile.matrix[posInTileX];
      let row = fetchedTile.mouseOverData[posInTileX];

      const dataY = ((trackY - fetchedTile.sprite.y)
        / fetchedTile.sprite.scale.y) + fetchedTile.lowestY;

      //use color to map back to the array index for correct data
      const colorScaleMap = {};
      for (let i = 0; i < colorScale.length; i++) {
        colorScaleMap[colorScale[i]] = i;
      }

      // // if mousing over a blank area
      if (dataY < row[0].y || dataY
        >= (row[row.length - 1].y + row[row.length - 1].height)) {
        return '';
      }
      else {
        for (let i = 0; i < row.length; i++) {
          const y = row[i].y;
          const height = row[i].height;
          if (dataY > y && dataY <= (y + height)) {
            const color = row[i].color;
            const value = Number.parseFloat(matrixRow[colorScaleMap[color]]).toPrecision(4).toString();
            
            let type;
            if(this.options.selectRows) {
              // if `selectRows` is used, we need to point to the index specified in it
              const idx = this.options.selectRows[colorScaleMap[color]];
              if(Array.isArray(idx)) {
                // This means multiple types are aggregated. Hence, show the multiple types in the tooltip.
                const types = idx.map(d => this.tilesetInfo.row_infos[d].name || this.tilesetInfo.row_infos[d]);
                type = types.join(', ');
              } else {
                const rowInfo = this.tilesetInfo.row_infos[idx];
                type = rowInfo.name || rowInfo;
              }
            }
            else {
              const rowInfo = this.tilesetInfo.row_infos[colorScaleMap[color]];
              type = rowInfo.name || rowInfo;
            }
            return `<svg width="10" height="10"><rect width="10" height="10" rx="2" ry="2"
            style="fill:${color};stroke:black;stroke-width:2;"></svg>`
              + ` ${type}` + `<br>` + `${value}`;
          }
        }
      }

    }


  }
  return new StackedBarTrackClass(...args);
};

const icon = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 5640 5420" preserveAspectRatio="xMidYMid meet"> <g id="layer101" fill="#000000" stroke="none"> <path d="M0 2710 l0 -2710 2820 0 2820 0 0 2710 0 2710 -2820 0 -2820 0 0 -2710z"/> </g> <g id="layer102" fill="#750075" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> <path d="M4340 2710 l0 -2510 560 0 560 0 0 2510 0 2510 -560 0 -560 0 0 -2510z"/> <path d="M200 1870 l0 -1670 630 0 630 0 0 1670 0 1670 -630 0 -630 0 0 -1670z"/> <path d="M1660 1810 l0 -1610 570 0 570 0 0 1610 0 1610 -570 0 -570 0 0 -1610z"/> <path d="M3000 840 l0 -640 570 0 570 0 0 640 0 640 -570 0 -570 0 0 -640z"/> </g> <g id="layer103" fill="#ffff04" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> </g> </svg>';

// default
StackedBarTrack.config = {
  type: 'horizontal-stacked-bar',
  datatype: ['multivec', 'epilogos'],
  local: false,
  orientation: '1d-horizontal',
  thumbnail: new DOMParser().parseFromString(icon, 'text/xml').documentElement,
  availableOptions: ['labelPosition', 'labelColor', 'valueScaling',
    'labelTextOpacity', 'labelBackgroundOpacity', 'trackBorderWidth',
    'trackBorderColor', 'trackType', 'scaledHeight', 'backgroundColor',
    'colorScale', 'barBorder', 'sortLargestOnTop', 'selectRows'],
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
    selectRows: null
  },
  otherOptions: {
    'epilogos': {
      scaledHeight: false,
    }
  }
};


export default StackedBarTrack;
