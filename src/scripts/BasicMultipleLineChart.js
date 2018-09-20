import {mix} from 'mixwith';
import {scaleLinear, scaleOrdinal, schemeCategory10} from 'd3-scale';

const BasicMultipleLineChart = (HGC, ...args) => {
  if (!new.target) {
    throw new Error(
      'Uncaught TypeError: Class constructor cannot be invoked without "new"',
    );
  }

  // Services
  const {tileProxy} = HGC.services;

  class BasicMultipleLineChart extends mix(HGC.tracks.BarTrack).with(HGC.tracks.OneDimensionalMixin) {
    constructor(scene, trackConfig, dataConfig, handleTilesetInfoReceived, animate, onValueScaleChanged) {
      super(scene, dataConfig, handleTilesetInfoReceived, trackConfig.options, animate, onValueScaleChanged);

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
      tile.drawnAtScale = this._xScale.copy();

      // we're setting the start of the tile to the current zoom level
      const {tileX, tileWidth} = this.getTilePosAndDimensions(tile.tileData.zoomLevel,
        tile.tileData.tilePos, this.tilesetInfo.tile_size);

      const matrix = tile.matrix;
      const trackHeight = this.dimensions[1];
      const matrixDimensions = tile.tileData.shape;
      const colorScale = this.options.colorScale || scaleOrdinal(schemeCategory10);
      const valueToPixels = scaleLinear()
        .domain([0, this.maxAndMin.max])
        .range([0, trackHeight / matrixDimensions[0]]);

      for (let i = 0; i < matrix[0].length; i++) {
        const intervals = trackHeight / matrixDimensions[0];
        // calculates placement for a line in each interval; we subtract 1 so we can see the last line clearly
        const linePlacement = (i === matrix[0].length - 1) ?
          (intervals * i) + ((intervals * (i + 1) - (intervals * i))) - 1 :
          (intervals * i) + ((intervals * (i + 1) - (intervals * i)));
        graphics.lineStyle(1, this.colorHexMap[colorScale[i]], 1);

        for (let j = 0; j < matrix.length; j++) { // 3070 or something
          const x = this._xScale(tileX + (j * tileWidth / this.tilesetInfo.tile_size));
          const y = linePlacement - valueToPixels(matrix[j][i]);
          this.addSVGInfo(tile, x, y, colorScale[i]);
          // move draw position back to the start at beginning of each line
          (j === 0) ? graphics.moveTo(x, y) : graphics.lineTo(x, y);
        }
      }

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
     * @param color
     */
    addSVGInfo(tile, x, y, color) {
      if (tile.svgData
        && tile.svgData.hasOwnProperty('lineXValues')
        && tile.svgData.hasOwnProperty('lineYValues')
        && tile.svgData.hasOwnProperty('lineColor')) {
        // if a new color appears, create a separate array to indicate new line
        if (tile.svgData.lineColor[tile.svgData.lineColor.length - 1] !== color) {
          tile.svgData.lineXValues.push([x]);
          tile.svgData.lineYValues.push([y]);
          tile.svgData.lineColor.push(color);
        }
        // else add x y coordinates onto the last array in the list
        else {
          tile.svgData.lineXValues[tile.svgData.lineXValues.length - 1].push(x);
          tile.svgData.lineYValues[tile.svgData.lineYValues.length - 1].push(y);
        }
      }
      else {
        // create entirely new 2d arrays for x y coordinates
        tile.svgData = {
          lineXValues: [[x]],
          lineYValues: [[y]],
          lineColor: [color]
        };
      }
    }

    /**
     * Export an SVG representation of this track
     *
     * @returns {[DOMNode,DOMNode]} The two returned DOM nodes are both SVG
     * elements [base,track]. Base is a parent which contains track as a
     * child. Track is clipped with a clipping rectangle contained in base.
     *
     */
    exportSVG() {
      let base = document.createElement('g');
      let track = base;

      [base, track] = super.superSVG();

      base.setAttribute('class', 'exported-line-track');
      const output = document.createElement('g');

      track.appendChild(output);
      output.setAttribute('transform',
        `translate(${this.position[0]},${this.position[1]})`);

      const tiles = this.visibleAndFetchedTiles();
      for (let i = 0; i < tiles.length; i++) { // unique tiles
        for (let j = 0; j < tiles[i].svgData.lineXValues.length; j++) { // unique lines
          const g = document.createElement('path');
          g.setAttribute('fill', 'transparent');
          g.setAttribute('stroke', tiles[i].svgData.lineColor[j]);
          let d = `M${tiles[i].svgData.lineXValues[j][0]} ${tiles[i].svgData.lineYValues[j][0]}`;
          for (let k = 0; k < tiles[i].svgData.lineXValues[j].length; k++) { // data points on each line
            d += `L${tiles[i].svgData.lineXValues[j][k]} ${tiles[i].svgData.lineYValues[j][k]}`;
          }
          g.setAttribute('d', d);
          output.appendChild(g);
        }
      }

      const gAxis = document.createElement('g');
      gAxis.setAttribute('id', 'axis');

      // append the axis to base so that it's not clipped
      base.appendChild(gAxis);
      gAxis.setAttribute('transform',
        `translate(${this.axis.pAxis.position.x}, ${this.axis.pAxis.position.y})`);

      // add the axis to the export
      if (
        this.options.axisPositionHorizontal === 'left' ||
        this.options.axisPositionVertical === 'top'
      ) {
        // left axis are shown at the beginning of the plot
        const gDrawnAxis = this.axis.exportAxisLeftSVG(this.valueScale, this.dimensions[1]);
        gAxis.appendChild(gDrawnAxis);
      } else if (
        this.options.axisPositionHorizontal === 'right' ||
        this.options.axisPositionVertical === 'bottom'
      ) {
        const gDrawnAxis = this.axis.exportAxisRightSVG(this.valueScale, this.dimensions[1]);
        gAxis.appendChild(gDrawnAxis);
      }

      return [base, track];
    }

    getMouseOverHtml(trackX, trackY) {
      //console.log(this.tilesetInfo, trackX, trackY);
      return '';
    }

  }
  return new BasicMultipleLineChart(...args);
};

const icon = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  width="100%" height="100%" viewBox="0 0 340 288" preserveAspectRatio="xMidYMid meet"><rect id="svgEditorBackground" x="0" y="0" width="340" height="288" style="fill:none;stroke:none;"/><g style="fill:rgb(239,221,228);fill-rule:evenodd;stroke:rgb(239,221,228);stroke-width:0.1;" id="l1"><path d="M0,0h340v88h-2l-8,-4l-4,-2v-1h-3l-14,-7v-1h-3l-16,-8v-1h-3l-18,-9v-1h-3l-32,-16v-1h-3l-14,-7v-1l-5,5c-2,0,-2,1,-7,6c-2,0,-2,1,-8,7c-2,0,-2,1,-7,6c-2,0,-2,1,-6,5c-2,0,-2,1,-5,4h-1l-2,-16l-1,-9c0,-4,-1,-3,-3,-2c-2,0,-2,1,-3,2l-2,1l-2,1c-2,0,-2,1,-3,2l-2,1c-2,0,-2,1,-3,2l-2,1c-2,0,-2,1,-3,2h-1l-2,-1l-1,-1v-1h-2l-1,-1v-1h-2l-2,-2v-1h-2l-2,-2v-1h-2l-2,-2v-1c-3,0,-3,2,-4,3h-1v2l-1,1h-1v2l-1,1h-1l-1,-1l-2,-4c0,-3,-1,-3,-5,-11c0,-3,-1,-3,-4,-9c0,-3,-1,-3,-3,-7v2l-7,21h-1v4l-3,9l-3,9l-3,9h-1v4l-3,9l-3,9l-3,9h-1v4l-3,9l-2,6l-1,2h-1c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3l-1,-2c0,-2,-1,-2,-3,-4l-1,-2c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3v-1l-1,1c-5,0,-5,1,-11,4c-3,0,-3,1,-5,2c-3,0,-3,1,-5,2c-3,0,-3,1,-5,2l-3,1c-3,0,-3,1,-5,2h-2Z" style="fill:white;"/><path d="M220,41h1l24,12l1,1v1h2l24,12l1,1v1h2l28,14l1,1v1h2l18,9l8,4l1,1v1h2l4,2l1,1v94l-2,2h-1v2l-4,4l-11,11h-1v2l-8,8l-2,1l-15,1l-32,2c-17,0,-17,1,-33,2c-16,0,-16,1,-31,2l-16,1c-17,0,-17,1,-33,2h-7l-1,-2l-1,-6c0,-6,-1,-6,-2,-11l-1,-6c0,-6,-1,-6,-2,-11v-2l-4,4c-2,0,-2,1,-6,5c-2,0,-2,1,-7,6c-2,0,-2,1,-7,6l-2,1h-2l-8,-8v-1h-2l-1,-1l-7,-7v-1l-1,1l-4,2c-3,0,-3,1,-7,3c-3,0,-3,1,-5,2h-2l-2,-1l-6,-6l-2,-2v-1h-2l-3,-3v-1l-1,1h-1v3l-2,4h-1v3l-2,4h-1v3h-2l-1,-1c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-2,-3c0,-2,-1,-2,-3,-4v3l-2,10h-1v6l-1,4h-1v5l-1,5h-1l-6,-3l-1,-1v-1h-2l-6,-3l-1,-1v-1h-2l-4,-2l-1,-1v-1h-2l-2,-1l-1,-1v-130l4,-2l3,-1c3,0,3,-1,5,-2l3,-1c3,0,3,-1,5,-2l3,-1c3,0,3,-1,5,-2l3,-1h3l1,2c0,2,1,2,2,3l3,6c0,2,1,2,2,3l2,4l2,4c0,2,1,2,2,3l4,8c0,2,1,2,2,3l3,6c0,2,1,2,2,3l4,8c0,2,1,2,2,3l4,8c0,2,1,2,2,3l3,6c0,2,1,2,2,3l3,6v-2l1,-4l7,-21h1v-4l3,-9l3,-9h1v-4l3,-9l2,-6h1v-4l3,-9l2,-6h1v-4l3,-9l2,-6h1l2,4l1,3c0,3,1,3,2,5c0,3,1,3,2,5c0,3,1,3,2,5c0,3,1,3,2,5c0,3,1,3,2,5q0,1,1,-3l1,-3h1v-4l1,-3h1v-4l1,-3h1v-4l1,-3h1v-4l1,-1h1l5,5l5,5v1l3,-1c2,0,2,-1,3,-2c2,0,2,-1,3,-2l2,-1c2,0,2,-1,3,-2l2,-1h1l1,2l1,9l1,10c0,9,1,9,2,12v-1l1,-1c2,0,2,-1,4,-3l2,-2c2,0,2,-1,5,-4c2,0,2,-1,6,-5c2,0,2,-1,5,-4c2,0,2,-1,6,-5c2,0,2,-1,6,-5c2,0,2,-1,5,-4c2,0,2,-1,6,-5c2,0,2,-1,5,-4Z" style="fill:white;"/><path d="M339,214h1v74h-340v-58h1l24,12l1,1v1h2l8,4l1,1v-3l1,-5l2,-8l1,-3h1l2,4c0,2,1,2,2,3l2,4v2h1v1l1,-2h1v-3l2,-4h1v-3l1,-2h1v-3l2,-4h1v-3l1,-2h1l4,4c0,1,2,1,6,2v-1l3,-1c3,0,3,-1,5,-2l9,-3h2l1,1c0,2,1,2,6,7l3,3c0,2,1,2,8,9v2l4,-4c2,0,2,-1,5,-4c2,0,2,-1,6,-5c2,0,2,-1,5,-4l2,-1h1l1,7l1,10c0,10,1,10,4,11v-1c15,0,15,-1,29,-2l15,-1c16,0,16,-1,46,-3l15,-1l30,-2l15,-1l16,-1h14v-1c2,0,2,-1,9,-8l8,-8h1v-2l2,-1h1v-2Z" style="fill:white;"/></g><g style="fill:rgb(252,100,68);fill-rule:evenodd;stroke:rgb(252,100,68);stroke-width:0.1;" id="l2"><path d="M109,10h1l2,4c0,3,1,3,4,9c0,3,1,3,5,11c0,3,1,3,2,5l1,3q0,1,2-3l1-1h1v-2l1-1h1v-2h3l2,2v1h2l2,2v1h2l2,2v1h2l1,1v1h2l1,1v1h2c1,1,1,0,2-1l2-1c2,0,2-1,3-2l2-1c2,0,2-1,3-2l4-2c2,0,2-1,3-2l4-2h1l1,4l1,9c0,10,1,10,2,16v-1c2,0,2-1,6-5c2,0,2-1,7-6c2,0,2-1,9-8c2,0,2-1,6-5c2,0,2-1,7-6l2-1h3l12,6v1h3l32,16v1h3l18,9v1h3l16,8v1h3l14,7v1h3l14,7v14h-3l-4-2l-1-1v-1h-2l-26-13l-1-1v-1h-2l-28-14l-1-1v-1h-2l-24-12l-1-1v-1h-2l-18-9l-4-2v-1l-4,4c-2,0-2,1-4,3c-2,0-2,1-5,4c-2,0-2,1-6,5c-2,0-2,1-5,4c-2,0-2,1-4,3l-2,2c-2,0-2,1-5,4c-2,0-2,1-6,5c-2,0-2,1-4,3l-2,2c-2,0-2,1-5,4h-1l-1-6l-2-20c0-7-2-6-4-6v1l-1,1l-2,1c-2,0-2,1-3,2c-2,0-2,1-3,2l-2,1h-2l-12-12v1l-1,5l-1,3h-1v4l-1,3l-1,2h-1v5l-1,4l-1,3h-1v4h-1l-1-1l-1-2c0-3-1-3-2-5c0-3-1-3-2-5c0-3-1-3-2-5c0-3-1-3-2-5l-1-3c0-3-1-3-3-7v3l-2,6l-2,6h-1v4l-3,9l-2,6h-1v4l-3,9l-2,6l-1,2h-1v5l-3,9l-2,6l-1,2h-1v5l-3,9l-3,9h-1v4l-1,2h-1l-2-4c0-2-1-2-2-3l-3-6c0-2-1-2-2-3l-4-8c0-2-1-2-2-3l-4-8c0-2-1-2-2-3l-3-6c0-2-1-2-2-3l-4-8c0-2-1-2-2-3l-4-8c0-2-1-2-2-3l-3-6c0-2-1-2-2-3l-1-2c0-2-3-1-6-1v1l-2,1l-3,1c-3,0-3,1-5,2l-3,1c-3,0-3,1-5,2l-3,1c-3,0-3,1-5,2h-2v-12l4-2l3-1c3,0,3-1,5-2c3,0,3-1,5-2c3,0,3-1,5-2c3,0,3-1,9-4l5-1h1l2,2c0,2,1,2,2,3c0,3,1,3,4,6c0,3,1,3,4,6c0,2,1,2,2,3c0,3,1,3,4,6c0,3,1,3,2,4c0,2,1,2,3,4l1,2c0,2,1,2,3,4c0,2,1,2,2,3c0,2,1,2,2,3c0,2,1,2,2,3c0,2,1,2,2,3c0,2,1,2,2,3l1,2v-2l3-9l2-6l1-2h1v-5l3-9l3-9l2-6l1-2h1v-5l3-9l3-9l2-6l1-2h1v-5l3-9l3-9z"/></g><g style="fill:rgb(6,6,252);fill-rule:evenodd;stroke:rgb(6,6,252);stroke-width:0.1;" id="l3"><path d="M56,197h1l3,3v1h2l8,8v1h2v1l4-2c3,0,3-1,7-3c3,0,3-1,7-3h1l8,8v1h2l1,1l7,7v1l2-1c2,0,2-1,7-6c2,0,2-1,7-6c2,0,2-1,6-5c2,0,2-1,5-4h1l1,2l1,5l1,6c0,6,1,6,2,11l2,12c0,2,9,1,25,1v-1l15-1l18-1c16,0,16-1,31-2c16,0,16-1,31-2c18,0,18-1,34-2h13v-1c2,0,2-1,7-6l5-5h1v-2l10-10l5-5h1v16l-8,8h-1v2l-12,12l-4,1l-28,2l-15,1c-17,0-17,1-32,2c-15,0-15,1-28,2c-17,0-17,1-31,2l-15,1c-16,0-16,1-31,2h-1l-1-1l-1-10l-1-12v-5l-1,1c-2,0-2,1-5,4c-2,0-2,1-6,5c-2,0-2,1-5,4c-2,0-2,1-5,4h-1c0-2-1-2-8-9c0-2-1-2-9-10l-1-2v-1l-2,1l-6,2c-3,0-3,1-5,2l-6,2h-4l-2-2v-1h-2c-3-3-3-1-4,2l-2,4h-1v3l-1,2h-1v3l-2,4h-1v3l-1,2h-1l-1-1l-2-4c0-2-1-2-2-3l-3-6v3l-2,8h-1v5l-1,3h-1l-10-5l-1-1v-1h-2l-22-11l-1-1v-15h1l4,2l1,1v1h2l4,2l1,1v1h2l4,2l2,1l1,1v1h2l4,2l1,1v-5l1-5l1-4h1v-6l2-10l1-3h1l2,2c0,2,1,2,2,3c0,2,1,2,2,3c0,2,1,2,2,3c0,2,1,2,2,3c0,2,1,2,3,3v-3l2-4h1v-3l2-4h1v-3z"/></g><g style="fill:rgb(252,133,112);fill-rule:evenodd;stroke:rgb(252,133,112);stroke-width:0.1;" id="l4"><path d="M216,29h1v1l-1,1h-1v-1zm-115,4h1v2h-1zm109,1h1v1l-2,2h-1v-1zm7,2h1v1l-2,2h-1v-1zm-14,4h1v1l-1,1h-1v-1zm-80,1h1l1,1v1h-1l-1-1zm72,6h1v1l-2,2h-1v-1zm-59,1h1l5,5l6,6v1h-1l-5-5l-5-5v-1l-1,1h-1v-1zm75,0h1v1l-1,1h-1v-1zm-47,3h1v2h-1zm42,1h1v1l-1,1h-1v-1zm-18,1h1v1l-2,2h-1v-1zm-11,1h1v2h-1zm23,3h1v1l-1,1h-1v-1zm-35,1h1v4h-1zm17,0h1v1l-2,2h-1v-1zm13,3h1v1l-2,2h-1v-1zm-104,3h1v2h-1z"/><path d="M41,66h1l1,1v1h-1l-1-1zm89,0h1v2h-1zm59,0h1v1l-1,1h-1v-1zm-23,2h1v4h-1zm18,2h1v1l-2,2h-1v-1zm-139,2h1l1,1v1h-1l-1-1zm133,3h1v1l-1,1h-1v-1zm-11,3h1v3h-1zm5,2h1v1l-1,1h-1v-1zm-121,1h1l1,1v1h-1l-1-1zm4,6h1l1,1v1h-1l-1-1zm2,3h1l1,1v1h-1l-1-1zm24,5h1v2h-1zm-20,1h1l1,1v1h-1l-1-1zm278,6h1v1h-1zm-245,2h1v2h-1zm-7,22h1v2h-1zm-12,16h1l1,1v1h-1l-1-1z"/></g><g style="fill:rgb(155,153,247);fill-rule:evenodd;stroke:rgb(155,153,247);stroke-width:0.1;" id="l5"><path d="M339,197h1v1l-2,2h-1v-1zm-16,17h1v1l-2,2h-1v-1zm14,2h1v1l-1,1h-1v-1zm-3,3h1v1l-3,3h-1v-1zm-270,2h1l1,1v1h-1l-1-1zm67,5h1v2h-1zm165,1h2v1h-2zm-16,1h2v1h-2zm-33,2h2v1h-2zm-16,1h2v1h-2zm-16,1h3v1h-3zm-15,1h2v1h-2zm-33,2h2v1h-2zm-16,1h2v1h-2zm164,0h2v1h-2zm-14,1h2v1h-2zm-46,3h2v1h-2zm-15,1h2v1h-2zm-15,1h2v1h-2zm-30,2h2v1h-2zm-45,3h2v1h-2zm-15,1h2v1h-2z"/></g></svg>';

// default
BasicMultipleLineChart.config = {
  type: 'basic-multiple-line-chart',
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

export default BasicMultipleLineChart;


