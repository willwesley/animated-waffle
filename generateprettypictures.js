const plotly = require('plotly')(...require('./plotlykey.js'));
const fs = require('fs');
const findBits = (N, Q=2, q=1) => N <= Q ? q : findBits(N, Q*2, q+1);

const fileToObject = (data) => {
  return (''+data).trim().split('\n')
    .map((line) => JSON.parse(line))
};

const processFile = (filename, process) => {
  fs.readFile(filename, function(err,data){
    if (!err) {
      process(fileToObject(data))
    } else {
      console.log(err);
    }
  });
};

const unique = (a,b) => {
  if(a.indexOf(b.N) === -1)
    a.push(b.N)
  return a;
};

processFile('90semiprimes.txt', (data) => {
  // processFile('datawithguessesok.txt', (datawithguessesok) => {
    // console.log(data.reduce((a,b) => {
    //   a[b.success?0:1]++;
    //   return a;
    // }, [0, 0]))
    // console.log(datawithguessesok.reduce((a,b) => {
    //   a[b.success?0:1]++;
    //   return a;
    // }, [0, 0]))
    // data = data.concat(datawithguessesok);
    const split = splitSuccess(data)[0];


    const ticksForN = {
      ...params,
      x: split.map(r => r.N),
      y: split.map(r => r.ticks),
    };
    console.log(Math.max(...ticksForN.y))
    const scale = Math.max(...ticksForN.y)/Math.max(...ticksForN.x)
    const line = {
      ...params,
      x: [0, Math.max(...ticksForN.x)],
      y: [0, Math.max(...ticksForN.y)],
      mode: 'line',
      name: 'n'
    };
    const nlogn = {
      ...params,
      x: [...Array(110).keys()].map(a => 35+10*a),
      y: [...Array(110).keys()].map(a => scale*a*Math.log2(a)),
      mode: 'line',
      name: 'nlogn'
    };
    const parab = {
      ...params,
      x: [...Array(110).keys()].map(a => 35+10*a),
      y: [...Array(110).keys()].map(a => 10*a*a),
      mode: 'line',
      name: 'n^2'
    };
    const forkthing = {
      ...params,
      x: [...Array(60).keys()].map(a => 35+10*a),
      y: [...Array(60).keys()].map(a => a*a*a),
      mode: 'line',
      name: 'n^3'
    };
    makeGraph([ticksForN, parab, forkthing], 'Time to Factor N',
      'Time vs. N', 'N', 'ms');
    const ticksForQ = {
      ...params,
      x: split.map(r => findBits(r.N)),
      y: split.map(r => r.ticks),
    };
    makeGraph([ticksForQ], 'Time to Factor N (bits)',
      'Time vs. bits', 'bits', 'ms');
    const attemptsForN = {
      ...params,
      x: split.map(r => r.N),
      y: split.map(r => r.attempts+1),
    };
    makeGraph([attemptsForN], 'Attempts to Factor N',
      'Tries vs. N', 'N', 'tries');
    const attemptsForQ = {
      ...params,
      x: split.map(r => findBits(r.N)),
      y: split.map(r => r.attempts+1),
    };
    makeGraph([attemptsForQ], 'Attempts to Factor N (bits)',
      'Tries vs. bits', 'bits', 'tries');
    const ticksForAttempt = {
      ...params,
      x: split.map(r => r.N),
      y: split.map(r => r.ticks/(r.attempts+1)),
    };
    makeGraph([ticksForAttempt], 'Ticks per Attempt to Factor N',
      'Ticks per Attempt to Factor N', 'N', 'ms/attempt');
  // });
});


const splitSuccess = (data) => data.reduce((a,b) => {
  a[b.success?0:1].push(b);
  return a;
}, [[], []]);

const params = {
  mode: 'markers',
  type: 'scatter'
};

const makeGraph = (data, filename, title, xlabel, ylabel) => {
  plotly.plot(data, {
    filename: filename,
    fileopt: "overwrite",
    layout: layout = {
      title: title,
      xaxis: {
        title: xlabel,
        showgrid: false
      },
      yaxis: {
        title: ylabel,
        showline: false,
      }
    }
  }, (err, msg) => console.log(err, msg));
};

