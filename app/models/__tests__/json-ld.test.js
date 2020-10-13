import * as emaHbn from './ema-hbn.json';
import * as ndaPhq from './nda-phq.json';
import * as variableMap from './variable_map.json';
import {
  activityTransformJson,
  appletTransformJson,
  languageListToObject,
  listToVisObject,
  flattenIdList,
  flattenItemList,
  flattenValueConstraints,
  itemTransformJson,
  itemAttachExtras,
  transformVariableMap,
  attachPreamble,
} from '../json-ld';

test('languageListToObject', () => {
  const languageList = emaHbn.applet['schema:description'];
  expect(languageListToObject(languageList)).toEqual({
    en: 'Daily questions about your child\'s physical and mental health',
  });
});

test('listToVisObject', () => {
  const languageList = emaHbn.applet['reprolib:terms/addProperties'];
  expect(listToVisObject(languageList)).toEqual({
    ema_evening: true,
    ema_morning: true,
  });
});

test('flattenIdList', () => {
  const idList = emaHbn.applet['reprolib:terms/order'][0]['@list'];
  expect(flattenIdList(idList)).toEqual([
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/ema_morning_schema.jsonld',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNEvening/ema_evening_schema.jsonld',
  ]);
});

test('flattenItemList', () => {
  const item = emaHbn.items['https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/nightmares.jsonld'];
  const valueConstraints = item['reprolib:terms/responseOptions'][0];
  const itemList = valueConstraints['schema:itemListElement'];
  expect(flattenItemList(itemList)).toEqual([
    {
      image: 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg/1F634.svg?sanitize=true',
      name: {
        en: 'No',
      },
      value: 0,
    },
    {
      image: 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg/1F62B.svg?sanitize=true',
      name: {
        en: 'Yes',
      },
      value: 1,
    },
  ]);
});

test('flattenValueConstraints', () => {
  const item = emaHbn.items['https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/nightmares.jsonld'];
  const valueConstraints = item['reprolib:terms/responseOptions'][0];
  expect(flattenValueConstraints(valueConstraints)).toEqual({
    multipleChoice: false,
    maxValue: 1,
    minValue: 0,
    itemList: [
      {
        image: 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg/1F634.svg?sanitize=true',
        name: {
          en: 'No',
        },
        value: 0,
      },
      {
        image: 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg/1F62B.svg?sanitize=true',
        name: {
          en: 'Yes',
        },
        value: 1,
      },
    ],
  });
});

test('appletTransformJson: ema-hbn', () => {
  const appletJson = emaHbn.applet;

  const expectedResult = {
    responseDates: [],
    schedule: {},
    groupId: ["12345"],
    about: {
      en:
        "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activity-sets/ema-hbn/README.md",
    },
    image:
      "https://childmindinstitute.github.io/mindlogger-assets/illustrations/undraw/hbn_ema_image.svg",
    description: {
      en: "Daily questions about your child's physical and mental health",
    },
    name: {
      en: "Healthy Brain Network: EMA",
    },
    order: [
      "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/ema_morning_schema.jsonld",
      "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNEvening/ema_evening_schema.jsonld",
    ],
    schemaVersion: {
      en: "0.0.1",
    },
    version: {
      en: "0.0.1",
    },
    shuffle: false,
    visibility: {
      ema_evening: true,
      ema_morning: true,
    },
    altLabel: {
      en: "ema-hbn",
    },
    schema:
      "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activity-sets/ema-hbn/ema-hbn_schema.jsonld",
    id: "applet/5ca5314fd27b4e0459cee21f",
  };

  expect(appletTransformJson(appletJson)).toEqual(expectedResult);
});

test('activityTransformJson: ema-hbn', () => {
  const activityJson = emaHbn.activities['https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/ema_morning_schema.jsonld'];
  const itemsJson = emaHbn.items;
  const itemKeys = [
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/time_in_bed.jsonld',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/nightmares.jsonld',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/sleeping_aids.jsonld',
  ];
  const transformedItems = itemKeys.map((key) => {
    const item = itemTransformJson(emaHbn.items[key]);
    return itemAttachExtras(item, key, {});
  });

  const expectedResult = {
    id: 'activity/5cba070386fafd5df796d908',
    preamble: { en: '' },
    description: { en: 'Morning Questions' },
    name: { en: 'EMA: Morning' },
    items: transformedItems,
    schemaVersion: { en: '0.0.1' },
    image: undefined,
    version: { en: '0.0.1' },
    shuffle: false,
    scoringLogic: [],
    altLabel: { en: 'ema_morning_schema' },
    skippable: false,
    autoAdvance: false,
    backDisabled: false,
    fullScreen: false,
    info: undefined,
    notification: {},
  };

  expect(activityTransformJson(activityJson, itemsJson)).toEqual(expectedResult);
});

