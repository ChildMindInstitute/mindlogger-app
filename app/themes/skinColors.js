import { colors as defaultColors } from './colors';
import { getStore } from '../store';
import { skinSelector } from '../state/app/app.selectors';


export const colors = () => {
  const store = getStore();
  if (typeof store !== 'undefined') {
    const state = store.getState();
    const skin = skinSelector(state);
    return ({
      primary: skin.colors.primary,
      secondary: skin.colors.secondary,
      secondary_50: 'rgba(255, 255, 255, 0.5)',
      tertiary: '#404040',
      grey: '#808080',
      lightGrey: '#F0F0F0',
      alert: 'rgb(230, 50, 50)',
      blue: '#005fa3',
    });
  }
  return defaultColors;
};
