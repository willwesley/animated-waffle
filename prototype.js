const { GPU } = require('gpu.js');

const { gcd, findQ, fracExp, picka } = require('./utils');
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

const shors = (N, allowGuessing = true) => {
  const a = picka(N);
  console.log('a: ', a);
  const gcdAN = gcd(a, N);
  if(gcdAN !== 1) {
    console.log('Guessed a factor: ', gcdAN);
    return allowGuessing;
  }

  const Q = findQ(N);
  console.log('Q: ', Q);

  const R1 = makeHRegister(Q);
  // console.log(R1)
  const R2 = axmodnGate.setOutput([Q])(R1, a, N);
  // console.log(R2)
  const measured = R2[Math.floor(Math.random()*Q)];
  console.log('measured from R2: ', measured);
  const cR1 = normalize(partialCollapse.setOutput([Q])(R1, R2, measured));
  // console.log(cR1);
  const THRESH = 1/(Q*Q);
  const tR1 = normalize(gpufourier.setOutput([cR1.length])(cR1, cR1.length).map(v=>v<THRESH?0:v));
  // console.log(tR1);
  // console.log(Math.max(...tR1));
  const kqr = measure(tR1);
  console.log('kqr: ', kqr);
  if(kqr === 0) {
    console.log('Bad luck, measured nil from quantum computer')
    return false;
  }
  const r = fracExp(kqr/Q, N)[1];
  console.log('period: ', r);
  if(r % 2 === 1) {
    console.log('Bad luck, odd period: ', r)
    return false;
  } else if(r === N - 1) {
    console.log('Bad luck, period not useful: ', r)
    return false;
  } else {
    const m = gcd(Math.pow(a, r/2)-1, N);
    const n = gcd(Math.pow(a, r/2)+1, N);
    if(1 < m && m < N || 1 < n && n < N) {
      if(N%m === 0 || N%n === 0) {
        console.log('One or both of these is/are a factor(s): ', m, n);
        return true;
      } else {
        console.log('Bad luck, garbage came out: ', m, n);
        return false;
      }
    } else {
      console.log('Bad luck, snake eyes or sixes: ', m, n);
      return false;
    }
  }
};

module.exports = shors;
