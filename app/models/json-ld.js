import * as R from "ramda";

const ALLOW = "reprolib:terms/allow";
const ABOUT = "reprolib:terms/landingPage";
const ALT_LABEL = "http://www.w3.org/2004/02/skos/core#altLabel";
const AUDIO_OBJECT = "schema:AudioObject";
const AUTO_ADVANCE = "reprolib:terms/auto_advance";
const BACK_DISABLED = "reprolib:terms/disable_back";
const CONTENT_URL = "schema:contentUrl";
const DELAY = "reprolib:terms/delay";
const DESCRIPTION = "schema:description";
const DO_NOT_KNOW = "reprolib:terms/dont_know_answer";
const ENCODING_FORMAT = "schema:encodingFormat";
const FULL_SCREEN = "reprolib:terms/full_screen";
const IMAGE = "schema:image";
const IMAGE_OBJECT = "schema:ImageObject";
const INPUT_TYPE = "reprolib:terms/inputType";
const INPUTS = "reprolib:terms/inputs";
const IS_ABOUT = "reprolib:terms/isAbout";
const ITEM_LIST_ELEMENT = "schema:itemListElement";
const MAX_VALUE = "schema:maxValue";
const MEDIA = "reprolib:terms/media";
const MIN_VALUE = "schema:minValue";
const MULTIPLE_CHOICE = "reprolib:terms/multipleChoice";
const NAME = "schema:name";
const PREAMBLE = "reprolib:terms/preamble";
const PREF_LABEL = "http://www.w3.org/2004/02/skos/core#prefLabel";
const QUESTION = "schema:question";
const REFUSE_TO_ANSWER = "reprolib:terms/refused_to_answer";
const REQUIRED_VALUE = "reprolib:terms/required";
const SCHEMA_VERSION = "schema:schemaVersion";
const SCORING_LOGIC = "reprolib:terms/scoringLogic";
const SHUFFLE = "reprolib:terms/shuffle";
const TIMER = "reprolib:terms/timer";
const TRANSCRIPT = "schema:transcript";
const URL = "schema:url";
const VALUE = "schema:value";
const RESPONSE_OPTIONS = "reprolib:terms/responseOptions";
const VARIABLE_NAME = "reprolib:terms/variableName";
const JS_EXPRESSION = "reprolib:terms/jsExpression";
const VERSION = "schema:version";
const IS_VIS = "reprolib:terms/isVis";
const ADD_PROPERTIES = "reprolib:terms/addProperties";
const COMPUTE = "reprolib:terms/compute";
const MESSAGES = "reprolib:terms/messages";
const MESSAGE = "reprolib:terms/message";
export const ORDER = "reprolib:terms/order";

export const languageListToObject = (list) => {
  if (
    typeof list === "undefined" ||
    typeof list === "string" ||
    list.length === 0
  ) {
    return undefined;
  }
  return list.reduce(
    (obj, item) => ({
      ...obj,
      [item["@language"]]: item["@value"],
    }),
    {}
  );
};

export const listToObject = (list = []) =>
  list.reduce(
    (obj, item) => ({
      ...obj,
      [item["@index"]]: item["@value"],
    }),
    {}
  );

export const listToVisObject = (list = []) =>
  list.reduce(
    (obj, item) => ({
      ...obj,
      [item[VARIABLE_NAME][0]["@value"]]: item[IS_VIS] ? item[IS_VIS][0]["@value"] : true,
    }),
    {}
  );

export const listToValue = (list = []) =>
  list.length > 0 ? list[0]["@value"] : undefined;

export const flattenIdList = (list = []) => list.map((item) => item["@id"]);

export const flattenItemList = (list = []) =>
  list.map((item) => ({
    name: languageListToObject(item[NAME]),
    value: R.path([VALUE, 0, "@value"], item),
    image: item[IMAGE],
    valueConstraints: item[RESPONSE_OPTIONS]
      ? flattenValueConstraints(R.path([RESPONSE_OPTIONS, 0], item))
      : undefined,
  }));

