export default {
  sample1: [
    {
      text: 'Input name',
      type: 'text'
    },
    {
      text: 'Fill out in session?',
      type: 'bool'
    },
    {
      text: 'Skills',
      type: 'multi_sel',
      rows: [
      {text:'Not thought about or used', value: 0},
      {text:'Thought about, not used, didn\'t want to', value: 1},
      {text:'Thought about, not used, wanted to', value: 2},
      {text:'Tried but couldn\'t use them', value: 3},
      {text:'Tried, could do them but they didn\'t help', value: 4},
      {text:'Tried, could use them, helped', value: 5},
      {text:'Didn\'t try, used them, didn\'t help', value: 6},
      {text:'Didn\'t try, used them, helped', value: 7}
      ]
    },
    {
      text: 'Self Harm Urge',
      type: 'single_sel',
      rows: [
      {text:'Not at all', value: 0},
      {text:'A bit', value: 1},
      {text:'Somewhat', value: 2},
      {text:'Rather Strong', value: 3},
      {text:'Very Strong', value: 4},
      {text:'Extremely Strong', value: 5}
      ]
    },
    {
      text: 'Self Harm Actions',
      type: 'bool'
    },
    {
      text: 'Suicidal Thoughts',
      type: 'single_sel',
      rows: [
      {text:'Not at all', value: 0},
      {text:'A bit', value: 1},
      {text:'Somewhat', value: 2},
      {text:'Rather Strong', value: 3},
      {text:'Very Strong', value: 4},
      {text:'Extremely Strong', value: 5}
      ]
    },
    {
      text: 'Suicidal Actions',
      type: 'bool'
    },
    {
      text: 'Alcohol urge',
      type: 'single_sel',
      rows: [
      {text:'Not at all', value: 0},
      {text:'A bit', value: 1},
      {text:'Somewhat', value: 2},
      {text:'Rather Strong', value: 3},
      {text:'Very Strong', value: 4},
      {text:'Extremely Strong', value: 5}
      ]
    },
    {
      text: 'Alcohol Actions',
      type: 'bool'
    },
    {
      text: 'Drugs Urge',
      type: 'single_sel',
      rows: [
      {text:'Not at all', value: 0},
      {text:'A bit', value: 1},
      {text:'Somewhat', value: 2},
      {text:'Rather Strong', value: 3},
      {text:'Very Strong', value: 4},
      {text:'Extremely Strong', value: 5}
      ]
    },
    {
      text: 'Drugs Actions',
      type: 'bool'
    },
    {
      text: 'Meds Taken as Prescribed',
      type: 'bool'
    },
    {
      text: 'Cut class/school',
      type: 'bool'
    },
    {
      text: 'Skills',
      type: 'single_sel',
      rows: [
      {text:'Not thought about or used', value: 0},
      {text:'Thought about, not used, didn\'t want to', value: 1},
      {text:'Thought about, not used, wanted to', value: 2},
      {text:'Tried but couldn\'t use them', value: 3},
      {text:'Tried, could do them but they didn\'t help', value: 4},
      {text:'Tried, could use them, helped', value: 5},
      {text:'Didn\'t try, used them, didn\'t help', value: 6},
      {text:'Didn\'t try, used them, helped', value: 7}
      ]
    },
  ],
  sample2: [
    {
      text: 'Sample question',
      type: 'multi_sel',
      rows: [
        { text: 'John Smith', value: 0 },
        { text: 'John Beck', value: 1 },
        { text: 'Johne Doe', value: 2 },
        { text: 'Jerry B', value: 3 },
        { text: 'Dorry A', value: 4 },
        { text: 'James B', value: 5 }
      ]
    }
  ]
}