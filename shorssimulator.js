
//return a random integer n, a <= n < b
function randInt(a,b) {
	return Math.floor( Math.random()*(b-a) + a );
}


//euclidian algorithm for gcd
function gcd(a,b) {
	return b === 0 ? a : gcd(b, a % b);
}

//returns the numerator and denominator
//of the integer fraction closest to n
//with a denominator less than or equal to max
//assumes that n is between 0 and 1
function fracExp(n, max) {
	var num = 1;
	var den = 1;
	var delta = n;
	for( var i = 1; i <= max; i++ ){
		for( var j = 0; j <= i; j++ ) {
			if( Math.abs((j/i) - n) < delta ) {
				num = j;
				den = i;
				delta = Math.abs((j/i) - n);
			}
		}
	}
	//reduce to lowest terms
	var fGcd = gcd(num,den);
	if( fGcd !== 1 ) {
		num /= fGcd;
		den /= fGcd;
	}
	return [num, den];
}
//returns true if n is prime
function isPrime(n) {
	var max = Math.floor(Math.sqrt(n));
	for( var i = 2 ; i <= max; i++) {
		if (n % i == 0) {
			return false;
		}
	}
	return true;
}

//returns true if n = m^k where m is an integer
function isPrimePower(n) {
	var max = Math.log(n)/Math.log(2);
	for( var i = 2; i <= max; i++ ) {
		var root = Math.pow(n,1.0/i);
		if( root === Math.floor(root) ) return true;
	}
	return false;
}
//returns a^b mod n
//naive algorithm, like everything else here
function expmod(a,b,n) {
	var r = 1;
	for( var i = 0; i < b; i++ ) {
		r = r * a % n;
	}
	return r;
}

//computes the fourier tranform on an array 'reg'
//returns the powers of the result, which is enough for finding the dominant frequency/period
//this is a naive algorithm i know
function fourier(reg,size) {
	var freq = new Array(size);
	for( var i = 0; i < size; i++ ) {
		var n = new Complex(0,0);
		for( var j = 0; j < size; j++) {
			n.a += reg[j]*Math.cos(-2*Math.PI*i*j/size);
			n.b += reg[j]*Math.sin(-2*Math.PI*i*j/size);
		}
		freq[i] = n.power();
	}
	return freq;
}

//represents a complex number , a + bi
var Complex = Class.create({
	initialize: function (a,b) {
		this.a = a;
		this.b = b;
	},
	//returns magnitude on the complex plane
	magnitude: function () {
		return Math.sqrt(this.a*this.a + this.b*this.b);
	},
	//square of magnitude
	power: function () {
		return (this.a*this.a + this.b*this.b);
	}
});


