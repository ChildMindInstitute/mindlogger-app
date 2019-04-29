import * as R from 'ramda';

const ALLOW = 'https://schema.repronim.org/allow';
const ALT_LABEL = 'http://www.w3.org/2004/02/skos/core#altLabel';
const DESCRIPTION = 'http://schema.org/description';
const DO_NOT_KNOW = 'https://schema.repronim.org/dont_know_answer';
const IMAGE = 'http://schema.org/image';
const INPUT_TYPE = 'https://schema.repronim.org/inputType';
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
const URL = 'http://schema.org/url';
const VALUE = 'http://schema.org/value';
const VALUE_CONSTRAINTS = 'https://schema.repronim.org/valueconstraints';
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
}, {});

export const appletTransformJson = appletJson => ({
  id: appletJson._id,
  schema: languageListToObject(appletJson[URL]).en,
  name: languageListToObject(appletJson[PREF_LABEL]),
  description: languageListToObject(appletJson[DESCRIPTION]),
  schemaVersion: languageListToObject(appletJson[SCHEMA_VERSION]),
  version: languageListToObject(appletJson[VERSION]),
  altLabel: languageListToObject(appletJson[ALT_LABEL]),
  visibility: listToObject(appletJson[VISIBILITY]),
  order: flattenIdList(appletJson[ORDER][0]['@list']),
  shuffle: R.path([SHUFFLE, 0, '@value'], appletJson),
});

export const itemTransformJson = (itemKey, itemJson) => {
  const valueConstraintsObj = R.pathOr({}, [VALUE_CONSTRAINTS, 0], itemJson);
  const valueConstraints = flattenValueConstraints(valueConstraintsObj);

  return {
    schema: itemKey,
    name: languageListToObject(itemJson[PREF_LABEL]),
    description: languageListToObject(itemJson[DESCRIPTION]),
    schemaVersion: languageListToObject(itemJson[SCHEMA_VERSION]),
    version: languageListToObject(itemJson[VERSION]),
    altLabel: languageListToObject(itemJson[ALT_LABEL]),
    inputType: listToValue(itemJson[INPUT_TYPE]),
    question: languageListToObject(itemJson[QUESTION]),
    preamble: languageListToObject(itemJson[PREAMBLE]),
    valueConstraints,
  };
};

export const activityTransformJson = (activityJson, itemsJson) => {
  const allowList = flattenIdList(R.pathOr([], [ALLOW, 0, '@list'], activityJson));
  const allowRefuseToAnswer = allowList.includes(REFUSE_TO_ANSWER);
  const allowDoNotKnow = allowList.includes(DO_NOT_KNOW);

  const scoringLogic = activityJson[SCORING_LOGIC]; // TO DO
  const notification = {}; // TO DO
  const info = languageListToObject(activityJson.info); // TO DO

  const order = flattenIdList(activityJson[ORDER][0]['@list']);
  const items = order.map(itemKey => itemTransformJson(itemKey, itemsJson[itemKey]));

  return {
    id: activityJson._id,
    name: languageListToObject(activityJson[PREF_LABEL]),
    description: languageListToObject(activityJson[DESCRIPTION]),
    schemaVersion: languageListToObject(activityJson[SCHEMA_VERSION]),
    version: languageListToObject(activityJson[VERSION]),
    preamble: languageListToObject(activityJson[PREAMBLE]),
    altLabel: languageListToObject(activityJson[ALT_LABEL]),
    visibility: listToObject(activityJson[VISIBILITY]),
    shuffle: R.path([SHUFFLE, 0, '@value'], activityJson),
    image: languageListToObject(activityJson[IMAGE]),
    allowRefuseToAnswer,
    allowDoNotKnow,
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
