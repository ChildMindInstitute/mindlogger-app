const DESCRIPTION = 'http://schema.org/description';
const SCHEMA_VERSION = 'http://schema.org/schemaVersion';
const VERSION = 'http://schema.org/version';
const ALT_LABEL = 'http://www.w3.org/2004/02/skos/core#altLabel';
const PREF_LABEL = 'http://www.w3.org/2004/02/skos/core#prefLabel';
const ORDER = 'https://schema.repronim.org/order';
const SHUFFLE = 'https://schema.repronim.org/shuffle';
const VISIBILITY = 'https://schema.repronim.org/visibility';
const PREAMBLE = 'http://schema.repronim.org/preamble';
const SCORING_LOGIC = 'https://schema.repronim.org/scoringLogic';
const REFUSE_TO_ANSWER = 'https://schema.repronim.org/refused_to_answer';
const DO_NOT_KNOW = 'https://schema.repronim.org/dont_know_answer';
const ALLOW = 'https://schema.repronim.org/allow';
const IMAGE = 'http://schema.org/image';

export const languageListToObject = (list = []) => list.reduce((obj, item) => ({
  ...obj,
  [item['@language']]: item['@value'],
}), {});

export const listToObject = (list = []) => list.reduce((obj, item) => ({
  ...obj,
  [item['@index']]: item['@value'],
}), {});

export const flattenIdList = (list = []) => list.map(item => item['@id']);

export const appletTransformJson = (appletJson) => {
  const name = languageListToObject(appletJson[PREF_LABEL]);
  const description = languageListToObject(appletJson[DESCRIPTION]);
  const schemaVersion = languageListToObject(appletJson[SCHEMA_VERSION]);
  const version = languageListToObject(appletJson[VERSION]);
  const altLabel = languageListToObject(appletJson[ALT_LABEL]);
  const visibility = listToObject(appletJson[VISIBILITY]);
  const order = flattenIdList(appletJson[ORDER][0]['@list']);
  return {
    name: name.en,
    description: description.en,
    altLabel: altLabel.en,
    schemaVersion: schemaVersion.en,
    version: version.en,
    shuffle: appletJson[SHUFFLE][0]['@value'],
    visibility,
    order,
  };
};

export const activityTransformJson = (activityJson) => {
  const name = languageListToObject(activityJson[PREF_LABEL]);
  const description = languageListToObject(activityJson[DESCRIPTION]);
  const schemaVersion = languageListToObject(activityJson[SCHEMA_VERSION]);
  const version = languageListToObject(activityJson[VERSION]);
  const preamble = languageListToObject(activityJson[PREAMBLE]);
  const altLabel = languageListToObject(activityJson[ALT_LABEL]);
  const visibility = listToObject(activityJson[VISIBILITY]);
  const order = flattenIdList(activityJson[ORDER][0]['@list']);

  const allowList = activityJson[ALLOW] ? flattenIdList(activityJson[ALLOW][0]['@list']) : [];
  const allowRefuseToAnswer = allowList.includes(REFUSE_TO_ANSWER);
  const allowDoNotKnow = allowList.includes(DO_NOT_KNOW);

  const scoringLogic = activityJson[SCORING_LOGIC]; // TO DO
  const image = activityJson[IMAGE]; // TO DO
  const notification = {}; // TO DO
  const info = languageListToObject(activityJson.info); // TO DO

  return {
    name: name.en,
    description: description.en,
    altLabel: altLabel.en,
    schemaVersion: schemaVersion.en,
    version: version.en,
    preamble: preamble.en,
    image,
    shuffle: activityJson[SHUFFLE][0]['@value'],
    scoringLogic,
    visibility,
    order,
    allowRefuseToAnswer,
    allowDoNotKnow,
    notification,
    info: info.en,
  };
};