//represents a quantum register of 'size' qubits
var QReg = Class.create({
	initialize: function (size) {
		this.size = size;
		//probability of each
		//possible state of the qubits
		this.states = Math.pow(2,size);
		this.probs = new Array(this.states);
		for( var i = 0; i < this.states; i++ ) {
			//initializes probabilities equally
			this.probs[i] = 1;
		}
		this.normalize();
		//at this point, measuring the value of QReg
		//would return a random value between 0 and size-1
	},
	//collapses the register and returns
	//the decimal value of the measured number
	measure: function () {
		var rand = Math.random(); //random 0 <= r < 1
		var pLess = 0; //stores the probability that we read less than probs[i]
		var pMore = 0; //stores the probability that we read more than probs[i]

		//check all probabilities and see if the random number chosen fits in the 'slot' of the given 'i'
		for( var i = 0; i < this.states; i++ ) {
			pMore += this.probs[i];
			if( rand > pLess && rand < pMore ) {
				//kay, we're measuring this one
				//collapse state of everything else
				for( var j = 0; j < this.states; j++ ) {
					this.probs[j] = (j === i ? 1 : 0);
				}
				//return read value
				return i;
			}
			pLess += this.probs[i];
		}
		//uhoh, an error
		return -1;
	},
	//returns new register transformed throguh
	//a^x mod n, x represented by the superposition of states
	//in this register
	modTransform: function (a,n) {
		var out = new QReg(this.size);
		//set output register to 0 first
		for( var i = 0; i < this.states; i++ ) {
			out.probs[i] = 0;
		}
		//classically calculate the a^x mod n for every
		//possible state, and increment the probability
		//for the result in the new register with the probability
		//of getting that number from this register
		for( var i = 0; i < this.states; i++ ) {
			var result = expmod(a,i,n);
			out.probs[result] += this.probs[i];
		}
		out.normalize();
		//out now represents the superposition
		//of all possible outputs of a^x mod n
		return out;
		//the quantum register 'out' is entangled with this register
		//so a measurement on 'out' also collapses positions of
		//this register inconsistent with the measurement
		//I couldn't think of a nice OOP way to handle that
		//so the makeConsistent function makes the current register
		//consistent with whatever the input measurement is
	},
	//makes this register's superposition consistent with
	//the measurement from the register returned by the 'modTransform'
	//function with base 'a' and mod 'n'
	makeConsistent: function (a,n,measured) {
		//for each possible state, we need to calculate
		//a^X mod n again, and set the probability
		//of that state accordingly
		for( var i = 0; i < this.states; i++ ) {
			var result = expmod(a,i,n);
			//if result equals the value measured, this value would occur
			this.probs[i] = ( result === measured ? 1 : 0 );
		}
		this.normalize();
	},
	//normalizes the register so the total probablity is 1
	normalize: function () {
		//find current total
		var total = 0;
		for( var i = 0; i < this.states; i++ ) {
			total += this.probs[i];
		}
		//find scaling factor to reduce total to 1
		//and apply it to all the states
		var scale = 1.0 / total;
		for( var i = 0; i < this.states; i++ ) {
			this.probs[i] *= scale;
		}
	},
	//returns a new QReg containing the amplitudes of the quantum transform
	//of this QReg
	quantFT: function () {
		//perform regular ol' DFT on the probabilities
		//of this register
		var result = fourier(this.probs,this.states);
		var newReg = new QReg(this.size);
		//set the probabilities of newReg to the fourier transform
		newReg.probs = result;
		newReg.normalize();
		//newReg now will return a k*this.states/period, where k is
		//random between 0 < r <= r-1
		return newReg;
	},
	//graphs the pdf of this register
	//using Plotr, to element 'e'
	//with max being the max on the x-axis
	//drawTicks is bool on whether to draw ticks
	graph: function(e, max, drawTicks) {
		//form probabilities
		var pdf = new Array();
		var ticks = new Array();
		for( var i = 0; i < this.states; i++ ) {
			pdf.push([i, this.probs[i]]);
			if( i < max ) { ticks.push(i) }
		}
		if( !drawTicks ) ticks = null;
		Flotr.draw(
			e,
			[ pdf ],
			{
				mouse:{
					track: true,
					color: 'purple',
					sensibility: 1, // => distance to show point get's smaller
					trackDecimals: 4,
					trackFormatter: function(obj){ return 'x = ' + obj.x +', y = ' + obj.y; }
				},
				yaxis: {
					min: 0, max: null
				},
				xaxis: {
					ticks: ticks,
					min: 0, max: max
				},
				points: {
					show: true
				}
			}
		);
	}
});

//javascript<->html interfacing
//driver functions are in the event handlers

//hide output and the sections on page load
$("output").hide();


//create global object to store program state
var shor = new Object();

$("randomize").observe('click', function () {
	$('a').value = randInt(2,parseInt($('n').value));
});


//the algorithm flow follows through the next few events
//its's confusing since i need the events to be button-driven
//but it should be fairly linear

$("run").observe('click', function () {
	$("output").show();
	$("output").childElements().each( function (e) {
	e.hide();
	});
	$("numcheck").show();
	$("numcheck").scrollTo();
	$("numcheck-error").hide();
	//fill numcheck results
	shor.n = $('n').value;
	if( shor.n > 32 ) {
		var ans = confirm("Hey, "+shor.n+" is a bit big, given the amount of bookkeeping a classical simulation of Shor's Algorithm has to do. Are you sure you want to try?");
		if( !ans ) return;
	}
	var good = true;
	if( isPrime(shor.n) ) {
		$('primecheck').innerHTML = "It\'s prime!";
		good = false;
	} else {
		$('primecheck').innerHTML = "check!";
	}
	if( isPrimePower(shor.n) ) {
		$('powerprimecheck').innerHTML = "That's a prime power!";
		good = false;
	} else {
		$('powerprimecheck').innerHTML = "check!";
	}
	if( !good ) {
		$('numcheck-error').show();
		return;
	}
	$('classpart1').show();
	$('classicalpart1').show();
	$('classicalpart2').hide();
	//the rest of the algorithm runs once an 'a' is entered
});

