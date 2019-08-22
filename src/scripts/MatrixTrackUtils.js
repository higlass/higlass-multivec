/**
 * Find max and min heights for the given tile
 *
 * @param matrix 2d array of numbers representing one tile
 */
const findMaxAndMin = (matrix) => {
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

    let negativeValues = temp.filter(a => a < 0);
    // console.log('negativeValues:', negativeValues);

    if (negativeValues.length > 0) {
      negativeValues = negativeValues.map(a => Math.abs(a));
      const localNegativeMax = negativeValues.reduce((a, b) => a + b, 0); // check
      if (maxAndMin.min === null || localNegativeMax > maxAndMin.min) {
        maxAndMin.min = localNegativeMax;
      }
    }
  }

  return maxAndMin;
};

/**
 *
 * @param tile
 * @param data array of values to reshape
 * @returns {Array} 2D array representation of data
 */
const simpleUnFlatten = (tile, data) => {
  const shapeX = tile.tileData.shape[0]; // number of different nucleotides in each bar
  const shapeY = tile.tileData.shape[1]; // number of bars

  // matrix[0] will be [flattenedArray[0], flattenedArray[256], flattenedArray[512], etc.]
  // because of how flattenedArray comes back from the server.
  const matrix = [];
  for (let i = 0; i < shapeX; i++) { // 6
    for (let j = 0; j < shapeY; j++) { // 256;
      let singleBar;
      if (matrix[j] === undefined) {
        singleBar = [];
      } else {
        singleBar = matrix[j];
      }
      singleBar.push(data[(shapeY * i) + j]);
      matrix[j] = singleBar;
    }
  }

  return matrix;
};

/**
 * un-flatten data into matrix of tile.tileData.shape[0] x tile.tileData.shape[1]
 *
 * @param tile
 * @returns {Array} 2d array of numerical values for each column
 */
const unFlatten = (track, tile) => {
  if (tile.matrix) {
    return tile.matrix;
  }

  const flattenedArray = tile.tileData.dense;

  // if any data is negative, switch to exponential scale
  if (flattenedArray.filter(a => a < 0).length > 0 && track.options.valueScaling === 'linear') {
    console.warn('Negative values present in data. Defaulting to exponential scale.');
    track.options.valueScaling = 'exponential';
  }

  const matrix = simpleUnFlatten(tile, flattenedArray);

  const maxAndMin = findMaxAndMin(matrix);
  // console.log('unflatten', tile.tileId, maxAndMin.min, maxAndMin.max);

  tile.matrix = matrix;
  tile.maxValue = maxAndMin.max;
  tile.minValue = maxAndMin.min;

  track.syncMaxAndMin();

  return matrix;
};

const matrixTrackUtils = {
  unFlatten,
};

export default matrixTrackUtils;