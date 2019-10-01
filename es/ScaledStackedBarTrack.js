var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { mix } from 'mixwith';
import { scaleLinear, scaleOrdinal, schemeCategory10 } from 'd3-scale';

var ScaledStackedBarTrack = function ScaledStackedBarTrack(HGC) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (!new.target) {
    throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
  }

  // Services
  var tileProxy = HGC.services.tileProxy;

  var ScaledStackedBarTrackClass = function (_mix$with) {
    _inherits(ScaledStackedBarTrackClass, _mix$with);

    function ScaledStackedBarTrackClass(context, options) {
      _classCallCheck(this, ScaledStackedBarTrackClass);

      var _this = _possibleConstructorReturn(this, (ScaledStackedBarTrackClass.__proto__ || Object.getPrototypeOf(ScaledStackedBarTrackClass)).call(this, context, options));

      _this.maxAndMin = {
        max: null,
        min: null
      };

      return _this;
    }

    /**
     * Draws exactly one tile.
     *
     * @param tile
     */


    _createClass(ScaledStackedBarTrackClass, [{
      key: 'renderTile',
      value: function renderTile(tile) {
        var graphics = tile.graphics;

        // remove all of this graphic's children
        for (var i = graphics.children.length - 1; i >= 0; i--) {
          graphics.removeChild(graphics.children[i]);
        }
        graphics.clear();
        tile.drawnAtScale = this._xScale.copy();

        // we're setting the start of the tile to the current zoom level

        var _getTilePosAndDimensi = this.getTilePosAndDimensions(tile.tileData.zoomLevel, tile.tileData.tilePos, this.tilesetInfo.tile_size),
            tileX = _getTilePosAndDimensi.tileX,
            tileWidth = _getTilePosAndDimensi.tileWidth;

        var matrix = this.unFlatten(tile);

        this.drawNormalizedBars(this.scaleMatrix(this.mapOriginalColors(matrix)), tileX, tileWidth, tile);
        graphics.addChild(tile.sprite);

        this.makeMouseOverData(tile);
      }

      /**
       * Rescales the sprites of all visible tiles when zooming and panning.
       */

    }, {
      key: 'rescaleTiles',
      value: function rescaleTiles() {
        var _this2 = this;

        var visibleAndFetched = this.visibleAndFetchedTiles();
        visibleAndFetched.map(function (a) {
          if (a.sprite) {
            a.sprite.height = _this2.dimensions[1];
            a.sprite.y = 0;
          }
        });
      }

      /**
       * Scales positive and negative values in the given matrix so that they each sum to 1.
       *
       * @param matrix call mapOriginalColors on this matrix before calling this function on it.
       */

    }, {
      key: 'scaleMatrix',
      value: function scaleMatrix(matrix) {
        var _loop = function _loop(i) {
          var positives = matrix[i][0];
          var negatives = matrix[i][1];

          var positiveArray = positives.map(function (a) {
            return a.value;
          });
          var negativeArray = negatives.map(function (a) {
            return a.value;
          });

          var positiveSum = positiveArray.length > 0 ? positiveArray.reduce(function (sum, a) {
            return sum + a;
          }) : 0;
          var negativeSum = negativeArray.length > 0 ? negativeArray.reduce(function (sum, a) {
            return sum + a;
          }) : 0;

          positives.map(function (a) {
            return a.value = a.value / positiveSum;
          });
          negatives.map(function (a) {
            return a.value = a.value / negativeSum;
          }); // these will be positive numbers
        };

        for (var i = 0; i < matrix.length; i++) {
          _loop(i);
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
              value: matrix[j][i],
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
       * Draws graph using normalized values.
       *
       * @param graphics PIXI.Graphics instance
       * @param matrix 2d array of numbers representing nucleotides
       * @param tileX starting position of tile
       * @param tileWidth pre-scaled width of tile
       * @param tile
       */

    }, {
      key: 'drawNormalizedBars',
      value: function drawNormalizedBars(matrix, tileX, tileWidth, tile) {
        var trackHeight = this.dimensions[1];
        var graphics = new HGC.libraries.PIXI.Graphics();
        var start = null;
        var lowestY = this.dimensions[1];

        // if (this.options.barBorder) {
        //   graphics.lineStyle(0.1, 'black', 1);
        //   tile.barBorders = true;
        // }

        for (var j = 0; j < matrix.length; j++) {
          // jth vertical bar in the graph
          var x = j; //this._xScale(tileX + (j * tileWidth / this.tilesetInfo.tile_size));
          var width = 1; //this._xScale(tileX + (tileWidth / this.tilesetInfo.tile_size)) - this._xScale(tileX);
          j === 0 ? start = x : start;
          // positives
          var valueToPixelsPositive = scaleLinear().domain([0, 1]).range([0, trackHeight / 2]);
          var positiveStackedHeight = 0;
          for (var i = 0; i < matrix[j][0].length; i++) {
            var height = valueToPixelsPositive(matrix[j][0][i].value);
            var y = trackHeight / 2 - (positiveStackedHeight + height);
            var color = matrix[j][0][i].color;
            this.addSVGInfo(tile, x, y, width, height, color);
            graphics.beginFill(this.colorHexMap[color], 1);
            graphics.drawRect(x, y, width, height);
            positiveStackedHeight = positiveStackedHeight + height;
            if (lowestY > y) lowestY = y;
          }
          positiveStackedHeight = 0;

          // negatives
          var valueToPixelsNegative = scaleLinear().domain([0, 1]).range([0, trackHeight / 2]);
          var negativeStackedHeight = 0;
          for (var _i2 = 0; _i2 < matrix[j][1].length; _i2++) {
            var _height = valueToPixelsNegative(matrix[j][1][_i2].value);
            var _y = trackHeight / 2 + negativeStackedHeight;
            var _color = matrix[j][1][_i2].color;
            this.addSVGInfo(tile, x, _y, width, _height, _color);
            graphics.beginFill(this.colorHexMap[_color], 1);
            graphics.drawRect(x, _y, width, _height);
            negativeStackedHeight = negativeStackedHeight + _height;
          }
          negativeStackedHeight = 0;
        }

        var texture = graphics.generateTexture(HGC.libraries.PIXI.SCALE_MODES.NEAREST);
        var sprite = new HGC.libraries.PIXI.Sprite(texture);
        sprite.width = this._xScale(tileX + tileWidth) - this._xScale(tileX);
        sprite.x = this._xScale(tileX);
        tile.sprite = sprite;
      }

      /**
       * Here, rerender all tiles every time track size is changed
       *
       * @param newDimensions
       */

    }, {
      key: 'setDimensions',
      value: function setDimensions(newDimensions) {
        var _this3 = this;

        _get(ScaledStackedBarTrackClass.prototype.__proto__ || Object.getPrototypeOf(ScaledStackedBarTrackClass.prototype), 'setDimensions', this).call(this, newDimensions);
        var visibleAndFetched = this.visibleAndFetchedTiles();
        visibleAndFetched.map(function (a) {
          return _this3.initTile(a);
        });
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
    }, {
      key: 'draw',
      value: function draw() {
        _get(ScaledStackedBarTrackClass.prototype.__proto__ || Object.getPrototypeOf(ScaledStackedBarTrackClass.prototype), 'draw', this).call(this);
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
        var barColors = tile.svgData.barColors;
        var barHeights = tile.svgData.barHeights;
        var mouseOverData = [];

        for (var i = 0; i < shapeX; i++) {
          for (var j = 0; j < shapeY; j++) {
            var index = j * shapeX + i;
            var dataPoint = {
              y: barYValues[index],
              color: barColors[index],
              height: barHeights[index]
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
    }, {
      key: 'exportSVG',
      value: function exportSVG() {
        var _this4 = this;

        var visibleAndFetched = this.visibleAndFetchedTiles();
        visibleAndFetched.map(function (tile) {
          _this4.initTile(tile);
        });

        var track = null;
        var base = null;

        base = document.createElement('g');
        track = base;

        var _get$call = _get(ScaledStackedBarTrackClass.prototype.__proto__ || Object.getPrototypeOf(ScaledStackedBarTrackClass.prototype), 'superSVG', this).call(this);

        var _get$call2 = _slicedToArray(_get$call, 2);

        base = _get$call2[0];
        track = _get$call2[1];


        var output = document.createElement('g');
        track.appendChild(output);

        output.setAttribute('transform', 'translate(' + this.pMain.position.x + ',' + this.pMain.position.y + ') scale(' + this.pMain.scale.x + ',' + this.pMain.scale.y + ')');

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.visibleAndFetchedTiles()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var tile = _step.value;

            var rotation = 0;
            var g = document.createElement('g');

            // place each sprite
            g.setAttribute('transform', 'translate(' + tile.sprite.x + ',' + tile.sprite.y + ') rotate(' + rotation + ') scale(' + tile.sprite.scale.x + ',' + tile.sprite.scale.y + ')');

            var data = tile.svgData;

            // add each bar
            for (var i = 0; i < data.barXValues.length; i++) {
              var rect = document.createElement('rect');
              rect.setAttribute('fill', data.barColors[i]);
              rect.setAttribute('stroke', data.barColors[i]);

              rect.setAttribute('x', data.barXValues[i]);
              rect.setAttribute('y', data.barYValues[i]);
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

        // use color to map back to the array index for correct data
        var colorScaleMap = {};
        for (var i = 0; i < colorScale.length; i++) {
          colorScaleMap[colorScale[i]] = i;
        }

        // // if mousing over a blank area
        if (trackY < row[0].y || trackY >= row[row.length - 1].y + row[row.length - 1].height) {
          return '';
        } else {
          for (var _i4 = 0; _i4 < row.length; _i4++) {
            if (trackY > row[_i4].y && trackY <= row[_i4].y + row[_i4].height) {
              var color = row[_i4].color;
              var value = Number.parseFloat(matrixRow[colorScaleMap[color]]).toPrecision(4).toString();
              var type = this.tilesetInfo.row_infos[colorScaleMap[color]];

              return '<svg width="10" height="10"><rect width="10" height="10" rx="2" ry="2"\n            style="fill:' + color + ';stroke:black;stroke-width:2;"></svg>' + (' ' + type) + '<br>' + ('' + value);
            }
          }
        }
      }
    }]);

    return ScaledStackedBarTrackClass;
  }(mix(HGC.tracks.BarTrack).with(HGC.tracks.OneDimensionalMixin));

  return new (Function.prototype.bind.apply(ScaledStackedBarTrackClass, [null].concat(args)))();
};

var icon = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="564px" height="542px" viewBox="0 0 5640 5420" preserveAspectRatio="xMidYMid meet"> <g id="layer101" fill="#000000" stroke="none"> <path d="M0 2710 l0 -2710 2820 0 2820 0 0 2710 0 2710 -2820 0 -2820 0 0 -2710z"/> </g> <g id="layer102" fill="#750075" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> <path d="M4340 2710 l0 -2510 560 0 560 0 0 2510 0 2510 -560 0 -560 0 0 -2510z"/> <path d="M200 1870 l0 -1670 630 0 630 0 0 1670 0 1670 -630 0 -630 0 0 -1670z"/> <path d="M1660 1810 l0 -1610 570 0 570 0 0 1610 0 1610 -570 0 -570 0 0 -1610z"/> <path d="M3000 840 l0 -640 570 0 570 0 0 640 0 640 -570 0 -570 0 0 -640z"/> </g> <g id="layer103" fill="#ffff04" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> </g> </svg>';

// default
ScaledStackedBarTrack.config = {
  type: 'scaled-horizontal-stacked-bar',
  datatype: ['multivec'],
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
  }
};

export default ScaledStackedBarTrack;