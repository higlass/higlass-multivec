var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { mix } from 'mixwith';
import { scaleLinear, scaleOrdinal, schemeCategory10 } from 'd3-scale';

var BasicMultipleBarChart = function BasicMultipleBarChart(HGC) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (!new.target) {
    throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
  }

  // Services
  var tileProxy = HGC.services.tileProxy;

  var BasicMultipleBarChartClass = function (_mix$with) {
    _inherits(BasicMultipleBarChartClass, _mix$with);

    function BasicMultipleBarChartClass(context, options) {
      _classCallCheck(this, BasicMultipleBarChartClass);

      var _this = _possibleConstructorReturn(this, (BasicMultipleBarChartClass.__proto__ || Object.getPrototypeOf(BasicMultipleBarChartClass)).call(this, context, options));

      _this.maxAndMin = {
        max: null,
        min: null
      };

      return _this;
    }

    /**
     * Draws exactly one tile.
     * @param tile
     */


    _createClass(BasicMultipleBarChartClass, [{
      key: 'renderTile',
      value: function renderTile(tile) {
        var graphics = tile.graphics;
        graphics.clear();
        graphics.children.map(function (child) {
          graphics.removeChild(child);
        });
        tile.drawnAtScale = this._xScale.copy();

        var localGraphics = new HGC.libraries.PIXI.Graphics();

        // we're setting the start of the tile to the current zoom level

        var _getTilePosAndDimensi = this.getTilePosAndDimensions(tile.tileData.zoomLevel, tile.tileData.tilePos, this.tilesetInfo.tile_size),
            tileX = _getTilePosAndDimensi.tileX,
            tileWidth = _getTilePosAndDimensi.tileWidth;

        if (this.options.barBorder) {
          localGraphics.lineStyle(0.1, 'black', 1);
          tile.barBorders = true;
        }

        var matrix = tile.matrix;
        var trackHeight = this.dimensions[1];
        var matrixDimensions = tile.tileData.shape;
        var colorScale = this.options.colorScale || scaleOrdinal(schemeCategory10);
        var width = this._xScale(tileX + tileWidth / this.tilesetInfo.tile_size) - this._xScale(tileX);
        var valueToPixels = scaleLinear().domain([0, this.maxAndMin.max]).range([0, trackHeight / matrixDimensions[0]]);

        for (var i = 0; i < matrix[0].length; i++) {
          // 15
          localGraphics.beginFill(this.colorHexMap[colorScale[i]]);

          for (var j = 0; j < matrix.length; j++) {
            // 3000
            var x = this._xScale(tileX + j * tileWidth / this.tilesetInfo.tile_size);
            var height = valueToPixels(matrix[j][i]);
            var y = trackHeight / matrixDimensions[0] * (i + 1) - height;
            this.addSVGInfo(tile, x, y, width, height, colorScale[i]);
            localGraphics.drawRect(x, y, width, height);
          }
        }

        var texture = localGraphics.generateTexture(HGC.libraries.PIXI.SCALE_MODES.NEAREST);
        var sprite = new HGC.libraries.PIXI.Sprite(texture);
        sprite.width = this._xScale(tileX + tileWidth) - this._xScale(tileX);
        sprite.x = this._xScale(tileX);
        graphics.addChild(sprite);
      }

      /**
       * Here, rerender all tiles every time track size is changed
       *
       * @param newDimensions
       */

    }, {
      key: 'setDimensions',
      value: function setDimensions(newDimensions) {
        var _this2 = this;

        _get(BasicMultipleBarChartClass.prototype.__proto__ || Object.getPrototypeOf(BasicMultipleBarChartClass.prototype), 'setDimensions', this).call(this, newDimensions);
        var visibleAndFetched = this.visibleAndFetchedTiles();
        visibleAndFetched.map(function (a) {
          return _this2.initTile(a);
        });
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

        _get(BasicMultipleBarChartClass.prototype.__proto__ || Object.getPrototypeOf(BasicMultipleBarChartClass.prototype), 'setDimensions', this).call(this, newDimensions);
        var visibleAndFetched = this.visibleAndFetchedTiles();
        visibleAndFetched.map(function (a) {
          return _this3.initTile(a);
        });
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
    }, {
      key: 'getMouseOverHtml',
      value: function getMouseOverHtml(trackX, trackY) {
        //console.log(this.tilesetInfo);
        return '';
      }
    }]);

    return BasicMultipleBarChartClass;
  }(mix(HGC.tracks.BarTrack).with(HGC.tracks.OneDimensionalMixin));

  return new (Function.prototype.bind.apply(BasicMultipleBarChartClass, [null].concat(args)))();
};

var icon = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="598px" height="568px" viewBox="0 0 5980 5680" preserveAspectRatio="xMidYMid meet"> <g id="layer101" fill="#000000" stroke="none"> <path d="M0 2840 l0 -2840 2990 0 2990 0 0 2840 0 2840 -2990 0 -2990 0 0 -2840z"/> </g> <g id="layer102" fill="#ff1388" stroke="none"> <path d="M180 4780 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1700 4050 l0 -1470 550 0 550 0 0 1470 0 1470 -550 0 -550 0 0 -1470z"/> <path d="M3100 2990 l0 -2530 610 0 610 0 0 2530 0 2530 -610 0 -610 0 0 -2530z"/> <path d="M4580 3670 l0 -1850 610 0 610 0 0 1850 0 1850 -610 0 -610 0 0 -1850z"/> <path d="M0 1920 l0 -1920 2990 0 2990 0 0 810 0 810 -730 0 -730 0 0 -680 0 -680 -810 0 -810 0 0 1060 0 1060 -700 0 -700 0 0 730 0 730 -750 0 -750 0 0 -1920z"/> </g> <g id="layer103" fill="#ffffff" stroke="none"> <path d="M0 1920 l0 -1920 2990 0 2990 0 0 810 0 810 -730 0 -730 0 0 -680 0 -680 -810 0 -810 0 0 1060 0 1060 -700 0 -700 0 0 730 0 730 -750 0 -750 0 0 -1920z"/> </g> </svg>';

// default
BasicMultipleBarChart.config = {
  type: 'basic-multiple-bar-chart',
  datatype: ['multivec'],
  local: false,
  orientation: '1d-horizontal',
  thumbnail: new DOMParser().parseFromString(icon, 'text/xml').documentElement,
  availableOptions: ['labelPosition', 'labelColor', 'valueScaling', 'labelTextOpacity', 'labelBackgroundOpacity', 'trackBorderWidth', 'trackBorderColor', 'trackType'],
  defaultOptions: {
    labelPosition: 'topLeft',
    labelColor: 'black',
    labelTextOpacity: 0.4,
    valueScaling: 'linear',
    trackBorderWidth: 0,
    trackBorderColor: 'black'
  }
};

export default BasicMultipleBarChart;