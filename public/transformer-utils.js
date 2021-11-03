function distance(c1, c2) {
  return Math.max(...c1.map((v, idx) => Math.abs(v - c2[idx])));
}

function* enumerate(array, start = 0, end) {
  for (
    let [idx, colorIdx] = [4 * start, start];
    idx + 3 < (end == null ? array.length : 4 * end);
    [idx, colorIdx] = [idx + 4, colorIdx + 1]
  ) {
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