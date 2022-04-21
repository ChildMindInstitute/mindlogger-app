import _ from 'lodash';
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

const findActivityFromName = (activities, name) => {
  return activities.findIndex(activity => activity.name.en == name)
}

export const getDependency = (activities) => {
  const dependency = []

  for (let i = 0; i < activities.length; i++) {
    dependency.push([])
  }

  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];

    if (activity.messages) {
      for (const message of activity.messages) {
        if (message.nextActivity) {
          const index = findActivityFromName(activities, message.nextActivity)
          if (index >= 0) {
            dependency[index].push(i);
          }
        }
      }
    }
  }

  return dependency;
}

export const getAvailableActivities = (appletActivities, availableActivities, archievedActivities) => {
  const g = getDependency(appletActivities);
  const marked = [], activities = [];
  let markedCount = 0;

  for (let i = 0; i < g.length; i++) {
    marked.push(false)
  }

  for (let index of availableActivities) {
    markedCount++;
    marked[index] = true;
    activities.push(index);
  }

  for (let index of archievedActivities) {
    if (!marked[index]) {
      marked[index] = true;
      markedCount++;
    }
  }

  for (let i = 0; i < g.length; i++) {
    if (!g[i].length && !marked[i]) {
      activities.push(i);
      markedCount++;
      marked[i] = true;
    }
  }

  while (markedCount < g.length) {
    let updated = false;

    for (let i = 0; i < g.length; i++) {
      if (!marked[i] && g[i].some(dependency => marked[dependency])) {
        marked[i] = true;
        markedCount++;
        updated = true;
      }
    }

    if (!updated) {
      // in case of a circular dependency exists
      for (let i = 0; i < g.length; i++) {
        if (!marked[i]) {
          marked[i] = true;
          markedCount++;
          activities.push(i);
          break;
        }
      }
    }
  }

  const hidden = [];
  for (let i = 0; i < g.length; i++) {
    hidden.push(false);
  }

  for (const activity of appletActivities) {
    if (activity.messages) {
      for (const message of activity.messages) {
        if (message.nextActivity && (message.hideActivity || message.hideActivity === undefined)) {
          const index = findActivityFromName(appletActivities, message.nextActivity);
          if (index >= 0) {
            hidden[index] = true;
          }
        }
      }
    }
  }

  for (let i = 0; i < hidden.length; i++) {
    if (!hidden[i] && !activities.includes(i) && archievedActivities.includes(i)) {
      try {
        const activity = appletActivities[i];
        for (const message of activity?.messages) {
          if (message.nextActivity && !message.hideActivity) {
            activities.push(i);
            break;
          }
        }
      } catch (error) {
        console.log(error);
      }

    } else if (!hidden[i] && !activities.includes(i) && !archievedActivities.includes(i)) {
      activities.push(i);
    }
  }

  return activities.sort();
}

export const getChainedActivities = (activities, currentActivity) => {
  const g = getDependency(activities);
  const index = findActivityFromName(activities, currentActivity.name.en);
  let markedCount = 0, marked = [];

  for (let i = 0; i < g.length; i++) {
    marked.push(false);
  }

  for (let i = 0; i < g.length; i++) {
    if (!g[i].length && !marked[i]) {
      markedCount++;
      marked[i] = true;
    }
  }

  while (!marked[index] && markedCount < g.length) {
    let updated = false;

    for (let i = 0; i < g.length; i++) {
      if (!marked[i] && g[i].some(dependency => marked[dependency])) {
        marked[i] = true;
        markedCount++;
        updated = true;
        break;
      }
    }

    if (!updated) {
      for (let i = 0; i < g.length; i++) {
        if (!marked[i]) {
          marked[i] = true;
          markedCount++;
          break;
        }
      }
    }
  }

  for (let i = 0; i < g.length; i++) {
    if (!marked[i] && g[i].some(dependency => dependency == index)) {
      return [currentActivity];
    }
  }

  for (let i = 0; i < g.length; i++) {
    marked[i] = false;
  }

  const queue = [index], chainedActivities = [];

  marked[index] = true;

  while (queue.length > 0) {
    const head = queue[0];
    queue.shift();

    for (let i = 0; i < g[head].length; i++) {
      const prev = g[head][i];

      if (!marked[prev]) {
        marked[prev] = true;
        queue.push(prev);
      }
    }
  }

  for (let i = 0; i < marked.length; i++) {
    if (marked[i]) {
      chainedActivities.push(activities[i])
    }
  }

  return chainedActivities;
}

export const waitFor = (sec = 1) => {
  return new Promise(res => {
    setTimeout(() => res(), sec * 1000)
  })
}

export const getTextBetweenBrackets = (str) => {
  const reBrackets = /\[\[(.*?)\]]/g;
  const listOfText = [];
  let found;
  while (found = reBrackets.exec(str)) {
    listOfText.push(found[1]);
  };
  return listOfText;
};

export const replaceItemVariableWithName = (markdown, activity, answers) => {
  const getTimeString = (obj) => {
    if (!obj) return '';

    return `${obj.hour.toString().padStart(2, '0')}:${obj.minute.toString().padStart(2, '0')}`;
  }

  const getDateString = (obj) => {
    if (!obj) return '';
    return `${obj.year}-${Number(obj.month+1).toString().padStart(2, '0')}-${Number(obj.day).toString().padStart(2, '0')}`;
  }
  try {
    const variableNames = getTextBetweenBrackets(markdown);
    if (variableNames?.length) {
      variableNames.forEach(variableName => {
        const index = _.findIndex(activity.items, { variableName });
        const reg = new RegExp(`\\[\\[${variableName}\\]\\]`, "gi");

        if (Array.isArray(answers[index]?.value)) {
          let names = [];
          answers[index]?.value.forEach(ans => {
            const item = index > -1 && _.find(activity.items[index]?.valueConstraints?.itemList, { value: ans });
            if (item) names.push(item.name.en);
          })

          markdown = markdown.replace(reg, names.join(', '));

        } else if (typeof answers[index] === "object") {
          switch (activity.items[index].inputType) {
            case 'radio':
              const item = index > -1 && _.find(activity.items[index]?.valueConstraints?.itemList, { value: answers[index].value });
              if (item) {
                markdown = markdown.replace(reg, item.name.en);
              }
              break;
            case 'slider':
              markdown = markdown.replace(reg, answers[index].value);
              break;
            case 'timeRange':
              markdown = markdown.replace(reg, getTimeString(answers[index].value?.from) + ' - ' + getTimeString(answers[index].value?.to));
              break;
            case 'date':
              markdown = markdown.replace(reg, getDateString(answers[index].value));
              break;
            case 'ageSelector':
              markdown = markdown.replace(reg, answers[index].value);
              break;
            case 'text':
              markdown = markdown.replace(reg, answers[index].value.toString().replace(/(?=[$&])/g, '\\'));
              break;
          }

        } else if (answers[index]) {
          markdown = markdown.replace(reg, answers[index].toString().replace(/(?=[$&])/g, '\\'));
        }
      });
    }
  } catch (error) {
    console.warn(error)
  }
  return markdown;
}