test('activityTransformJson: nda-phq', () => {
  const activityJson = ndaPhq.activities['https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/nda_guid.jsonld'];
  const itemsJson = ndaPhq.items;
  const itemKeys = [
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/yearOfBirth.jsonld',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/raceEthnicity.jsonld',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/gender.jsonld',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/state.jsonld',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/countryOfBirth.jsonld',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/nativeLanguage.jsonld',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/mentalHealth.jsonld',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/healthCondition.jsonld',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/medication.jsonld',
  ];
  const transformedItems = itemKeys.map((key) => {
    const item = itemTransformJson(ndaPhq.items[key]);
    return itemAttachExtras(item, key, {});
  });

  const expectedResult = {
    skippable: true,
    autoAdvance: false,
    backDisabled: false,
    fullScreen: false,
    altLabel: { en: 'nda_guid' },
    description: {
      en: 'schema describing terms needed to generate NDA guid',
    },
    name: {
      en: 'NDA guid',
    },
    items: transformedItems,
    preamble: undefined,
    image: undefined,
    schemaVersion: { en: '0.0.1' },
    scoringLogic: undefined,
    shuffle: false,
    version: { en: '0.0.1' },
    info: undefined,
    notification: {},
    id: 'activity/5cba3c1f86fafd5df796d913',
  };

  expect(activityTransformJson(activityJson, itemsJson)).toEqual(expectedResult);
});

test('itemTransformJson', () => {
  const itemKey = 'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/nightmares.jsonld';
  const itemJson = emaHbn.items[itemKey];
  expect(itemTransformJson(itemJson)).toEqual({
    description: { en: 'whether or not your child experience nightmares or night terrors' },
    schemaVersion: { en: '0.0.1' },
    version: { en: '0.0.1' },
    altLabel: { en: 'nightmares' },
    inputType: 'radio',
    question: { en: 'Did your child have any nightmares or night terrors last night?' },
    preamble: undefined,
    inputs: {},
    valueConstraints: {
      multipleChoice: false,
      maxValue: 1,
      minValue: 0,
      itemList: [
        {
          image: 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg/1F634.svg?sanitize=true',
          name: {
            en: 'No',
          },
          value: 0,
          valueConstraints: undefined,
        },
        {
          image: 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg/1F62B.svg?sanitize=true',
          name: {
            en: 'Yes',
          },
          value: 1,
          valueConstraints: undefined,
        },
      ],
    },
    skippable: undefined,
    autoAdvance: false,
    backDisabled: false,
    fullScreen: false,
    id: "screen/5cbf991e86fafd5189aee252",
    timer: undefined,
    delay: undefined,
    media: undefined,
  });
});

test('transformVariableMap', () => {
  expect(transformVariableMap(variableMap.variableMap)).toEqual({
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNEvening/items/energy.jsonld': 'energy',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNEvening/items/enjoyed_day.jsonld': 'enjoyed_day',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNEvening/items/good_bad_day.jsonld': 'good_bad_day',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNEvening/items/health.jsonld': 'health',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNEvening/items/sources_of_stress.jsonld': 'sources_of_stress',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNEvening/items/stressful_day.jsonld': 'stressful_day',
  });
});

test('attachPreamble', () => {
  const longPreamble = {
    en: 'For each item, please select how often your child behaved a certain way *over the past 6 months*, as best you can.',
  };
  const shortPreamble = {
    en: 'This is a short preamble',
  };

  expect(attachPreamble(longPreamble, [{}, {}])).toEqual([{
    inputType: 'markdown-message',
    preamble: longPreamble,
  }, {}, {}]);

  expect(attachPreamble(shortPreamble, [
    {
      valueConstraints: undefined,
    }, {
      value: 0,
    },
  ])).toEqual([
    {
      preamble: shortPreamble,
      valueConstraints: undefined,
    }, {
      value: 0,
    },
  ]);

  expect(attachPreamble(shortPreamble, [])).toEqual([]);
});
