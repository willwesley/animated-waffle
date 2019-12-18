const { GPU } = require('gpu.js');
const gpu = new GPU();

/**
 * Returns an array of equal amplitudes. Like as if it was a
 * register of entangled qubits.
 * @param Q, the number of values to represent (q-qbits => Q = 2^q)
 */
const makeHRegister = (Q) => {
  return [...Array(Q)].map(() => 1/Q);
}

/**
 * returns a^x mod N
 */
const axmodnFnLinear = function axmodnFn(R, a, N) {
  R[0] = 1;
  for(let i = 1; i < R.length; i++) {
    R[i] = (R[i-1]*a)%N;
  }
  return R;
};

const axmodnFn = function axmodnFn(a, N, x) {
  let p = 1;
  for(let i = 0; i < x; i++) {
    p = (p*a)%N;
  }
  return p;
};

/**
 * Returns an "entangled" register in which only values from the
 * field of a^x mod N are present. You are expected to resolve
 * any entanglement.
 */
const axmodnGate = gpu.createKernel(function(R, a, N) {
  return axmodnFn(a, N, this.thread.x);
}).setDynamicOutput(true);
gpu.addFunction(axmodnFn);

/**
 * register values are probabilities that total 1. If we sum them
 * in sequence, each value has a "slot". Pick a random value from
 * [0, 1) and find which slot it matches
 */
const measure = (R) => {
  const rand = Math.random();
  let slotStart = 0, slotEnd = 0;
  for(let i = 0; i < R.length; i++) {
    slotEnd += R[i];
    if(slotStart <= rand && rand < slotEnd) {
      return i;
    }
    slotStart += R[i];
  }
  return -1;
};

/**
 * returns a register where amplitudes in R1 are wiped out
 * if the slot wouldn't match a slot in R2 with the measured
 * value.
 */
const partialCollapse = gpu.createKernel(function(R1, R2, v) {
  if(R2[this.thread.x] === v)
    return R1[this.thread.x];
  return 0;
}).setDynamicOutput(true);

/**
 * Scales all amplitudes so their sum is 1
 */
const normalize = (R) => {
  const normalizeRegister = gpu.createKernel(function(R, scale) {
    return R[this.thread.x] * scale;
  }).setOutput([R.length]);

  const total = R.reduce((a,b) => a+b, 0);
  return normalizeRegister(R, 1/total);
};

/**
 * sort of computes the fourier tranform on an array 'reg'
 * this is the "how much power at this frequency" step
 * returns the powers of the result, which is enough for finding the dominant frequency/period
 */
const fourier = function fourier(reg, x, size) {
  let a = 0, b = 0;
  for(let j = 0; j < size; j++) {
    a += reg[j] * Math.cos(-2*Math.PI*x*j/size);
    b += reg[j] * Math.sin(-2*Math.PI*x*j/size);
  }
  return a*a + b*b;
};

gpu.addFunction(fourier);
const gpufourier = gpu.createKernel(function(R, size) {
  return fourier(R, this.thread.x, size)
}).setDynamicOutput(true);

module.exports = {
  axmodnFn,
  axmodnFnLinear,
  axmodnGate,
  fourier,
  gpufourier,
  makeHRegister,
  measure,
  normalize,
  partialCollapse,
};
