const { performance } = require('perf_hooks');
const plotly = require('plotly')(...require('./plotlykey.js'));

const {
  axmodnGate,
  axmodnFnLinear
} = require('./quantumFunctions');
const { findQ, picka } = require('./utils');

// t vs n, for cpu and gpu
const minN=10, maxN = 2000;
// warm up gpujs apparently
axmodnGate.setOutput([maxN*maxN*2])([...Array(maxN*maxN*2).keys()], 1, 1);

const out = [...Array(maxN - minN)]
  .map((v,N) => ({Q:findQ(N + minN), N: N + minN}))
  .map(R => [...Array(10)]
    .map((v, i) => ({ a: picka(R.N), ...R}))
  )
  .reduce((a,b) => a.concat(b), [])
  .map(R => {
    // gpujs doesn't like it when you make the output of the kernel bigger,
    // so, we'll go the oposite direction
    // const testArray = [...Array(maxN - R.N).keys()];
    const testArray = [...Array(R.N).keys()];
    const t0 = performance.now();
    const out1 = axmodnGate.setOutput([testArray.length])(testArray, R.a, R.N);
    const t1 = performance.now();
    const out2 = axmodnFnLinear(testArray, R.a, R.N);
    const t2 = performance.now();
    return {
      gpu: t1-t0,
      cpu: t2-t1,
      ...R
    };
  })
;

console.log(out)

const params = {
  mode: 'markers',
  type: 'scatter'
};
plotly.plot([
  {
    ...params,
    name: 'GPU',
    x: out.map(r => r.N),
    y: out.map(r => r.gpu),
  },
  {
    ...params,
    name: 'CPU',
    x: out.map(r => r.N),
    y: out.map(r => r.cpu),
  }
], {
    filename: "project_axmodn_timepern_cpuvsgpu",
    fileopt: "overwrite",
    layout: layout = {
      title: "a^x mod N Performance",
      xaxis: {
        title: "N",
        showgrid: false
      },
      yaxis: {
        title: "ms",
        showline: false,
      }
    }
}, (err, msg) => console.log(err, msg));
