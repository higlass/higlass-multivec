import {scaleLinear} from 'd3-scale';

const SequenceLogoTrack = (HGC, ...args) => {
  if (!new.target) {
    throw new Error(
      'Uncaught TypeError: Class constructor cannot be invoked without "new"',
    );
  }

  // Services
  const { tileProxy, pixiRenderer } = HGC.services;

  // Utils
  const { colorToHex } = HGC.utils;

  class SequenceLogoTrackClass extends HGC.tracks.BarTrack {
    constructor(context, options) {
      super(context, options);
      this.initializeSequenceLogoTrack();
    }

    initializeSequenceLogoTrack() {
      if (this.sequenceLogoTrackInitialized) return;

      this.maxAndMin = {
        max: null,
        min: null
      };

      this.textureGraphics = new HGC.libraries.PIXI.Graphics();
      
      // Define nucleotide colors
      this.nucleotideColors = {
        'A': '#FF0000', // Red
        'T': '#0000FF', // Blue  
        'G': '#FFA500', // Orange
        'C': '#008000', // Green
        'U': '#0000FF'  // Blue (for RNA)
      };

      this.sequenceLogoTrackInitialized = true;
    }

    initTile(tile) {
      console.log('initing', tile);
      this.initializeSequenceLogoTrack();

      this.scale.minRawValue = 0;
      this.scale.maxRawValue = 2; // Maximum information content is 2 bits

      this.scale.minValue = this.scale.minRawValue;
      this.scale.maxValue = this.scale.maxRawValue;

      this.maxAndMin.min = 0;
      this.maxAndMin.max = 2;

      // Number of nucleotides (A, T, G, C)
      this.numCategories = 4;

      this.renderTile(tile);
      this.rescaleTiles();
    }

    destroyTile(tile) {
      tile.graphics.destroy(true);
      tile.graphics = null;
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
      // const visibleAndFetched = this.visibleAndFetchedTiles();
      // for (let i = 0; i < visibleAndFetched.length; i++) {
      //   const tile = visibleAndFetched[i];
      //   this.unFlatten(tile);
      // }
      // this.rescaleTiles();
    }

    drawTile(tile) {
      // Prevent BarTrack's draw method
    }

    draw() {
      if (!this.initialized) return;
  
      // we don't want to call HorizontalLine1DPixiTrack's draw function
      // but rather its parent's
      super.draw();
  
      if (this.options.zeroLineVisible) this.drawZeroLine();
      else this.zeroLine.clear();
  
      Object.values(this.fetchedTiles).forEach((tile) => {
        const [graphicsXScale, graphicsXPos] = this.getXScaleAndOffset(
          tile.drawnAtScale,
        );
  
        tile.graphics.scale.x = graphicsXScale;
        tile.graphics.position.x = graphicsXPos;
      });
    }

    calculateVisibleTiles() {
      if (!this.tilesetInfo) return;
      
      // Subtracting 2 from the zoom level to ensure that letters are larger
      // This does present a problem where the largest zoom levels will
      // never be shown though
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

    renderTile(tile) {
      tile.svgData = null;
      tile.mouseOverData = null;

      const graphics = tile.graphics;
      let children = graphics.children;
      children.map(x => x.destroy(true));
      graphics.removeChildren();
      graphics.clear();

      tile.drawnAtScale = this._xScale.copy();

      const {tileX, tileWidth} = this.getTilePosAndDimensions(tile.tileData.zoomLevel,
        tile.tileData.tilePos, this.tilesetInfo.tile_size);

      const matrixDimensions = tile.tileData.shape;
      const textures = [];

      for (let i = 0; i < matrixDimensions[0]; i++) {
      // for (let i = 0; i < 1; i++) {
        const letter = this.tilesetInfo.row_infos[i];

        const text = new HGC.libraries.PIXI.Text(letter, {
              fontFamily: 'Arial',
              fontSize: 48,
              fontWeight: 'bold',
              fill: 'black',
              align: 'center'
            })
        let metrics = PIXI.TextMetrics.measureText(text.text, text.style);

        const textureOrig = HGC.services.pixiRenderer.generateTexture(text);
        const rect = new HGC.libraries.PIXI.Rectangle(0, metrics.fontProperties.descent, metrics.width, metrics.height-metrics.fontProperties.descent*2);
        const texture = new HGC.libraries.PIXI.Texture(textureOrig.baseTexture, rect);
        // texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

        textures.push(texture);
      }

      for (let j = 0; j < matrixDimensions[1]; j++) {
      // for (let j = 0; j < 1; j++) {
        let colSum = 0;
        let rowVals = [];

        // calculate the total column sum
        for (let i = 0; i < matrixDimensions[0]; i++) {
          const index = i * matrixDimensions[1] + j;
          colSum += tile.tileData.dense[index];

          rowVals.push(
            {'name': this.tilesetInfo.row_infos[i], 'value': tile.tileData.dense[index]})
        }

        rowVals.sort((a, b) => b.value - a.value)

        if (colSum == 0) {
          // There's no values so no need to draw anything
          continue;
        }

        const probs = rowVals.map(x =>x.value  / colSum)
        const entropy = -probs.reduce((sum, p) => {
          return p > 0 ? sum + p * Math.log2(p) : sum;
        }, 0);

        // Information content = max entropy - entropy
        const maxEntropy = Math.log2(probs.length);
        const information = maxEntropy - entropy;

        let currPos = 0;

        // add each letter
        for (let i = 0; i < rowVals.length; i++) {
        // for (let i = 0; i < 1; i++) {
          const letterHeight = this.dimensions[1] * information * probs[i];

          const sprite = new PIXI.Sprite(textures[i]);
          const letterWidth = tileWidth / this.tilesetInfo.tile_size;
  
          const x = this._xScale(tileX + (j * letterWidth));
          const letterScaledWidth = this._xScale(letterWidth) - this._xScale(0)

          sprite.x = x;
          sprite.y = currPos;
          sprite.width = letterScaledWidth;
          sprite.height = letterHeight;
          // sprite.height = 40;
          console.log('letterScaledWidth', letterScaledWidth);

          tile.graphics.addChild(sprite);
          // tile.graphics.addChild(text1);

          currPos += letterHeight;
        }
      }
    }

    rescaleTiles() {

    }

    makeMouseOverData(tile) {
      // Simplified mouseover data
      tile.mouseOverData = tile.matrix.map((position, j) => {
        return position.map((height, i) => ({
          nucleotide: ['A', 'T', 'G', 'C'][i],
          height: height,
          information: height
        }));
      });
    }

    getMouseOverHtml(trackX, trackY) {
      if (!this.tilesetInfo) return '';

      const zoomLevel = this.calculateZoomLevel();
      const tileWidth = tileProxy.calculateTileWidth(this.tilesetInfo,
        zoomLevel, this.tilesetInfo.tile_size);

      const tilePos = this._xScale.invert(trackX) / tileWidth;
      const posInTileX = Math.floor(this.tilesetInfo.tile_size * (tilePos - Math.floor(tilePos)));
      const tileId = this.tileToLocalId([zoomLevel, Math.floor(tilePos)]);
      const fetchedTile = this.fetchedTiles[tileId];

      if (!fetchedTile || !fetchedTile.mouseOverData) return '';

      const positionData = fetchedTile.mouseOverData[posInTileX];
      if (!positionData) return '';

      let html = '<div>Position ' + posInTileX + '</div>';
      positionData.forEach(data => {
        if (data.height > 0) {
          html += `<div>${data.nucleotide}: ${data.information.toFixed(3)} bits</div>`;
        }
      });

      return html;
    }

    exportSVG() {
      // Simplified SVG export
      const base = document.createElement('g');
      return [base, base];
    }
  }

  return new SequenceLogoTrackClass(...args);
};

const icon = '<svg width="20" height="20" viewBox="0 0 20 20"><text x="2" y="8" font-family="Arial" font-size="6" fill="red">A</text><text x="8" y="8" font-family="Arial" font-size="4" fill="blue">T</text><text x="2" y="16" font-family="Arial" font-size="5" fill="orange">G</text><text x="8" y="16" font-family="Arial" font-size="3" fill="green">C</text></svg>';

SequenceLogoTrack.config = {
  type: 'sequence-logo',
  datatype: ['multivec'],
  local: false,
  orientation: '1d-horizontal',
  thumbnail: new DOMParser().parseFromString(icon, 'text/xml').documentElement,
  availableOptions: ['labelPosition', 'labelColor', 'trackBorderWidth', 'trackBorderColor', 'backgroundColor'],
  defaultOptions: {
    labelPosition: 'topLeft',
    labelColor: 'black',
    trackBorderWidth: 0,
    trackBorderColor: 'black',
    backgroundColor: 'white'
  }
};

export default SequenceLogoTrack;