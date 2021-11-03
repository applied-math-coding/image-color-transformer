self.importScripts('./transformer-utils.js');

onmessage = ({ data: { imageData, palette } }) => {
  const result = new Uint8ClampedArray(imageData);
  const rgbColors = palette.map(c => toRgb(c));
  for (let { color, colorIdx } of enumerate(result)) {
    const paletteIdx = rgbColors
      .map(c => distance(c, color))
      .reduce((prev, cur, idx, dist) => cur < dist[prev] ? idx : prev, 0);
    setColor(colorIdx, result, rgbColors[paletteIdx]);
  }
  postMessage(result.buffer, [result.buffer]);
}

