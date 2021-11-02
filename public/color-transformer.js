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

function distance(c1, c2) {
  return Math.max(...c1.map((v, idx) => Math.abs(v - c2[idx])));
}

function* enumerate(array) {
  for (let [idx, colorIdx] = [0, 0]; idx + 3 < array.length; [idx, colorIdx] = [idx + 4, colorIdx + 1]) {
    yield {
      color: [array[idx], array[idx + 1], array[idx + 2]],
      colorIdx
    };
  }
}

function setColor(colorIdx, target, color) {
  color.forEach((v, idx) => {
    target[4 * colorIdx + idx] = v;
  });
}

function toRgb(c) {
  return c
    .substring(1)
    .split('')
    .reduce((prev, cur, idx) => {
      if (idx % 2 === 0) {
        prev.push(cur);
      } else {
        prev[prev.length - 1] = parseInt(prev[prev.length - 1] + cur, 16);
      }
      return prev;
    }, []);
}