self.importScripts('./transformer-utils.js');

onmessage = ({ data: { imageData, palette, start, end } }) => {
  const rgbColors = palette.map(c => toRgb(c));
  for (let { color, colorIdx } of enumerate(imageData, start, end)) {
    const paletteIdx = rgbColors
      .map(c => distance(c, color))
      .reduce((prev, cur, idx, dist) => cur < dist[prev] ? idx : prev, 0);
    setColor(colorIdx, imageData, rgbColors[paletteIdx]);
  }
  postMessage(null);
}

