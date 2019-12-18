// Method to ease test assertions involving arrays
Array.prototype.compare = function(that) {
    if(this.length !== that.length)
        return false;
    for (var i = this.length - 1; i >= 0; i--) {
        if(this[i] != that[i]) return false;
    }
    return true;
}

/** assertEquals
 * got tired of unhelpful assert errors. This improves that by asserting
 * the inputs are equal, and displaying the description and the expected
 * and received values in the error message.
 *
 * @param expected expected value
 * @param received value to compare
 * @param description of the comparison (what does it represent)
 */
function assertEquals(expected, received, description) {
  if(expected.compare)
    console.assert(expected.compare(received), description,
      `\nExpected: '${expected}'\tReceived: '${received}'`);
  else
    console.assert(expected == received, description,
      `\nExpected: '${expected}'\tReceived: '${received}'`);
}

/**
 * helper function so we can match with some room for erro
 */
assertEquals.round = (value, points) => Math.floor(value * Math.pow(10, points) + 0.5)/Math.pow(10, points);
assertEquals(0.5, assertEquals.round(12/25, 1), 'pretty close to half');
assertEquals(0.02778, assertEquals.round(1/36, 5), 'something repeating');

module.exports = assertEquals;
