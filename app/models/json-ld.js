import * as R from 'ramda';

const ALLOW = 'https://schema.repronim.org/allow';
const ALT_LABEL = 'http://www.w3.org/2004/02/skos/core#altLabel';
const AUDIO_OBJECT = 'http://schema.org/AudioObject';
const AUTO_ADVANCE = 'https://schema.repronim.org/auto_advance';
const BACK_DISABLED = 'https://schema.repronim.org/disable_back';
const CONTENT_URL = 'http://schema.org/contentUrl';
const DESCRIPTION = 'http://schema.org/description';
const DO_NOT_KNOW = 'https://schema.repronim.org/dont_know_answer';
const FULL_SCREEN = 'https://schema.repronim.org/full_screen';
const IMAGE = 'http://schema.org/image';
const IMAGE_OBJECT = 'http://schema.org/ImageObject';
const INPUT_TYPE = 'https://schema.repronim.org/inputType';
const INPUTS = 'https://schema.repronim.org/inputs';
const IS_ABOUT = 'https://schema.repronim.org/isAbout';
const ITEM_LIST_ELEMENT = 'http://schema.org/itemListElement';
const MAX_VALUE = 'http://schema.org/maxValue';
const MIN_VALUE = 'http://schema.org/minValue';
const MULTIPLE_CHOICE = 'http://schema.repronim.org/multipleChoice';
const NAME = 'http://schema.org/name';
const ORDER = 'https://schema.repronim.org/order';
const PREAMBLE = 'http://schema.repronim.org/preamble';
const PREF_LABEL = 'http://www.w3.org/2004/02/skos/core#prefLabel';
const QUESTION = 'http://schema.org/question';
const REFUSE_TO_ANSWER = 'https://schema.repronim.org/refused_to_answer';
const REQUIRED_VALUE = 'http://schema.repronim.org/requiredValue';
const SCHEMA_VERSION = 'http://schema.org/schemaVersion';
const SCORING_LOGIC = 'https://schema.repronim.org/scoringLogic';
const SHUFFLE = 'https://schema.repronim.org/shuffle';
const TRANSCRIPT = 'http://schema.org/transcript';
const URL = 'http://schema.org/url';
const VALUE = 'http://schema.org/value';
const VALUE_CONSTRAINTS = 'https://schema.repronim.org/valueconstraints';
const VARIABLE_MAP = 'https://schema.repronim.org/variableMap';
const VARIABLE_NAME = 'https://schema.repronim.org/variableName';
const VERSION = 'http://schema.org/version';
const VISIBILITY = 'https://schema.repronim.org/visibility';

export const languageListToObject = (list) => {
  if (typeof list === 'undefined' || list.length === 0) {
    return undefined;
  }
  return list.reduce((obj, item) => ({
    ...obj,
    [item['@language']]: item['@value'],
  }), {});
};

export const listToObject = (list = []) => list.reduce((obj, item) => ({
  ...obj,
  [item['@index']]: item['@value'],
}), {});

export const listToValue = (list = []) => (list.length > 0
  ? list[0]['@value']
  : undefined);

export const flattenIdList = (list = []) => list.map(item => item['@id']);

export const flattenItemList = (list = []) => list.map(item => ({
  name: languageListToObject(item[NAME]),
  value: R.path([VALUE, 0, '@value'], item),
  image: languageListToObject(item[IMAGE]),
  valueConstraints: item[VALUE_CONSTRAINTS]
    ? flattenValueConstraints(R.path([VALUE_CONSTRAINTS, 0], item))
    : undefined,
}));

export const flattenValueConstraints = vcObj => Object.keys(vcObj).reduce((accumulator, key) => {
  if (key === MAX_VALUE) {
    return { ...accumulator, maxValue: R.path([key, 0, '@value'], vcObj) };
  }
  if (key === MIN_VALUE) {
    return { ...accumulator, minValue: R.path([key, 0, '@value'], vcObj) };
  }
  if (key === MULTIPLE_CHOICE) {
    return { ...accumulator, multipleChoice: R.path([key, 0, '@value'], vcObj) };
  }
  if (key === ITEM_LIST_ELEMENT) {
    const itemList = R.path([key, 0, '@list'], vcObj);
    return { ...accumulator, itemList: flattenItemList(itemList) };
  }
  if (key === REQUIRED_VALUE) {
    return { ...accumulator, required: R.path([key, 0, '@value'], vcObj) };
  }
  if (key === IMAGE) {
    return { ...accumulator, image: languageListToObject(vcObj[key]) };
  }
  return accumulator;
}, {});

export const transformInputs = inputs => inputs.reduce((accumulator, inputObj) => {
  const key = R.path([NAME, 0, '@value'], inputObj);
  let val = R.path([VALUE, 0, '@value'], inputObj);

  if (typeof val === 'undefined' && inputObj[ITEM_LIST_ELEMENT]) {
    const itemList = R.path([ITEM_LIST_ELEMENT], inputObj);
    val = flattenItemList(itemList);
  }

  if (inputObj['@type'].includes(AUDIO_OBJECT)) {
    val = {
      contentUrl: languageListToObject(inputObj[CONTENT_URL]),
      transcript: languageListToObject(inputObj[TRANSCRIPT]),
    };
  }

  if (inputObj['@type'].includes(IMAGE_OBJECT)) {
    val = {
      contentUrl: languageListToObject(inputObj[CONTENT_URL]),
    };
  }

  return {
    ...accumulator,
    [key]: val,
  };
}, {});

