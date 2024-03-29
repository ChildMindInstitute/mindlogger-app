import * as R from "ramda";
import moment from 'moment';
import { Parse, Day } from 'dayspan';
import _ from 'lodash';
import {
  getLastScheduled,
  getStartOfInterval,
  getNextScheduled,
  getScheduledNotifications,
} from '../services/time';
import { getIdBySplit, buildExactDateFromUTC } from '../utils'

const ALLOW = "reprolib:terms/allow";
const ABOUT = "reprolib:terms/landingPage";
const LANDING_PAGE_TYPE = "reprolib:terms/landingPageType";
const ABOUT_CONTENT = "reprolib:terms/landingPageContent";
const ALT_LABEL = "http://www.w3.org/2004/02/skos/core#altLabel";
const AUDIO_OBJECT = "schema:AudioObject";
const AUTO_ADVANCE = "reprolib:terms/auto_advance";
const ALLOW_EXPORT = "reprolib:terms/allow_export";
const BACK_DISABLED = "reprolib:terms/disable_back";
const SUMMARY_DISABLED = "reprolib:terms/disable_summary";
const CONTENT_URL = "schema:contentUrl";
const DELAY = "reprolib:terms/delay";
const DESCRIPTION = "schema:description";
const SPLASH = "schema:splash";
const DO_NOT_KNOW = "reprolib:terms/dont_know_answer";
const ENCODING_FORMAT = "schema:encodingFormat";
const FULL_SCREEN = "reprolib:terms/full_screen";
const IMAGE = "schema:image";
const WATERMARK = "schema:watermark";
const IMAGE_OBJECT = "schema:ImageObject";
const INPUT_TYPE = "reprolib:terms/inputType";
const INPUTS = "reprolib:terms/inputs";
const IS_ABOUT = "reprolib:terms/isAbout";
const ITEM_LIST_ELEMENT = "schema:itemListElement";
const MAX_VALUE = "schema:maxValue";
const MEDIA = "reprolib:terms/media";
const TIME_DURATION = "schema:timeDuration";
const MIN_VALUE = "schema:minValue";
const MIN_AGE = "schema:minAge";
const MAX_AGE = "schema:maxAge";
const MULTIPLE_CHOICE = "reprolib:terms/multipleChoice";
const MIN_VALUE_IMAGE = "schema:minValueImg";
const MAX_VALUE_IMAGE = "schema:maxValueImg";
const SLIDER_LABEL = "schema:sliderLabel";
const SCORING = "reprolib:terms/scoring";
const ITEM_LIST = "reprolib:terms/itemList";
const ITEM_OPTIONS = "reprolib:terms/itemOptions";
const OPTIONS = "reprolib:terms/options";
const SLIDER_OPTIONS = "reprolib:terms/sliderOptions";
const VALUE_TYPE = "reprolib:terms/valueType";
const ENABLE_NEGATIVE_TOKENS = "reprolib:terms/enableNegativeTokens";
const NAME = "schema:name";
const PREAMBLE = "reprolib:terms/preamble";
const PREF_LABEL = "http://www.w3.org/2004/02/skos/core#prefLabel";
const QUESTION = "schema:question";
const REFUSE_TO_ANSWER = "reprolib:terms/refused_to_answer";
const REQUIRED_VALUE = "reprolib:terms/required";
const SCHEMA_VERSION = "schema:schemaVersion";
const SCORING_LOGIC = "reprolib:terms/scoringLogic";
const SHUFFLE = "reprolib:terms/shuffle";
const ISPRIZE = "reprolib:terms/isPrize";
const TIMER = "reprolib:terms/timer";
const TRANSCRIPT = "schema:transcript";
const URL = "schema:url";
const VALUE = "schema:value";
const COLOR = "schema:color";
const PRICE = "schema:price";
const SCORE = "schema:score";
const ALERT = "schema:alert";
const CORRECT_ANSWER = "schema:correctAnswer";
const RESPONSE_OPTIONS = "reprolib:terms/responseOptions";
const VARIABLE_NAME = "reprolib:terms/variableName";
const JS_EXPRESSION = "reprolib:terms/jsExpression";
const SCORE_OVERVIEW = "reprolib:terms/scoreOverview";
const DIRECTION = "reprolib:terms/direction";
const VERSION = "schema:version";
export const IS_VIS = "reprolib:terms/isVis";
const ADD_PROPERTIES = "reprolib:terms/addProperties";
const SUBSCALES = "reprolib:terms/subScales";
const FINAL_SUBSCALE = "reprolib:terms/finalSubScale";
const IS_AVERAGE_SCORE = "reprolib:terms/isAverageScore";
const MESSAGE = "reprolib:terms/message";
const LOOKUP_TABLE = "reprolib:terms/lookupTable";
const AGE = "reprolib:terms/age";
const RAW_SCORE = "reprolib:terms/rawScore";
const SEX = "reprolib:terms/sex";
const T_SCORE = "reprolib:terms/tScore";
const OUTPUT_TEXT  ="reprolib:terms/outputText";
const OUTPUT_TYPE = "reprolib:terms/outputType";
const NEXT_ACTIVITY = "reprolib:terms/nextActivity";
const HIDE_ACTIVITY = "reprolib:terms/hideActivity";
const IS_RECOMMENDED = "reprolib:terms/isRecommended";
const RESPONSE_ALERT = "reprolib:terms/responseAlert";
const RANDOMIZE_OPTIONS = "reprolib:terms/randomizeOptions";
const REMOVE_UNDO_OPTION = "reprolib:terms/removeUndoOption";
const REMOVE_BACK_OPTION = "reprolib:terms/removeBackOption";
const TOP_NAVIGATION_OPTION = "reprolib:terms/topNavigationOption"
const COLOR_PALETTE = "reprolib:terms/colorPalette";
const CONTINOUS_SLIDER = "reprolib:terms/continousSlider";
const TICK_MARK = "reprolib:terms/tickMark";
const TICK_LABEL = "reprolib:terms/tickLabel";
const TEXT_ANCHORS = "reprolib:terms/textAnchors";
const SHOW_TICK_MARKS = "reprolib:terms/showTickMarks";
const IS_OPTIONAL_TEXT = "reprolib:terms/isOptionalText";
const IS_OPTIONAL_TEXT_REQUIRED =  "reprolib:terms/isOptionalTextRequired";
const IS_REVIEWER_ACTIVITY = "reprolib:terms/isReviewerActivity";
const MAX_LENGTH = "reprolib:terms/maxLength";
const RESPONSE_ALERT_MESSAGE = "schema:responseAlertMessage";
const MIN_ALERT_VALUE = "schema:minAlertValue";
const MAX_ALERT_VALUE = "schema:maxAlertValue";
const NEGATIVE_BEHAVIORS = "reprolib:terms/negativeBehaviors";
const POSITIVE_BEHAVIORS = "reprolib:terms/positiveBehaviors";
const START_TIME = "schema:startTime";
const END_TIME = "schema:endTime";
const RATE = "schema:rate";
const TIME_SCREEN = "reprolib:terms/timeScreen";
const STREAM_ENABLED = "reprolib:terms/streamEnabled";
const COMBINE_REPORTS = "reprolib:terms/combineReports";
const SHOW_BADGE = "reprolib:terms/showBadge";
const REPORT_CONFIGS = "reprolib:terms/reportConfigs"
const ACTIVITY_FLOW_ORDER = "reprolib:terms/activityFlowOrder";
const ACTIVITY_FLOW_PROPERTIES = "reprolib:terms/activityFlowProperties";
const REPORTS = "reprolib:terms/reports";
const PRINT_ITEMS = "reprolib:terms/printItems";
const CONDITIONALS = "reprolib:terms/conditionals";
const FLAG_SCORE = "reprolib:terms/flagScore";
const ACTIVITY_TYPE = "reprolib:terms/activityType";

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
    id: R.path(['@id'], item),
    value: R.path([VALUE, 0, "@value"], item),
    color: R.path([COLOR, 0, "@value"], item),
    price: R.path([PRICE, 0, "@value"], item),
    score: R.path([SCORE, 0, "@value"], item),
    alert: R.path([ALERT, 0, "@value"], item),
    order: item[ORDER] && flattenIdList(R.path([ORDER, 0, "@list"], item)),
    isVis: item[IS_VIS] ? R.path([IS_VIS, 0, "@value"], item) : false,
    description: R.path([DESCRIPTION, 0, "@value"], item),
    image: item[IMAGE],
    valueConstraints: item[RESPONSE_OPTIONS]
      ? flattenValueConstraints(R.path([RESPONSE_OPTIONS, 0], item))
      : undefined,
}));

