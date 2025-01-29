import {scaleLinear, scaleOrdinal} from 'd3-scale';

const BasicMultipleBarChart = (HGC, ...args) => {
  if (!new.target) {
    throw new Error(
      'Uncaught TypeError: Class constructor cannot be invoked without "new"',
    );
  }

  // Services
  const { tileProxy, pixiRenderer } = HGC.services;

  // Utils
  const { absToChr, colorToHex } = HGC.utils;

  class BasicMultipleBarChartClass extends HGC.tracks.BarTrack {
    constructor(context, options) {
      super(context, options);
      this.initializeBasicMultipleBarChart();
    }

    /** Factor out some initialization code for the track. This is
    necessary because we can now load tiles synchronously and so
    we have to check if the track is initialized in initTiles
    and not in the constructor */
    initializeBasicMultipleBarChart() {
      if (this.basicMultipleBarChartInitialized) return;

      this.maxAndMin = {
        max: null,
        min: null
      };

      this.textureGraphics = new HGC.libraries.PIXI.Graphics();
      this.basicMultipleBarChartInitialized = true;
      this.renderedTileIds = Object.create({});
      this.rescaledTileIds = Object.create({});
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
      this.initializeBasicMultipleBarChart();

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

      this.renderedTileIds[tile.tileId] = false;
      this.renderTile(tile);

      // this.rescaledTileIds[tile.tileId] = false;
      // this.rescaleTiles();

      const visibleAndFetched = this.visibleAndFetchedTiles();
      const visibleTileIds = visibleAndFetched.map(a => a.tileId);
      const renderedTileIds = Object.keys(this.renderedTileIds);
      if (this.deepEqual(visibleTileIds, renderedTileIds)) {
        this.syncMaxAndMin();
        visibleAndFetched.map(a => {
          if ((this.minValueInArray(a.tileData.dense) !== this.maxAndMin.min) || (this.maxValueInArray(a.tileData.dense) !== this.maxAndMin.max)) {
            // console.log(`tile ${a.tileId} needs redrawing`);
            if (a.hasOwnProperty('mouseoverRawData') && a.mouseoverRawData !== null) {
              // console.log(`clearing mouseover raw data`);
              for (var k in a.mouseoverRawData) {
                if (a.mouseoverRawData.hasOwnProperty(k)) {
                  delete a.mouseoverRawData[k];
                }
              }
              a.mouseoverRawData = null;
            }
            this.renderedTileIds[a.tileId] = false;
            this.renderTile(a);
          }
        });
      }
    }

    destroyTile(tile) {
      /**
       * 1) delete tile ID key from rendered and rescaled tables
       * 2) reset the rescaled status of remaining tile IDs, so that 
       *    rescaling can take place upon initialization of a new tile
       * 3) clean up sprite data
       * 4) redraw tiles that require new scale and mouseover data
       */
      delete this.renderedTileIds[tile.tileId];
      for (var remainingTileId in this.renderedTileIds) {
        this.renderedTileIds[remainingTileId] = false;
      }
      delete this.rescaledTileIds[tile.tileId];
      for (var remainingTileId in this.rescaledTileIds) {
        this.rescaledTileIds[remainingTileId] = false;
      }
      tile.sprite.destroy(true);
      tile.graphics.destroy(true);

      tile.graphics = null;
      tile.sprite = null;

      const visibleAndFetched = this.visibleAndFetchedTiles();
      const visibleTileIds = visibleAndFetched.map(a => a.tileId);
      const renderedTileIds = Object.keys(this.renderedTileIds);
      if (this.deepEqual(visibleTileIds, renderedTileIds)) {
        this.syncMaxAndMin();
        visibleAndFetched.map(a => {
          if ((this.minValueInArray(a.tileData.dense) !== this.maxAndMin.min) || (this.maxValueInArray(a.tileData.dense) !== this.maxAndMin.max)) {
            // console.log(`tile ${a.tileId} needs redrawing`);
            if (a.hasOwnProperty('mouseoverRawData') && a.mouseoverRawData !== null) {
              // console.log(`clearing mouseover raw data`);
              for (var k in a.mouseoverRawData) {
                if (a.mouseoverRawData.hasOwnProperty(k)) {
                  delete a.mouseoverRawData[k];
                }
              }
              a.mouseoverRawData = null;
            }
            this.renderedTileIds[a.tileId] = false;
            this.renderTile(a);
          }
        });
      }
    }

    rerender(newOptions) {
      super.rerender(newOptions);

      this.options = newOptions;

      const visibleAndFetched = this.visibleAndFetchedTiles();

      for (let i = 0; i < visibleAndFetched.length; i++) {
        this.updateTile(visibleAndFetched[i]);
      }

      // this.rescaleTiles();
      this.draw();
      
    }

    updateTile() {
      const visibleAndFetched = this.visibleAndFetchedTiles();

      for (let i = 0; i < visibleAndFetched.length; i++) {
        const tile = visibleAndFetched[i];
        // console.log(`BasicMultipleBarChart -> updateTile(${tile.tileId})`);
        this.unFlatten(tile);
        // this.rescaledTileIds[tile.tileId] = false;

        // TBD: Replace redraw with rescale of individual sprites?

        // this.syncMaxAndMin();
        // if ((this.minValueInArray(tile.tileData.dense) !== this.maxAndMin.min) || (this.maxValueInArray(tile.tileData.dense) !== this.maxAndMin.max)) {
        //   // console.log(`BasicMultipleBarChart -> updateTile -> tile needs scale redraw`);
        //   if (tile.hasOwnProperty('mouseoverRawData') && tile.mouseoverRawData !== null) {
        //     // console.log(`clearing mouseover raw data`);
        //     for (var k in tile.mouseoverRawData) {
        //       if (tile.mouseoverRawData.hasOwnProperty(k)) {
        //         delete tile.mouseoverRawData[k];
        //       }
        //     }
        //     tile.mouseoverRawData = null;
        //   }
        //   this.renderedTileIds[tile.tileId] = false;
        //   this.renderTile(tile);
        // }
      }

      // this.rescaleTiles();
    }

    /**
     * Prevent BarTracks draw method from having an effect
     *
     * @param tile
     */
    drawTile(tile) {

    }

    /**
     * Draws exactly one tile.
     *
     * @param tile
     */
    renderTile(tile) {
      if (this.renderedTileIds[tile.tileId]) return;

      tile.svgData = null;
      tile.mouseOverData = null;

      const graphics = tile.graphics;
      graphics.clear();
      graphics.children.map(child => {graphics.removeChild(child)});
      tile.drawnAtScale = this._xScale.copy();

      // we're setting the start of the tile to the current zoom level
      const {tileX, tileWidth} = this.getTilePosAndDimensions(tile.tileData.zoomLevel,
        tile.tileData.tilePos, this.tilesetInfo.tile_size);

      const matrix = this.unFlatten(tile);

      this.oldDimensions = this.dimensions; // for mouseover

      // creates a sprite containing all of the rectangles in this tile
      try {
        this.drawVerticalBars(
          this.mapOriginalColors(matrix), 
          tileX, 
          tileWidth,
          this.maxAndMin.max, 
          this.maxAndMin.min, 
          tile);
  
        graphics.addChild(tile.sprite);
        this.makeMouseOverData(tile);
        this.renderedTileIds[tile.tileId] = true;
      }
      catch(err) {
        // console.log(`BasicMultipleBarChart -> renderTile(${tile.tileId}) TypeError`);
      }
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
        // console.log(`BasicMultipleBarChart -> syncMaxAndMin(${tile.tileId})`);
        // if (tile.minValue + tile.maxValue > this.maxAndMin.min + this.maxAndMin.max) {
        //   this.maxAndMin.min = tile.minValue;
        //   this.maxAndMin.max = tile.maxValue;
        // }
        // let localRangeAdjusted = false;
        if (tile.minValue < this.maxAndMin.min) {
          this.maxAndMin.min = tile.minValue;
        }
        if (tile.maxValue > this.maxAndMin.max) {
          this.maxAndMin.max = tile.maxValue;
        }
      });
    }

    /**
     * Tests deep equality of two Objects
     */
    deepEqual(x, y) {
      const ok = Object.keys, tx = typeof x, ty = typeof y;
      return x && y && tx === 'object' && tx === ty ? (
        ok(x).length === ok(y).length &&
          ok(x).every(key => this.deepEqual(x[key], y[key]))
      ) : (x === y);
    }

    /**
     * Rescales the sprites of all visible tiles when zooming and panning.
     */
    rescaleTiles() {
      const visibleAndFetched = this.visibleAndFetchedTiles();

      const visibleTileIds = visibleAndFetched.map(a => a.tileId);
      const renderedTileIds = Object.keys(this.renderedTileIds);

      // we do not rescale all tiles until all visible tiles are rendered
      if (!this.deepEqual(visibleTileIds, renderedTileIds)) return;

      // set global min/max range
      this.syncMaxAndMin();

      visibleAndFetched.map(a => {
        if (!this.rescaledTileIds[a.tileId]) {
          const valueToPixels = scaleLinear()
            .domain([0, this.maxAndMin.max + Math.abs(this.maxAndMin.min)])
            .range([0, this.dimensions[1]]);
          const newZero = this.dimensions[1] - valueToPixels(Math.abs(this.maxAndMin.min));
          const height = valueToPixels(this.maxAndMin.max + Math.abs(this.maxAndMin.min));
          const sprite = a.sprite;
          const y = newZero - valueToPixels(this.maxAndMin.max);
          if (sprite) {
            sprite.height = height;
            sprite.y = y;
            this.rescaledTileIds[a.tileId] = true;
          }
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
        if (this.options.hideColorByIndex) {
          if (i === this.options.hideColorByIndex) {
            colorHexMap[colorScale[i]] = colorToHex("#ffffff");
          }
        }
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
        //const localPositiveMax = temp.filter(a => a >= 0).reduce((a, b) => a + b, 0);
        const localPositiveMax = Math.max(...temp.filter(a => a >= 0));
        if (localPositiveMax > maxAndMin.max) {
          maxAndMin.max = localPositiveMax;
        }

        // When dealing with states data we have positive values including 0
        // maxAndMin.min should be 0 in this case
        let negativeValues = temp.filter(a => a <= 0);

        if (negativeValues.length > 0) {
          negativeValues = negativeValues.map(a => Math.abs(a));
          //const localNegativeMax = negativeValues.reduce((a, b) => a + b, 0); // check
          const localNegativeMax = Math.min(...negativeValues);
          if (maxAndMin.min === null || localNegativeMax > maxAndMin.min) {
            maxAndMin.min = localNegativeMax;
          }
        }
        else {
          maxAndMin.min = 0;
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
          // console.warn('Negative values present in data. Defaulting to exponential scale.');
          this.options.valueScaling = 'exponential';
        }

        const unflattenedData = this.simpleUnFlatten(tile, flattenedArray);

        const maxAndMin = this.findMaxAndMin(unflattenedData.matrix);

        tile.matrix = unflattenedData.matrix;
        tile.maxValue = maxAndMin.max;
        tile.minValue = maxAndMin.min;

        this.syncMaxAndMin();

        return unflattenedData.matrix;
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
        const idxs = [];
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

        let max = -1;

        for (let col = 0; col < shapeY; col++) {
          for (let row = 0; row < shapeX; row++) {
            if (max < matrix[col][row]) max = matrix[col][row];
          }
          // idxs[col] = this.remapVectorToSortedIndices(matrix[col]);
          // matrix[col] = this.remapVectorToStateSortedDeltas(matrix[col]);
        }
        // console.log(`matrix max ${max}`);

        return { matrix };
      }

    /**
     * Remap input vector into a vector of state-sorted indices
     * 
     * @param {Array} 1d array of numbers
     * @returns {Array} 1d array of indices of sorted array
     */

    remapVectorToSortedIndices(vector) {
      const len = vector.length - 1, res = Array(len + 1);
      const idxs = [...vector].map((d, i) => { return { i:i, d:d }}).sort((a, b) => (a.d > b.d) ? 1 : -1).map((d) => d.i);
      return idxs;
    }

    /**
     * Remap input vector into a vector of state-sorted delta scores
     * 
     * @param {Array} 1d array of numbers
     * @returns {Array} 1d array of deltas ("diffs") sorted by state
     */

    remapVectorToStateSortedDeltas(vector) {
      var i = 0;
      const len = vector.length - 1, res = Array(len + 1);
      const idxs = [...res.keys()].sort((a, b) => vector[a] - vector[b]);
      res[idxs[i]] = vector[idxs[i]];
      while (i++ < len) { res[idxs[i]] = vector[idxs[i]] - vector[idxs[i - 1]] }
      return res;
    }
    
    /**
     * Remap input vector into a list of stacked state-delta objects
     * 
     * @param vector 1d array of numbers
     * @returns {Array} 1d array of state-delta objects, ordered by value
     */
    remapVectorToStateDeltas(vector) {
      const indices = [...Array(vector.length).keys()];
      indices.sort(function (a, b) { return vector[a] < vector[b] ? -1 : vector[a] > vector[b] ? 1 : 0; });
      const sortColByValue = [];
      indices.forEach((d, i) => sortColByValue.push({i: indices[i], d : vector[indices[i]]}));
      const deltas = new Array(vector.length);
      deltas[0] = sortColByValue[0];
      for (let i = 1; i < vector.length; ++i) deltas[i] = {i: sortColByValue[i].i, d: sortColByValue[i].d - sortColByValue[i - 1].d};
      return deltas;
    }

    sortStateDeltasByState(deltas) {
      let resortedDeltas = [...deltas];
      resortedDeltas.sort((a, b) => (a.i > b.i) ? 1 : -1);
      return resortedDeltas;
    }

    sortStateDeltasByValue(deltas) {
      let resortedDeltas = [...deltas];
      resortedDeltas.sort((a, b) => (a.d > b.d) ? 1 : -1);
      return resortedDeltas;
    }

    remapVectorToUndiffedStateDeltas(vector) {
      const indices = [...Array(vector.length).keys()];
      indices.sort(function (a, b) { return vector[a] < vector[b] ? -1 : vector[a] > vector[b] ? 1 : 0; });
      const pairs = [];
      indices.forEach((d, i) => pairs.push({i: indices[i], d : vector[indices[i]]}));
      return pairs;
    }

    /**
     * Add up scores from score-sorted deltas, up to and including the specified state
     * Used for mouseover value calculation
     * 
     * @param {Array} deltas 
     * @param {Number} state 
     * @returns {Number} accumulated state score value
     */
    accumulateStateDeltasUpToState(deltas, state) {
      let acc = 0;
      for (let idx = 0; idx < deltas.length; idx++) {
        const delta = deltas[idx];
        acc += delta.d;
        if (delta.i === state) break;
      }
      return acc;
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
        positive.reverse();
        negative.reverse();
        
        // if (this.options.sortLargestOnTop) {
        //   positive.sort((a, b) => a.value - b.value);
        //   negative.sort((a, b) => b.value - a.value);
        // }
        // else {
        //   positive.sort((a, b) => b.value - a.value);
        //   negative.sort((a, b) => a.value - b.value);
        // }

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

      this.syncMaxAndMin();

      //positiveMax = 19;

      const trueMax = (this.options.valueScaleMax === -1.0) ? positiveMax : this.options.valueScaleMax;
      // console.log(`BasicMultipleBarChart | drawVerticalBars | positiveMax ${positiveMax} trueMax ${trueMax}`);

      // get amount of trackHeight reserved for positive and for negative
      const unscaledHeight = positiveMax + (Math.abs(negativeMax));

      // fraction of the track devoted to positive values
      const positiveTrackHeight = (positiveMax * trackHeight) / unscaledHeight;

      // fraction of the track devoted to negative values
      const negativeTrackHeight = (Math.abs(negativeMax) * trackHeight) / unscaledHeight;

      const positiveRowHeight = positiveTrackHeight / this.numCategories;
      const negativeRowHeight = negativeTrackHeight / this.numCategories;

      let start = null;
      let lowestY = this.dimensions[1];

      const width = 10;

      // calls drawBackground in PixiTrack.js
      this.drawBackground(matrix, this.textureGraphics);

      // borders around each bar
      // if (this.options.barBorder) {
      //   this.textureGraphics.lineStyle(1, 0x000000, 1);
      // }

      const backgroundHex = "#000000";
      const backgroundPixiColor = colorToHex(backgroundHex);

      // const valueToPixelsPositive = scaleLinear()
      //   .domain([0, positiveMax])
      //   .range([0, positiveRowHeight]);

      const valueToPixelsPositive = scaleLinear()
        .domain([0, trueMax])
        .range([0, positiveRowHeight]);

      for (let j = 0; j < matrix.length; j++) { // jth vertical bar in the graph
        const x = (j * width);
        (j === 0) ? start = x : start;

        // draw positive values
        const positive = matrix[j][0];
        
        // const valueToPixelsPositive = scaleLinear()
        //   .domain([0, positiveMax])
        //   .range([0, positiveTrackHeight]);
        
        let positiveStackedHeight = 0;

        // this.textureGraphics.beginFill(colorToHex("#ffffff"));
        // this.textureGraphics.drawRect(0, positiveTrackHeight, this.dimensions[0], this.dimensions[1]);

        for (let i = 0; i < positive.length; i++) {
          
          let clippedPosVal = positive[i].value;
          if ((this.options.valueScaleMax !== -1) && (positive[i].value > this.options.valueScaleMax)) {
            clippedPosVal = this.options.valueScaleMax;
          } 
          // const height = valueToPixelsPositive(positive[i].value) < 0.5 ? 1 : valueToPixelsPositive(positive[i].value);
          const height = valueToPixelsPositive(clippedPosVal) < 0.5 ? 1 : valueToPixelsPositive(clippedPosVal);

          //const y = positiveTrackHeight - (positiveStackedHeight + height);
          //const y = positiveRowHeight - (positiveStackedHeight + height);
          const y = positiveTrackHeight - positiveStackedHeight - height;
          
          // SVG coordinate system has inverted y-axis?
          //this.addSVGInfo(tile, x, positiveTrackHeight - (positiveRowHeight * i) + (positiveRowHeight - height), width, height, positive[i].color);
          //this.addSVGInfo(tile, x, positiveRowHeight * (positive.length - i) - height + positiveRowHeight/2 + 7, width, height, positive[i].color);

          this.addSVGInfo(tile, x, y, width, height, positive[i].color);
          //this.addSVGInfo(tile, x, positiveRowHeight * (positive.length - i) - 10, width, positiveRowHeight, positive[i].color);

          // const mY0 = y + height - 53; // y + height; // positiveRowHeight * (positive.length - i) - 10
          // const mYh = positiveRowHeight; //mY0 - height; // height; // positiveRowHeight
          // this.addMouseoverRawInfo(tile, x, mY0, width, mYh, positive[i].color);

          //this.textureGraphics.beginFill(this.colorHexMap[positive[i].color], !this.options.hideColorByIndex ? 1 : ((positive[i].color === "#ffffff") ? 0 : 1));
          
          // this.textureGraphics.beginFill(this.colorHexMap[positive[i].color], (valueToPixelsPositive(positive[i].value) < 1) ? 0.33 : 1);

          this.textureGraphics.beginFill(this.colorHexMap[positive[i].color], (valueToPixelsPositive(clippedPosVal) < 1) ? 0.33 : 1);
          this.textureGraphics.drawRect(x, y, width, height);
          this.textureGraphics.endFill();

          // this.addSVGInfo(tile, x, i * positiveRowHeight, width, positiveRowHeight - height, "#ffffff");

          // this.textureGraphics.beginFill(colorToHex("#ffffff"));
          // this.textureGraphics.drawRect(x, i * positiveRowHeight, width, positiveRowHeight - height);
          // this.textureGraphics.endFill();

          // positiveStackedHeight = positiveStackedHeight + height;
          positiveStackedHeight = positiveStackedHeight + positiveRowHeight;

          if (lowestY > y)
            lowestY = y;
        }

        // draw negative values, if there are any

        // if(Math.abs(negativeMax)>0){
        //   const negative = matrix[j][1];
        //   const valueToPixelsNegative = scaleLinear()
        //     .domain([-Math.abs(negativeMax), 0])
        //     .range([negativeTrackHeight, 0]);
        //   let negativeStackedHeight = 0;
        //   for (let i = 0; i < negative.length; i++) {
        //     const height = valueToPixelsNegative(negative[i].value);
        //     const y = positiveTrackHeight + negativeStackedHeight;
        //     this.addSVGInfo(tile, x, y, width, height, negative[i].color);
        //     this.textureGraphics.beginFill(this.colorHexMap[negative[i].color], !this.options.hideColorByIndex ? 1 : ((negative[i].color === "#ffffff") ? 0 : 1));
        //     this.textureGraphics.drawRect(x, y, width, height);
        //     negativeStackedHeight = negativeStackedHeight + height;
        //   }
        // }
      }

      this.addSVGInfo(tile, 0, 0, matrix.length * width, lowestY, backgroundHex);
      this.textureGraphics.beginFill(backgroundPixiColor);
      this.textureGraphics.drawRect(0, 0, matrix.length * width, lowestY);
      this.textureGraphics.endFill();

      const diff = positiveRowHeight - lowestY;
      // const diff = positiveRowHeight - valueToPixelsPositive(tile.maxValue); // positiveRowHeight - lowestY;

      for (let j = 0; j < matrix.length; j++) { // jth vertical bar in the graph
        const x = (j * width);
        (j === 0) ? start = x : start;

        // draw positive values
        const positive = matrix[j][0];
        let positiveStackedHeight = 0;

        for (let i = 0; i < positive.length; i++) {
          const height = valueToPixelsPositive(positive[i].value);
          const y = positiveTrackHeight - positiveStackedHeight - height;
          const mY0 = parseInt(positiveTrackHeight - positiveStackedHeight - diff); // parseInt(y - diff); // y + height; // - diff;
          const mYh = parseInt(positiveRowHeight);
          this.addMouseoverRawInfo(tile, x, mY0, width, mYh, positive[i].color);
          positiveStackedHeight = positiveStackedHeight + positiveRowHeight;
        }
      }

      try {
        // vertical bars are drawn onto the graphics object
        // and a texture is generated from that
        const texture = pixiRenderer.generateTexture(
          this.textureGraphics, 
          HGC.libraries.PIXI.SCALE_MODES.NEAREST
        );
        const sprite = new HGC.libraries.PIXI.Sprite(texture);
        sprite.width = this._xScale(tileX + tileWidth) - this._xScale(tileX);
        sprite.x = this._xScale(tileX);
        tile.sprite = sprite;
        tile.lowestY = lowestY;
      }
      catch(err) {
        // console.log(`BasicMultipleBarChart -> drawVerticalBars(${tile.tileId}) TypeError`);
      }
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
     * Adds untransformed information for mouseover behavior
     *
     * @param tile
     * @param x x value of bar
     * @param y y value of bar
     * @param width width of bar
     * @param height height of bar
     * @param color color of bar (not converted to hex)
     */
    addMouseoverRawInfo(tile, x, y, width, height, color) {
      if (tile.hasOwnProperty('mouseoverRawData') && tile.mouseoverRawData !== null) {
        tile.mouseoverRawData.barXValues.push(x);
        tile.mouseoverRawData.barYValues.push(y);
        tile.mouseoverRawData.barWidths.push(width);
        tile.mouseoverRawData.barHeights.push(height);
        tile.mouseoverRawData.barColors.push(color);
      }
      else {
        tile.mouseoverRawData = {
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
      visibleAndFetched.map(a => { 
        if (a.hasOwnProperty('mouseoverRawData') && a.mouseoverRawData !== null) {
          // console.log(`clearing mouseover raw data`);
          for (var k in a.mouseoverRawData) {
            if (a.mouseoverRawData.hasOwnProperty(k)) {
              delete a.mouseoverRawData[k];
            }
          }
          a.mouseoverRawData = null;
        }
        this.initTile(a);
      });
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

      return min;
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

      return max;
    }

    /**
     * Sorts relevant data for mouseover for easy iteration later
     *
     * @param tile
     */
    makeMouseOverData(tile) {
      const shapeX = this.numCategories; // 15 number of different nucleotides in each bar
      const shapeY = tile.tileData.shape[1]; // 3840 number of bars
      const barYValues = tile.mouseoverRawData.barYValues;
      const barHeights = tile.mouseoverRawData.barHeights;
      const barColors = tile.mouseoverRawData.barColors;
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

        // tile.lowestY is needed to shift the plot downwards into full vertical alignment
        const xOffset = tile.sprite.x;
        const yOffset = tile.sprite.y + tile.lowestY;
        const xScale = tile.sprite.scale.x;
        const yScale = tile.sprite.scale.y;

        // place each sprite
        g.setAttribute(
          'transform',
          ` translate(${xOffset},${yOffset}) rotate(${rotation}) scale(${xScale},${yScale}) `,
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
     * @param isShiftDown whether shift is pressed
     * @returns string with embedded values and svg square for color
     */
    getMouseOverHtml(trackX, trackY, isShiftDown) {
      if (!this.tilesetInfo || (!this.options.showTooltip && !isShiftDown))
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
            if (color === "#ffffff") return '';
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

            const itemRGBMarkup = `<svg width="10" height="10"><rect width="10" height="10" rx="2" ry="2" style="fill:${color};stroke:black;stroke-width:2;"></svg> ${type}`;

            const dataX = this._xScale.invert(trackX);
            let positionText = null;
            if (this.options.chromInfo && this.options.binSize) {
              const atcX = absToChr(dataX, this.options.chromInfo);
              const chrom = atcX[0];
              const position = Math.ceil(atcX[1] / this.options.binSize) * this.options.binSize - this.options.binSize;
              positionText = `${chrom}:${position}`;
            }
            let output = "";
            output += `<div class="track-mouseover-menu-table">`;
            if (positionText) {
              output += `
              <div class="track-mouseover-menu-table-item">
                <label for="position" class="track-mouseover-menu-table-item-label">Position</label>
                <div name="position" class="track-mouseover-menu-table-item-value">${positionText}</div>
              </div>
              `;
            }
            output += `
              <div class="track-mouseover-menu-table-item">
                <label for="normalizedDensity" class="track-mouseover-menu-table-item-label">Normalized density</label>
                <div name="normalizedDensity" class="track-mouseover-menu-table-item-value">${value}</div>
              </div>
              <div class="track-mouseover-menu-table-item">
                <label for="category" class="track-mouseover-menu-table-item-label">Category</label>
                <div name="category" class="track-mouseover-menu-table-item-value">${itemRGBMarkup}</div>
              </div>
            `;
            output += `</div>`

            return output;
          }
        }
      }

    }

    draw() {
      super.draw();
    }

  }
  return new BasicMultipleBarChartClass(...args);
};

const icon = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 5640 5420" preserveAspectRatio="xMidYMid meet"> <g id="layer101" fill="#000000" stroke="none"> <path d="M0 2710 l0 -2710 2820 0 2820 0 0 2710 0 2710 -2820 0 -2820 0 0 -2710z"/> </g> <g id="layer102" fill="#750075" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> <path d="M4340 2710 l0 -2510 560 0 560 0 0 2510 0 2510 -560 0 -560 0 0 -2510z"/> <path d="M200 1870 l0 -1670 630 0 630 0 0 1670 0 1670 -630 0 -630 0 0 -1670z"/> <path d="M1660 1810 l0 -1610 570 0 570 0 0 1610 0 1610 -570 0 -570 0 0 -1610z"/> <path d="M3000 840 l0 -640 570 0 570 0 0 640 0 640 -570 0 -570 0 0 -640z"/> </g> <g id="layer103" fill="#ffff04" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> </g> </svg>';

// default
BasicMultipleBarChart.config = {
  type: 'basic-multiple-bar-chart',
  datatype: ['multivec', 'epilogos'],
  local: false,
  orientation: '1d-horizontal',
  thumbnail: new DOMParser().parseFromString(icon, 'text/xml').documentElement,
  availableOptions: ['labelPosition', 'labelColor', 'valueScaling',
    'labelTextOpacity', 'labelBackgroundOpacity', 'trackBorderWidth',
    'trackBorderColor', 'trackType', 'scaledHeight', 'backgroundColor',
    'colorScale', 'barBorder', 'sortLargestOnTop', 'selectRows', 'showTooltip'],
  defaultOptions: {
    labelPosition: 'topLeft',
    labelColor: 'black',
    labelTextOpacity: 0.4,
    valueScaling: 'linear',
    trackBorderWidth: 0,
    trackBorderColor: 'black',
    showTooltip: true,
  }
};


export default BasicMultipleBarChart;
