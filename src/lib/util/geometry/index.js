/**
 * Check if a point lies within a polygon
 *
 * @param {number} xPct - X-coordinate as percentage
 * @param {number} yPct - Y-coordinate as percentage
 * @param {Array} polygon - Array of [x, y] points
 *
 * @returns {boolean} True if the point lies within the polygon
 */
export function isPointInPolygon(xPct, yPct, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > yPct !== yj > yPct &&
      xPct < ((xj - xi) * (yPct - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}
