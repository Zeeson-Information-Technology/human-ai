// Use CommonJS style requires to avoid ESM loader complexity in ts-node
const assert = require('node:assert');
const { computeRemainingMs } = require("../src/components/interview/timer/math");

function approxEqual(a: number, b: number, epsilon = 5) {
  return Math.abs(a - b) <= epsilon;
}

// Basic monotonic countdown
{
  const duration = 7 * 60 * 1000 + 30 * 1000; // 7:30
  const t0 = 1_000_000;
  assert.equal(computeRemainingMs(t0, t0, duration), duration, 'remaining at t0 should equal duration');
  const t1 = t0 + 1000;
  assert(approxEqual(computeRemainingMs(t0, t1, duration), duration - 1000), 'after 1s, remaining ~ duration-1000');
  const t2 = t0 + duration - 1;
  assert.equal(computeRemainingMs(t0, t2, duration), 1, '1ms before expiry');
  const t3 = t0 + duration;
  assert.equal(computeRemainingMs(t0, t3, duration), 0, 'at expiry clamp to 0');
  const t4 = t0 + duration + 5000;
  assert.equal(computeRemainingMs(t0, t4, duration), 0, 'after expiry clamp to 0');
}

// Negative now guard
{
  const duration = 1000;
  const t0 = 5000;
  const before = t0 - 500;
  assert.equal(computeRemainingMs(t0, before, duration), duration, 'before start time still full remaining');
}

console.log('timer.test: OK');
