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
      this.initializeSequenceLogoTrack();

      this.scale.minRawValue = 0;
      this.scale.maxRawValue = 2; // Maximum information content is 2 bits

      this.scale.minValue = this.scale.minRawValue;
      this.scale.maxValue = this.scale.maxRawValue;

      this.maxAndMin.min = 0;
      this.maxAndMin.max = 2;

      // Number of nucleotides (A, T, G, C)
      this.numCategories = 4;

      this.unFlatten(tile);
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
      const visibleAndFetched = this.visibleAndFetchedTiles();
      for (let i = 0; i < visibleAndFetched.length; i++) {
        const tile = visibleAndFetched[i];
        this.unFlatten(tile);
      }
      this.rescaleTiles();
    }

    drawTile(tile) {
      // Prevent BarTrack's draw method
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
      graphics.clear();
      graphics.children.map(child => {graphics.removeChild(child)});
      tile.drawnAtScale = this._xScale.copy();

      const {tileX, tileWidth} = this.getTilePosAndDimensions(tile.tileData.zoomLevel,
        tile.tileData.tilePos, this.tilesetInfo.tile_size);

      const matrixDimensions = tile.tileData.shape;
      const cols = matrixDimensions[1];
      const rows = matrixDimensions[0];

      console.log('tsinfo', this.tilesetInfo);
      console.log('tileWidth', tileWidth);

      const textures = [];

      for (let i = 0; i < matrixDimensions[0]; i++) {
        const letter = this.tilesetInfo.row_infos[i];

        const text = new HGC.libraries.PIXI.Text(letter, {
              fontFamily: 'Arial',
              fontSize: 12,
              fontWeight: 'bold',
              fill: 'black',
              align: 'center'
            })
        let metrics = PIXI.TextMetrics.measureText(text.text, text.style);
        console.log('metrics', metrics);

        const textureOrig = HGC.services.pixiRenderer.generateTexture(text);
        const rect = new HGC.libraries.PIXI.Rectangle(0, 3, metrics.width, metrics.height-6);
        const texture = new HGC.libraries.PIXI.Texture(textureOrig.baseTexture, rect);

        console.log('texture', texture);
        textures.push(texture);
      }

      for (let j = 0; j < matrixDimensions[1]; j++) {
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

        console.log('probs', probs);
        console.log('information', information);

        let currPos = 0;
        // add each letter
        for (let i = 0; i < rowVals.length; i++) {
          const letterHeight = this.dimensions[1] * information * probs[i];

          const sprite = new PIXI.Sprite(textures[i]);
          const letterWidth = tileWidth / this.tilesetInfo.tile_size;
  
          const x = this._xScale(tileX + (j * letterWidth));
          const letterScaledWidth = this._xScale(letterWidth) - this._xScale(0)
  
          // console.log('x', x)
          // console.log('y', currPos);
          // console.log('height', letterHeight);

          sprite.x = x;
          sprite.y = currPos;
          sprite.width = letterScaledWidth;
          sprite.height = letterHeight;
  
          tile.graphics.addChild(sprite);

          currPos += letterHeight;
        }
      }
    }

    rescaleTiles() {
      const visibleAndFetched = this.visibleAndFetchedTiles();
      
      visibleAndFetched.map(a => {
        const sprite = a.sprite;
        if (sprite) {
          sprite.height = this.dimensions[1];
          sprite.y = 0;
        }
      });
    }

    unFlatten(tile) {
      if (tile.matrix) return tile.matrix;

      const flattenedArray = tile.tileData.dense;
      const matrix = this.simpleUnFlatten(tile, flattenedArray);
      
      // Calculate information content for each position
      const logoMatrix = [];
      for (let j = 0; j < matrix.length; j++) {
        const frequencies = matrix[j];
        const total = frequencies.reduce((sum, freq) => sum + freq, 0);
        
        if (total === 0) {
          logoMatrix[j] = frequencies.map(() => 0);
          continue;
        }

        // Normalize frequencies
        const probs = frequencies.map(freq => freq / total);
        
        // Calculate entropy
        const entropy = -probs.reduce((sum, p) => {
          return p > 0 ? sum + p * Math.log2(p) : sum;
        }, 0);
        
        // Information content = max entropy - entropy
        const maxEntropy = Math.log2(frequencies.length);
        const information = maxEntropy - entropy;
        
        // Calculate heights (information * probability)
        logoMatrix[j] = probs.map(p => p * information);
      }

      tile.matrix = logoMatrix;
      tile.maxValue = 2;
      tile.minValue = 0;

      return logoMatrix;
    }

    simpleUnFlatten(tile, data) {
      const shapeX = 4; // A, T, G, C
      const shapeY = tile.tileData.shape[1];

      const matrix = [];
      for (let j = 0; j < shapeY; j++) {
        const position = [];
        for (let i = 0; i < shapeX; i++) {
          position.push(data[(shapeY * i) + j]);
        }
        matrix[j] = position;
      }

      return matrix;
    }

    drawSequenceLogos(matrix, tileX, tileWidth, tile) {
      this.textureGraphics.clear();
      const trackHeight = this.dimensions[1];
      const totalSpriteWidth = this._xScale(tileX + tileWidth) - this._xScale(tileX);
      const width = totalSpriteWidth / matrix.length;
      
      
      const spriteGraphics = new HGC.libraries.PIXI.Graphics();
      const nucleotides = ['A', 'T', 'G', 'C'];
      
      for (let j = 0; j < matrix.length; j++) {
        const x = j * width;
        const heights = matrix[j];
        
        // Sort by height for stacking
        const sortedData = heights.map((height, i) => ({
          nucleotide: nucleotides[i],
          height: height,
          color: this.nucleotideColors[nucleotides[i]]
        })).sort((a, b) => a.height - b.height);
        
        let stackedHeight = 0;
        
        for (let i = 0; i < sortedData.length; i++) {
          const data = sortedData[i];
          if (data.height <= 0) continue;
          
          const pixelHeight = (data.height / 2) * trackHeight; // Scale to track height
          const y = trackHeight - stackedHeight - pixelHeight;
          
          // Draw letter background
          this.textureGraphics.beginFill(colorToHex(data.color));
          this.textureGraphics.drawRect(x, y, width, pixelHeight);
          
          console.log('pixelHeight', pixelHeight)
          console.log('width', width);
          
          // Add text (simplified - in practice you'd want proper font rendering)
          const text = new HGC.libraries.PIXI.Text(data.nucleotide, {
            fontFamily: 'Arial',
            fontSize: Math.min(pixelHeight * 0.8, width * 0.8),
            fill: 'white',
            align: 'center'
          });
          text.x = x + width / 2;
          text.y = y + pixelHeight / 2;
          text.anchor.set(0.5);
          this.textureGraphics.addChild(text);
          
          stackedHeight += pixelHeight;
        }
      }

      const texture = pixiRenderer.generateTexture(
        this.textureGraphics, HGC.libraries.PIXI.SCALE_MODES.NEAREST
      );
      
      const sprite = new HGC.libraries.PIXI.Sprite(texture);
      sprite.width = totalSpriteWidth;
      sprite.x = this._xScale(tileX);
      
      tile.sprite = sprite;
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