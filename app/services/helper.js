import RNFetchBlob from 'rn-fetch-blob';
import { Platform } from 'react-native';
import { getStore } from '../store';
import { fileLink } from './network';
import { mediaMapSelector } from '../state/media/media.selectors';

export const getFileInfoAsync = (path) => {
  return RNFetchBlob.fs.stat(path);
};

export const zeroFill = (number, width) => {
  width -= number.toString().length;
  if (width > 0) {
    return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
  }
  return `${number}`; // always return a string
};

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
export const btoa = (input = '') => {
  const str = input;
  let output = '';

  for (let block = 0, charCode, i = 0, map = chars; str.charAt(i | 0) || (map = '=', i % 1); output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
    charCode = str.charCodeAt(i += 3 / 4);

    if (charCode > 0xFF) {
      throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
    }

    block = block << 8 | charCode;
  }

  return output;
};

export const atob = (input = '') => {
  const str = input.replace(/=+$/, '');
  let output = '';

  if (str.length % 4 == 1) {
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++);

    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
    bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    buffer = chars.indexOf(buffer);
  }

  return output;
};

export const randomLink = (files, token) => {
  const rand = files[Math.floor(Math.random() * files.length)];
  return fileLink(rand, token);
};


export const getURL = (url) => {
  let transformedUrl = url;

  // getURL will replace an SVG image with a JPG image because
  // react-native can't handle SVGs, but web prefers them.
  if (url.endsWith('.svg')) {
    transformedUrl = url.replace('.svg', '.jpg');
  }

  // Check if we've downloaded the asset already, and if so use local file URI
  const state = getStore().getState();
  const mediaMap = mediaMapSelector(state);
  if (typeof mediaMap[url] === 'string') {
    transformedUrl = mediaMap[url];

    // Android needs a 'file://' prefix
    if (Platform.OS === 'android') {
      transformedUrl = `file://${transformedUrl}`;
    }
  }

  return transformedUrl;
};

export const truncateString = (str, len, dots = true) => {
  return str.length <= len ? str : str.substr(0, len) + (dots ? '...' : '');
};
