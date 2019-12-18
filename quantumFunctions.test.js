const assertEquals = require('./assertEquals');

const {
  axmodnFn,
  axmodnGate,
  fourier,
  gpufourier,
  makeHRegister,
  measure,
  normalize,
  partialCollapse,
} = require('./quantumFunctions');

(function testMakeHRegister() {
  let out = makeHRegister(2);
  assertEquals(2, out.length, '1 qubit Q = 2');
  assertEquals([1/2,1/2], out, 'hadamard means equal amplitudes');
  out = makeHRegister(1024);
  assertEquals(1024, out.length, '10 qubit Q = 1024');
  out.map(o => assertEquals(1/1024, o, 'hadamard means equal amplitudes'));
})();

(function testAxmodnFn() {
  assertEquals(5, axmodnFn(5, 7, 1), '5^1 mod 7 = 5');
  assertEquals(4, axmodnFn(5, 7, 2), '5^2 mod 7 = 4');
  assertEquals(6, axmodnFn(5, 7, 3), '5^3 mod 7 = 6');
  assertEquals(2, axmodnFn(5, 7, 4), '5^4 mod 7 = 2');
  assertEquals(3, axmodnFn(5, 7, 5), '5^5 mod 7 = 3');
  assertEquals(1, axmodnFn(5, 7, 6), '5^6 mod 7 = 1');
})();

(function testAxmodnGate() {
  let out = axmodnGate.setOutput([6])([...Array(6).keys()], 3, 7);
  assertEquals(6, out.length, 'length it was told');
  assertEquals([1,3,2,6,4,5], out, '3 is a primitive root of 7');
  out = axmodnGate.setOutput([6])([...Array(6).keys()], 2, 7);
  assertEquals([1,2,4,1,2,4], out, '2 is not a primitive root of 7');
})();

(function testMeasure() {
  const oldRand = Math.random;

  Math.random = () => 1/8;
  let out = measure([1/8,1/8,1/8,1/8,1/8,1/8,1/8,1/8]);
  assertEquals(1, out, 'second slot');

  Math.random = () => 5/8 + 1/16;
  out = measure([1/8,1/8,1/8,1/8,1/8,1/8,1/8,1/8]);
  assertEquals(5, out, 'fifth slot');

  Math.random = oldRand;
})();

(function testPartialCollapse() {
  const R1 = [0,1,2,3,4,5,6,7,8,9];
  const R2 = [10,11,12,13,14,11,12,14,14];
  let out = partialCollapse.setOutput([10])(R1, R2, 11);
  assertEquals([0,1,0,0,0,5,0,0,0,0], out, 'Picking pieces');
  out = partialCollapse.setOutput([10])(R1, R2, 14);
  assertEquals([0,0,0,0,4,0,0,7,8,0], out, 'Picking pieces');
  out = partialCollapse.setOutput([10])(R2, R1, 0);
  assertEquals([10,0,0,0,0,0,0,0,0,0], out, 'Change places');
})();

(function testNormalize() {
  let out = normalize([1,1,1,1]);
  assertEquals([0.25,0.25,0.25,0.25], out, 'Four hadamard whatsit');
  out = normalize([1,0,1,0,1,0,0,1]);
  assertEquals([0.25,0,0.25,0,0.25,0,0,0.25], out, 'Five outta ten aint bad');
  out = normalize([2,0,30,0]);
  assertEquals([0.0625,0,0.9375,0], out, 'I dont even know whats going on');
  out = normalize([0.1,0,0.1,0]);
  assertEquals([0.5,0,0.5,0], out, 'Scaling up');
  out = normalize([0.1,0,0.3,0]);
  assertEquals([0.25,0,0.75,0], out, 'Scaling up lopsided');
})();

(function testFourier() {
  let out;
  assertEquals(1, assertEquals.round(fourier([0, 0.5, 0, 0.5], 0, 4), 20), 'period == 0/4*Q');
  assertEquals(0, assertEquals.round(fourier([0, 0.5, 0, 0.5], 1, 4), 20), 'period != 1/4*Q');
  assertEquals(1, assertEquals.round(fourier([0, 0.5, 0, 0.5], 2, 4), 20), 'period == 2/4*Q');
  assertEquals(0, assertEquals.round(fourier([0, 0.5, 0, 0.5], 3, 4), 20), 'period != 3/4*Q');
  const r4 = [0,0,0,0.25,0,0,0,0.25,0,0,0,0.25,0,0,0,0.25];
  assertEquals(1, assertEquals.round(fourier(r4, 0, r4.length), 20), 'period == 0/8*Q');
  assertEquals(0, assertEquals.round(fourier(r4, 1, r4.length), 20), 'period != 1/8*Q');
  assertEquals(0, assertEquals.round(fourier(r4, 2, r4.length), 20), 'period != 2/8*Q');
  assertEquals(0, assertEquals.round(fourier(r4, 3, r4.length), 20), 'period != 3/8*Q');
  assertEquals(1, assertEquals.round(fourier(r4, 4, r4.length), 20), 'period == 4/8*Q');
  assertEquals(0, assertEquals.round(fourier(r4, 5, r4.length), 20), 'period != 5/8*Q');
  assertEquals(0, assertEquals.round(fourier(r4, 6, r4.length), 20), 'period != 6/8*Q');
  assertEquals(0, assertEquals.round(fourier(r4, 7, r4.length), 20), 'period != 7/8*Q');
})();

(function testGpufourier() {
  const r4 = [0,0,0,0.25,0,0,0,0.25,0,0,0,0.25,0,0,0,0.25];
  let out = gpufourier.setOutput([r4.length])(r4, r4.length);
  assertEquals(1, assertEquals.round(out[0], 10), 'period == 0/8*Q');
  assertEquals(0, assertEquals.round(out[1], 10), 'period != 1/8*Q');
  assertEquals(0, assertEquals.round(out[2], 10), 'period != 2/8*Q');
  assertEquals(0, assertEquals.round(out[3], 10), 'period != 3/8*Q');
  assertEquals(1, assertEquals.round(out[4], 10), 'period == 4/8*Q');
  assertEquals(0, assertEquals.round(out[5], 10), 'period != 5/8*Q');
  assertEquals(0, assertEquals.round(out[6], 10), 'period != 6/8*Q');
  assertEquals(0, assertEquals.round(out[7], 10), 'period != 7/8*Q');
})();
