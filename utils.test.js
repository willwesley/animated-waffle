const assertEquals = require('./assertEquals');
const { gcd, findQ, fracExp, picka } = require('./utils');

(function testFindQ() {
  assertEquals(2, findQ(1), 'N=1, Q=2');
  assertEquals(4, findQ(2), 'N=2, Q=4');
  assertEquals(16, findQ(3), 'N=3, Q=16');
  assertEquals(16, findQ(4), 'N=4, Q=16');
  assertEquals(32, findQ(5), 'N=5, Q=32');
  assertEquals(64, findQ(6), 'N=6, Q=64');
  assertEquals(64, findQ(7), 'N=7, Q=64');
  assertEquals(64, findQ(8), 'N=8, Q=64');
  assertEquals(128, findQ(9), 'N=9, Q=128');
  assertEquals(128, findQ(10), 'N=10, Q=128');
  assertEquals(128, findQ(11), 'N=11, Q=128');
  assertEquals(256, findQ(12), 'N=12, Q=256');
  assertEquals(256, findQ(13), 'N=13, Q=256');
  assertEquals(256, findQ(14), 'N=14, Q=256');
  assertEquals(256, findQ(15), 'N=15, Q=256');
  assertEquals(256, findQ(16), 'N=16, Q=256');
  assertEquals(512, findQ(17), 'N=17, Q=512');
  assertEquals(16384, findQ(99), 'N=99, Q=16384');
})();

(function testGcd() {
  assertEquals(2, gcd(2,4), 'First evens');
  assertEquals(11, gcd(66,11), 'b is my factor');
  assertEquals(1, gcd(378,425), 'co-primes like one');
  assertEquals(425, gcd(425,425), 'I am my own factor');
  assertEquals(2, gcd(6, 4), 'GCD(6, 4) = 2')
  assertEquals(1, gcd(17, 4), 'GCD(17, 4) = 1')
  assertEquals(11, gcd(121, 66), 'GCD(121, 66) = 11')
})();

(function testPicka() {
  assertEquals(10, assertEquals.round(picka(10)+5, -1))
  assertEquals(100, assertEquals.round(picka(100)+50, -2))
})();

(function testFracExp() {
  assertEquals([1,2], fracExp(0.5, 2), '0.5 = 1/2');
  assertEquals([3,8], fracExp(3/8, 8), '3/8 = 3/8');
  assertEquals([13, 16], fracExp(13/16, 16), '13/16 = 13/16');
  assertEquals([4, 5], fracExp(13/16, 8), '13/16 is kinda like 4/5');
})();




