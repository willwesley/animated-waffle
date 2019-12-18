const { performance } = require('perf_hooks');
const fs = require('fs');

const shors = require('./prototype');

const somePrimes = [
  5,  7, 11, 13, 17, 19, 23, 27, 29, 31,
  37, 41, //43, 47, 53, 59, 61, 67, 71, 73,
].reverse();
const perN = 5;
const maxTries = 100;

const functions = somePrimes.map(p => {
  if(p >= 41)
    return somePrimes.map(q => {
      if(p > q && q >= 29 && q < 37)
        return [...Array(perN)].map(() => {
          const N = p*q;
          let attempts = 0;
          return () => {
            console.log('Factoring: ', N);
            const t0 = performance.now();
            while(!shors(N) && attempts < maxTries) attempts++;
            const t1 = performance.now();

            return {
              N,
              p,
              q,
              attempts,
              ticks: t1-t0,
              success: attempts<maxTries,
            };
          };
        });
      return [];
    }).reduce((a,b) => a.concat(b), [])
  return [];
}).reduce((a,b) => a.concat(b), []);


const os = fs.createWriteStream('90semiprimes.txt', {flags: 'a'});
let fn;
const runFns = () => {
  while(functions.length) {
    fn = functions.shift();
    // fn();
    if(!os.write(JSON.stringify(fn()) + '\n')) {
      os.once('drain', runFns);
      return;
    }
  }
  os.end();
};

runFns();
