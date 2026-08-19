(function (root, factory) {
  var calculator = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = calculator;
  }

  root.SuntNeewPowerCalculatorCore = calculator;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var PLANNING_FACTOR = 0.85;

  var RV_PRODUCTS = [
    { key: 'rv-g31', id: 'g31-100ah', model: 'Group 31 100Ah', capacityWh: 1280, outputW: 1280 },
    { key: 'rv-230', id: '230ah', model: '230Ah', capacityWh: 2944, outputW: 2560 },
    { key: 'rv-314', id: '314ah', model: '314Ah', capacityWh: 4019.2, outputW: 2010 }
  ];

  var JUMP_PRODUCTS = [
    {
      key: 'jump-u23',
      id: 'u23-8000',
      model: 'U23',
      variant: '8,000mAh',
      gasoline: 6,
      diesel: 3,
      priority: { compact: 0, display: 1, charging: 3, reserve: 5 }
    },
    {
      key: 'jump-a20',
      id: 'a20-8000',
      model: 'A20',
      variant: '8,000mAh variant',
      gasoline: 6,
      diesel: 3,
      priority: { compact: 2, display: 3, charging: 3, reserve: 4 }
    },
    {
      key: 'jump-u32',
      id: 'u32-10000',
      model: 'U32',
      variant: '10,000mAh',
      gasoline: 6.5,
      diesel: 3.5,
      priority: { compact: 1, display: 0, charging: 2, reserve: 3 }
    },
    {
      key: 'jump-a20',
      id: 'a20-12000',
      model: 'A20',
      variant: '12,000mAh variant',
      gasoline: 7,
      diesel: 4,
      priority: { compact: 3, display: 3, charging: 1, reserve: 2 }
    },
    {
      key: 'jump-a3',
      id: 'a3-16000',
      model: 'A3',
      variant: '16,000mAh',
      gasoline: 8,
      diesel: 5,
      priority: { compact: 4, display: 2, charging: 0, reserve: 1 }
    },
    {
      key: 'jump-a20',
      id: 'a20-16000',
      model: 'A20',
      variant: '16,000mAh variant',
      gasoline: 8,
      diesel: 5,
      priority: { compact: 5, display: 3, charging: 1, reserve: 0 }
    }
  ];

  function asNumber(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function round(value, precision) {
    var factor = Math.pow(10, precision || 0);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function calculateLoads(loads) {
    var activeLoads = Array.isArray(loads)
      ? loads.filter(function (load) {
          return load && load.selected !== false && asNumber(load.watts, 0) > 0 && asNumber(load.hours, 0) > 0;
        })
      : [];

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
      activeCount: activeLoads.length,
      dailyWh: round(dailyWh, 1),
      peakW: round(Math.max(largestLoadW, simultaneousW), 1)
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

  function invalidResult(scenario, reason) {
    return {
      status: 'invalid',
      resultType: 'invalid',
      scenario: scenario,
      reason: reason
    };
  }

  function supportResult(scenario, reason, metrics) {
    return Object.assign(
      {
        status: 'support',
        resultType: 'technical_review',
        scenario: scenario,
        reason: reason
      },
      metrics || {}
    );
  }

  function recommendRv(input) {
    var loadMetrics = calculateLoads(input && input.loads);
    var backupDays = asNumber(input && input.backupDays, 0);
    var fit = (input && input.fit) || 'flexible';

    if (!loadMetrics.activeCount) return invalidResult('rv', 'Select at least one appliance.');
    if (backupDays <= 0 || backupDays > 7) return invalidResult('rv', 'Choose a backup period from 1 to 7 days.');

    var requiredWh = round((loadMetrics.dailyWh * backupDays) / PLANNING_FACTOR, 1);
    var metrics = {
      dailyWh: loadMetrics.dailyWh,
      peakW: loadMetrics.peakW,
      requiredWh: requiredWh,
      energyBand: energyBand(loadMetrics.dailyWh),
      peakBand: peakBand(loadMetrics.peakW)
    };

    if (requiredWh > 24000 || loadMetrics.peakW > 10000) {
      return supportResult('rv', 'This load is beyond the calculator\'s standard RV configuration range.', metrics);
    }

    var products = RV_PRODUCTS.slice();
    if (fit === 'group24') {
      products = [{ key: 'rv-g24', id: 'g24-100ah', model: 'Group 24 100Ah', capacityWh: 1280, outputW: 1280 }];
    } else if (fit === 'group31') {
      products = [{ key: 'rv-g31', id: 'g31-100ah', model: 'Group 31 100Ah', capacityWh: 1280, outputW: 1280 }];
    }

    var ranked = products
      .map(function (product) {
        var energyQuantity = Math.ceil(requiredWh / product.capacityWh);
        var outputQuantity = Math.ceil(loadMetrics.peakW / product.outputW);
        var quantity = Math.max(1, energyQuantity, outputQuantity);
        return Object.assign({}, product, {
          quantity: quantity,
          combinedWh: round(product.capacityWh * quantity, 1),
          overageWh: round(product.capacityWh * quantity - requiredWh, 1)
        });
      })
      .filter(function (product) {
        return product.quantity <= 6;
      })
      .sort(function (a, b) {
        return a.quantity - b.quantity || a.overageWh - b.overageWh || b.outputW - a.outputW;
      });

    if (!ranked.length) {
      return supportResult('rv', 'The estimated battery count needs a custom system review.', metrics);
    }

    var match = ranked[0];
    var alternateKey = null;
    if (match.key === 'rv-g31' && fit === 'flexible') alternateKey = 'rv-g24';
    if (match.key === 'rv-g24' && fit === 'flexible') alternateKey = 'rv-g31';

    return Object.assign(metrics, {
      status: 'match',
      resultType: match.quantity > 1 ? 'multi_battery_starting_point' : 'product_match',
      scenario: 'rv',
      productKey: match.key,
      productId: match.id,
      model: match.model,
      quantity: match.quantity,
      unitCapacityWh: match.capacityWh,
      unitOutputW: match.outputW,
      combinedWh: match.combinedWh,
      alternateKey: alternateKey,
      needsSystemReview: match.quantity > 1
    });
  }

  function recommendJump(input) {
    var voltage = input && input.voltage;
    var fuel = input && input.fuel;
    var engineLiters = asNumber(input && input.engineLiters, 0);
    var environment = (input && input.environment) || 'standard';
    var priority = (input && input.priority) || 'compact';

    if (fuel !== 'gasoline' && fuel !== 'diesel') return invalidResult('jump', 'Choose gasoline or diesel.');
    if (engineLiters <= 0 || engineLiters > 12) return invalidResult('jump', 'Enter a valid engine displacement.');

    var environmentFactor = environment === 'demanding' ? 1.15 : environment === 'cold' ? 1.08 : 1;
    var planningLiters = round(engineLiters * environmentFactor, 2);
    var metrics = {
      engineLiters: engineLiters,
      planningLiters: planningLiters,
      fuel: fuel,
      environment: environment,
      peakBand: 'vehicle_starting',
      energyBand: 'not_applicable'
    };

    if (voltage !== '12v') {
      return supportResult('jump', 'SuntNeew jump starter matches in this planner are limited to verified 12V vehicle use.', metrics);
    }

    var candidates = JUMP_PRODUCTS
      .filter(function (product) {
        return product[fuel] >= planningLiters;
      })
      .map(function (product) {
        return Object.assign({}, product, {
          score: asNumber(product.priority[priority], 3),
          coverageOverage: round(product[fuel] - planningLiters, 2)
        });
      })
      .sort(function (a, b) {
        return a.score - b.score || a.coverageOverage - b.coverageOverage;
      });

    if (!candidates.length) {
      return supportResult('jump', 'The vehicle or operating conditions fall outside the verified standard matching table.', metrics);
    }

    var match = candidates[0];
    var alternate = candidates.find(function (candidate) {
      return candidate.id !== match.id;
    });

    return Object.assign(metrics, {
      status: 'match',
      resultType: 'product_match',
      scenario: 'jump',
      productKey: match.key,
      productId: match.id,
      model: match.model,
      variant: match.variant,
      coverageLiters: match[fuel],
      alternateKey: alternate ? alternate.key : null,
      alternateId: alternate ? alternate.id : null,
      alternateModel: alternate ? alternate.model : null,
      alternateVariant: alternate ? alternate.variant : null
    });
  }

  function recommendHome(input) {
    var loadMetrics = calculateLoads(input && input.loads);
    var backupHours = asNumber(input && input.backupHours, 0);
    var architecture = input && input.architecture;

    if (!loadMetrics.activeCount) return invalidResult('home', 'Select at least one essential load.');
    if (backupHours <= 0 || backupHours > 72) return invalidResult('home', 'Choose a backup window from 4 to 72 hours.');

    var requiredWh = round((loadMetrics.dailyWh * (backupHours / 24)) / PLANNING_FACTOR, 1);
    var metrics = {
      dailyWh: loadMetrics.dailyWh,
      peakW: loadMetrics.peakW,
      requiredWh: requiredWh,
      energyBand: energyBand(requiredWh),
      peakBand: peakBand(loadMetrics.peakW)
    };

    if (architecture !== 'low' && architecture !== 'high') {
      return supportResult('home', 'Battery voltage architecture must be confirmed with the inverter and installer before choosing a model.', metrics);
    }

    if (loadMetrics.peakW > 12000) {
      return supportResult('home', 'The simultaneous peak load needs an engineered inverter and battery review.', metrics);
    }

    if (architecture === 'low') {
      if (requiredWh <= 5120) {
        return Object.assign(metrics, {
          status: 'match',
          resultType: 'product_match',
          scenario: 'home',
          productKey: 'home-wl5a',
          productId: 'wl5a',
          model: 'ENERGY STAR WL5A',
          nominalWh: 5120,
          architecture: 'low_voltage'
        });
      }
      if (requiredWh <= 10240) {
        return Object.assign(metrics, {
          status: 'match',
          resultType: 'product_match',
          scenario: 'home',
          productKey: 'home-wl10b',
          productId: 'wl10b',
          model: 'ENERGY STAR WL10B',
          nominalWh: 10240,
          architecture: 'low_voltage'
        });
      }
      return supportResult('home', 'The estimated low-voltage capacity is above one standard WL10B starting point.', metrics);
    }

    if (requiredWh <= 10240) {
      return Object.assign(metrics, {
        status: 'match',
        resultType: 'product_match',
        scenario: 'home',
        productKey: 'home-vh',
        productId: 'vh-10',
        model: 'ENERGY STAR VH',
        variant: '10.24kWh configuration',
        nominalWh: 10240,
        architecture: 'high_voltage'
      });
    }
    if (requiredWh <= 15360) {
      return Object.assign(metrics, {
        status: 'match',
        resultType: 'product_match',
        scenario: 'home',
        productKey: 'home-vh',
        productId: 'vh-15',
        model: 'ENERGY STAR VH',
        variant: '15.36kWh configuration',
        nominalWh: 15360,
        architecture: 'high_voltage'
      });
    }

    return supportResult('home', 'The estimated high-voltage capacity needs a project-specific system design.', metrics);
  }

  return {
    PLANNING_FACTOR: PLANNING_FACTOR,
    calculateLoads: calculateLoads,
    energyBand: energyBand,
    peakBand: peakBand,
    recommendRv: recommendRv,
    recommendJump: recommendJump,
    recommendHome: recommendHome
  };
});
