const assert = require('node:assert/strict');
const core = require('../assets/suntneew-power-calculator-core.js');

const rvExample = core.recommendRv({
  loads: [
    { watts: 50, hours: 24, selected: true, simultaneous: true },
    { watts: 800, hours: 0.2, selected: true, simultaneous: true },
    { watts: 800, hours: 1, selected: true, simultaneous: true }
  ],
  backupDays: 1,
  fit: 'flexible'
});

assert.equal(rvExample.status, 'match');
assert.equal(rvExample.dailyWh, 2160);
assert.equal(rvExample.peakW, 1650);
assert.equal(rvExample.productKey, 'rv-230');
assert.equal(rvExample.quantity, 1);

const rvGroup24Fit = core.recommendRv({
  loads: [{ watts: 500, hours: 4, selected: true, simultaneous: true }],
  backupDays: 1,
  fit: 'group24'
});
assert.equal(rvGroup24Fit.status, 'match');
assert.equal(rvGroup24Fit.productKey, 'rv-g24');
assert.equal(rvGroup24Fit.quantity, 2);

const rvOverRange = core.recommendRv({
  loads: [{ watts: 12000, hours: 24, selected: true, simultaneous: true }],
  backupDays: 7,
  fit: 'flexible'
});
assert.equal(rvOverRange.status, 'support');

const jumpMatch = core.recommendJump({
  fuel: 'gasoline',
  engineLiters: 5.8,
  voltage: '12v',
  environment: 'standard',
  priority: 'compact'
});
assert.equal(jumpMatch.status, 'match');
assert.equal(jumpMatch.productKey, 'jump-u23');

const jumpDisplayPriority = core.recommendJump({
  fuel: 'gasoline',
  engineLiters: 5.8,
  voltage: '12v',
  environment: 'standard',
  priority: 'display'
});
assert.equal(jumpDisplayPriority.status, 'match');
assert.equal(jumpDisplayPriority.productKey, 'jump-u32');

const jumpUnsupportedVoltage = core.recommendJump({
  fuel: 'gasoline',
  engineLiters: 3,
  voltage: '24v',
  environment: 'standard',
  priority: 'compact'
});
assert.equal(jumpUnsupportedVoltage.status, 'support');

const homeLow = core.recommendHome({
  loads: [
    { watts: 150, hours: 12, selected: true, simultaneous: true },
    { watts: 100, hours: 5, selected: true, simultaneous: false },
    { watts: 25, hours: 24, selected: true, simultaneous: false }
  ],
  backupHours: 12,
  architecture: 'low'
});
assert.equal(homeLow.status, 'match');
assert.equal(homeLow.productKey, 'home-wl5a');

const homeArchitectureReview = core.recommendHome({
  loads: [{ watts: 500, hours: 8, selected: true, simultaneous: true }],
  backupHours: 12,
  architecture: 'unsure'
});
assert.equal(homeArchitectureReview.status, 'support');

console.log('SuntNeew calculator core tests passed.');
