const assert = require('node:assert/strict');
const core = require('../assets/suntneew-power-calculator-core.js');

function selectedLoad(watts, hours, simultaneous = true) {
  return { watts, hours, selected: true, simultaneous };
}

const rvExample = core.recommendRv({
  loads: [
    selectedLoad(50, 24),
    selectedLoad(800, 0.2),
    selectedLoad(800, 1)
  ],
  backupDays: 1,
  fit: 'flexible',
  seriesCount: 1
});

assert.equal(rvExample.status, 'match');
assert.equal(rvExample.dailyWh, 2160);
assert.equal(rvExample.peakW, 1650);
assert.equal(rvExample.productKey, 'rv-230');
assert.equal(rvExample.quantity, 1);
assert.equal(rvExample.seriesCount, 1);
assert.equal(rvExample.parallelCount, 1);

const rvGroup24Fit = core.recommendRv({
  loads: [selectedLoad(500, 4)],
  backupDays: 1,
  fit: 'group24',
  seriesCount: 1
});
assert.equal(rvGroup24Fit.status, 'match');
assert.equal(rvGroup24Fit.productKey, 'rv-g24');
assert.equal(rvGroup24Fit.quantity, 2);
assert.equal(rvGroup24Fit.parallelCount, 2);

const rvDemandingLoads = [
  selectedLoad(1950, 1),
  selectedLoad(850, 1, false)
];
const rvTwelveVoltLimit = core.recommendRv({
  loads: rvDemandingLoads,
  backupDays: 3,
  fit: 'group24',
  seriesCount: 1
});
assert.equal(rvTwelveVoltLimit.status, 'invalid');
assert.equal(rvTwelveVoltLimit.limits.maximumBatteryCount, 4);
assert.equal(rvTwelveVoltLimit.limits.maxStoredEnergyWh, 5120);

const rvTwentyFourVoltMatch = core.recommendRv({
  loads: rvDemandingLoads,
  backupDays: 3,
  fit: 'group24',
  seriesCount: 2
});
assert.equal(rvTwentyFourVoltMatch.status, 'match');
assert.equal(rvTwentyFourVoltMatch.quantity, 8);
assert.equal(rvTwentyFourVoltMatch.seriesCount, 2);
assert.equal(rvTwentyFourVoltMatch.parallelCount, 4);
assert.equal(rvTwentyFourVoltMatch.nominalSystemVoltage, 25.6);

const rvFourSeriesFourParallel = core.recommendRv({
  loads: [selectedLoad(1000, 3.4)],
  backupDays: 4,
  fit: 'group31',
  seriesCount: 4
});
assert.equal(rvFourSeriesFourParallel.status, 'match');
assert.equal(rvFourSeriesFourParallel.quantity, 16);
assert.equal(rvFourSeriesFourParallel.seriesCount, 4);
assert.equal(rvFourSeriesFourParallel.parallelCount, 4);
assert.equal(rvFourSeriesFourParallel.nominalSystemVoltage, 51.2);

const rvLimits12V = core.getRvInputLimits({ loads: rvDemandingLoads, backupDays: 1, fit: 'group24', seriesCount: 1 });
const rvLimits51V = core.getRvInputLimits({ loads: rvDemandingLoads, backupDays: 1, fit: 'group24', seriesCount: 4 });
assert.equal(rvLimits12V.maximumBatteryCount, 4);
assert.equal(rvLimits51V.maximumBatteryCount, 16);
assert.equal(rvLimits51V.maximumParallelStrings, 4);

const defaultRvCatalog = core.getCatalog().rv;
assert.deepEqual(
  defaultRvCatalog.find((product) => product.id === 'g24-100ah') && {
    lengthMm: defaultRvCatalog.find((product) => product.id === 'g24-100ah').lengthMm,
    widthMm: defaultRvCatalog.find((product) => product.id === 'g24-100ah').widthMm,
    heightMm: defaultRvCatalog.find((product) => product.id === 'g24-100ah').heightMm
  },
  { lengthMm: 260, widthMm: 170, heightMm: 212 }
);

const measuredLimits = core.getRvInputLimits({
  loads: [selectedLoad(500, 1)],
  backupDays: 1,
  seriesCount: 1,
  spaceMode: 'measured',
  space: { longSideMm: 270, shortSideMm: 180, heightMm: 220 }
});
assert.equal(measuredLimits.available, true);
assert.equal(measuredLimits.spaceMatchCount, 1);
assert.equal(measuredLimits.measuredSpaceLimits.minLongSideMm, 260);
assert.equal(measuredLimits.measuredSpaceLimits.minShortSideMm, 170);
assert.equal(measuredLimits.measuredSpaceLimits.minHeightMm, 212);

