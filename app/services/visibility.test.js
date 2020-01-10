import { testVisibility } from './visibility';

const TEST_ITEMS = [
  { variableName: 'foo' },
  { variableName: 'bar' },
  { variableName: 'bam' },
  { variableName: 'boom' },
];

const TEST_RESPONSES = [
  1,
  false,
  { uri: 'some-uri', filename: 'some-filename.jpg' },
  undefined,
];

test('it evaluates true to truthy', () => {
  const testExpression = 'true';
  expect(testVisibility(testExpression, TEST_ITEMS, TEST_RESPONSES)).toBe(true);
});

test('it handles logical comparitors', () => {
  const testExpression = '1 < 2';
  expect(testVisibility(testExpression, TEST_ITEMS, TEST_RESPONSES)).toBe(true);
});

test('it handles equality', () => {
  const testExpression = '3 == 3';
  expect(testVisibility(testExpression, TEST_ITEMS, TEST_RESPONSES)).toBe(true);
});

test('it evaluates 1 to truthy', () => {
  const testExpression = 'foo';
  expect(testVisibility(testExpression, TEST_ITEMS, TEST_RESPONSES)).toBe(true);
});

test('it evaluates false to falsy', () => {
  const testExpression = 'bar';
  expect(testVisibility(testExpression, TEST_ITEMS, TEST_RESPONSES)).toBe(false);
});

test('it evaluates an object to truthy', () => {
  const testExpression = 'bam';
  expect(testVisibility(testExpression, TEST_ITEMS, TEST_RESPONSES)).toBe(true);
});

test('it evaluates undefined to falsy', () => {
  const testExpression = 'boom';
  expect(testVisibility(testExpression, TEST_ITEMS, TEST_RESPONSES)).toBe(false);
});

test('it can handle logical OR', () => {
  const testExpression = 'foo || bar';
  expect(testVisibility(testExpression, TEST_ITEMS, TEST_RESPONSES)).toBe(true);
});

test('it can handle logical AND', () => {
  const testExpression = 'foo && bar';
  expect(testVisibility(testExpression, TEST_ITEMS, TEST_RESPONSES)).toBe(false);
});

test('it can handle object properties', () => {
  const testExpression = 'bam.uri == "some-uri"';
  expect(testVisibility(testExpression, TEST_ITEMS, TEST_RESPONSES)).toBe(true);
});