export const flattenValueConstraints = (vcObj) =>
  Object.keys(vcObj).reduce((accumulator, key) => {
    if (key === MAX_VALUE) {
      return { ...accumulator, maxValue: R.path([key, 0, "@value"], vcObj) };
    }
    if (key === MIN_VALUE) {
      return { ...accumulator, minValue: R.path([key, 0, "@value"], vcObj) };
    }
    if (key === MULTIPLE_CHOICE) {
      return {
        ...accumulator,
        multipleChoice: R.path([key, 0, "@value"], vcObj),
      };
    }
    if (key === ITEM_LIST_ELEMENT) {
      const itemList = R.path([key], vcObj);
      return { ...accumulator, itemList: flattenItemList(itemList) };
    }
    if (key === REQUIRED_VALUE) {
      return { ...accumulator, required: R.path([key, 0, "@value"], vcObj) };
    }
    if (key === IMAGE) {
      return { ...accumulator, image: vcObj[key] };
    }
    return accumulator;
  }, {});

export const transformInputs = (inputs) =>
  inputs.reduce((accumulator, inputObj) => {
    const key = R.path([NAME, 0, "@value"], inputObj);
    let val = R.path([VALUE, 0, "@value"], inputObj);

    if (typeof val === "undefined" && inputObj[ITEM_LIST_ELEMENT]) {
      const itemList = R.path([ITEM_LIST_ELEMENT], inputObj);
      val = flattenItemList(itemList);
    }

    if (inputObj["@type"].includes(AUDIO_OBJECT)) {
      val = {
        contentUrl: languageListToObject(inputObj[CONTENT_URL]),
        transcript: languageListToObject(inputObj[TRANSCRIPT]),
      };
    }

    if (inputObj["@type"].includes(IMAGE_OBJECT)) {
      val = {
        contentUrl: languageListToObject(inputObj[CONTENT_URL]),
      };
    }

    return {
      ...accumulator,
      [key]: val,
    };
  }, {});

export const transformVariableMap = (variableAr) =>
  variableAr.reduce((accumulator, item) => {
    const val = R.path([VARIABLE_NAME, 0, "@value"], item);
    const key = R.path([IS_ABOUT, 0, "@id"], item);
    return {
      ...accumulator,
      [key]: val,
    };
  }, {});

export const transformMedia = (mediaObj) => {
  if (typeof mediaObj === "undefined") {
    return undefined;
  }

  const keys = Object.keys(mediaObj);
  return keys.map((key) => {
    const media = mediaObj[key];
    return {
      contentUrl: R.path([0, CONTENT_URL, 0, "@value"], media),
      transcript: R.path([0, TRANSCRIPT, 0, "@value"], media),
      encodingType: R.path([0, ENCODING_FORMAT, 0, "@value"], media),
      name: R.path([0, NAME, 0, "@value"], media),
    };
  });
};

export const isSkippable = (allowList) => {
  if (allowList.includes(REFUSE_TO_ANSWER)) {
    return true;
  }
  if (allowList.includes(DO_NOT_KNOW)) {
    return true;
  }
  return false;
};

export const itemTransformJson = (itemJson) => {
  // For items, 'skippable' is undefined if there's no ALLOW prop
  const allowList = flattenIdList(R.path([ALLOW, 0, "@list"], itemJson));
  const skippable = isSkippable(allowList) ? true : undefined;

  const valueConstraintsObj = R.pathOr({}, [RESPONSE_OPTIONS, 0], itemJson);
  const valueConstraints = flattenValueConstraints(valueConstraintsObj);

  const inputs = R.pathOr([], [INPUTS], itemJson);
  const inputsObj = transformInputs(inputs);

  const media = transformMedia(R.path([MEDIA, 0], itemJson));

  const res = {
    id: itemJson._id,
    description: languageListToObject(itemJson[DESCRIPTION]),
    schemaVersion: languageListToObject(itemJson[SCHEMA_VERSION]),
    version: languageListToObject(itemJson[VERSION]),
    altLabel: languageListToObject(itemJson[ALT_LABEL]),
    inputType: listToValue(itemJson[INPUT_TYPE]),
    question: languageListToObject(itemJson[QUESTION]),
    preamble: languageListToObject(itemJson[PREAMBLE]),
    timer: R.path([TIMER, 0, "@value"], itemJson),
    delay: R.path([DELAY, 0, "@value"], itemJson),
    valueConstraints,
    skippable,
    fullScreen: allowList.includes(FULL_SCREEN),
    backDisabled: allowList.includes(BACK_DISABLED),
    autoAdvance: allowList.includes(AUTO_ADVANCE),
    inputs: inputsObj,
    media,
  };
  return res;
};

export const itemAttachExtras = (
  transformedItem,
  schemaUri,
  addProperties = {},
) => ({
  ...transformedItem,
  schema: schemaUri,
  variableName: R.path([0, "@value"], addProperties[VARIABLE_NAME]),
  visibility: R.path([0, "@value"], addProperties[IS_VIS]),
});

