// Source: https://github.com/peterpeterparker/tietracker/blob/main/src/utils/utils.color.ts

const rgbToYIQ = ({ r, g, b }) => {
  return (r * 299 + g * 587 + b * 114) / 1000;
};

const hexToRgb = (hex: string) => {
  if (!hex || hex === undefined || hex === '') {
    return undefined;
  }

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : undefined;
};

export const contrast = (colorHex, threshold = 128, invert = false) => {
  if (colorHex === undefined) {
    return invert ? '#fff' : '#000';
  }

  const rgb = hexToRgb(colorHex);

  if (rgb === undefined) {
    return invert ? '#fff' : '#000';
  }

  if (rgbToYIQ(rgb) >= threshold) {
    return (invert ? '#fff' : '#000');
  }

  return invert ? '#000' : '#fff';
};
