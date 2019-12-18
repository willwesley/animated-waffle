/**
 * Find the power of 2 greater than N^2 so we can make a
 * register big enough to represent periods in
 * @param N number we want to be bigger than
 * @param Q starting power of 2 to calculate from
 */
const findQ = (N, Q=2) => N*N <= Q ? Q : findQ(N, Q*2);

/**
 * Find the greatest common denominator of a & b by the
 * Euclidean method
 * @param a first integer
 * @param b second integer
 * @return the largest integer that divides both
 *   numbers evenly
 */
const gcd = (a,b) => !b ? a : gcd(b, a % b);

/**
 * Randomly pick some a value from [2, N). Why less than
 * N-1 you ask? Well, if you consider a^x mod N, where a
 * = N-1, you get (N-1)^1=N-1, (N-1)^2=N^2+1=1(mod N), and
 * (N-1)^3=N^3-N^2+N-1=N-1(mod N), which is a period of 2
 * which *could* be nice, but (N-1)^(2/2) = (N-1) which
 * can't give us a factor of N.
 * @param N big ol' number we're aiming for.
 * @return a value from [2, N)
 */
const picka = (N) => Math.floor(Math.random()*(N-3)) + 2;

/**
 * returns the numerator and denominator of the integer
 * fraction closest to n with a denominator less than or
 * equal to max
 * @param n number between 0 and 1 to figure out
 * @param max largest denominator to consider
 * @return [numerator, denominator] of fraction closest to
 *  n
 */
const fracExp = (n, max) => {
  let num = 1, den = 1, delta = n;
  for(let i = 1; i <= max; i++) {
    for(let j = 0; j <= i; j++) {
      if(Math.abs((j/i) - n) < delta) {
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

module.exports = {
  gcd,
  findQ,
  fracExp,
  picka,
};
