import * as emaHbn from './ema-hbn.json';
import * as ndaPhq from './nda-phq.json';
import {
  languageListToObject,
  listToObject,
  appletTransformJson,
  activityTransformJson,
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

test('appletTransformJson: ema-hbn', () => {
  const appletJson = emaHbn.applet[0];

  const expectedResult = {
    description: "Daily questions about your child's physical and mental health",
    name: 'Healthy Brain Network: EMA',
    order: [
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/ema_morning_schema.jsonld',
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNEvening/ema_evening_schema.jsonld',
    ],
    schemaVersion: '0.0.1',
    version: '0.0.1',
    shuffle: false,
    visibility: {
      ema_evening: true,
      ema_morning: true,
    },
    altLabel: 'ema-hbn',
  };

  expect(appletTransformJson(appletJson)).toEqual(expectedResult);
});

test('activityTransformJson: ema-hbn', () => {
  const activityJson = emaHbn.activities['https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/ema_morning_schema.jsonld'][0];

  const expectedResult = {
    preamble: '',
    description: 'Morning Questions',
    name: 'EMA: Morning',
    order: [
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/time_in_bed.jsonld',
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/nightmares.jsonld',
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/items/sleeping_aids.jsonld',
    ],
    schemaVersion: '0.0.1',
    image: undefined,
    version: '0.0.1',
    shuffle: false,
    visibility: {
      nightmares: true,
      sleeping_aids: true,
      time_in_bed: true,
    },
    scoringLogic: [],
    altLabel: 'ema_morning_schema',
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
    altLabel: 'nda_guid',
    description: 'schema describing terms needed to generate NDA guid',
    name: 'NDA guid',
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
    schemaVersion: '0.0.1',
    scoringLogic: undefined,
    shuffle: false,
    version: '0.0.1',
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