const measuredRotatedMatch = core.recommendRv({
  loads: [selectedLoad(500, 1)],
  backupDays: 1,
  seriesCount: 1,
  spaceMode: 'measured',
  space: { longSideMm: 180, shortSideMm: 270, heightMm: 220 }
});
assert.equal(measuredRotatedMatch.status, 'match');
assert.equal(measuredRotatedMatch.productKey, 'rv-g24');
assert.equal(measuredRotatedMatch.spaceVerified, true);
assert.deepEqual(measuredRotatedMatch.unitDimensions, { longSideMm: 260, shortSideMm: 170, heightMm: 212 });

const group31SpaceMatch = core.recommendRv({
  loads: [selectedLoad(500, 1)],
  backupDays: 1,
  seriesCount: 1,
  spaceMode: 'group31'
});
assert.equal(group31SpaceMatch.status, 'match');
assert.equal(group31SpaceMatch.productKey, 'rv-g31');

const invalidLoads = core.calculateLoads([selectedLoad(0, 2), selectedLoad(100, 25)]);
assert.equal(invalidLoads.valid, false);

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

const jumpColdDieselLimits = core.getJumpInputLimits({
  fuel: 'diesel',
  voltage: '12v',
  environment: 'cold'
});
assert.equal(jumpColdDieselLimits.maxEngineLiters, 4.6);
assert.equal(core.recommendJump({
  fuel: 'diesel',
  engineLiters: 4.7,
  voltage: '12v',
  environment: 'cold',
  priority: 'reserve'
}).status, 'invalid');

const jumpUnsupportedVoltage = core.recommendJump({
  fuel: 'gasoline',
  engineLiters: 3,
  voltage: '24v',
  environment: 'standard',
  priority: 'compact'
});
assert.equal(jumpUnsupportedVoltage.status, 'invalid');
assert.equal(jumpUnsupportedVoltage.limits.available, false);

const homeLow = core.recommendHome({
  loads: [
    selectedLoad(150, 12),
    selectedLoad(100, 5, false),
    selectedLoad(25, 24, false)
  ],
  backupHours: 12,
  architecture: 'low'
});
assert.equal(homeLow.status, 'match');
assert.equal(homeLow.productKey, 'home-wl5a');

const homeLowMultiSet = core.recommendHome({
  loads: [selectedLoad(1000, 20)],
  backupHours: 24,
  architecture: 'low'
});
assert.equal(homeLowMultiSet.status, 'match');
assert.equal(homeLowMultiSet.productKey, 'home-wl10b');
assert.equal(homeLowMultiSet.quantity, 3);

const homeHighOverRange = core.recommendHome({
  loads: [selectedLoad(1000, 20)],
  backupHours: 24,
  architecture: 'high'
});
assert.equal(homeHighOverRange.status, 'invalid');
assert.equal(homeHighOverRange.limits.maxStoredEnergyWh, 15360);

const homeAuto = core.recommendHome({
  loads: [selectedLoad(500, 8)],
  backupHours: 12,
  architecture: 'auto'
});
assert.equal(homeAuto.status, 'match');

core.configureCatalog([
  {
    scenario: 'rv',
    key: 'rv-future',
    id: 'future-500ah',
    model: 'Future 500Ah',
    fit: 'flexible',
    lengthMm: 610,
    widthMm: 300,
    heightMm: 250,
    capacityWh: 6400,
    outputW: 5000,
    maxSeries: 4,
    maxParallel: 4
  }
]);
const futureLimits = core.getRvInputLimits({
  loads: [selectedLoad(1000, 1)],
  backupDays: 1,
  fit: 'flexible',
  seriesCount: 4
});
assert.equal(futureLimits.maxStoredEnergyWh, 102400);
assert.equal(futureLimits.maximumBatteryCount, 16);
const futureMatch = core.recommendRv({
  loads: [selectedLoad(5000, 10)],
  backupDays: 1,
  fit: 'flexible',
  seriesCount: 4
});
assert.equal(futureMatch.status, 'match');
assert.equal(futureMatch.productKey, 'rv-future');
assert.equal(futureMatch.quantity, 12);

const futureMeasuredLimits = core.getRvInputLimits({
  loads: [selectedLoad(1000, 1)],
  backupDays: 1,
  fit: 'flexible',
  spaceMode: 'measured',
  space: { longSideMm: 610, shortSideMm: 300, heightMm: 250 },
  seriesCount: 1
});
assert.equal(futureMeasuredLimits.available, true);
assert.equal(futureMeasuredLimits.measuredSpaceLimits.minLongSideMm, 610);
assert.equal(futureMeasuredLimits.measuredSpaceLimits.minShortSideMm, 300);

core.resetCatalog();
assert.equal(core.getCatalog().rv.length, 4);

console.log('SuntNeew calculator core tests passed.');