const SHORT_PREAMBLE_LENGTH = 90;

export const attachPreamble = (preamble, items) => {
  const text = preamble ? preamble.en : "";
  if (text && text.length > SHORT_PREAMBLE_LENGTH) {
    return R.prepend(
      {
        inputType: "markdown-message",
        preamble,
      },
      items
    );
  }
  if (text && items.length > 0) {
    return R.assocPath([0, "preamble"], preamble, items);
  }
  return items;
};

export const activityTransformJson = (activityJson, itemsJson) => {
  const allowList = flattenIdList(
    R.pathOr([], [ALLOW, 0, "@list"], activityJson)
  );
  const scoringLogic = activityJson[SCORING_LOGIC]; // TO DO
  const notification = {}; // TO DO
  const info = languageListToObject(activityJson.info); // TO DO
  const addProperties = activityJson[ADD_PROPERTIES];

  const preamble = languageListToObject(activityJson[PREAMBLE]);
  const order = (activityJson[ORDER] && flattenIdList(activityJson[ORDER][0]["@list"])) || [];
  let itemIndex = -1;

  const mapItems = R.map((itemKey) => {
    itemIndex += 1;
    const item = itemTransformJson(itemsJson[itemKey]);
    return itemAttachExtras(item, itemKey, addProperties[itemIndex]);
  });
  const items = attachPreamble(preamble, mapItems(order));

  const compute = activityJson[COMPUTE] && R.map((item) => { 
    return {
      jsExpression: R.path([JS_EXPRESSION, 0, "@value"], item),
      variableName: R.path([VARIABLE_NAME, 0, "@value"], item)
    }
  }, activityJson[COMPUTE]);
  const messages = activityJson[MESSAGES] && R.map((item) => {
    return {
      message: R.path([MESSAGE, 0, "@value"], item),
      jsExpression: R.path([JS_EXPRESSION, 0, "@value"], item)
    }
  }, activityJson[MESSAGES]);

  return {
    id: activityJson._id,
    name: languageListToObject(activityJson[PREF_LABEL]),
    description: languageListToObject(activityJson[DESCRIPTION]),
    schemaVersion: languageListToObject(activityJson[SCHEMA_VERSION]),
    version: languageListToObject(activityJson[VERSION]),
    altLabel: languageListToObject(activityJson[ALT_LABEL]),
    shuffle: R.path([SHUFFLE, 0, "@value"], activityJson),
    image: languageListToObject(activityJson[IMAGE]),
    skippable: isSkippable(allowList),
    backDisabled: allowList.includes(BACK_DISABLED),
    fullScreen: allowList.includes(FULL_SCREEN),
    autoAdvance: allowList.includes(AUTO_ADVANCE),
    compute,
    messages,
    preamble,
    scoringLogic,
    notification,
    info,
    items,
  };
};

export const appletTransformJson = (appletJson) => {
  const res = {
    id: appletJson._id,
    groupId: appletJson.groups,
    schema: appletJson.url || appletJson[URL],
    name: languageListToObject(appletJson[PREF_LABEL]),
    description: languageListToObject(appletJson[DESCRIPTION]),
    about: languageListToObject(appletJson[ABOUT]),
    schemaVersion: languageListToObject(appletJson[SCHEMA_VERSION]),
    version: languageListToObject(appletJson[VERSION]),
    altLabel: languageListToObject(appletJson[ALT_LABEL]),
    visibility: listToVisObject(appletJson[ADD_PROPERTIES]),
    image: appletJson[IMAGE],
    order: flattenIdList(appletJson[ORDER][0]["@list"]),
    schedule: appletJson.schedule,
    responseDates: appletJson.responseDates,
    shuffle: R.path([SHUFFLE, 0, "@value"], appletJson),
  };
  if (appletJson.encryption && Object.keys(appletJson.encryption).length) {
    res.encryption = appletJson.encryption;
  }
  return res;
};

export const transformApplet = (payload) => {
  const activities = Object.keys(payload.activities).map((key) => {
    const activity = activityTransformJson(
      payload.activities[key],
      payload.items,
    );
    activity.schema = key;
    return activity;
  });
  const applet = appletTransformJson(payload.applet);
  // Add the items and activities to the applet object
  applet.activities = activities;
  applet.groupId = payload.groups;
  console.log('app---->', applet);
  return applet;
};
