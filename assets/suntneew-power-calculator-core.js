(function (root, factory) {
  var calculator = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = calculator;
  }

  root.SuntNeewPowerCalculatorCore = calculator;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var PLANNING_FACTOR = 0.85;
  var MIN_LOAD_W = 1;
  var MAX_LOAD_W = 1000000;
  var MIN_LOAD_HOURS = 0.1;
  var MAX_LOAD_HOURS = 24;
  var MIN_RV_BACKUP_DAYS = 1;
  var MAX_RV_BACKUP_DAYS = 30;
  var MIN_JUMP_ENGINE_LITERS = 0.1;
  var MIN_HOME_BACKUP_HOURS = 1;
  var MAX_HOME_BACKUP_HOURS = 168;
  var MAX_SPACE_LONG_MM = 1000;
  var MAX_SPACE_SHORT_MM = 600;
  var MAX_SPACE_HEIGHT_MM = 500;

  var DEFAULT_CATALOG = [
    { scenario: 'rv', key: 'rv-g31', id: 'g31-100ah', model: 'Group 31 100Ah', fit: 'group31', lengthMm: 339, widthMm: 185, heightMm: 218, capacityWh: 1280, outputW: 1280, maxSeries: 4, maxParallel: 4 },
    { scenario: 'rv', key: 'rv-g24', id: 'g24-100ah', model: 'Group 24 100Ah', fit: 'group24', lengthMm: 260, widthMm: 170, heightMm: 212, capacityWh: 1280, outputW: 1280, maxSeries: 4, maxParallel: 4 },
    { scenario: 'rv', key: 'rv-230', id: '230ah', model: '230Ah', fit: 'flexible', lengthMm: 522, widthMm: 268, heightMm: 220, capacityWh: 2944, outputW: 2560, maxSeries: 4, maxParallel: 4 },
    { scenario: 'rv', key: 'rv-314', id: '314ah', model: '314Ah', fit: 'flexible', lengthMm: 522, widthMm: 268, heightMm: 220, capacityWh: 4019.2, outputW: 2010, maxSeries: 4, maxParallel: 4 },
    { scenario: 'jump', key: 'jump-u23', id: 'u23-8000', model: 'U23', variant: '8,000mAh', voltage: '12v', gasoline: 6, diesel: 3, priority: { compact: 0, display: 1, charging: 3, reserve: 5 } },
    { scenario: 'jump', key: 'jump-a20', id: 'a20-8000', model: 'A20', variant: '8,000mAh variant', voltage: '12v', gasoline: 6, diesel: 3, priority: { compact: 2, display: 3, charging: 3, reserve: 4 } },
    { scenario: 'jump', key: 'jump-u32', id: 'u32-10000', model: 'U32', variant: '10,000mAh', voltage: '12v', gasoline: 6.5, diesel: 3.5, priority: { compact: 1, display: 0, charging: 2, reserve: 3 } },
    { scenario: 'jump', key: 'jump-a20', id: 'a20-12000', model: 'A20', variant: '12,000mAh variant', voltage: '12v', gasoline: 7, diesel: 4, priority: { compact: 3, display: 3, charging: 1, reserve: 2 } },
    { scenario: 'jump', key: 'jump-a3', id: 'a3-16000', model: 'A3', variant: '16,000mAh', voltage: '12v', gasoline: 8, diesel: 5, priority: { compact: 4, display: 2, charging: 0, reserve: 1 } },
    { scenario: 'jump', key: 'jump-a20', id: 'a20-16000', model: 'A20', variant: '16,000mAh variant', voltage: '12v', gasoline: 8, diesel: 5, priority: { compact: 5, display: 3, charging: 1, reserve: 0 } },
    { scenario: 'home', key: 'home-wl5a', id: 'wl5a', model: 'SuntNeew WL5A', architecture: 'low', capacityWh: 5120, maxUnits: 9, maxSystemOutputW: 12000 },
    { scenario: 'home', key: 'home-wl10b', id: 'wl10b', model: 'SuntNeew WL10B', architecture: 'low', capacityWh: 10240, maxUnits: 9, maxSystemOutputW: 12000 },
    { scenario: 'home', key: 'home-vh', id: 'vh-10', model: 'SuntNeew VH', variant: '10.24kWh configuration', architecture: 'high', capacityWh: 10240, maxUnits: 1, maxSystemOutputW: 12000 },
    { scenario: 'home', key: 'home-vh', id: 'vh-15', model: 'SuntNeew VH', variant: '15.36kWh configuration', architecture: 'high', capacityWh: 15360, maxUnits: 1, maxSystemOutputW: 12000 }
  ];

  var catalog = buildCatalog(DEFAULT_CATALOG);

  function asNumber(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function round(value, precision) {
    var factor = Math.pow(10, precision || 0);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function clonePriority(priority) {
    return {
      compact: asNumber(priority && priority.compact, 3),
      display: asNumber(priority && priority.display, 3),
      charging: asNumber(priority && priority.charging, 3),
      reserve: asNumber(priority && priority.reserve, 3)
    };
  }

  function normalizeRecord(record) {
    if (!record || record.enabled === false) return null;

    var scenario = record.scenario;
    var common = {
      scenario: scenario,
      key: String(record.key || ''),
      id: String(record.id || record.key || ''),
      model: String(record.model || record.key || '')
    };

    if (!common.key || !common.id || !common.model) return null;

    if (scenario === 'rv') {
      var rvCapacityWh = asNumber(record.capacityWh, 0);
      var rvOutputW = asNumber(record.outputW, 0);
      var requestedFit = record.fitClass || record.fit;
      var fit = requestedFit === 'group24' || requestedFit === 'group31' ? requestedFit : 'flexible';
      if (rvCapacityWh <= 0 || rvOutputW <= 0) return null;
      return Object.assign(common, {
        fit: fit,
        fitClass: fit,
        lengthMm: Math.max(0, asNumber(record.lengthMm, 0)),
        widthMm: Math.max(0, asNumber(record.widthMm, 0)),
        heightMm: Math.max(0, asNumber(record.heightMm, 0)),
        capacityWh: rvCapacityWh,
        outputW: rvOutputW,
        maxSeries: Math.max(1, Math.floor(asNumber(record.maxSeries, 1))),
        maxParallel: Math.max(1, Math.floor(asNumber(record.maxParallel, asNumber(record.maxUnits, 1))))
      });
    }

    if (scenario === 'jump') {
      var gasoline = asNumber(record.gasoline, 0);
      var diesel = asNumber(record.diesel, 0);
      if (gasoline <= 0 && diesel <= 0) return null;
      return Object.assign(common, {
        variant: String(record.variant || ''),
        voltage: String(record.voltage || '12v'),
        gasoline: gasoline,
        diesel: diesel,
        priority: clonePriority(record.priority)
      });
    }

    if (scenario === 'home') {
      var homeCapacityWh = asNumber(record.capacityWh, 0);
      var architecture = record.architecture;
      if (homeCapacityWh <= 0 || (architecture !== 'low' && architecture !== 'high')) return null;
      return Object.assign(common, {
        variant: String(record.variant || ''),
        architecture: architecture,
        capacityWh: homeCapacityWh,
        maxUnits: Math.max(1, Math.floor(asNumber(record.maxUnits, 1))),
        maxSystemOutputW: Math.max(1, asNumber(record.maxSystemOutputW, 12000))
      });
    }

    return null;
  }

  function flattenRecords(records) {
    if (Array.isArray(records)) return records;
    if (!records || typeof records !== 'object') return [];
    return ['rv', 'jump', 'home'].reduce(function (all, scenario) {
      var scenarioRecords = Array.isArray(records[scenario]) ? records[scenario] : [];
      return all.concat(scenarioRecords.map(function (record) {
        return Object.assign({ scenario: scenario }, record);
      }));
    }, []);
  }

  function buildCatalog(records) {
    var next = { rv: [], jump: [], home: [] };
    var positions = { rv: {}, jump: {}, home: {} };

    flattenRecords(records).forEach(function (record) {
      var normalized = normalizeRecord(record);
      if (!normalized) return;
      var identity = normalized.id;
      var existingIndex = positions[normalized.scenario][identity];
      if (existingIndex !== undefined) {
        next[normalized.scenario][existingIndex] = normalized;
      } else {
        positions[normalized.scenario][identity] = next[normalized.scenario].length;
        next[normalized.scenario].push(normalized);
      }
    });

    return next;
  }

  function configureCatalog(records) {
    var configured = buildCatalog(records);
    var defaults = buildCatalog(DEFAULT_CATALOG);
    ['rv', 'jump', 'home'].forEach(function (scenario) {
      catalog[scenario] = configured[scenario].length ? configured[scenario] : defaults[scenario];
    });
    return getCatalog();
  }

  function resetCatalog() {
    catalog = buildCatalog(DEFAULT_CATALOG);
    return getCatalog();
  }

  function getCatalog() {
    return ['rv', 'jump', 'home'].reduce(function (copy, scenario) {
      copy[scenario] = catalog[scenario].map(function (record) {
        var cloned = Object.assign({}, record);
        if (record.priority) cloned.priority = clonePriority(record.priority);
        return cloned;
      });
      return copy;
    }, {});
  }

  function selectedLoads(loads) {
    return Array.isArray(loads)
      ? loads.filter(function (load) { return load && load.selected !== false; })
      : [];
  }

  function calculateLoads(loads) {
    var activeLoads = selectedLoads(loads);
    var valid = activeLoads.every(function (load) {
      var watts = asNumber(load.watts, 0);
      var hours = asNumber(load.hours, 0);
      return watts >= MIN_LOAD_W && watts <= MAX_LOAD_W && hours >= MIN_LOAD_HOURS && hours <= MAX_LOAD_HOURS;
    });
    var dailyWh = activeLoads.reduce(function (total, load) {
      return total + asNumber(load.watts, 0) * asNumber(load.hours, 0);
    }, 0);
    var largestLoadW = activeLoads.reduce(function (largest, load) {
      return Math.max(largest, asNumber(load.watts, 0));
    }, 0);
    var simultaneousW = activeLoads.reduce(function (total, load) {
      return load.simultaneous ? total + asNumber(load.watts, 0) : total;
    }, 0);

    return {
      valid: valid,
      activeCount: activeLoads.length,
      dailyWh: round(dailyWh, 1),
      peakW: round(Math.max(largestLoadW, simultaneousW), 1)
    };
  }

  function loadMetricsWithout(loads, excludedIndex) {
    var dailyWh = 0;
    var largestLoadW = 0;
    var simultaneousW = 0;

    (Array.isArray(loads) ? loads : []).forEach(function (load, index) {
      if (!load || index === excludedIndex || load.selected === false) return;
      var watts = Math.max(0, asNumber(load.watts, 0));
      var hours = Math.max(0, asNumber(load.hours, 0));
      dailyWh += watts * hours;
      largestLoadW = Math.max(largestLoadW, watts);
      if (load.simultaneous) simultaneousW += watts;
    });

    return {
      dailyWh: dailyWh,
      largestLoadW: largestLoadW,
      simultaneousW: simultaneousW,
      peakW: Math.max(largestLoadW, simultaneousW)
    };
  }

  function energyBand(wh) {
    if (wh < 1000) return 'under_1_kwh';
    if (wh < 3000) return '1_to_3_kwh';
    if (wh < 6000) return '3_to_6_kwh';
    if (wh < 10000) return '6_to_10_kwh';
    return 'over_10_kwh';
  }

  function peakBand(watts) {
    if (watts < 1000) return 'under_1_kw';
    if (watts < 2000) return '1_to_2_kw';
    if (watts < 4000) return '2_to_4_kw';
    return 'over_4_kw';
  }

  function invalidResult(scenario, reason, details) {
    return Object.assign({
      status: 'invalid',
      resultType: 'invalid',
      scenario: scenario,
      reason: reason
    }, details || {});
  }

  function supportResult(scenario, reason) {
    return {
      status: 'support',
      resultType: 'catalog_review',
      scenario: scenario,
      reason: reason,
      title: 'Product data needs a technical review.',
      guidance: 'The calculator could not find a complete verified catalog record for this scenario.'
    };
  }

  function productDimensions(product) {
    var lengthMm = asNumber(product && product.lengthMm, 0);
    var widthMm = asNumber(product && product.widthMm, 0);
    var heightMm = asNumber(product && product.heightMm, 0);
    if (lengthMm <= 0 || widthMm <= 0 || heightMm <= 0) return null;
    return {
      longSideMm: Math.max(lengthMm, widthMm),
      shortSideMm: Math.min(lengthMm, widthMm),
      heightMm: heightMm
    };
  }

  function normalizeRvSpace(input) {
    var mode = input && input.spaceMode;
    if (mode !== 'group24' && mode !== 'group31' && mode !== 'measured') {
      return mode === 'all' ? { mode: 'all' } : null;
    }

    if (mode === 'group24') {
      return { mode: mode, longSideMm: 260, shortSideMm: 170, heightMm: 212 };
    }
    if (mode === 'group31') {
      return { mode: mode, longSideMm: 339, shortSideMm: 185, heightMm: 218 };
    }

    var measured = input.space || {};
    var firstSide = asNumber(measured.longSideMm != null ? measured.longSideMm : input.spaceLongMm, 0);
    var secondSide = asNumber(measured.shortSideMm != null ? measured.shortSideMm : input.spaceShortMm, 0);
    return {
      mode: mode,
      longSideMm: Math.max(firstSide, secondSide),
      shortSideMm: Math.min(firstSide, secondSide),
      heightMm: asNumber(measured.heightMm != null ? measured.heightMm : input.spaceHeightMm, 0)
    };
  }

  function productFitsSpace(product, space) {
    if (!space || space.mode === 'all') return true;
    var dimensions = productDimensions(product);
    if (!dimensions) return false;
    return dimensions.longSideMm <= space.longSideMm &&
      dimensions.shortSideMm <= space.shortSideMm &&
      dimensions.heightMm <= space.heightMm;
  }

  function rvProductsForFit(fit, seriesCount, space) {
    return catalog.rv.filter(function (product) {
      if (product.maxSeries < seriesCount) return false;
      if (space) return productFitsSpace(product, space);
      if (fit === 'group24' || fit === 'group31') return product.fit === fit;
      return true;
    });
  }

  function measuredSpaceLimits(seriesCount) {
    var dimensioned = catalog.rv.filter(function (product) {
      return product.maxSeries >= seriesCount && productDimensions(product);
    }).map(function (product) {
      return { product: product, dimensions: productDimensions(product) };
    }).sort(function (a, b) {
      var aVolume = a.dimensions.longSideMm * a.dimensions.shortSideMm * a.dimensions.heightMm;
      var bVolume = b.dimensions.longSideMm * b.dimensions.shortSideMm * b.dimensions.heightMm;
      return aVolume - bVolume || a.dimensions.longSideMm - b.dimensions.longSideMm;
    });
    var smallest = dimensioned.length ? dimensioned[0].dimensions : null;
    return {
      available: Boolean(smallest),
      minLongSideMm: smallest ? smallest.longSideMm : 1,
      maxLongSideMm: Math.max(MAX_SPACE_LONG_MM, smallest ? smallest.longSideMm : 0),
      minShortSideMm: smallest ? smallest.shortSideMm : 1,
      maxShortSideMm: Math.max(MAX_SPACE_SHORT_MM, smallest ? smallest.shortSideMm : 0),
      minHeightMm: smallest ? smallest.heightMm : 1,
      maxHeightMm: Math.max(MAX_SPACE_HEIGHT_MM, smallest ? smallest.heightMm : 0)
    };
  }

  function homeProductsForArchitecture(architecture) {
    if (architecture === 'low' || architecture === 'high') {
      return catalog.home.filter(function (product) { return product.architecture === architecture; });
    }
    return catalog.home.slice();
  }

  function rvCapability(product, seriesCount) {
    return {
      record: product,
      capacityWh: product.capacityWh * seriesCount * product.maxParallel,
      outputW: product.outputW * seriesCount * product.maxParallel
    };
  }

  function homeCapability(product) {
    return {
      record: product,
      capacityWh: product.capacityWh * product.maxUnits,
      outputW: product.maxSystemOutputW
    };
  }

  function getLoadInputLimits(loads, capabilities, duration, durationKind) {
    var safeDuration = Math.max(durationKind === 'rv' ? MIN_RV_BACKUP_DAYS : MIN_HOME_BACKUP_HOURS, asNumber(duration, 0));
    var allLoads = Array.isArray(loads) ? loads : [];
    var loadLimits = allLoads.map(function (load, index) {
      var other = loadMetricsWithout(allLoads, index);
      var hours = Math.max(MIN_LOAD_HOURS, asNumber(load && load.hours, MIN_LOAD_HOURS));
      var watts = Math.max(MIN_LOAD_W, asNumber(load && load.watts, MIN_LOAD_W));
      var simultaneous = Boolean(load && load.simultaneous);
      var maxWatts = 0;
      var maxHours = 0;

      capabilities.forEach(function (capability) {
        if (other.peakW > capability.outputW) return;
        var dailyLimit = durationKind === 'rv'
          ? (capability.capacityWh * PLANNING_FACTOR) / safeDuration
          : (capability.capacityWh * PLANNING_FACTOR * 24) / safeDuration;
        var energyWatts = (dailyLimit - other.dailyWh) / hours;
        var outputWatts = simultaneous ? capability.outputW - other.simultaneousW : capability.outputW;
        var candidateMaxWatts = Math.min(energyWatts, outputWatts, MAX_LOAD_W);
        if (candidateMaxWatts >= MIN_LOAD_W) maxWatts = Math.max(maxWatts, candidateMaxWatts);

        var peakWithCurrentWatts = Math.max(
          other.largestLoadW,
          simultaneous ? other.simultaneousW + watts : watts,
          other.simultaneousW
        );
        if (peakWithCurrentWatts > capability.outputW) return;
        var candidateMaxHours = (dailyLimit - other.dailyWh) / watts;
        if (candidateMaxHours >= MIN_LOAD_HOURS) maxHours = Math.max(maxHours, Math.min(MAX_LOAD_HOURS, candidateMaxHours));
      });

      return {
        minWatts: MIN_LOAD_W,
        maxWatts: round(Math.max(MIN_LOAD_W, maxWatts), 2),
        minHours: MIN_LOAD_HOURS,
        maxHours: round(Math.max(MIN_LOAD_HOURS, maxHours), 2)
      };
    });

    return loadLimits;
  }

  function maximumDuration(loads, capabilities, durationKind) {
    var metrics = calculateLoads(loads);
    if (!metrics.activeCount || metrics.dailyWh <= 0) {
      return durationKind === 'rv' ? MAX_RV_BACKUP_DAYS : MAX_HOME_BACKUP_HOURS;
    }

    var maximum = 0;
    capabilities.forEach(function (capability) {
      if (metrics.peakW > capability.outputW) return;
      var candidate = durationKind === 'rv'
        ? (capability.capacityWh * PLANNING_FACTOR) / metrics.dailyWh
        : (capability.capacityWh * PLANNING_FACTOR * 24) / metrics.dailyWh;
      maximum = Math.max(maximum, candidate);
    });

    var configuredMaximum = durationKind === 'rv' ? MAX_RV_BACKUP_DAYS : MAX_HOME_BACKUP_HOURS;
    return round(Math.min(configuredMaximum, maximum), 2);
  }

  function summarizeCapabilities(capabilities) {
    return capabilities.reduce(function (summary, capability) {
      summary.maxStoredEnergyWh = Math.max(summary.maxStoredEnergyWh, capability.capacityWh);
      summary.maxPeakW = Math.max(summary.maxPeakW, capability.outputW);
      return summary;
    }, { maxStoredEnergyWh: 0, maxPeakW: 0 });
  }

  function getRvInputLimits(input) {
    var fit = input && input.fit ? input.fit : 'flexible';
    var seriesCount = Math.max(1, Math.min(4, Math.floor(asNumber(input && input.seriesCount, 1))));
    var space = normalizeRvSpace(input || {});
    var products = rvProductsForFit(fit, seriesCount, space);
    var capabilities = products.map(function (product) { return rvCapability(product, seriesCount); });
    var backupDays = asNumber(input && input.backupDays, MIN_RV_BACKUP_DAYS);
    var loads = input && input.loads;
    var summary = summarizeCapabilities(capabilities);

    return Object.assign(summary, {
      available: capabilities.length > 0,
      fit: fit,
      spaceMode: space ? space.mode : null,
      spaceMatchCount: products.length,
      measuredSpaceLimits: measuredSpaceLimits(seriesCount),
      seriesCount: seriesCount,
      nominalSystemVoltage: round(12.8 * seriesCount, 1),
      maximumBatteryCount: products.reduce(function (maximum, product) {
        return Math.max(maximum, seriesCount * product.maxParallel);
      }, 0),
      maximumParallelStrings: products.reduce(function (maximum, product) {
        return Math.max(maximum, product.maxParallel);
      }, 0),
      availableFits: {
        flexible: catalog.rv.some(function (product) { return product.maxSeries >= seriesCount; }),
        group24: catalog.rv.some(function (product) { return product.fit === 'group24' && product.maxSeries >= seriesCount; }),
        group31: catalog.rv.some(function (product) { return product.fit === 'group31' && product.maxSeries >= seriesCount; })
      },
      availableSpaceModes: {
        all: catalog.rv.some(function (product) { return product.maxSeries >= seriesCount; }),
        group24: catalog.rv.some(function (product) {
          return product.maxSeries >= seriesCount && productFitsSpace(product, normalizeRvSpace({ spaceMode: 'group24' }));
        }),
        group31: catalog.rv.some(function (product) {
          return product.maxSeries >= seriesCount && productFitsSpace(product, normalizeRvSpace({ spaceMode: 'group31' }));
        }),
        measured: measuredSpaceLimits(seriesCount).available
      },
      availableSeriesCounts: [1, 2, 3, 4].filter(function (count) {
        return rvProductsForFit(fit, count, space).length > 0;
      }),
      minBackupDays: MIN_RV_BACKUP_DAYS,
      maxBackupDays: Math.max(MIN_RV_BACKUP_DAYS, maximumDuration(loads, capabilities, 'rv')),
      loadLimits: getLoadInputLimits(loads, capabilities, backupDays, 'rv')
    });
  }

  function environmentFactor(environment) {
    return environment === 'demanding' ? 1.15 : environment === 'cold' ? 1.08 : 1;
  }

  function getJumpInputLimits(input) {
    var fuel = input && input.fuel === 'diesel' ? 'diesel' : 'gasoline';
    var voltage = String(input && input.voltage ? input.voltage : '12v');
    var factor = environmentFactor(input && input.environment);
    var voltageProducts = catalog.jump.filter(function (product) { return product.voltage === voltage; });
    var maxCoverageLiters = voltageProducts.reduce(function (maximum, product) {
      return Math.max(maximum, asNumber(product[fuel], 0));
    }, 0);
    var voltages = catalog.jump.reduce(function (available, product) {
      if (available.indexOf(product.voltage) === -1) available.push(product.voltage);
      return available;
    }, []);

    return {
      available: maxCoverageLiters > 0,
      availableVoltages: voltages,
      fuel: fuel,
      voltage: voltage,
      environmentFactor: factor,
      minEngineLiters: MIN_JUMP_ENGINE_LITERS,
      maxEngineLiters: round(maxCoverageLiters / factor, 1),
      maxCoverageLiters: maxCoverageLiters
    };
  }

  function getHomeInputLimits(input) {
    var architecture = input && input.architecture ? input.architecture : 'auto';
    if (architecture !== 'low' && architecture !== 'high') architecture = 'auto';
    var products = homeProductsForArchitecture(architecture);
    var capabilities = products.map(homeCapability);
    var backupHours = asNumber(input && input.backupHours, MIN_HOME_BACKUP_HOURS);
    var loads = input && input.loads;
    var summary = summarizeCapabilities(capabilities);

    return Object.assign(summary, {
      available: capabilities.length > 0,
      architecture: architecture,
      availableArchitectures: {
        auto: catalog.home.length > 0,
        low: catalog.home.some(function (product) { return product.architecture === 'low'; }),
        high: catalog.home.some(function (product) { return product.architecture === 'high'; })
      },
      minBackupHours: MIN_HOME_BACKUP_HOURS,
      maxBackupHours: Math.max(MIN_HOME_BACKUP_HOURS, maximumDuration(loads, capabilities, 'home')),
      loadLimits: getLoadInputLimits(loads, capabilities, backupHours, 'home')
    });
  }

  function rankRvProducts(products, requiredWh, peakW, seriesCount) {
    return products.map(function (product) {
      var energyParallelCount = Math.ceil(requiredWh / (product.capacityWh * seriesCount));
      var outputParallelCount = Math.ceil(peakW / (product.outputW * seriesCount));
      var parallelCount = Math.max(1, energyParallelCount, outputParallelCount);
      var quantity = seriesCount * parallelCount;
      return Object.assign({}, product, {
        seriesCount: seriesCount,
        parallelCount: parallelCount,
        quantity: quantity,
        combinedWh: round(product.capacityWh * quantity, 1),
        combinedOutputW: round(product.outputW * quantity, 1),
        overageWh: round(product.capacityWh * quantity - requiredWh, 1)
      });
    }).filter(function (product) {
      return product.seriesCount <= product.maxSeries && product.parallelCount <= product.maxParallel;
    }).sort(function (a, b) {
      return a.quantity - b.quantity || a.overageWh - b.overageWh || b.combinedOutputW - a.combinedOutputW;
    });
  }

  function recommendRv(input) {
    var loadMetrics = calculateLoads(input && input.loads);
    var backupDays = asNumber(input && input.backupDays, 0);
    var fit = input && input.fit ? input.fit : 'flexible';
    var seriesCount = Math.max(1, Math.min(4, Math.floor(asNumber(input && input.seriesCount, 1))));
    var space = normalizeRvSpace(input || {});
    var products = rvProductsForFit(fit, seriesCount, space);

    if (!products.length) return supportResult('rv', 'No verified RV product is configured for the selected footprint.');
    if (!loadMetrics.activeCount) return invalidResult('rv', 'Select at least one appliance.');
    if (!loadMetrics.valid) return invalidResult('rv', 'Use positive load values and run times from 0.1 to 24 hours.');
    if (backupDays < MIN_RV_BACKUP_DAYS || backupDays > MAX_RV_BACKUP_DAYS) {
      return invalidResult('rv', 'Choose a backup period within the available range.');
    }

    var requiredWh = round((loadMetrics.dailyWh * backupDays) / PLANNING_FACTOR, 1);
    var metrics = {
      dailyWh: loadMetrics.dailyWh,
      peakW: loadMetrics.peakW,
      requiredWh: requiredWh,
      energyBand: energyBand(loadMetrics.dailyWh),
      peakBand: peakBand(loadMetrics.peakW)
    };
    var ranked = rankRvProducts(products, requiredWh, loadMetrics.peakW, seriesCount);
    if (!ranked.length) {
      return invalidResult('rv', 'One or more values are above the verified range. Adjust the highlighted inputs.', Object.assign(metrics, {
        limits: getRvInputLimits(input)
      }));
    }

    var match = ranked[0];
    var alternate = ranked.find(function (candidate) { return candidate.key !== match.key; });
    var dimensions = productDimensions(match);
    var spaceCaveat = space && space.mode !== 'all'
      ? (match.quantity > 1
        ? 'The selected space was checked for one battery enclosure only. The complete bank layout, restraint, terminals, cabling and service clearance are not verified.'
        : 'The selected usable space was checked against one battery enclosure. Restraint, terminals, cabling and service clearance are not verified.')
      : null;
    var topologyCaveat = match.quantity > 1
      ? 'Use only identical, supported batteries in balanced series/parallel strings. Confirm battery state of charge, busbars, conductors, protection, charging and inverter voltage before installation.'
      : null;
    return Object.assign(metrics, {
      status: 'match',
      resultType: match.quantity > 1 ? 'multi_battery_starting_point' : 'product_match',
      scenario: 'rv',
      productKey: match.key,
      productId: match.id,
      model: match.model,
      quantity: match.quantity,
      seriesCount: match.seriesCount,
      parallelCount: match.parallelCount,
      nominalSystemVoltage: round(12.8 * match.seriesCount, 1),
      unitCapacityWh: match.capacityWh,
      unitOutputW: match.outputW,
      combinedWh: match.combinedWh,
      fit: match.fit,
      spaceMode: space ? space.mode : 'all',
      spaceVerified: Boolean(space && space.mode !== 'all' && dimensions),
      unitDimensions: dimensions,
      alternateKey: alternate ? alternate.key : null,
      alternateId: alternate ? alternate.id : null,
      alternateModel: alternate ? alternate.model : null,
      needsSystemReview: match.quantity > 1,
      productCaveat: [topologyCaveat, spaceCaveat].filter(Boolean).join(' ')
    });
  }

  function recommendJump(input) {
    var voltage = String(input && input.voltage ? input.voltage : '');
    var fuel = input && input.fuel;
    var engineLiters = asNumber(input && input.engineLiters, 0);
    var environment = input && input.environment ? input.environment : 'standard';
    var priority = input && input.priority ? input.priority : 'compact';
    var limits = getJumpInputLimits(input);

    if (fuel !== 'gasoline' && fuel !== 'diesel') return invalidResult('jump', 'Choose gasoline or diesel.');
    if (!limits.available) {
      return invalidResult('jump', 'Choose a vehicle voltage with a verified SuntNeew product range.', { limits: limits });
    }
    if (engineLiters < MIN_JUMP_ENGINE_LITERS || engineLiters > limits.maxEngineLiters) {
      return invalidResult('jump', 'Enter an engine size within the verified range shown above.', { limits: limits });
    }

    var factor = environmentFactor(environment);
    var planningLiters = round(engineLiters * factor, 2);
    var candidates = catalog.jump.filter(function (product) {
      return product.voltage === voltage && product[fuel] >= planningLiters;
    }).map(function (product) {
      return Object.assign({}, product, {
        score: asNumber(product.priority[priority], 3),
        coverageOverage: round(product[fuel] - planningLiters, 2)
      });
    }).sort(function (a, b) {
      return a.score - b.score || a.coverageOverage - b.coverageOverage;
    });

    if (!candidates.length) return supportResult('jump', 'The configured starting coverage table is incomplete.');

    var match = candidates[0];
    var alternate = candidates.find(function (candidate) { return candidate.id !== match.id; });
    return {
      status: 'match',
      resultType: 'product_match',
      scenario: 'jump',
      productKey: match.key,
      productId: match.id,
      model: match.model,
      variant: match.variant,
      coverageLiters: match[fuel],
      engineLiters: engineLiters,
      planningLiters: planningLiters,
      fuel: fuel,
      voltage: voltage,
      environment: environment,
      peakBand: 'vehicle_starting',
      energyBand: 'not_applicable',
      alternateKey: alternate ? alternate.key : null,
      alternateId: alternate ? alternate.id : null,
      alternateModel: alternate ? alternate.model : null,
      alternateVariant: alternate ? alternate.variant : null
    };
  }

  function rankHomeProducts(products, requiredWh, peakW) {
    return products.map(function (product) {
      var quantity = Math.max(1, Math.ceil(requiredWh / product.capacityWh));
      return Object.assign({}, product, {
        quantity: quantity,
        combinedWh: round(product.capacityWh * quantity, 1),
        overageWh: round(product.capacityWh * quantity - requiredWh, 1)
      });
    }).filter(function (product) {
      return product.quantity <= product.maxUnits && peakW <= product.maxSystemOutputW;
    }).sort(function (a, b) {
      return a.quantity - b.quantity || a.overageWh - b.overageWh || b.maxSystemOutputW - a.maxSystemOutputW;
    });
  }

  function recommendHome(input) {
    var loadMetrics = calculateLoads(input && input.loads);
    var backupHours = asNumber(input && input.backupHours, 0);
    var architecture = input && input.architecture ? input.architecture : 'auto';
    if (architecture !== 'low' && architecture !== 'high') architecture = 'auto';
    var products = homeProductsForArchitecture(architecture);

    if (!products.length) return supportResult('home', 'No verified home battery is configured for the selected architecture.');
    if (!loadMetrics.activeCount) return invalidResult('home', 'Select at least one essential load.');
    if (!loadMetrics.valid) return invalidResult('home', 'Use positive load values and run times from 0.1 to 24 hours.');
    if (backupHours < MIN_HOME_BACKUP_HOURS || backupHours > MAX_HOME_BACKUP_HOURS) {
      return invalidResult('home', 'Choose a backup window within the available range.');
    }

    var requiredWh = round((loadMetrics.dailyWh * (backupHours / 24)) / PLANNING_FACTOR, 1);
    var metrics = {
      dailyWh: loadMetrics.dailyWh,
      peakW: loadMetrics.peakW,
      requiredWh: requiredWh,
      energyBand: energyBand(requiredWh),
      peakBand: peakBand(loadMetrics.peakW)
    };
    var ranked = rankHomeProducts(products, requiredWh, loadMetrics.peakW);
    if (!ranked.length) {
      return invalidResult('home', 'One or more values are above the verified range. Adjust the highlighted inputs.', Object.assign(metrics, {
        limits: getHomeInputLimits(input)
      }));
    }

    var match = ranked[0];
    var alternate = ranked.find(function (candidate) { return candidate.key !== match.key || candidate.id !== match.id; });
    return Object.assign(metrics, {
      status: 'match',
      resultType: match.quantity > 1 ? 'multi_battery_starting_point' : 'product_match',
      scenario: 'home',
      productKey: match.key,
      productId: match.id,
      model: match.model,
      variant: match.variant,
      nominalWh: match.capacityWh,
      combinedWh: match.combinedWh,
      quantity: match.quantity,
      architecture: match.architecture === 'high' ? 'high_voltage' : 'low_voltage',
      alternateKey: alternate ? alternate.key : null,
      alternateId: alternate ? alternate.id : null,
      alternateModel: alternate ? alternate.model : null,
      needsSystemReview: match.quantity > 1,
      productCaveat: match.quantity > 1
        ? 'This quantity is a capacity starting point. Confirm the documented connection topology, inverter compatibility, current sharing, conductors, protection and communications before installation.'
        : null
    });
  }

  return {
    PLANNING_FACTOR: PLANNING_FACTOR,
    limits: {
      minLoadW: MIN_LOAD_W,
      maxLoadW: MAX_LOAD_W,
      minLoadHours: MIN_LOAD_HOURS,
      maxLoadHours: MAX_LOAD_HOURS,
      minRvBackupDays: MIN_RV_BACKUP_DAYS,
      maxRvBackupDays: MAX_RV_BACKUP_DAYS,
      minJumpEngineLiters: MIN_JUMP_ENGINE_LITERS,
      minHomeBackupHours: MIN_HOME_BACKUP_HOURS,
      maxHomeBackupHours: MAX_HOME_BACKUP_HOURS
    },
    configureCatalog: configureCatalog,
    resetCatalog: resetCatalog,
    getCatalog: getCatalog,
    calculateLoads: calculateLoads,
    energyBand: energyBand,
    peakBand: peakBand,
    getRvInputLimits: getRvInputLimits,
    getJumpInputLimits: getJumpInputLimits,
    getHomeInputLimits: getHomeInputLimits,
    recommendRv: recommendRv,
    recommendJump: recommendJump,
    recommendHome: recommendHome
  };
});
