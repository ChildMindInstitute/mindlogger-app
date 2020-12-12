export const prizesActivity = {
  id: "activity/5fcfdb9ec47c585b7c7330f3",
  name: {
    en: "TokenLogger Sleep Prizes",
  },
  description: {
    en: "TokenLogger Sleep Prizes schema",
  },
  schemaVersion: {
    en: "0.0.1",
  },
  version: {
    en: "0.0.1",
  },
  shuffle: false,
  skippable: false,
  backDisabled: false,
  fullScreen: false,
  autoAdvance: false,
  items: [
    {
      id: "screen/5fd3ea35c47c585b7c7339d2",
      inputType: "radio_prizes",
      info: {
        en: "Balance: 10 Tokens",
      },
      valueConstraints: {
        itemList: [
          {
            name: {
              en: "Go out to dinner with mom",
            },
            value: 10,
            image:
              "https://raw.githubusercontent.com/ChildMindInstitute/GraphoLearn_EMA_applet/master/images/productivity.png",
          },
          {
            name: {
              en: "See a movie",
            },
            value: 15,
            image:
              "https://raw.githubusercontent.com/ChildMindInstitute/NIMH_EMA_applet/master/images/1F3AC.png",
          },
          {
            name: {
              en: "Go on a hike",
            },
            value: 5,
            image:
              "https://raw.githubusercontent.com/ReproNim/reproschema/master/docs/img/reproschema_logo.png",
          },
        ],
      },
      fullScreen: false,
      backDisabled: false,
      autoAdvance: true,
      inputs: {},
      schema: "",
      variableName: "balance",
      visibility: true,
    },
    {
      id: "screen/5fd3ea35c47c585b7c7339d2",
      inputType: 'radio',
      question: {
        en: '',
      },
      valueConstraints: {
        itemList: [
          {
            name: {
              en: 'Yes',
            },
            value: 1,
          },
          {
            name: {
              en: 'No',
            },
            value: 2,
          },
        ],
      },
      fullScreen: false,
      backDisabled: false,
      autoAdvance: true,
      inputs: {},
      schema: '',
      variableName: 'confirm',
      visibility: true,
    },
  ],
};
