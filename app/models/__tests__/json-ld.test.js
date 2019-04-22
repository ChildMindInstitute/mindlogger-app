import * as emaHbn from '../mock-data/ema-hbn.json';
import * as ndaPhq from '../mock-data/nda-phq.json';
import {
  activityTransformJson,
  appletTransformJson,
  languageListToObject,
  listToObject,
  flattenIdList,
  flattenItemList,
  flattenValueConstraints,
  itemTransformJson,
} from '../json-ld';

test('languageListToObject', () => {
  const languageList = emaHbn.applet[0]['http://schema.org/description'];
  expect(languageListToObject(languageList)).toEqual({
    en: 'Daily questions about your child\'s physical and mental health',
  });
});

test('listToObject', () => {
  const languageList = emaHbn.applet[0]['https://schema.repronim.org/visibility'];
  expect(listToObject(languageList)).toEqual({
    ema_evening: true,
    ema_morning: true,
  });
});

test('flattenIdList', () => {
  const idList = emaHbn.applet[0]['https://schema.repronim.org/order'][0]['@list'];
  expect(flattenIdList(idList)).toEqual([
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/ema_morning_schema.jsonld',
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNEvening/ema_evening_schema.jsonld',
  ]);
});

test('flattenItemList', () => {
  const item = emaHbn.items['https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/nightmares.jsonld'][0];
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
  const item = emaHbn.items['https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/nightmares.jsonld'][0];
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
  const appletJson = emaHbn.applet[0];

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
    schema: 'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activity-sets/ema-hbn/ema-hbn_schema',
  };

  expect(appletTransformJson(appletJson)).toEqual(expectedResult);
});

test('activityTransformJson: ema-hbn', () => {
  const activityJson = emaHbn.activities['https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/ema_morning_schema.jsonld'][0];

  const expectedResult = {
    preamble: { en: '' },
    description: { en: 'Morning Questions' },
    name: { en: 'EMA: Morning' },
    order: [
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/time_in_bed.jsonld',
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/nightmares.jsonld',
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/sleeping_aids.jsonld',
    ],
    schemaVersion: { en: '0.0.1' },
    image: undefined,
    version: { en: '0.0.1' },
    shuffle: false,
    visibility: {
      nightmares: true,
      sleeping_aids: true,
      time_in_bed: true,
    },
    scoringLogic: [],
    altLabel: { en: 'ema_morning_schema' },
    allowDoNotKnow: false,
    allowRefuseToAnswer: false,
    info: undefined,
    notification: {},
  };

  expect(activityTransformJson(activityJson)).toEqual(expectedResult);
});

test('activityTransformJson: nda-phq', () => {
  const activityJson = ndaPhq.activities['https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/nda_guid.jsonld'][0];

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
    order: [
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/yearOfBirth.jsonld',
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/raceEthnicity.jsonld',
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/gender.jsonld',
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/state.jsonld',
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/countryOfBirth.jsonld',
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/nativeLanguage.jsonld',
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/mentalHealth.jsonld',
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/healthCondition.jsonld',
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/NDA/items/medication.jsonld',
    ],
    preamble: undefined,
    image: undefined,
    schemaVersion: { en: '0.0.1' },
    scoringLogic: undefined,
    shuffle: false,
    version: { en: '0.0.1' },
    visibility: {
      countryOfBirth: true,
      gender: true,
      healthCondition: true,
      medication: true,
      mentalHealth: true,
      nativeLanguage: true,
      raceEthnicity: true,
      state: true,
      yearOfBirth: true,
    },
    info: undefined,
    notification: {},
  };

  expect(activityTransformJson(activityJson)).toEqual(expectedResult);
});

test('itemTransformJson', () => {
  const item = emaHbn.items['https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/nightmares.jsonld'][0];
  expect(itemTransformJson(item)).toEqual({
    name: { en: 'Nightmares' },
    description: { en: 'whether or not your child experience nightmares or night terrors' },
    schemaVersion: { en: '0.0.1' },
    version: { en: '0.0.1' },
    altLabel: { en: 'nightmares' },
    inputType: 'radio',
    question: { en: 'Did your child have any nightmares or night terrors last night?' },
    preamble: undefined,
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
    },
  });
});
