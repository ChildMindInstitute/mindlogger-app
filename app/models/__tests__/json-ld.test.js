import * as emaHbn from './ema-hbn.json';
import * as ndaPhq from './nda-phq.json';
import * as variableMap from './variable_map.json';
import {
  activityTransformJson,
  appletTransformJson,
  languageListToObject,
  listToObject,
  flattenIdList,
  flattenItemList,
  flattenValueConstraints,
  itemTransformJson,
  itemAttachExtras,
  transformVariableMap,
} from '../json-ld';

test('languageListToObject', () => {
  const languageList = emaHbn.applet['http://schema.org/description'];
  expect(languageListToObject(languageList)).toEqual({
    en: 'Daily questions about your child\'s physical and mental health',
  });
});

test('listToObject', () => {
  const languageList = emaHbn.applet['https://schema.repronim.org/visibility'];
  expect(listToObject(languageList)).toEqual({
    ema_evening: true,
    ema_morning: true,
  });
});

test('flattenIdList', () => {
  const idList = emaHbn.applet['https://schema.repronim.org/order'][0]['@list'];
  expect(flattenIdList(idList)).toEqual([
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/ema_morning_schema.jsonld',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNEvening/ema_evening_schema.jsonld',
  ]);
});

test('flattenItemList', () => {
  const item = emaHbn.items['https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/nightmares.jsonld'];
  const valueConstraints = item['https://schema.repronim.org/valueconstraints'][0];
  const itemList = valueConstraints['http://schema.org/itemListElement'][0]['@list'];
  expect(flattenItemList(itemList)).toEqual([
    {
      image: {
        en: 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg/1F634.svg?sanitize=true',
      },
      name: {
        en: 'No',
      },
      value: 0,
    },
    {
      image: {
        en: 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg/1F62B.svg?sanitize=true',
      },
      name: {
        en: 'Yes',
      },
      value: 1,
    },
  ]);
});

test('flattenValueConstraints', () => {
  const item = emaHbn.items['https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/nightmares.jsonld'];
  const valueConstraints = item['https://schema.repronim.org/valueconstraints'][0];
  expect(flattenValueConstraints(valueConstraints)).toEqual({
    multipleChoice: false,
    maxValue: 1,
    minValue: 0,
    itemList: [
      {
        image: {
          en: 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg/1F634.svg?sanitize=true',
        },
        name: {
          en: 'No',
        },
        value: 0,
      },
      {
        image: {
          en: 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg/1F62B.svg?sanitize=true',
        },
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
    description: {
      en: "Daily questions about your child's physical and mental health",
    },
    name: {
      en: 'Healthy Brain Network: EMA',
    },
    order: [
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/ema_morning_schema.jsonld',
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNEvening/ema_evening_schema.jsonld',
    ],
    schemaVersion: {
      en: '0.0.1',
    },
    version: {
      en: '0.0.1',
    },
    shuffle: false,
    visibility: {
      ema_evening: true,
      ema_morning: true,
    },
    altLabel: {
      en: 'ema-hbn',
    },
    schema: 'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activity-sets/ema-hbn/ema-hbn_schema.jsonld',
    id: 'applet/5ca5314fd27b4e0459cee21f',
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
    return itemAttachExtras(item, key, {}, {});
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
    allowDoNotKnow: false,
    allowRefuseToAnswer: false,
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
    return itemAttachExtras(item, key, {}, {});
  });

  const expectedResult = {
    allowDoNotKnow: false,
    allowRefuseToAnswer: true,
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
    name: { en: 'Nightmares' },
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
          image: {
            en: 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg/1F634.svg?sanitize=true',
          },
          name: {
            en: 'No',
          },
          value: 0,
          valueConstraints: undefined,
        },
        {
          image: {
            en: 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg/1F62B.svg?sanitize=true',
          },
          name: {
            en: 'Yes',
          },
          value: 1,
          valueConstraints: undefined,
        },
      ],
    },
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