$("continue").observe('click', function () {
	$('classicalpart2').show();
	$('classicalpart2').scrollTo();
	$('quantumpart1').hide();
	$('quantumpart2').hide();
	$('quantumpart3').hide();
	$('classicalpart3').hide();
	$("lucky-factor").hide();
	$("unlucky").hide();
	$("badperiod").hide();
	$('goodstuff').hide();

	shor.a = $('a').value;

	var gcdResult = gcd(shor.a,shor.n);
	$('gcd-result').innerHTML = "gcd("+shor.a+","+shor.n+") = " + gcdResult;
	if( gcdResult !== 1 ) {
		$("lucky-factor").show();
		$('lucky-result').innerHTML = gcdResult;
		$('lucky-n').innerHTML = shor.n;
		return;
	}
	$('unlucky').show();
	var mods = new Array();
	var ticks = new Array();
	for( var i = 0; i < shor.n; i++ ) {
		mods.push([i, expmod(shor.a,i,shor.n)]);
		ticks.push(i);
	}
	Flotr.draw(
		$('modgraph'),
		[ mods ],
		{
			mouse:{
				track: true,
				color: 'purple',
				sensibility: 1, // => distance to show point get's smaller
				trackDecimals: 0,
				trackFormatter: function(obj){ return 'x = ' + obj.x +', y = ' + obj.y; }
			},
			xaxis: {
				ticks: ticks,
				tickDecimals: 0
			},
			yaxis: {
				min: 0, max: shor.n
			},
			points: {
				show: true
			}
		}
	);

	$('quantumpart').show();
	$('quantumpart1').show();
	//calculate q and Q naively
	shor.q = 1;
	shor.Q = Math.pow(2,shor.q);
	while( shor.Q < (shor.n*shor.n) ) {
		shor.q++;
		shor.Q = Math.pow(2,shor.q);
	}
	$('q-n').innerHTML = shor.n;
	$('q-q').innerHTML = shor.q;
	$('q-Q').innerHTML = shor.Q;

	shor.register1 = new QReg(shor.q);
	shor.register1.graph($('emptyreggraph'),shor.Q,false);
	shor.register2 = shor.register1.modTransform(shor.a,shor.n);
	shor.register2.graph($('transreggraph'),shor.n,true);

});

$("transmeasure").observe('click', function () {
	$('quantumpart2').show();
	$('quantumpart2').scrollTo();
	var measurement = shor.register2.measure();
	shor.register1.makeConsistent(shor.a,shor.n,measurement);
	$('qmeas').innerHTML = measurement;
	$('qmeas2').innerHTML = measurement;

	shor.register1.graph($('culledreggraph'),shor.n*3,false);

	shor.register1 = shor.register1.quantFT();
	shor.register1.graph($('fourierreggraph'),shor.Q,false);

	//cheating so we don't pick 0
	shor.register1.probs[0] = 0;
	shor.register1.normalize();
});