export const transformVariableMap = variableAr => variableAr.reduce((accumulator, item) => {
  const val = R.path([VARIABLE_NAME, 0, '@value'], item);
  const key = R.path([IS_ABOUT, 0, '@id'], item);
  return {
    ...accumulator,
    [key]: val,
  };
}, {});

export const isSkippable = (allowList) => {
  if (allowList.includes(REFUSE_TO_ANSWER)) {
    return true;
  }
  if (allowList.includes(DO_NOT_KNOW)) {
    return true;
  }
  return false;
};

export const appletTransformJson = appletJson => ({
  id: appletJson._id,
  schema: languageListToObject(appletJson[URL]).en,
  name: languageListToObject(appletJson[PREF_LABEL]),
  description: languageListToObject(appletJson[DESCRIPTION]),
  schemaVersion: languageListToObject(appletJson[SCHEMA_VERSION]),
  version: languageListToObject(appletJson[VERSION]),
  altLabel: languageListToObject(appletJson[ALT_LABEL]),
  visibility: listToObject(appletJson[VISIBILITY]),
  image: languageListToObject(appletJson[IMAGE]),
  order: flattenIdList(appletJson[ORDER][0]['@list']),
  shuffle: R.path([SHUFFLE, 0, '@value'], appletJson),
});

export const itemTransformJson = (itemJson) => {
  // For items, 'skippable' is undefined if there's no ALLOW prop
  const allowList = flattenIdList(R.path([ALLOW, 0, '@list'], itemJson));
  const skippable = isSkippable(allowList) ? true : undefined;

  const valueConstraintsObj = R.pathOr({}, [VALUE_CONSTRAINTS, 0], itemJson);
  const valueConstraints = flattenValueConstraints(valueConstraintsObj);

  const inputs = R.pathOr([], [INPUTS], itemJson);
  const inputsObj = transformInputs(inputs);

  return {
    description: languageListToObject(itemJson[DESCRIPTION]),
    schemaVersion: languageListToObject(itemJson[SCHEMA_VERSION]),
    version: languageListToObject(itemJson[VERSION]),
    altLabel: languageListToObject(itemJson[ALT_LABEL]),
    inputType: listToValue(itemJson[INPUT_TYPE]),
    question: languageListToObject(itemJson[QUESTION]),
    preamble: languageListToObject(itemJson[PREAMBLE]),
    valueConstraints,
    skippable,
    fullScreen: allowList.includes(FULL_SCREEN),
    backDisabled: allowList.includes(BACK_DISABLED),
    autoAdvance: allowList.includes(AUTO_ADVANCE),
    inputs: inputsObj,
  };
};

export const itemAttachExtras = (
  transformedItem,
  schemaUri,
  variableMap = {},
  visibilityObj = {},
) => ({
  ...transformedItem,
  schema: schemaUri,
  variableName: variableMap[schemaUri],
  visibility: visibilityObj[variableMap[schemaUri]],
});

export const activityTransformJson = (activityJson, itemsJson) => {
  const allowList = flattenIdList(R.pathOr([], [ALLOW, 0, '@list'], activityJson));

  const scoringLogic = activityJson[SCORING_LOGIC]; // TO DO
  const notification = {}; // TO DO
  const info = languageListToObject(activityJson.info); // TO DO

  const variableMapAr = R.pathOr([], [VARIABLE_MAP, 0, '@list'], activityJson);
  const variableMap = transformVariableMap(variableMapAr);
  const visibility = listToObject(activityJson[VISIBILITY]);

  const order = flattenIdList(activityJson[ORDER][0]['@list']);
  const items = order.map((itemKey) => {
    const item = itemTransformJson(itemsJson[itemKey]);
    return itemAttachExtras(item, itemKey, variableMap, visibility);
  });

  return {
    id: activityJson._id,
    name: languageListToObject(activityJson[PREF_LABEL]),
    description: languageListToObject(activityJson[DESCRIPTION]),
    schemaVersion: languageListToObject(activityJson[SCHEMA_VERSION]),
    version: languageListToObject(activityJson[VERSION]),
    preamble: languageListToObject(activityJson[PREAMBLE]),
    altLabel: languageListToObject(activityJson[ALT_LABEL]),
    shuffle: R.path([SHUFFLE, 0, '@value'], activityJson),
    image: languageListToObject(activityJson[IMAGE]),
    skippable: isSkippable(allowList),
    backDisabled: allowList.includes(BACK_DISABLED),
    fullScreen: allowList.includes(FULL_SCREEN),
    autoAdvance: allowList.includes(AUTO_ADVANCE),
    scoringLogic,
    notification,
    info,
    items,
  };
};

export const transformApplet = (payload) => {
  const activities = Object.keys(payload.activities)
    .map((key) => {
      const activity = activityTransformJson(payload.activities[key], payload.items);
      activity.schema = key;
      return activity;
    });
  const applet = appletTransformJson(payload.applet);

  // Add the items and activities to the applet object
  applet.activities = activities;

  return applet;
};
