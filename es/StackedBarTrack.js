var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { scaleLinear, scaleOrdinal, schemeCategory10 } from 'd3-scale';

var StackedBarTrack = function StackedBarTrack(HGC) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (!new.target) {
    throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
  }

  // Services
  var _HGC$services = HGC.services,
      tileProxy = _HGC$services.tileProxy,
      pixiRenderer = _HGC$services.pixiRenderer;

  // Utils

  var colorToHex = HGC.utils.colorToHex;

  var StackedBarTrackClass = function (_HGC$tracks$BarTrack) {
    _inherits(StackedBarTrackClass, _HGC$tracks$BarTrack);

    function StackedBarTrackClass(context, options) {
      _classCallCheck(this, StackedBarTrackClass);

      var _this = _possibleConstructorReturn(this, (StackedBarTrackClass.__proto__ || Object.getPrototypeOf(StackedBarTrackClass)).call(this, context, options));

      _this.maxAndMin = {
        max: null,
        min: null
      };

      return _this;
    }

    _createClass(StackedBarTrackClass, [{
      key: 'initTile',
      value: function initTile(tile) {
        // create the tile
        // should be overwritten by child classes
        this.scale.minRawValue = this.minVisibleValue();
        this.scale.maxRawValue = this.maxVisibleValue();

        this.scale.minValue = this.scale.minRawValue;
        this.scale.maxValue = this.scale.maxRawValue;

        this.maxAndMin.max = this.scale.maxValue;
        this.maxAndMin.min = this.scale.minValue;

        // console.log('initTile:', tile.tileId, this.maxAndMin);
        // tile.minValue = this.scale.minValue;

        this.localColorToHexScale();

        this.unFlatten(tile);

        this.renderTile(tile);
        this.rescaleTiles();
      }
    }, {
      key: 'rerender',
      value: function rerender(newOptions) {
        _get(StackedBarTrackClass.prototype.__proto__ || Object.getPrototypeOf(StackedBarTrackClass.prototype), 'rerender', this).call(this, newOptions);

        this.options = newOptions;
        var visibleAndFetched = this.visibleAndFetchedTiles();

        for (var i = 0; i < visibleAndFetched.length; i++) {
          this.updateTile(visibleAndFetched[i]);
        }

        this.rescaleTiles();
      }
    }, {
      key: 'updateTile',
      value: function updateTile() {
        var visibleAndFetched = this.visibleAndFetchedTiles();

        for (var i = 0; i < visibleAndFetched.length; i++) {
          var tile = visibleAndFetched[i];
          this.unFlatten(tile);
        }

        this.rescaleTiles();
      }

      /**
       * Prevent BarTracks draw method from having an effect
       *
       * @param tile
       */

    }, {
      key: 'drawTile',
      value: function drawTile(tile) {}

      /**
       * Draws exactly one tile.
       *
       * @param tile
       */

    }, {
      key: 'renderTile',
      value: function renderTile(tile) {
        tile.svgData = null;
        tile.mouseOverData = null;

        var graphics = tile.graphics;
        graphics.clear();
        graphics.children.map(function (child) {
          graphics.removeChild(child);
        });
        tile.drawnAtScale = this._xScale.copy();

        // we're setting the start of the tile to the current zoom level

        var _getTilePosAndDimensi = this.getTilePosAndDimensions(tile.tileData.zoomLevel, tile.tileData.tilePos, this.tilesetInfo.tile_size),
            tileX = _getTilePosAndDimensi.tileX,
            tileWidth = _getTilePosAndDimensi.tileWidth;

        var matrix = this.unFlatten(tile);

        this.oldDimensions = this.dimensions; // for mouseover

        // creates a sprite containing all of the rectangles in this tile
        this.drawVerticalBars(this.mapOriginalColors(matrix), tileX, tileWidth, this.maxAndMin.max, this.maxAndMin.min, tile);

        // console.log('tile.sprite', tile.sprite.x, tile.sprite.y, tile.sprite.scale.x, tile.sprite.scale.y)
        // console.log('this.maxAndMin', this.maxAndMin);

        graphics.addChild(tile.sprite);
        this.makeMouseOverData(tile);
      }
    }, {
      key: 'syncMaxAndMin',
      value: function syncMaxAndMin() {
        var _this2 = this;

        var visibleAndFetched = this.visibleAndFetchedTiles();

        visibleAndFetched.map(function (tile) {
          // console.log('tile:', tile.tileId, tile.minValue, tile.maxValue);

          if (tile.minValue + tile.maxValue > _this2.maxAndMin.min + _this2.maxAndMin.max) {
            _this2.maxAndMin.min = tile.minValue;
            _this2.maxAndMin.max = tile.maxValue;
          }
          // if (!(this.maxAndMin && this.maxAndMin.min && this.maxAndMin.min < tile.minValue)) {
          //   this.maxAndMin.min = tile.minValue;
          // }

          // if (!(this.maxAndMin && this.maxAndMin.max && this.maxAndMin.max > tile.maxValue)) {
          //   this.maxAndMin.max = tile.maxValue;
          // }
          // console.log('this.maxAndMin:', this.maxAndMin);
        });
      }

      /**
       * Rescales the sprites of all visible tiles when zooming and panning.
       */

    }, {
      key: 'rescaleTiles',
      value: function rescaleTiles() {
        var _this3 = this;

        // console.log('rescale:')
        var visibleAndFetched = this.visibleAndFetchedTiles();

        this.syncMaxAndMin();

        // console.log('maxAndMin:', this.maxAndMin);

        visibleAndFetched.map(function (a) {
          var valueToPixels = scaleLinear().domain([0, _this3.maxAndMin.max + Math.abs(_this3.maxAndMin.min)]).range([0, _this3.dimensions[1]]);
          var newZero = _this3.dimensions[1] - valueToPixels(Math.abs(_this3.maxAndMin.min));
          var height = valueToPixels(a.minValue + a.maxValue);
          var sprite = a.sprite;
          var y = newZero - valueToPixels(a.maxValue);

          if (sprite) {
            sprite.height = height;

            sprite.y = y;
          }
        });
      }

      /**
       * Converts all colors in a colorScale to Hex colors.
       */

    }, {
      key: 'localColorToHexScale',
      value: function localColorToHexScale() {
        var colorScale = this.options.colorScale || scaleOrdinal(schemeCategory10);
        var colorHexMap = {};
        for (var i = 0; i < colorScale.length; i++) {
          colorHexMap[colorScale[i]] = colorToHex(colorScale[i]);
        }
        this.colorHexMap = colorHexMap;
      }

      /**
       * Find max and min heights for the given tile
       *
       * @param matrix 2d array of numbers representing one tile
       */

    }, {
      key: 'findMaxAndMin',
      value: function findMaxAndMin(matrix) {
        // find max height of bars for scaling in the track
        var maxAndMin = {
          max: null,
          min: null
        };

        for (var i = 0; i < matrix.length; i++) {
          var temp = matrix[i];

          // find total heights of each positive column and each negative column
          // and compare to highest value so far for the tile
          var localPositiveMax = temp.filter(function (a) {
            return a >= 0;
          }).reduce(function (a, b) {
            return a + b;
          }, 0);
          if (localPositiveMax > maxAndMin.max) {
            maxAndMin.max = localPositiveMax;
          }

          var negativeValues = temp.filter(function (a) {
            return a < 0;
          });
          // console.log('negativeValues:', negativeValues);

          if (negativeValues.length > 0) {
            negativeValues = negativeValues.map(function (a) {
              return Math.abs(a);
            });
            var localNegativeMax = negativeValues.reduce(function (a, b) {
              return a + b;
            }, 0); // check
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

    }, {
      key: 'unFlatten',
      value: function unFlatten(tile) {
        if (tile.matrix) {
          return tile.matrix;
        }

        var flattenedArray = tile.tileData.dense;

        // if any data is negative, switch to exponential scale
        if (flattenedArray.filter(function (a) {
          return a < 0;
        }).length > 0 && this.options.valueScaling === 'linear') {
          console.warn('Negative values present in data. Defaulting to exponential scale.');
          this.options.valueScaling = 'exponential';
        }

        var matrix = this.simpleUnFlatten(tile, flattenedArray);

        var maxAndMin = this.findMaxAndMin(matrix);
        // console.log('unflatten', tile.tileId, maxAndMin.min, maxAndMin.max);

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

    }, {
      key: 'simpleUnFlatten',
      value: function simpleUnFlatten(tile, data) {
        var shapeX = tile.tileData.shape[0]; // number of different nucleotides in each bar
        var shapeY = tile.tileData.shape[1]; // number of bars

        // matrix[0] will be [flattenedArray[0], flattenedArray[256], flattenedArray[512], etc.]
        // because of how flattenedArray comes back from the server.
        var matrix = [];
        for (var i = 0; i < shapeX; i++) {
          // 6
          for (var j = 0; j < shapeY; j++) {
            // 256;
            var singleBar = void 0;
            if (matrix[j] === undefined) {
              singleBar = [];
            } else {
              singleBar = matrix[j];
            }
            singleBar.push(data[shapeY * i + j]);
            matrix[j] = singleBar;
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

    }, {
      key: 'mapOriginalColors',
      value: function mapOriginalColors(matrix) {
        var colorScale = this.options.colorScale || scaleOrdinal(schemeCategory10);

        // mapping colors to unsorted values
        var matrixWithColors = [];
        for (var j = 0; j < matrix.length; j++) {
          var columnColors = [];

          for (var i = 0; i < matrix[j].length; i++) {
            columnColors[i] = {
              value: isNaN(matrix[j][i]) ? 0 : matrix[j][i],
              color: colorScale[i]
            };
          }

          // separate positive and negative array values
          var positive = [];
          var negative = [];
          for (var _i = 0; _i < columnColors.length; _i++) {
            if (columnColors[_i].value >= 0) {
              positive.push(columnColors[_i]);
            } else if (columnColors[_i].value < 0) {
              negative.push(columnColors[_i]);
            }
          }
          if (this.options.sortLargestOnTop) {
            positive.sort(function (a, b) {
              return a.value - b.value;
            });
            negative.sort(function (a, b) {
              return b.value - a.value;
            });
          } else {
            positive.sort(function (a, b) {
              return b.value - a.value;
            });
            negative.sort(function (a, b) {
              return a.value - b.value;
            });
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

    }, {
      key: 'drawVerticalBars',
      value: function drawVerticalBars(matrix, tileX, tileWidth, positiveMax, negativeMax, tile) {
        var graphics = new HGC.libraries.PIXI.Graphics();
        var trackHeight = this.dimensions[1];
        // console.log('drawing vertical:', trackHeight, positiveMax, negativeMax);

        // get amount of trackHeight reserved for positive and for negative
        var unscaledHeight = positiveMax + Math.abs(negativeMax);

        // fraction of the track devoted to positive values
        var positiveTrackHeight = positiveMax * trackHeight / unscaledHeight;

        // fraction of the track devoted to negative values
        var negativeTrackHeight = Math.abs(negativeMax) * trackHeight / unscaledHeight;

        // console.log('positiveTrackHeight', tile.tileId, positiveTrackHeight);

        var start = null;
        var lowestY = this.dimensions[1];

        var width = 10;

        // calls drawBackground in PixiTrack.js
        this.drawBackground(matrix, graphics);

        // borders around each bar
        if (this.options.barBorder) {
          graphics.lineStyle(1, 0x000000, 1);
        }

        for (var j = 0; j < matrix.length; j++) {
          // jth vertical bar in the graph
          var x = j * width;
          j === 0 ? start = x : start;

          // draw positive values
          var positive = matrix[j][0];
          var valueToPixelsPositive = scaleLinear().domain([0, positiveMax]).range([0, positiveTrackHeight]);
          var positiveStackedHeight = 0;
          for (var i = 0; i < positive.length; i++) {
            var height = valueToPixelsPositive(positive[i].value);
            var y = positiveTrackHeight - (positiveStackedHeight + height);
            this.addSVGInfo(tile, x, y, width, height, positive[i].color);
            graphics.beginFill(this.colorHexMap[positive[i].color]);
            graphics.drawRect(x, y, width, height);
            positiveStackedHeight = positiveStackedHeight + height;
            if (lowestY > y) lowestY = y;
          }

          // draw negative values
          var negative = matrix[j][1];
          var valueToPixelsNegative = scaleLinear().domain([-Math.abs(negativeMax), 0]).range([negativeTrackHeight, 0]);
          var negativeStackedHeight = 0;
          for (var _i2 = 0; _i2 < negative.length; _i2++) {
            var _height = valueToPixelsNegative(negative[_i2].value);
            var _y = positiveTrackHeight + negativeStackedHeight;
            this.addSVGInfo(tile, x, _y, width, _height, negative[_i2].color);
            graphics.beginFill(this.colorHexMap[negative[_i2].color]);
            graphics.drawRect(x, _y, width, _height);
            negativeStackedHeight = negativeStackedHeight + _height;
          }
        }

        // vertical bars are drawn onto the graphics object
        // and a texture is generated from that
        var texture = pixiRenderer.generateTexture(graphics, HGC.libraries.PIXI.SCALE_MODES.NEAREST);
        var sprite = new HGC.libraries.PIXI.Sprite(texture);
        sprite.width = this._xScale(tileX + tileWidth) - this._xScale(tileX);
        sprite.x = this._xScale(tileX);
        tile.sprite = sprite;
        tile.lowestY = lowestY;
        // console.log('new lowestY:', tile.tileId, lowestY, tile.svgData);;
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

    }, {
      key: 'addSVGInfo',
      value: function addSVGInfo(tile, x, y, width, height, color) {
        if (tile.hasOwnProperty('svgData') && tile.svgData !== null) {
          tile.svgData.barXValues.push(x);
          tile.svgData.barYValues.push(y);
          tile.svgData.barWidths.push(width);
          tile.svgData.barHeights.push(height);
          tile.svgData.barColors.push(color);
        } else {
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

    }, {
      key: 'setDimensions',
      value: function setDimensions(newDimensions) {
        var _this4 = this;

        this.oldDimensions = this.dimensions;
        _get(StackedBarTrackClass.prototype.__proto__ || Object.getPrototypeOf(StackedBarTrackClass.prototype), 'setDimensions', this).call(this, newDimensions);

        var visibleAndFetched = this.visibleAndFetchedTiles();
        visibleAndFetched.map(function (a) {
          return _this4.initTile(a);
        });
      }

      /**
       * Sorts relevant data for mouseover for easy iteration later
       *
       * @param tile
       */

    }, {
      key: 'makeMouseOverData',
      value: function makeMouseOverData(tile) {
        var shapeX = tile.tileData.shape[0]; // 15 number of different nucleotides in each bar
        var shapeY = tile.tileData.shape[1]; // 3840 number of bars
        var barYValues = tile.svgData.barYValues;
        var barHeights = tile.svgData.barHeights;
        var barColors = tile.svgData.barColors;
        var mouseOverData = [];

        // console.log('barHeights:', barHeights);

        for (var i = 0; i < shapeX; i++) {
          for (var j = 0; j < shapeY; j++) {
            var index = j * shapeX + i;
            var dataPoint = {
              y: barYValues[index],
              height: barHeights[index],
              color: barColors[index]
            };
            mouseOverData[j] === undefined ? mouseOverData[j] = [dataPoint] : mouseOverData[j].push(dataPoint);
          }
        }
        for (var _i3 = 0; _i3 < mouseOverData.length; _i3++) {
          mouseOverData[_i3] = mouseOverData[_i3].sort(function (a, b) {
            return a.y - b.y;
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

    }, {
      key: 'exportSVG',
      value: function exportSVG() {
        var _this5 = this;

        var visibleAndFetched = this.visibleAndFetchedTiles();
        visibleAndFetched.map(function (tile) {
          _this5.initTile(tile);
          _this5.draw();
        });

        var track = null;
        var base = null;

        base = document.createElement('g');
        track = base;

        var _get$call = _get(StackedBarTrackClass.prototype.__proto__ || Object.getPrototypeOf(StackedBarTrackClass.prototype), 'superSVG', this).call(this);

        var _get$call2 = _slicedToArray(_get$call, 2);

        base = _get$call2[0];
        track = _get$call2[1];


        var output = document.createElement('g');
        track.appendChild(output);

        output.setAttribute('transform', 'translate(' + this.pMain.position.x + ',' + this.pMain.position.y + ') scale(' + this.pMain.scale.x + ',' + this.pMain.scale.y + ')');

        // this.realignSVG();

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.visibleAndFetchedTiles()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var tile = _step.value;

            var rotation = 0;
            var g = document.createElement('g');

            // place each sprite
            g.setAttribute('transform', ' translate(' + tile.sprite.x + ',' + tile.sprite.y + ') rotate(' + rotation + ') scale(' + tile.sprite.scale.x + ',' + tile.sprite.scale.y + ') ');

            var data = tile.svgData;

            // add each bar
            for (var i = 0; i < data.barXValues.length; i++) {
              var rect = document.createElement('rect');
              rect.setAttribute('fill', data.barColors[i]);
              rect.setAttribute('stroke', data.barColors[i]);

              rect.setAttribute('x', data.barXValues[i]);
              rect.setAttribute('y', data.barYValues[i] - tile.lowestY);
              rect.setAttribute('height', data.barHeights[i]);
              rect.setAttribute('width', data.barWidths[i]);
              if (tile.barBorders) {
                rect.setAttribute('stroke-width', '0.1');
                rect.setAttribute('stroke', 'black');
              }

              g.appendChild(rect);
            }

            output.appendChild(g);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
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

    }, {
      key: 'getMouseOverHtml',
      value: function getMouseOverHtml(trackX, trackY) {
        if (!this.tilesetInfo) return '';

        var colorScale = this.options.colorScale || scaleOrdinal(schemeCategory10);

        var zoomLevel = this.calculateZoomLevel();
        var tileWidth = tileProxy.calculateTileWidth(this.tilesetInfo, zoomLevel, this.tilesetInfo.tile_size);

        // the position of the tile containing the query position
        var tilePos = this._xScale.invert(trackX) / tileWidth;

        var posInTileX = Math.floor(this.tilesetInfo.tile_size * (tilePos - Math.floor(tilePos)));

        var tileId = this.tileToLocalId([zoomLevel, Math.floor(tilePos)]);
        var fetchedTile = this.fetchedTiles[tileId];

        if (!fetchedTile) return '';

        var matrixRow = fetchedTile.matrix[posInTileX];
        var row = fetchedTile.mouseOverData[posInTileX];

        // console.log('matrixRow:', matrixRow);

        var dataY = (trackY - fetchedTile.sprite.y) / fetchedTile.sprite.scale.y + fetchedTile.lowestY;

        // console.log('trackX:', trackX, 'trackY:', trackY, 'tilePos:',
        //   tilePos, 'posInTileX', posInTileX);
        // console.log('matrixRow:', matrixRow);

        // const dataY1 = dataY + fetchedTile.lowestY;
        // console.log('dataY', dataY, 'dataY1', dataY1);
        // console.log('fetchedTile:', fetchedTile);
        // console.log('trackY:', trackY, 'lowestY:', fetchedTile.lowestY);

        // row = this.scaleRow(row);

        //use color to map back to the array index for correct data
        var colorScaleMap = {};
        for (var i = 0; i < colorScale.length; i++) {
          colorScaleMap[colorScale[i]] = i;
        }

        // // if mousing over a blank area
        if (dataY < row[0].y || dataY >= row[row.length - 1].y + row[row.length - 1].height) {
          return '';
        } else {
          for (var _i4 = 0; _i4 < row.length; _i4++) {
            var y = row[_i4].y;
            var height = row[_i4].height;
            if (dataY > y && dataY <= y + height) {
              var color = row[_i4].color;
              var value = Number.parseFloat(matrixRow[colorScaleMap[color]]).toPrecision(4).toString();
              var type = this.tilesetInfo.row_infos[colorScaleMap[color]];

              return '<svg width="10" height="10"><rect width="10" height="10" rx="2" ry="2"\n            style="fill:' + color + ';stroke:black;stroke-width:2;"></svg>' + (' ' + type) + '<br>' + ('' + value);
            }
          }
        }
      }
    }, {
      key: 'draw',
      value: function draw() {
        _get(StackedBarTrackClass.prototype.__proto__ || Object.getPrototypeOf(StackedBarTrackClass.prototype), 'draw', this).call(this);
      }
    }]);

    return StackedBarTrackClass;
  }(HGC.tracks.BarTrack);

  return new (Function.prototype.bind.apply(StackedBarTrackClass, [null].concat(args)))();
};

var icon = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 5640 5420" preserveAspectRatio="xMidYMid meet"> <g id="layer101" fill="#000000" stroke="none"> <path d="M0 2710 l0 -2710 2820 0 2820 0 0 2710 0 2710 -2820 0 -2820 0 0 -2710z"/> </g> <g id="layer102" fill="#750075" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> <path d="M4340 2710 l0 -2510 560 0 560 0 0 2510 0 2510 -560 0 -560 0 0 -2510z"/> <path d="M200 1870 l0 -1670 630 0 630 0 0 1670 0 1670 -630 0 -630 0 0 -1670z"/> <path d="M1660 1810 l0 -1610 570 0 570 0 0 1610 0 1610 -570 0 -570 0 0 -1610z"/> <path d="M3000 840 l0 -640 570 0 570 0 0 640 0 640 -570 0 -570 0 0 -640z"/> </g> <g id="layer103" fill="#ffff04" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> </g> </svg>';

// default
StackedBarTrack.config = {
  type: 'horizontal-stacked-bar',
  datatype: ['multivec', 'epilogos'],
  local: false,
  orientation: '1d-horizontal',
  thumbnail: new DOMParser().parseFromString(icon, 'text/xml').documentElement,
  availableOptions: ['labelPosition', 'labelColor', 'valueScaling', 'labelTextOpacity', 'labelBackgroundOpacity', 'trackBorderWidth', 'trackBorderColor', 'trackType', 'scaledHeight', 'backgroundColor', 'colorScale', 'barBorder', 'sortLargestOnTop'],
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
    colorScale: ["#FF0000", "#FF4500", "#32CD32", "#008000", "#006400", "#C2E105", "#FFFF00", "#66CDAA", "#8A91D0", "#CD5C5C", "#E9967A", "#BDB76B", "#808080", "#C0C0C0", "#FFFFFF"]
  },
  otherOptions: {
    'epilogos': {
      scaledHeight: false
    }
  }
};

export default StackedBarTrack;