$("ftmeasure").observe('click', function () {
	$('quantumpart3').show();
	$('quantumpart3').scrollTo();
	var measurement = shor.register1.measure();
	$('ft-meas').innerHTML = measurement;
	$('ft-meas2').innerHTML = measurement/shor.Q;
	$('Q-meas').innerHTML = shor.Q;

	$('classpart2').show();
	$('classicalpart3').show();

	var c = measurement/shor.Q; //c should be less than 1

	//get fraction representation
	var fracEst = fracExp(c, shor.n);

	$('ft-calc').innerHTML = "Fractional representation: <span>"+fracEst[0]+"/"+fracEst[1]+"</span>";
	var period = fracEst[1];
	$('ft-p').innerHTML = period;

	var good = true;
	if( period % 2 === 1 ) {
		good = false;
		$('oddfail').innerHTML = "Uhoh, it's odd!";
	} else {
		$('oddfail').innerHTML = "check!";
	}
	if( (Math.pow(shor.a, period/2) % shor.n) === (shor.n-1) ) {
		good = false;
		$('otherfail').innerHTML = "Uhoh, they're equal!";
	} else {
		$('otherfail').innerHTML = "check!";
	}

	if( !good ) {
		$("badperiod").show();
		return;
	}
	$("goodstuff").show();
	var factor1 = gcd(Math.pow(shor.a,period/2) + 1, shor.n);
	var factor2 = gcd(Math.pow(shor.a,period/2) - 1, shor.n);
	$('atop').innerHTML = shor.a+"^("+period+"/2): <span>"+Math.pow(shor.a,period/2)+"</span>";
	$('gcds').innerHTML = "gcd("+(Math.pow(shor.a,period/2)+1)+", "+shor.n+"): <span>"+factor1+"</span>, gcd("+(Math.pow(shor.a,period/2)-1)+", "+shor.n+"): <span>"+factor2+"</span>";
	$('factors').innerHTML = "Factors: <span>"+factor1+", "+factor2+"</span>";

});

function retry() {
	$("badperiod").hide();
	$("goodstuff").hide();
	//set up initial register
	shor.register1 = new QReg(shor.q);
	//transform the register with a^x mod n
	shor.register2 = shor.register1.modTransform(shor.a,shor.n);
	//take measurement of transformed register
	//and partially collapse the first register
	var measurement = shor.register2.measure();

	$('qmeas').innerHTML = measurement;
	$('qmeas2').innerHTML = measurement;

	shor.register1.makeConsistent(shor.a,shor.n,measurement);
	//take the FT of the first register
	shor.register1 = shor.register1.quantFT();
	//cheating so we don't pick 0
	shor.register1.probs[0] = 0;
	shor.register1.normalize();

	//bookkeeping for the webpage
	var measurement = shor.register1.measure();
	$('ft-meas').innerHTML = measurement;
	$('ft-meas2').innerHTML = measurement/shor.Q;
	$('Q-meas').innerHTML = shor.Q;

	var c = measurement/shor.Q; //c should be less than 1
	//get fraction representation
	var fracEst = fracExp(c, shor.n);

	$('ft-calc').innerHTML = "Fractional representation: <span>"+fracEst[0]+"/"+fracEst[1]+"</span>";
	var period = fracEst[1];
	$('ft-p').innerHTML = period;

	var good = true;
	if( period % 2 === 1 ) {
		good = false;
		$('oddfail').innerHTML = "Uhoh, it's odd!";
	} else {
		$('oddfail').innerHTML = "check!";
	}
	if( (Math.pow(shor.a, period/2) % shor.n) === (shor.n-1) ) {
		good = false;
		$('otherfail').innerHTML = "Uhoh, they're equal!";
	} else {
		$('otherfail').innerHTML = "check!";
	}

	if( !good ) {
		$("badperiod").show();
		return;
	}
	$("goodstuff").show();
	var factor1 = gcd(Math.pow(shor.a,period/2) + 1, shor.n);
	var factor2 = gcd(Math.pow(shor.a,period/2) - 1, shor.n);
	$('atop').innerHTML = shor.a+"^("+period+"/2): <span>"+Math.pow(shor.a,period/2)+"</span>";
	$('gcds').innerHTML = "gcd("+(Math.pow(shor.a,period/2)+1)+", "+shor.n+"): <span>"+factor1+"</span>, gcd("+(Math.pow(shor.a,period/2)-1)+", "+shor.n+"): <span>"+factor2+"</span>";
	$('factors').innerHTML = "Factors: <span>"+factor1+", "+factor2+"</span>";

}

$("recalc").observe('click', retry);
$("recalc2").observe('click', retry);

function newA() {
	$("output").childElements().each( function (e) {
		e.hide();
	});
	$("numcheck").show();
	$("classpart1").show();
	$("classicalpart2").hide();
	$("classicalpart1").show();
	$("classicalpart1").scrollTo();
}
$("new-a").observe('click', newA );
$("new-a2").observe('click', newA );

$("new-n").observe('click', function () {
	$("output").childElements().each( function (e) {
		e.hide();
	});
	$("output").hide();
	$('n-input').scrollTo();
});