export const flattenValueConstraints = (vcObj) =>
  Object.keys(vcObj).reduce((accumulator, key) => {
    if (key === '@type') {
      return { ...accumulator, valueType: R.path([key, 0], vcObj) };
    }
    if (key === MAX_VALUE) {
      return { ...accumulator, maxValue: R.path([key, 0, "@value"], vcObj) };
    }
    if (key === TIME_DURATION) {
      return { ...accumulator, timeDuration: R.path([key, 0, "@value"], vcObj) };
    }
    if (key === MIN_VALUE) {
      return { ...accumulator, minValue: R.path([key, 0, "@value"], vcObj) };
    }
    if (key === MIN_AGE) {
      return { ...accumulator, minAge: Number(R.path([key, 0, "@value"], vcObj)) };
    }
    if (key === MAX_AGE) {
      return { ...accumulator, maxAge: Number(R.path([key, 0, "@value"], vcObj)) };
    }
    if (key === MULTIPLE_CHOICE) {
      return {
        ...accumulator,
        multipleChoice: R.path([key, 0, "@value"], vcObj),
      };
    }

    if (key === TIME_SCREEN) {
      return {
        ...accumulator,
        timeScreen: R.path([key, 0, "@value"], vcObj),
      }
    }

    if (key === NEGATIVE_BEHAVIORS) {
      const behaviorList = R.path([key], vcObj);

      return {
        ...accumulator,
        negativeBehaviors: behaviorList.map(behavior => ({
          endTime: R.path([END_TIME, 0, '@value'], behavior),
          startTime: R.path([START_TIME, 0, '@value'], behavior),
          name: R.path([NAME, 0, '@value'], behavior),
          rate: Number(R.path([RATE, 0, '@value'], behavior)),
          value: Number(R.path([VALUE, 0, '@value'], behavior)),
          image: R.path([IMAGE], behavior),
        }))
      }
    }

    if (key === POSITIVE_BEHAVIORS) {
      const behaviorList = R.path([key], vcObj);

      return {
        ...accumulator,
        positiveBehaviors: behaviorList.map(behavior => ({
          name: R.path([NAME, 0, '@value'], behavior),
          value: Number(R.path([VALUE, 0, '@value'], behavior)),
          image: R.path([IMAGE], behavior),
        }))
      }
    }

    if (key === IS_OPTIONAL_TEXT_REQUIRED) {
      return {
        ...accumulator,
        isOptionalTextRequired: R.path([key, 0, "@value"], vcObj),
      };
    }
    if (key === SCORING) {
      return {
        ...accumulator,
        scoring: R.path([key, 0, "@value"], vcObj),
      };
    }
    if (key === SHOW_TICK_MARKS) {
      return {
        ...accumulator,
        showTickMarks: R.path([key, 0, "@value"], vcObj),
      }

    }

  /*  if (key == IS_OPTIONAL_TEXT) {
      return {
        ...accumulator,
        isOptionalText: R.path([key, 0, "@value"], vcObj),
      }
    }*/

    if (key == RESPONSE_ALERT) {
      return {
        ...accumulator,
        responseAlert: R.path([key, 0, "@value"], vcObj),
      }
    }

    if (key == RANDOMIZE_OPTIONS) {
      return {
        ...accumulator,
        randomizeOptions: R.path([key, 0, "@value"], vcObj)
      }
    }

    if (key === REMOVE_UNDO_OPTION) {
      return {
        ...accumulator,
        removeUndoOption: R.path([key, 0, "@value"], vcObj)
      }
    }

    if (key === REMOVE_BACK_OPTION) {
      return {
        ...accumulator,
        removeBackOption: R.path([key, 0, "@value"], vcObj)
      }
    }

    if (key == MAX_LENGTH) {
      return {
        ...accumulator,
        maxLength: R.path([key, 0, "@value"], vcObj)
      }
    }

    if (key === TOP_NAVIGATION_OPTION) {
      return {
        ...accumulator,
        topNavigation: R.path([key, 0, "@value"], vcObj)
      }
    }

    if (key === COLOR_PALETTE) {
      return {
        ...accumulator,
        colorPalette: R.path([key, 0, "@value"], vcObj)
      }
    }

    if (key === CONTINOUS_SLIDER) {
      return {
        ...accumulator,
        continousSlider: R.path([key, 0, "@value"], vcObj),
      }
    }

    if (key === TEXT_ANCHORS) {
      return {
        ...accumulator,
        textAnchors: R.path([key, 0, "@value"], vcObj),
      }
    }

    if (key === TICK_LABEL) {
      return {
        ...accumulator,
        tickLabel: R.path([key, 0, "@value"], vcObj),
      }
    }

    if (key === TICK_MARK) {
      return {
        ...accumulator,
        tickMark: R.path([key, 0, "@value"], vcObj),
      }
    }

    if (key === RESPONSE_ALERT_MESSAGE) {
      return {
        ...accumulator,
        responseAlertMessage: R.path([key, 0, "@value"], vcObj),
      }
    }
    if (key === MIN_ALERT_VALUE) {
      return {
        ...accumulator,
        minAlertValue: R.path([key, 0, "@value"], vcObj)
      }
    }

    if (key === MIN_VALUE_IMAGE) {
      return {
        ...accumulator,
        minValueImg: R.path([key, 0, "@value"], vcObj)
      }
    }

    if (key === MAX_VALUE_IMAGE) {
      return {
        ...accumulator,
        maxValueImg: R.path([key, 0, "@value"], vcObj)
      }
    }

    if (key === MAX_ALERT_VALUE) {
      return {
        ...accumulator,
        maxAlertValue: R.path([key, 0, "@value"], vcObj)
      }
    }
    if (key === VALUE_TYPE) {
      return {
        ...accumulator,
        valueType: R.path([key, 0, "@id"], vcObj),
      };
    }
    if (key === ENABLE_NEGATIVE_TOKENS) {
      return {
        ...accumulator,
        enableNegativeTokens: R.path([key, 0, "@value"], vcObj),
      };
    }
    if (key === ITEM_LIST_ELEMENT) {
      const itemList = R.path([key], vcObj);
      return { ...accumulator, itemList: flattenItemList(itemList) };
    }
    if (key === ITEM_LIST) {
      const itemList = R.path([key], vcObj);
      return { ...accumulator, itemList: itemList.map(item => ({
        description: R.path([DESCRIPTION, 0, "@value"], item),
        image: item[IMAGE],
        name: languageListToObject(item[NAME])
      })) };
    }

    if (key === ITEM_OPTIONS) {
      const itemOptions = R.path([key], vcObj);
      return { ...accumulator, itemOptions: itemOptions.map(option => ({
        score: R.path([SCORE, 0, "@value"], option),
        value: R.path([VALUE, 0, "@value"], option),
        alert: R.path([ALERT, 0, "@value"], option)
      })) };
    }

    if (key === OPTIONS) {
      const options = R.path([key], vcObj);
      return { ...accumulator, options: options.map(option => ({
        description: R.path([DESCRIPTION, 0, "@value"], option),
        image: option[IMAGE],
        name: languageListToObject(option[NAME])
      }))}
    }

    if (key === SLIDER_OPTIONS) {
      const sliderOptions = R.path([SLIDER_OPTIONS], vcObj);

      return { ...accumulator, sliderOptions: sliderOptions.map(option => ({
        minValue: R.path([MIN_VALUE, 0, "@value"], option),
        maxValue: R.path([MAX_VALUE, 0, "@value"], option),
        minValueImg: R.path([MIN_VALUE_IMAGE, 0, "@value"], option),
        maxValueImg: R.path([MAX_VALUE_IMAGE, 0, "@value"], option),
        sliderLabel: R.path([SLIDER_LABEL, 0, "@value"], option),
        itemList: flattenItemList(R.path([ITEM_LIST_ELEMENT], option))
      }))}
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
    const type = R.path(["@type", 0], inputObj);
    let val = (R.path([VALUE], inputObj) || []).map(d => d["@value"]);

    if (type !== 'http://schema.org/List') {
      val = val[0];
    }

    if (key == 'fixationScreen') {
      val = {
        value: R.path([VALUE, 0, "@value"], inputObj),
        image: R.path([IMAGE], inputObj)
      };
    }

    if (typeof val === "undefined" && inputObj[ITEM_LIST_ELEMENT]) {
      const itemList = R.path([ITEM_LIST_ELEMENT], inputObj);
      val = flattenItemList(itemList);
    }

    if (inputObj["@type"] && inputObj["@type"].includes(AUDIO_OBJECT)) {
      val = {
        contentUrl: languageListToObject(inputObj[CONTENT_URL]),
        transcript: languageListToObject(inputObj[TRANSCRIPT]),
      };
    }

    if (inputObj["@type"] && inputObj["@type"].includes(IMAGE_OBJECT)) {
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

export const flattenLookupTable = (lookupTable, isFinalSubScale) => {
  if (!Array.isArray(lookupTable)) {
    return undefined;
  }

  let references = {
    [RAW_SCORE]: 'rawScore',
    [OUTPUT_TEXT]: 'outputText'
  };

  if (!isFinalSubScale) {
    Object.assign(references, {
      [AGE]: 'age',
      [SEX]: 'sex',
      [T_SCORE]: 'tScore'
    });
  }

  return R.map(row => Object.keys(references).reduce((previousValue, key) => {
    return {
      ...previousValue,
      [references[key]]: R.path([key, 0, "@value"], row)
    }
  }, {}), lookupTable)
}

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
  const inputType = listToValue(itemJson[INPUT_TYPE]);

  let valueConstraintsObj = R.pathOr({}, [RESPONSE_OPTIONS, 0], itemJson);
  const optionsObj = R.pathOr({}, [OPTIONS, 0], itemJson);

  if (inputType != 'stackedRadio' && inputType != 'futureBehaviorTracker' && inputType != 'pastBehaviorTracker') {
    Object.entries(optionsObj).forEach(([key, value]) => {
      if (value && Array.isArray(value) && value.length > 0 && !key.includes('sliderOptions') && !key.includes('itemListElement'))
        valueConstraintsObj = { ...valueConstraintsObj, [key]: value }
    })
  }

  const valueConstraints = flattenValueConstraints(valueConstraintsObj);
  const isVis = itemJson[IS_VIS] ? R.path([IS_VIS, 0, "@value"], itemJson) : false;

  const inputs = R.pathOr([], [INPUTS], itemJson);
  const inputsObj = transformInputs(inputs);

  const media = transformMedia(R.path([MEDIA, 0], itemJson));
  valueConstraints.isOptionalText = listToValue(itemJson[IS_OPTIONAL_TEXT]);

  const res = {
    id: itemJson._id,
    description: languageListToObject(itemJson[DESCRIPTION]),
    correctAnswer: languageListToObject(itemJson[CORRECT_ANSWER]),
    schemaVersion: languageListToObject(itemJson[SCHEMA_VERSION]),
    version: languageListToObject(itemJson[VERSION]),
    altLabel: languageListToObject(itemJson[ALT_LABEL]),
    inputType,
    isOptionalText : listToValue(itemJson[IS_OPTIONAL_TEXT]),
    question: languageListToObject(itemJson[QUESTION]),
    preamble: languageListToObject(itemJson[PREAMBLE]),
    timer: R.path([TIMER, 0, "@value"], itemJson),
    delay: R.path([DELAY, 0, "@value"], itemJson),
    isVis,
    valueConstraints,
    skippable,
    fullScreen: allowList.includes(FULL_SCREEN),
    backDisabled: allowList.includes(BACK_DISABLED),
    summaryDisabled: allowList.includes(SUMMARY_DISABLED),
    autoAdvance: allowList.includes(AUTO_ADVANCE),
    inputs: inputsObj,
    media,
  };

  if (res.inputType == 'markdown-message') {
    res.inputType = 'markdownMessage';
  }
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
        inputType: "markdownMessage",
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

const transformPureActivity = (activityJson) => {
  const allowList = flattenIdList(
    R.pathOr([], [ALLOW, 0, "@list"], activityJson)
  );
  const scoringLogic = activityJson[SCORING_LOGIC]; // TO DO
  const addProperties = activityJson[ADD_PROPERTIES];
  const preamble = languageListToObject(activityJson[PREAMBLE]);
  const order = (activityJson[ORDER] && flattenIdList(activityJson[ORDER][0]["@list"])) || [];
  const notification = {}; // TO DO
  const info = languageListToObject(activityJson.info); // TO DO
  const isVis = activityJson[IS_VIS] ? R.path([IS_VIS, 0, "@value"], activityJson) : false;
  const subScales = activityJson[SUBSCALES] && R.map((subScale) => {
    const jsExpression = R.path([JS_EXPRESSION, 0, "@value"], subScale);
    return {
      isAverageScore: R.path([IS_AVERAGE_SCORE, 0, "@value"], subScale),
      jsExpression,
      variableName: R.path([VARIABLE_NAME, 0, "@value"], subScale),
      lookupTable: flattenLookupTable(subScale[LOOKUP_TABLE], false),
      innerSubScales: jsExpression.split('+').filter(name => name.includes('(')).map(name => name.trim().replace(/[()]/g, ''))
    }
  }, activityJson[SUBSCALES])

  const finalSubScale = activityJson[FINAL_SUBSCALE] && {
    isAverageScore: R.path([FINAL_SUBSCALE, 0, IS_AVERAGE_SCORE, 0, "@value"], activityJson),
    variableName: R.path([FINAL_SUBSCALE, 0, VARIABLE_NAME, 0, "@value"], activityJson),
    lookupTable: flattenLookupTable(R.path([FINAL_SUBSCALE, 0, LOOKUP_TABLE], activityJson), true),
  }

  const reports = R.map((itemJson) => ({
    variableName: itemJson['@id'],
    label: R.path([PREF_LABEL, 0, "@value"], itemJson),
    message: R.path([MESSAGE, 0, "@value"], itemJson),

    conditionals: R.map((cond) => ({
      variableName: cond['@id'],
      label: R.path([PREF_LABEL, 0, "@value"], cond),
      message: R.path([MESSAGE, 0, "@value"], cond),
      jsExpression: R.path([IS_VIS, 0, "@value"], cond),
      flagScore: R.path([FLAG_SCORE, 0, "@value"], cond),
      printItems: R.map(pItem => pItem['@value'], R.path([PRINT_ITEMS, 0, "@list"], cond) || []),
    }), R.path([CONDITIONALS, 0, '@list'], itemJson) || []),

    jsExpression: R.path([IS_VIS, 0, "@value"], itemJson) || R.path([JS_EXPRESSION, 0, "@value"], itemJson),
    outputType: R.path([OUTPUT_TYPE, 0, "@value"], itemJson),
    dataType: R.path(['schema:DataType', 0, '@id'], itemJson),
    printItems: R.map(pItem => pItem['@value'], R.path([PRINT_ITEMS, 0, "@list"], itemJson) || []),
  }), R.path([REPORTS, 0, '@list'], activityJson) || []);

  return {
    id: activityJson._id,
    name: languageListToObject(activityJson[PREF_LABEL]),
    description: languageListToObject(activityJson[DESCRIPTION]),
    splash: languageListToObject(activityJson[SPLASH]),
    schemaVersion: languageListToObject(activityJson[SCHEMA_VERSION]),
    version: languageListToObject(activityJson[VERSION]),
    altLabel: languageListToObject(activityJson[ALT_LABEL]),
    shuffle: R.path([SHUFFLE, 0, "@value"], activityJson),
    image: activityJson[IMAGE],
    skippable: isSkippable(allowList),
    backDisabled: allowList.includes(BACK_DISABLED),
    summaryDisabled: allowList.includes(SUMMARY_DISABLED),
    fullScreen: allowList.includes(FULL_SCREEN),
    autoAdvance: allowList.includes(AUTO_ADVANCE),
    allowExport: allowList.includes(ALLOW_EXPORT),
    isPrize: R.path([ISPRIZE, 0, "@value"], activityJson) || false,
    isReviewerActivity: R.path([IS_REVIEWER_ACTIVITY, 0, '@value'], activityJson) || false,
    isVis,
    scoreOverview: _.get(activityJson, [SCORE_OVERVIEW, 0, "@value"]),
    subScales,
    finalSubScale,
    preamble,
    addProperties,
    order,
    scoringLogic,
    notification,
    info,
    reports,
    activityType: _.get(activityJson, [ACTIVITY_TYPE, 0, '@value']),
  };
};

export const activityTransformJson = (activityJson, itemsJson) => {
  const activity = transformPureActivity(activityJson);
  let itemIndex = -1, itemData;

  const mapItems = R.map((itemKey) => {
    itemIndex += 1;
    itemData = itemsJson[itemKey];

    if (!itemData) {
      console.warn(
        `Item ID "${itemKey}" defined in 'reprolib:terms/order' was not found`
      );
      return null;
    }
    const item = itemTransformJson(itemsJson[itemKey]);
    return itemAttachExtras(item, itemKey, activity.addProperties && activity.addProperties[itemIndex]);
  });
  const nonEmptyItems = R.filter(item => item, mapItems(activity.order));
  const items = attachPreamble(activity.preamble, nonEmptyItems);

  return {
    ...activity,
    items,
  };
};

export const appletTransformJson = (appletJson) => {
  const { applet, schedule, updated, accountId } = appletJson;
  const res = {
    id: applet._id,
    groupId: applet.groups,
    schema: applet.url || applet[URL],
    name: languageListToObject(applet[PREF_LABEL]),
    description: languageListToObject(applet[DESCRIPTION]),
    about: languageListToObject(applet[ABOUT]),
    aboutContent: languageListToObject(applet[ABOUT_CONTENT]),
    landingPageType: listToValue(applet[LANDING_PAGE_TYPE] || []) || 'markdown',
    schemaVersion: languageListToObject(applet[SCHEMA_VERSION]),
    version: languageListToObject(applet[VERSION]),
    altLabel: languageListToObject(applet[ALT_LABEL]),
    visibility: listToVisObject(applet[ADD_PROPERTIES]),
    image: applet[IMAGE],
    watermark: applet[WATERMARK] || "",
    order: flattenIdList(applet[ORDER][0]["@list"]),
    schedule,
    contentUpdateTime: updated,
    responseDates: applet.responseDates,
    shuffle: R.path([SHUFFLE, 0, "@value"], applet),
    streamEnabled: R.path([STREAM_ENABLED, 0, "@value"], applet) || false,
    combineReports: R.path([COMBINE_REPORTS, 0, "@value"], applet) || false,
    reportConfigs: transformInputs(R.path([REPORT_CONFIGS, 0, '@list'], applet) || []),
    accountId: accountId
  };

  if (applet.encryption && Object.keys(applet.encryption).length) {
    res.encryption = applet.encryption;
  }
  return res;
};

const orderBySchema = (order, getSchema = null) => (a, b) => {
  const indexA = order.indexOf(getSchema ? getSchema(a) : a.schema);
  const indexB = order.indexOf(getSchema ? getSchema(b) : b.schema);

  if (indexA < indexB) {
    return -1;
  }

  if (indexA > indexB) {
    return 1;
  }

  return 0;
}

export const activityFlowTransformJson = (activityFlowObj, activityFlows) => {
  const res = {
    id: activityFlowObj._id,
    name: R.path([NAME, 0, "@value"], activityFlowObj),
    description: R.path([DESCRIPTION, 0, "@value"], activityFlowObj),
    hideBadge: !R.path([SHOW_BADGE, 0, "@value"], activityFlowObj),
    combineReports: R.path([COMBINE_REPORTS, 0, "@value"], activityFlowObj),
    order: flattenIdList(R.path([ORDER, 0, "@list"], activityFlowObj))
  }

  activityFlows.forEach(activityFlow => {
    if (R.path([PREF_LABEL, 0, "@value"], activityFlow) === res.name) {
      res.isVis = R.path([IS_VIS, 0, "@value"], activityFlow);
    }
  })

  return res;
}

export const transformApplet = (payload, currentApplets = null) => {
  const applet = appletTransformJson(payload);

  if (payload.applet[ACTIVITY_FLOW_PROPERTIES]) {
    applet.activityFlows = Object.keys(payload.activityFlows).map((key) => {
      const flow = activityFlowTransformJson(
        payload.activityFlows[key],
        payload.applet[ACTIVITY_FLOW_PROPERTIES]
      );
      flow.schema = key;
      return flow;
    });
  } else {
    applet.activityFlows = [];
  }

  if (currentApplets && !R.isEmpty(currentApplets)) {
    const currentApplet = currentApplets.find(({ id }) => id.substring(7) === payload.id);

    if (!currentApplet) {
      const activities = Object.keys(payload.activities).map((key) => {
        const activity = activityTransformJson(
          payload.activities[key],
          payload.items,
        );
        activity.schema = key;
        return activity;
      });
      // Add the items and activities to the applet object
      applet.schedule = payload.schedule;
      applet.activities = activities;
    } else {
      if (R.isEmpty(payload.activities)) {
        if (R.isEmpty(payload.items)) {
          applet.activities = currentApplet.activities;
        } else {
          Object.keys(payload.items).forEach(dataKey => {
            const keys = dataKey.split('/');

            applet.activities.forEach((act, index) => {
              if (act.id.substring(9) === keys[0]) {
                act.items.forEach((itemData, i) => {
                  if (itemData.id === payload.items[dataKey]) {
                    const item = itemAttachExtras(itemTransformJson(payload.items[dataKey]), dataKey);
                    item.variableName = payload.items[dataKey]['@id'];

                    applet.activities[index].items[i] = {
                      ...itemData,
                      ...item,
                    }
                  }
                })
              }
            });
          });
        }
      } else {
        applet.activities = currentApplet.activities;
        Object.keys(payload.activities).forEach((key) => {
          const activity = transformPureActivity(payload.activities[key]);

          let updated = false;
          applet.activities.forEach((act, index) => {
            if (act.id.substring(9) === key) {
              updated = true;
              applet.activities[index] = {
                ...activity,
                items: act.items,
              };
            }
          });
          if (!updated) {
            applet.activities.push(activity);
          }
        });
        if (!R.isEmpty(payload.items)) {
          Object.keys(payload.items).forEach(dataKey => {
            const keys = dataKey.split('/');

            applet.activities.forEach((act, index) => {
              if (act.id.substring(9) === keys[0]) {
                const item = itemAttachExtras(itemTransformJson(payload.items[dataKey]), dataKey);

                item.variableName = payload.items[dataKey]['@id'];

                let updated = false;

                if (!act.items) {
                  applet.activities[index].items = [];
                }
                act.items.forEach((itemData, i) => {
                  if (itemData.id.split('/')[1] === dataKey.split('/')[1] && !updated) {
                    updated = true;
                    applet.activities[index].items[i] = {
                      ...itemData,
                      ...item,
                    }
                  }
                });
                if (!updated) {
                  applet.activities[index].items.push(item);
                }
              }
            });
          });
        }
      }

      if (payload.schedule) {
        const events = currentApplet.schedule.events;
        applet.schedule = payload.schedule;

        if (!R.isEmpty(payload.schedule.events)) {
          Object.keys(payload.schedule.events).forEach(eventId => {
            events[eventId] = payload.schedule.events[eventId];
          })
        }

        for (const eventId in events) {
          let isValid = false;
          for (const eventDate in payload.schedule.data) {
            if (payload.schedule.data[eventDate].find(({ id }) => id === eventId)) {
              isValid = true;
            }
          }

          if (!isValid) {
            delete events[eventId];
          }
        }
        applet.schedule.events = events;
      }
    }

    if (payload.removedItems && payload.removedItems.length) {
      payload.removedItems.forEach(itemKey => {
        const keys = itemKey.split('/');

        applet.activities.forEach((activity, index) => {
          if (activity.id.substring(9) === keys[0]) {
            activity.items.forEach((item, i) => {
              if (item.id.substring(7) === keys[1]) {
                applet.activities[index].items.splice(i, 1);
              }
            })
          }
        })
      })
    }

    if (payload.removedActivities && payload.removedActivities.length) {
      payload.removedActivities.forEach(activityKey => {
        applet.activities.forEach((activity, index) => {
          if (activity.id.substring(9) === activityKey) {
            applet.activities.splice(index, 1);
          }
        })
      })
    }
  } else {
    const activities = Object.keys(payload.activities).map((key) => {
      const activity = activityTransformJson(
        payload.activities[key],
        payload.items,
      );
      activity.schema = key;
      return activity;
    });
    // Add the items and activities to the applet object
    applet.activities = activities;
    applet.schedule = payload.schedule;
  }

  for (let i = 0; i < applet.activities.length; i++) {
    const activity = applet.activities[i];
    const items = [...(activity.items || [])].sort(orderBySchema(activity.order));

    if (
      !activity.summaryDisabled &&
      !activity.reports.some(report => report.dataType == 'score') &&
      !items.some(item => item.valueConstraints?.responseAlert)
    ) {
      activity.summaryDisabled = true;
    }

    applet.activities[i] = {
      ...activity,
      items
    }
  }

  for (let i = 0; i < applet.activityFlows.length; i++) {
    const flow = applet.activityFlows[i];
    const names = applet.activities.map(activity => activity.name.en);

    flow.order = flow.order.filter(name => names.includes(name));
    flow.summaryDisabled = true;

    for (const activity of applet.activities) {
      if (!activity.summaryDisabled) {
        flow.summaryDisabled = false;
      }
    }
  }

  applet.activities = [...applet.activities].sort(orderBySchema(applet.order, (activity) => activity.id.split('/').pop()));
  applet.groupId = payload.groups;
  applet.theme = payload.theme;
  applet.welcomeApplet = payload.welcomeApplet;
  return applet;
};

export const dateParser = (schedule) => {
  const output = {};
  Object.keys(schedule.events).forEach(key => {
    const e = schedule.events[key];
    const uri = e.data.URI;
    if (!output[uri]) {
      output[uri] = {
        notificationDateTimes: [],
        id: e.id,
      };
    }

    const eventSchedule = Parse.schedule(e.schedule);
    const now = Day.fromDate(new Date());

    const lastScheduled = getLastScheduled(eventSchedule, now);
    const nextScheduled = getNextScheduled(eventSchedule, now);
    const notifications = R.pathOr([], ['data', 'notifications'], e);
    const dateTimes = getScheduledNotifications(eventSchedule, now, notifications);

    let lastScheduledResponse = lastScheduled;
    let {
      lastScheduledTimeout, lastTimedActivity, extendedTime, id, completion
    } = output[uri];

    if (lastScheduledResponse) {
      lastScheduledTimeout = e.data.timeout;
      lastTimedActivity = e.data.timedActivity;
      completion = e.data.completion;
      id = e.id;
      extendedTime = e.data.extendedTime;
    }

    if (output[uri].lastScheduledResponse && lastScheduled) {
      lastScheduledResponse = moment.max(
        moment(output[uri].lastScheduledResponse),
        moment(lastScheduled),
      );
      if (lastScheduledResponse === output[uri].lastScheduledResponse) {
        lastScheduledTimeout = output[uri].lastScheduledTimeout;
        lastTimedActivity = output[uri].lastTimedActivity;
        id = output[uri].id;
        completion = output[uri].completion;
        extendedTime = output[uri].extendedTime;
      }
    }

    let nextScheduledResponse = nextScheduled;
    let { nextScheduledTimeout, nextTimedActivity } = output[uri];

    if (nextScheduledResponse) {
      nextScheduledTimeout = e.data.timeout;
      nextTimedActivity = e.data.timedActivity;
    }

    if (output[uri].nextScheduledResponse && nextScheduled) {
      nextScheduledResponse = moment.min(
        moment(output[uri].nextScheduledResponse),
        moment(nextScheduled),
      );
      if (nextScheduledResponse === output[uri].nextScheduledResponse) {
        nextScheduledTimeout = output[uri].nextScheduledTimeout;
        nextTimedActivity = output[uri].nextTimedActivity;
      }
    }

    output[uri] = {
      lastScheduledResponse: lastScheduledResponse || output[uri].lastScheduledResponse,
      nextScheduledResponse: nextScheduledResponse || output[uri].nextScheduledResponse,
      lastTimedActivity,
      nextTimedActivity,
      extendedTime,
      id,
      lastScheduledTimeout,
      nextScheduledTimeout,
      completion,
      // TODO: only append unique datetimes when multiple events scheduled for same activity/URI
      notificationDateTimes: output[uri].notificationDateTimes.concat(dateTimes),
    };
  });
  return output;
};

const transformScheduleDatesFromUTC = (schedule) => {
 return {
    ...schedule,
    start: schedule.start ? buildExactDateFromUTC(schedule.start).valueOf() : undefined,
    end: schedule.end ? buildExactDateFromUTC(schedule.end).valueOf() : undefined,
  };
}

export const parseAppletEvents = (applet) => {
  const extraInfoActivities = applet.activities.map((act) => {
    const events = [];
    const availability = getActivityAbility(applet.schedule, act.id);
    const activityId = getIdBySplit(act.id)

    for (let eventId in applet.schedule.events) {
      const event = applet.schedule.events[eventId];

      if (event.data.activity_id === activityId) {
        const date = new Date();
        date.setHours(0); date.setMinutes(0); date.setSeconds(0);

        const eventSchedule = transformScheduleDatesFromUTC(event.schedule);

        const futureSchedule = Parse.schedule(eventSchedule).forecast(
          Day.fromDate(date),
          true,
          1,
          0,
          true,
        );

        event.scheduledTime = getStartOfInterval(futureSchedule.array()[0]);
        events.push(event);
      }
    }
    return {
      ...act,
      appletId: applet.id,
      availability,
      events
    }
  });

  const activityFlows = applet.activityFlows.map(activityFlow => {
    const events = [];
    const activityFlowId = getIdBySplit(activityFlow.id);
    const availability = getActivityAbility(applet.schedule, activityFlow.name, false);

    for (let eventId in applet.schedule.events) {
      const event = applet.schedule.events[eventId];

      if (event.data.activity_flow_id === activityFlowId) {
        const date = new Date();
        date.setHours(0); date.setMinutes(0); date.setSeconds(0);

        const eventSchedule = transformScheduleDatesFromUTC(event.schedule);

        const futureSchedule = Parse.schedule(eventSchedule).forecast(
          Day.fromDate(date),
          true,
          1,
          0,
          true,
        );

        event.scheduledTime = getStartOfInterval(futureSchedule.array()[0]);
        events.push(event);
      }
    }
    return {
      ...activityFlow,
      isActivityFlow: true,
      appletId: applet.id,
      availability,
      events
    }
  })

  const map = new Map();

  const date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);

  for (let eventId in applet.schedule.actual_events) {
    const event = applet.schedule.actual_events[eventId];

    const json = JSON.stringify(event.schedule);
    const keyString = json + date.getTime().toString();

    if (map.has(keyString)) {
      const value = map.get(keyString);
      
      event.scheduledTime =
        value && typeof value.getTime === "function"
          ? new Date(value.getTime())
          : value;

    } else {
      const eventSchedule = transformScheduleDatesFromUTC(event.schedule); 

      const parsedSchedule = Parse.schedule(eventSchedule);
      const futureSchedule = parsedSchedule.forecast(
        Day.fromDate(date),
        true,
        1,
        0,
        true
      );

      event.scheduledTime = getStartOfInterval(futureSchedule.array()[0]);
      map.set(keyString, event.scheduledTime);
    }
  }

  return {
    ...applet,
    activities: extraInfoActivities,
    activityFlows: activityFlows
  };
}

const getActivityAbility = (schedule, value, isActivity = true) => {
  let availability = false;

  Object.keys(schedule.events).forEach(key => {
    const e = schedule.events[key];

    if (e.data.activity_id === value.substring(9) && isActivity) {
      availability = e.data.availability;
    }
    if (e.data.title === value && !isActivity) {
      availability = e.data.availability;
    }
  });

  return availability;
}

export const parseAppletActivities = (applet, responseSchedule) => {
  let scheduledDateTimesByActivity = {};
  // applet.schedule, if defined, has an events key.
  // events is a list of objects.
  // the events[idx].data.URI points to the specific activity's schema.
  if (applet.schedule) {
    scheduledDateTimesByActivity = dateParser(applet.schedule);
  }

  const extraInfoActivities = applet.activities.map((act) => {
    const scheduledDateTimes = scheduledDateTimesByActivity[act.schema];
    const nextScheduled = R.pathOr(null, ['nextScheduledResponse'], scheduledDateTimes);
    const lastScheduled = R.pathOr(null, ['lastScheduledResponse'], scheduledDateTimes);
    const nextTimedActivity = R.pathOr(null, ['nextTimedActivity'], scheduledDateTimes);
    const lastTimedActivity = R.pathOr(null, ['lastTimedActivity'], scheduledDateTimes);
    const oneTimeCompletion = R.pathOr(null, ['completion'], scheduledDateTimes);
    const lastTimeout = R.pathOr(null, ['lastScheduledTimeout'], scheduledDateTimes);
    const nextTimeout = R.pathOr(null, ['nextScheduledTimeout'], scheduledDateTimes);
    const id = R.pathOr(null, ['id'], scheduledDateTimes);
    const extendedTime = R.pathOr(null, ['extendedTime'], scheduledDateTimes);
    const lastResponse = R.path([applet.id, act.id, 'lastResponse'], responseSchedule);

    let nextAccess = false;
    let prevTimeout = null;
    let scheduledTimeout = null;
    let invalid = true;

    if (applet.schedule && applet.schedule.data) {
      Object.keys(applet.schedule.data).forEach(date => {
        const event = applet.schedule.data[date].find(ele => ele.id === id);

        if (moment().isSame(moment(date), 'day') && event) {
          invalid = event.valid;
        }
      })
    } else if (applet.schedule && applet.schedule.valid !== undefined) {
      invalid = applet.schedule.valid;
    }

    if (lastTimeout) {
      prevTimeout = ((lastTimeout.day * 24 + lastTimeout.hour) * 60 + lastTimeout.minute) * 60000;
    }
    if (nextTimeout) {
      nextAccess = nextTimeout.access;
      scheduledTimeout = ((nextTimeout.day * 24 + nextTimeout.hour) * 60 + nextTimeout.minute) * 60000;
    }

    return {
      ...act,
      appletId: applet.id,
      appletShortName: applet.name,
      appletName: applet.name,
      appletSchema: applet.schema,
      appletSchemaVersion: applet.schemaVersion,
      lastScheduledTimestamp: lastScheduled,
      lastResponseTimestamp: lastResponse,
      nextScheduledTimestamp: nextScheduled,
      oneTimeCompletion: oneTimeCompletion || false,
      lastTimeout: prevTimeout,
      nextTimeout: scheduledTimeout,
      nextTimedActivity,
      lastTimedActivity,
      currentTime: new Date().getTime(),
      invalid,
      extendedTime,
      nextAccess,
      isOverdue: lastScheduled && moment(lastResponse) < moment(lastScheduled),

      // also add in our parsed notifications...
      notification: R.prop('notificationDateTimes', scheduledDateTimes),
    };
  });

  return {
    ...applet,
    activities: extraInfoActivities,
  };
};
