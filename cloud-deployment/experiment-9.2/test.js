const add = require('./index');

test('adds 2 + 3 to equal 5', () => {
  if (add(2, 3) !== 5) {
    throw new Error('Test failed');
  }
});
