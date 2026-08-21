(function () {
  'use strict';

  function boot() {
    var root = document.querySelector('[data-suntneew-calculator]');
    var core = window.SuntNeewPowerCalculatorCore;
    if (!root || !core) return;

    var storageKey = 'suntneew-power-planner-v5';
    var customLoadSequence = 0;
    var state = {
      scenario: null,
      stage: 'scenario',
      result: null,
      productId: null,
      startTracked: false
    };

    var scenarioButtons = Array.prototype.slice.call(root.querySelectorAll('[data-scenario]'));
    var forms = Array.prototype.slice.call(root.querySelectorAll('[data-scenario-form]'));
    var scenarioStage = root.querySelector('[data-scenario-stage]');
    var scenarioContinue = root.querySelector('[data-scenario-continue]');
    var stepItems = Array.prototype.slice.call(root.querySelectorAll('[data-planner-step-item]'));
    var results = root.querySelector('[data-results]');
    var resultKicker = root.querySelector('[data-result-kicker]');
    var resultTitle = root.querySelector('[data-result-title]');
    var resultSummary = root.querySelector('[data-result-summary]');
    var resultMetrics = root.querySelector('[data-result-metrics]');
    var resultProduct = root.querySelector('[data-result-product]');
    var resultProductImage = root.querySelector('[data-result-image]');
    var resultProductLabel = root.querySelector('[data-result-product-label]');
    var resultProductTitle = root.querySelector('[data-result-product-title]');
    var resultProductSpecs = root.querySelector('[data-result-product-specs]');
    var resultProductCopy = root.querySelector('[data-result-product-copy]');
    var resultProductNote = root.querySelector('[data-result-product-note]');
    var resultProductLink = root.querySelector('[data-result-product-link]');
    var resultSecondaryLink = root.querySelector('[data-result-secondary-link]');
    var resultSupportActions = root.querySelector('[data-result-support-actions]');
    var resultSupportLink = root.querySelector('[data-result-support-link]');
    var resultReset = root.querySelector('[data-result-reset]');
    var productRecords = {};
    var productRecordsById = {};

    Array.prototype.forEach.call(root.querySelectorAll('[data-product-record]'), function (record) {
      var presentation = {
        id: record.dataset.productId,
        model: record.dataset.productModel,
        variant: record.dataset.productVariant,
        url: record.dataset.productUrl,
        image: record.dataset.productImage,
        description: record.dataset.productDescription
      };
      productRecords[record.dataset.productKey] = productRecords[record.dataset.productKey] || [];
      productRecords[record.dataset.productKey].push(presentation);
      if (presentation.id) productRecordsById[presentation.id] = presentation;
    });

    core.configureCatalog(Array.prototype.map.call(root.querySelectorAll('[data-product-record]'), function (record) {
      return {
        scenario: record.dataset.productScenario,
        key: record.dataset.productKey,
        id: record.dataset.productId,
        model: record.dataset.productModel,
        variant: record.dataset.productVariant,
        fit: record.dataset.productFit,
        fitClass: record.dataset.productFit,
        lengthMm: record.dataset.productLengthMm,
        widthMm: record.dataset.productWidthMm,
        heightMm: record.dataset.productHeightMm,
        capacityWh: record.dataset.productCapacityWh,
        outputW: record.dataset.productOutputW,
        maxSeries: record.dataset.productMaxSeries,
        maxParallel: record.dataset.productMaxParallel,
        maxUnits: record.dataset.productMaxUnits,
        voltage: record.dataset.productVoltage,
        gasoline: record.dataset.productGasoline,
        diesel: record.dataset.productDiesel,
        priority: {
          compact: record.dataset.productPriorityCompact,
          display: record.dataset.productPriorityDisplay,
          charging: record.dataset.productPriorityCharging,
          reserve: record.dataset.productPriorityReserve
        },
        architecture: record.dataset.productArchitecture,
        maxSystemOutputW: record.dataset.productMaxSystemOutputW
      };
    }));

    function safeStorage() {
      try {
        return window.sessionStorage;
      } catch (error) {
        return null;
      }
    }

    function readStorage() {
      var storage = safeStorage();
      if (!storage) return null;
      try {
        var value = storage.getItem(storageKey);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        return null;
      }
    }

    function writeStorage() {
      var storage = safeStorage();
      if (!storage) return;
      var payload = {
        scenario: state.scenario,
        stage: state.stage,
        forms: forms.map(function (form) {
          return {
            customLoadCount: form.querySelectorAll('[data-load-row].is-custom').length,
            fields: Array.prototype.slice.call(form.querySelectorAll('input, select')).map(function (field) {
              return { value: field.value, checked: field.checked, type: field.type };
            })
          };
        })
      };
      try {
        storage.setItem(storageKey, JSON.stringify(payload));
      } catch (error) {
        return;
      }
    }

    function hasAnalyticsConsent() {
      var privacy = window.Shopify && window.Shopify.customerPrivacy;
      if (!privacy) return false;
      try {
        if (typeof privacy.analyticsProcessingAllowed === 'function') return privacy.analyticsProcessingAllowed() === true;
        if (typeof privacy.getTrackingConsent === 'function') {
          var trackingConsent = privacy.getTrackingConsent();
          return trackingConsent === 'yes' || trackingConsent === true;
        }
        if (typeof privacy.currentVisitorConsent === 'function') {
          var currentConsent = privacy.currentVisitorConsent();
          return currentConsent && (currentConsent.analytics === true || currentConsent.analytics === 'yes');
        }
      } catch (error) {
        return false;
      }
      return false;
    }

    function track(eventName, details) {
      if (!hasAnalyticsConsent()) return false;
      var payload = {
        event: 'suntneew_power_planner',
        suntneew_event: eventName,
        scenario: details && details.scenario ? details.scenario : undefined,
        step: details && details.step ? details.step : undefined,
        result_type: details && details.resultType ? details.resultType : undefined,
        energy_band: details && details.energyBand ? details.energyBand : undefined,
        peak_band: details && details.peakBand ? details.peakBand : undefined,
        product_id: details && details.productId ? details.productId : undefined
      };
      Object.keys(payload).forEach(function (key) {
        if (payload[key] === undefined) delete payload[key];
      });
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(payload);
      return true;
    }

    function escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function formatDecimal(value, maximumDigits) {
      return Number(value).toLocaleString(undefined, { maximumFractionDigits: maximumDigits == null ? 1 : maximumDigits });
    }

    function formatWh(value) {
      if (!Number.isFinite(Number(value))) return '-';
      var rounded = Math.round(Number(value));
      return rounded >= 1000 ? (rounded / 1000).toFixed(rounded % 1000 === 0 ? 0 : 1) + 'kWh' : rounded + 'Wh';
    }

    function formatW(value) {
      if (!Number.isFinite(Number(value))) return '-';
      return Math.round(Number(value)).toLocaleString() + 'W';
    }

    function formatEnergyBand(value) {
      var labels = {
        under_1_kwh: 'Under 1kWh',
        '1_to_3_kwh': '1 to 3kWh',
        '3_to_6_kwh': '3 to 6kWh',
        '6_to_10_kwh': '6 to 10kWh',
        over_10_kwh: 'Over 10kWh',
        not_applicable: 'Not applicable'
      };
      return labels[value] || 'Review';
    }

    function getSelectedRadio(form, selector) {
      var selected = form.querySelector(selector + ':checked');
      return selected ? selected.value : '';
    }

    function updateRangeVisual(range) {
      if (!range) return;
      var min = Number(range.min);
      var max = Number(range.max);
      var value = Number(range.value);
      var progress = Number.isFinite(value) && max > min ? ((value - min) / (max - min)) * 100 : 0;
      range.style.setProperty('--snpc-range-progress', Math.max(0, Math.min(100, progress)) + '%');
    }

    function snapDown(value, step, minimum) {
      var safeStep = Number(step);
      var safeMinimum = Number(minimum);
      if (!Number.isFinite(value)) return safeMinimum;
      if (!Number.isFinite(safeStep) || safeStep <= 0) return value;
      return Number((Math.floor((value - safeMinimum + 0.0000001) / safeStep) * safeStep + safeMinimum).toFixed(6));
    }

    function syncRangeControl(control, source, commit) {
      if (!control) return;
      var range = control.querySelector('[data-range-input]');
      var number = control.querySelector('[data-range-number]');
      if (!range || !number) return;
      if (source === range) {
        number.value = range.value;
      } else {
        var value = Number(number.value);
        if (Number.isFinite(value)) {
          if (commit) {
            value = Math.max(Number(number.min), Math.min(Number(number.max), value));
            value = snapDown(value, number.step, Number(number.min));
            number.value = value;
          }
          range.value = Math.max(Number(range.min), Math.min(Number(range.max), value));
        }
      }
      updateRangeVisual(range);
    }

    function setRangeControlBounds(control, minimum, maximum, suffix, capToBase) {
      if (!control || !Number.isFinite(Number(minimum)) || !Number.isFinite(Number(maximum))) return false;
      var range = control.querySelector('[data-range-input]');
      var number = control.querySelector('[data-range-number]');
      if (!range || !number) return false;
      if (!range.dataset.baseMin) range.dataset.baseMin = range.min;
      if (!range.dataset.baseMax) range.dataset.baseMax = range.max;
      var safeMinimum = Number(minimum);
      var safeMaximum = Number(maximum);
      if (capToBase) {
        safeMinimum = Math.max(safeMinimum, Number(range.dataset.baseMin));
        safeMaximum = Math.min(safeMaximum, Number(range.dataset.baseMax));
      }
      safeMaximum = Math.max(safeMinimum, snapDown(safeMaximum, number.step, safeMinimum));
      var previous = Number(number.value);
      number.min = String(safeMinimum);
      number.max = String(safeMaximum);
      range.min = String(safeMinimum);
      range.max = String(safeMaximum);
      if (!Number.isFinite(previous) || previous < safeMinimum) number.value = safeMinimum;
      if (Number(number.value) > safeMaximum) number.value = safeMaximum;
      syncRangeControl(control, number, true);
      var scale = control.querySelector('.sn-power-calculator__range-scale');
      if (scale && scale.firstElementChild && suffix) scale.firstElementChild.textContent = formatDecimal(safeMinimum, 1) + suffix;
      if (scale && scale.lastElementChild && suffix) scale.lastElementChild.textContent = formatDecimal(safeMaximum, 1) + suffix;
      return Number.isFinite(previous) && (previous < safeMinimum || previous > safeMaximum);
    }

    function setNumberMax(field, maximum) {
      if (!field || !Number.isFinite(Number(maximum))) return false;
      if (!field.dataset.baseMax) field.dataset.baseMax = field.max;
      var minimum = Number(field.min) || 1;
      var safeMaximum = Math.max(minimum, Math.min(Number(maximum), Number(field.dataset.baseMax)));
      var previous = Number(field.value);
      field.max = String(safeMaximum);
      if (Number.isFinite(previous) && previous > safeMaximum) field.value = snapDown(safeMaximum, field.step, minimum);
      if (!Number.isFinite(previous) || previous < minimum) field.value = minimum;
      return Number.isFinite(previous) && (previous < minimum || previous > safeMaximum);
    }

    function initializeRangeControls(scope, commit) {
      Array.prototype.forEach.call((scope || root).querySelectorAll('[data-range-control]'), function (control) {
        syncRangeControl(control, control.querySelector('[data-range-number]'), commit === true);
      });
    }

    function loadName(row) {
      var customName = row.querySelector('[data-load-name]');
      var title = row.querySelector('[data-load-title]');
      return customName && customName.value.trim() ? customName.value.trim() : title ? title.textContent.trim() : 'Custom load';
    }

    function updateLoadPreview(row) {
      var preview = row.querySelector('[data-load-preview]');
      var watts = row.querySelector('[data-load-watts]');
      var hours = row.querySelector('[data-load-hours]');
      var title = row.querySelector('[data-load-title]');
      if (preview && watts && hours) preview.textContent = formatDecimal(watts.value, 1) + 'W / ' + formatDecimal(hours.value, 1) + 'h per day';
      if (title && row.classList.contains('is-custom')) title.textContent = loadName(row);
    }

    function syncLoadCard(row) {
      var selected = row.querySelector('[data-load-selected]');
      var controls = row.querySelector('[data-load-controls]');
      var toggle = row.querySelector('[data-load-toggle]');
      var active = !selected || selected.checked;
      row.classList.toggle('is-selected', active);
      if (controls) controls.hidden = !active;
      if (toggle) toggle.setAttribute('aria-pressed', active ? 'true' : 'false');
      updateLoadPreview(row);
    }

    function syncLoadCards(scope) {
      Array.prototype.forEach.call((scope || root).querySelectorAll('[data-load-row]'), syncLoadCard);
    }

    function collectLoads(form) {
      return Array.prototype.slice.call(form.querySelectorAll('[data-load-row]')).map(function (row) {
        var selected = row.querySelector('[data-load-selected]');
        var watts = row.querySelector('[data-load-watts]');
        var hours = row.querySelector('[data-load-hours]');
        var simultaneous = row.querySelector('[data-load-simultaneous]');
        return {
          selected: !selected || selected.checked,
          watts: watts ? watts.value : 0,
          hours: hours ? hours.value : 0,
          simultaneous: Boolean(simultaneous && simultaneous.checked)
        };
      });
    }

    function collectScenarioInput(form, scenario) {
      if (scenario === 'rv') {
        var spaceMode = getSelectedRadio(form, '[data-rv-space-mode]') || 'all';
        return {
          loads: collectLoads(form),
          backupDays: form.querySelector('[data-rv-backup-days]').value,
          fit: spaceMode === 'group24' || spaceMode === 'group31' ? spaceMode : 'flexible',
          spaceMode: spaceMode,
          space: {
            longSideMm: form.querySelector('[data-rv-space-long]').value,
            shortSideMm: form.querySelector('[data-rv-space-short]').value,
            heightMm: form.querySelector('[data-rv-space-height]').value
          },
          seriesCount: getSelectedRadio(form, '[data-rv-series]') || '1'
        };
      }
      if (scenario === 'jump') {
        return {
          fuel: getSelectedRadio(form, '[data-jump-fuel]') || 'gasoline',
          engineLiters: form.querySelector('[data-jump-engine]').value,
          voltage: getSelectedRadio(form, '[data-jump-voltage]') || '12v',
          environment: getSelectedRadio(form, '[data-jump-environment]') || 'standard',
          priority: getSelectedRadio(form, '[data-jump-priority]') || 'compact'
        };
      }
      return {
        loads: collectLoads(form),
        backupHours: form.querySelector('[data-home-backup-hours]').value,
        architecture: getSelectedRadio(form, '[data-home-architecture]') || 'auto'
      };
    }

    function setRadioAvailability(form, selector, availableValues, fallbackValue) {
      var radios = Array.prototype.slice.call(form.querySelectorAll(selector));
      var changed = false;
      radios.forEach(function (radio) {
        radio.disabled = availableValues.indexOf(radio.value) === -1;
        var label = radio.closest('label');
        if (label) label.classList.toggle('is-disabled', radio.disabled);
      });
      var checked = radios.find(function (radio) { return radio.checked; });
      if (!checked || checked.disabled) {
        var fallback = radios.find(function (radio) { return !radio.disabled && radio.value === fallbackValue; }) || radios.find(function (radio) { return !radio.disabled; });
        if (fallback) {
          fallback.checked = true;
          changed = true;
        }
      }
      return changed;
    }

    function applyLoadLimits(form, limits) {
      var clamped = false;
      Array.prototype.forEach.call(form.querySelectorAll('[data-load-row]'), function (row, index) {
        var loadLimit = limits[index];
        if (!loadLimit) return;
        clamped = setNumberMax(row.querySelector('[data-load-watts]'), loadLimit.maxWatts) || clamped;
        var hours = row.querySelector('[data-load-hours]');
        clamped = setRangeControlBounds(hours && hours.closest('[data-range-control]'), loadLimit.minHours, loadLimit.maxHours, 'h', true) || clamped;
        updateLoadPreview(row);
      });
      return clamped;
    }

    function setLimitNote(form, message, clamped) {
      Array.prototype.forEach.call(form.querySelectorAll('[data-limit-note]'), function (note) {
        note.textContent = (clamped ? 'A value was adjusted to stay inside the current verified product range. ' : '') + message;
        note.classList.toggle('is-adjusted', clamped);
      });
    }

    function updateMeasuredSpace(form, dimensionLimits) {
      var clamped = false;
      clamped = setRangeControlBounds(form.querySelector('[data-rv-space-long]').closest('[data-range-control]'), dimensionLimits.minLongSideMm, dimensionLimits.maxLongSideMm, 'mm', false) || clamped;
      clamped = setRangeControlBounds(form.querySelector('[data-rv-space-short]').closest('[data-range-control]'), dimensionLimits.minShortSideMm, dimensionLimits.maxShortSideMm, 'mm', false) || clamped;
      clamped = setRangeControlBounds(form.querySelector('[data-rv-space-height]').closest('[data-range-control]'), dimensionLimits.minHeightMm, dimensionLimits.maxHeightMm, 'mm', false) || clamped;
      return clamped;
    }

    function updateRvLimits(form) {
      var input = collectScenarioInput(form, 'rv');
      var unconstrained = Object.assign({}, input, { spaceMode: 'all', fit: 'flexible' });
      var baseLimits = core.getRvInputLimits(unconstrained);
      var clamped = updateMeasuredSpace(form, baseLimits.measuredSpaceLimits);
      input = collectScenarioInput(form, 'rv');
      var limits = core.getRvInputLimits(input);
      var availableSpaces = Object.keys(limits.availableSpaceModes).filter(function (mode) { return limits.availableSpaceModes[mode]; });
      clamped = setRadioAvailability(form, '[data-rv-space-mode]', availableSpaces, 'all') || clamped;
      input = collectScenarioInput(form, 'rv');
      limits = core.getRvInputLimits(input);
      clamped = setRadioAvailability(form, '[data-rv-series]', limits.availableSeriesCounts.map(String), '1') || clamped;
      input = collectScenarioInput(form, 'rv');

      for (var pass = 0; pass < 3; pass += 1) {
        limits = core.getRvInputLimits(input);
        clamped = applyLoadLimits(form, limits.loadLimits) || clamped;
        input = collectScenarioInput(form, 'rv');
      }
      limits = core.getRvInputLimits(input);
      clamped = setRangeControlBounds(form.querySelector('[data-rv-backup-days]').closest('[data-range-control]'), limits.minBackupDays, limits.maxBackupDays, ' days', true) || clamped;
      input = collectScenarioInput(form, 'rv');
      limits = core.getRvInputLimits(input);

      var measured = form.querySelector('[data-measured-space]');
      if (measured) measured.hidden = input.spaceMode !== 'measured';
      var spaceNote = form.querySelector('[data-space-note]');
      if (spaceNote) {
        spaceNote.textContent = limits.spaceMatchCount + ' current battery enclosure' + (limits.spaceMatchCount === 1 ? '' : 's') + ' fit these usable dimensions. Bank layout and service clearance are checked separately.';
      }
      setLimitNote(form, 'Current range: up to ' + limits.maximumBatteryCount + ' batteries (' + limits.seriesCount + 'S' + limits.maximumParallelStrings + 'P), ' + formatWh(limits.maxStoredEnergyWh) + ' stored energy and ' + formatW(limits.maxPeakW) + ' peak.', clamped);
      updateLiveSummary(form, limits);
      return limits;
    }

    function updateJumpLimits(form) {
      var input = collectScenarioInput(form, 'jump');
      var limits = core.getJumpInputLimits(input);
      var clamped = setRadioAvailability(form, '[data-jump-voltage]', limits.availableVoltages, limits.availableVoltages[0]);
      input = collectScenarioInput(form, 'jump');
      limits = core.getJumpInputLimits(input);
      clamped = setRangeControlBounds(form.querySelector('[data-jump-engine]').closest('[data-range-control]'), limits.minEngineLiters, limits.maxEngineLiters, 'L', false) || clamped;
      input = collectScenarioInput(form, 'jump');
      limits = core.getJumpInputLimits(input);
      setLimitNote(form, 'Verified ' + input.voltage.toUpperCase() + ' range for these conditions: up to ' + formatDecimal(limits.maxEngineLiters, 1) + 'L ' + input.fuel + '.', clamped);
      updateLiveSummary(form, limits);
      return limits;
    }

    function updateHomeLimits(form) {
      var input = collectScenarioInput(form, 'home');
      var availableArchitectures = ['auto'].concat(['low', 'high'].filter(function (architecture) {
        return core.getHomeInputLimits({ architecture: architecture, loads: input.loads, backupHours: input.backupHours }).available;
      }));
      var clamped = setRadioAvailability(form, '[data-home-architecture]', availableArchitectures, 'auto');
      input = collectScenarioInput(form, 'home');
      var limits;
      for (var pass = 0; pass < 3; pass += 1) {
        limits = core.getHomeInputLimits(input);
        clamped = applyLoadLimits(form, limits.loadLimits) || clamped;
        input = collectScenarioInput(form, 'home');
      }
      limits = core.getHomeInputLimits(input);
      clamped = setRangeControlBounds(form.querySelector('[data-home-backup-hours]').closest('[data-range-control]'), limits.minBackupHours, limits.maxBackupHours, 'h', true) || clamped;
      input = collectScenarioInput(form, 'home');
      limits = core.getHomeInputLimits(input);
      var architectureLabel = limits.architecture === 'low' ? 'low-voltage' : limits.architecture === 'high' ? 'high-voltage' : 'all-architecture';
      setLimitNote(form, 'Current ' + architectureLabel + ' range: up to ' + formatWh(limits.maxStoredEnergyWh) + ' stored energy and ' + formatW(limits.maxPeakW) + ' peak.', clamped);
      updateLiveSummary(form, limits);
      return limits;
    }

    function updateFormLimits(form) {
      if (!form) return null;
      var scenario = form.dataset.scenarioForm;
      if (scenario === 'rv') return updateRvLimits(form);
      if (scenario === 'jump') return updateJumpLimits(form);
      return updateHomeLimits(form);
    }

    function summaryLoadNames(form, simultaneousOnly) {
      return Array.prototype.slice.call(form.querySelectorAll('[data-load-row]')).filter(function (row) {
        var selected = row.querySelector('[data-load-selected]');
        var simultaneous = row.querySelector('[data-load-simultaneous]');
        return selected && selected.checked && (!simultaneousOnly || simultaneous && simultaneous.checked);
      }).map(loadName);
    }

    function setSummaryList(summary, values, emptyText) {
      var list = summary && summary.querySelector('[data-summary-loads]');
      if (!list) return;
      list.innerHTML = values.length
        ? values.map(function (value) { return '<li>' + escapeHtml(value) + '</li>'; }).join('')
        : '<li>' + escapeHtml(emptyText) + '</li>';
    }

    function setSummarySubmitState(form, disabled) {
      Array.prototype.forEach.call(form.querySelectorAll('[data-summary-submit], [data-mobile-summary] button'), function (button) {
        button.disabled = disabled;
      });
    }

    function updateLoadSummary(form, limits, scenario) {
      var summary = form.querySelector('[data-live-summary]');
      var mobile = form.querySelector('[data-mobile-summary]');
      if (!summary || !mobile) return;
      var input = collectScenarioInput(form, scenario);
      var metrics = core.calculateLoads(input.loads);
      var selectedNames = summaryLoadNames(form, false);
      var simultaneousNames = summaryLoadNames(form, true);
      var dailyKwh = metrics.dailyWh / 1000;
      var budget = scenario === 'rv'
        ? (limits.maxStoredEnergyWh * core.PLANNING_FACTOR) / Math.max(1, Number(input.backupDays))
        : (limits.maxStoredEnergyWh * core.PLANNING_FACTOR * 24) / Math.max(1, Number(input.backupHours));
      var progress = budget > 0 ? Math.min(100, (metrics.dailyWh / budget) * 100) : 0;
      var primary = summary.querySelector('[data-summary-primary]');
      if (primary) primary.innerHTML = dailyKwh.toFixed(2) + '<small>kWh</small>';
      var progressBar = summary.querySelector('[data-summary-progress]');
      if (progressBar) progressBar.style.width = progress + '%';
      var capacity = summary.querySelector('[data-summary-capacity]');
      if (capacity) capacity.textContent = formatWh(metrics.dailyWh) + ' of ' + formatWh(budget) + ' current daily range';
      var peak = summary.querySelector('[data-summary-peak]');
      if (peak) peak.textContent = formatW(metrics.peakW);
      var count = summary.querySelector('[data-summary-count]');
      if (count) count.textContent = String(metrics.activeCount);
      setSummaryList(summary, simultaneousNames, 'No simultaneous loads selected');
      mobile.querySelector('[data-mobile-primary]').textContent = dailyKwh.toFixed(2) + 'kWh';
      mobile.querySelector('[data-mobile-secondary]').textContent = formatW(metrics.peakW);
      setSummarySubmitState(form, selectedNames.length === 0);
    }

    function updateJumpSummary(form) {
      var summary = form.querySelector('[data-live-summary]');
      var mobile = form.querySelector('[data-mobile-summary]');
      if (!summary || !mobile) return;
      var input = collectScenarioInput(form, 'jump');
      var environmentLabels = { standard: 'Standard conditions', cold: 'Cold-weather reserve', demanding: 'Demanding-use reserve' };
      var priorityLabels = { compact: 'Compact size priority', display: 'Clear display priority', charging: 'Charging utility priority', reserve: 'Reserve capacity priority' };
      var fuel = input.fuel === 'diesel' ? 'Diesel' : 'Gasoline';
      var primary = summary.querySelector('[data-summary-primary]');
      if (primary) primary.innerHTML = formatDecimal(input.engineLiters, 1) + '<small>L</small>';
      summary.querySelector('[data-summary-peak]').textContent = fuel;
      summary.querySelector('[data-summary-count]').textContent = input.voltage.toUpperCase();
      setSummaryList(summary, [environmentLabels[input.environment], priorityLabels[input.priority]], 'Standard conditions');
      mobile.querySelector('[data-mobile-primary]').textContent = formatDecimal(input.engineLiters, 1) + 'L';
      mobile.querySelector('[data-mobile-secondary]').textContent = fuel;
      setSummarySubmitState(form, false);
    }

    function updateLiveSummary(form, limits) {
      var scenario = form.dataset.scenarioForm;
      if (scenario === 'jump') updateJumpSummary(form);
      else updateLoadSummary(form, limits, scenario);
    }

    function showFormError(form, message) {
      var error = form.querySelector('[data-form-error]');
      if (!error) return;
      error.textContent = message || '';
      error.hidden = !message;
    }

    function setPlannerStep(step) {
      var order = ['scenario', 'setup', 'needs', 'recommendation'];
      var currentIndex = order.indexOf(step);
      state.stage = step;
      root.dataset.plannerStep = step;
      stepItems.forEach(function (item) {
        var itemIndex = order.indexOf(item.dataset.plannerStepItem);
        var current = itemIndex === currentIndex;
        item.classList.toggle('is-active', current);
        item.classList.toggle('is-complete', itemIndex < currentIndex);
        if (current) item.setAttribute('aria-current', 'step');
        else item.removeAttribute('aria-current');
      });
    }

    function reducedMotion() {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function transition(callback) {
      if (document.startViewTransition && !reducedMotion()) document.startViewTransition(callback);
      else callback();
    }

    function scrollToElement(element, block) {
      if (!element) return;
      element.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: block || 'start' });
    }

    function chooseScenario(scenario, announce) {
      state.scenario = scenario;
      state.result = null;
      state.productId = null;
      scenarioButtons.forEach(function (button) {
        button.setAttribute('aria-pressed', button.dataset.scenario === scenario ? 'true' : 'false');
      });
      if (scenarioContinue) scenarioContinue.disabled = false;
      results.hidden = true;
      if (announce) {
        if (!state.startTracked) state.startTracked = track('start', { scenario: scenario, step: 'scenario' });
        track('scenario_selected', { scenario: scenario, step: 'scenario' });
      }
      writeStorage();
    }

    function showFormStage(form, stage, shouldScroll) {
      if (!form) return;
      transition(function () {
        Array.prototype.forEach.call(form.querySelectorAll('[data-form-stage]'), function (panel) {
          panel.hidden = panel.dataset.formStage !== stage;
        });
        setPlannerStep(stage);
      });
      showFormError(form, '');
      updateFormLimits(form);
      writeStorage();
      if (shouldScroll) scrollToElement(form, 'start');
    }

    function openScenario(scenario, shouldScroll, stage) {
      chooseScenario(scenario, false);
      transition(function () {
        scenarioStage.hidden = true;
        forms.forEach(function (form) { form.hidden = form.dataset.scenarioForm !== scenario; });
        results.hidden = true;
      });
      var activeForm = forms.find(function (form) { return form.dataset.scenarioForm === scenario; });
      showFormStage(activeForm, stage === 'needs' ? 'needs' : 'setup', shouldScroll);
    }

    function selectScenario(scenario) {
      chooseScenario(scenario, false);
      openScenario(scenario, false, 'setup');
    }

    function returnToScenarioSelection() {
      transition(function () {
        forms.forEach(function (form) { form.hidden = true; });
        results.hidden = true;
        scenarioStage.hidden = false;
        setPlannerStep('scenario');
      });
      writeStorage();
      scrollToElement(scenarioStage, 'start');
    }

    function customIconMarkup() {
      return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"></path></svg>';
    }

    function createCustomLoad(list) {
      if (!list) return null;
      customLoadSequence += 1;
      var inputId = 'sn-custom-load-' + customLoadSequence;
      var row = document.createElement('article');
      row.className = 'sn-power-calculator__load-card is-selected is-custom';
      row.setAttribute('data-load-row', '');
      row.innerHTML = '<div class="sn-power-calculator__load-card-main"><button class="sn-power-calculator__load-toggle" type="button" data-load-toggle aria-pressed="true" aria-controls="' + inputId + '-controls"><span class="sn-power-calculator__load-icon">' + customIconMarkup() + '</span><span class="sn-power-calculator__load-copy"><strong data-load-title>Custom device</strong><small data-load-preview>100W / 1h per day</small></span></button><label class="sn-power-calculator__switch"><input type="checkbox" checked data-load-selected aria-label="Include custom device"><span aria-hidden="true"></span></label></div>' +
        '<div id="' + inputId + '-controls" class="sn-power-calculator__load-controls" data-load-controls><div class="sn-power-calculator__custom-load-head"><label for="' + inputId + '-name">Device name</label><input id="' + inputId + '-name" type="text" maxlength="40" value="Custom device" data-load-name><button type="button" class="sn-power-calculator__remove" data-remove-load aria-label="Remove custom device">Remove</button></div><div class="sn-power-calculator__power-control"><label for="' + inputId + '-watts">Power draw</label><span class="sn-power-calculator__number-unit"><input id="' + inputId + '-watts" type="number" min="1" max="10000" step="10" value="100" inputmode="decimal" data-load-watts data-base-max="10000"><span>W</span></span></div>' +
        '<div class="sn-power-calculator__range-control" data-range-control><div class="sn-power-calculator__range-head"><label for="' + inputId + '-hours">Daily run time</label><span class="sn-power-calculator__number-unit sn-power-calculator__number-unit--time"><input id="' + inputId + '-hours" type="number" min="0.1" max="24" step="0.1" value="1" inputmode="decimal" data-load-hours data-range-number><span>h/day</span></span></div><input class="sn-power-calculator__range" type="range" min="0.1" max="24" step="0.1" value="1" data-range-input aria-label="Custom device daily run time"><div class="sn-power-calculator__range-scale" aria-hidden="true"><span>0.1h</span><span>24h</span></div></div><label class="sn-power-calculator__peak-choice"><input type="checkbox" checked data-load-simultaneous><span>May run with other selected loads</span></label></div>';
      var addButton = list.querySelector('[data-add-load]');
      list.insertBefore(row, addButton || null);
      initializeRangeControls(row, true);
      syncLoadCard(row);
      return row;
    }

    function restoreStorage() {
      var saved = readStorage();
      if (!saved) return;
      if (Array.isArray(saved.forms)) {
        saved.forms.forEach(function (savedForm, formIndex) {
          var form = forms[formIndex];
          if (!form || !savedForm || !Array.isArray(savedForm.fields)) return;
          var list = form.querySelector('[data-load-list]');
          var customLoadCount = Math.min(Number(savedForm.customLoadCount) || 0, 10);
          for (var index = 0; index < customLoadCount; index += 1) createCustomLoad(list);
          var fields = form.querySelectorAll('input, select');
          savedForm.fields.forEach(function (savedField, fieldIndex) {
            var field = fields[fieldIndex];
            if (!field || !savedField) return;
            if (field.type === 'checkbox' || field.type === 'radio') field.checked = savedField.checked === true;
            else if (typeof savedField.value === 'string') field.value = savedField.value;
          });
        });
      }
      syncLoadCards(root);
      initializeRangeControls(root, true);
      forms.forEach(function (form) { updateFormLimits(form); });
      if (saved.scenario === 'rv' || saved.scenario === 'jump' || saved.scenario === 'home') {
        chooseScenario(saved.scenario, false);
        openScenario(saved.scenario, false, saved.stage === 'needs' ? 'needs' : 'setup');
      }
    }

    function renderMetrics(result) {
      var metrics;
      if (result.scenario === 'jump') {
        metrics = [
          { value: result.fuel === 'diesel' ? 'Diesel' : 'Gasoline', label: 'Fuel reference' },
          { value: Number.isFinite(Number(result.engineLiters)) ? result.engineLiters + 'L' : 'Review', label: 'Engine input' },
          { value: Number.isFinite(Number(result.coverageLiters)) ? result.coverageLiters + 'L' : '12V only', label: 'Verified coverage' },
          { value: !result.environment || result.environment === 'standard' ? 'Standard' : 'Reserve', label: 'Condition factor' }
        ];
      } else {
        metrics = [
          { value: formatWh(result.dailyWh), label: result.scenario === 'home' ? 'Daily essential energy' : 'Daily RV energy' },
          { value: formatW(result.peakW), label: 'Simultaneous peak' },
          { value: formatWh(result.requiredWh), label: 'Planned stored energy' },
          { value: formatEnergyBand(result.energyBand), label: 'Energy band' }
        ];
      }
      resultMetrics.innerHTML = metrics.map(function (metric) {
        return '<div class="sn-power-calculator__metric"><strong>' + escapeHtml(metric.value) + '</strong><span>' + escapeHtml(metric.label) + '</span></div>';
      }).join('');
    }

    function findProductRecord(key, id) {
      if (id && productRecordsById[id]) return productRecordsById[id];
      var records = productRecords[key];
      return records && records.length ? records[0] : null;
    }

    function renderProduct(result) {
      var record = findProductRecord(result.productKey, result.productId);
      if (!record) {
        resultProduct.hidden = true;
        return;
      }
      state.productId = result.productId || record.id;
      resultProduct.hidden = false;
      resultProductImage.src = record.image;
      resultProductImage.alt = record.model;
      resultProductLabel.textContent = result.status === 'support' ? 'CLOSEST VERIFIED REFERENCE' : 'RECOMMENDED STARTING POINT';
      resultProductTitle.textContent = result.model || record.model;
      resultProductCopy.textContent = record.description;
      resultProductNote.textContent = result.productCaveat || '';
      resultProductNote.hidden = !result.productCaveat;
      resultProductLink.href = record.url;
      resultProductLink.dataset.productId = state.productId;
      resultProductLink.textContent = result.status === 'support' ? 'View reference product' : 'Open product details';

      var specs = [];
      if (result.scenario === 'rv') {
        specs = [
          result.quantity > 1 ? result.quantity + ' units' : '1 unit',
          result.seriesCount + 'S' + result.parallelCount + 'P / ' + formatDecimal(result.nominalSystemVoltage, 1) + 'V',
          formatWh(result.combinedWh) + ' combined'
        ];
        if (result.unitDimensions) specs.push(result.unitDimensions.longSideMm + ' x ' + result.unitDimensions.shortSideMm + ' x ' + result.unitDimensions.heightMm + 'mm each');
      } else if (result.scenario === 'jump') {
        specs = [result.variant || 'Model variant', result.coverageLiters + 'L ' + result.fuel, '12V vehicle use'];
      } else if (result.quantity > 1) {
        specs = [result.quantity + ' units', formatWh(result.nominalWh) + ' each', formatWh(result.combinedWh) + ' nominal'];
      } else {
        specs = [formatWh(result.nominalWh), result.architecture === 'high_voltage' ? 'High voltage' : 'Low voltage', 'System starting point'];
      }
      resultProductSpecs.innerHTML = specs.map(function (spec) { return '<span>' + escapeHtml(spec) + '</span>'; }).join('');

      var alternateRecord = result.alternateKey ? findProductRecord(result.alternateKey, result.alternateId) : null;
      if (alternateRecord) {
        resultSecondaryLink.hidden = false;
        resultSecondaryLink.href = alternateRecord.url;
        resultSecondaryLink.textContent = result.alternateModel ? 'Compare ' + result.alternateModel : 'Compare another option';
        resultSecondaryLink.dataset.productId = result.alternateId || alternateRecord.id;
      } else {
        resultSecondaryLink.hidden = true;
        resultSecondaryLink.removeAttribute('href');
      }
    }

    function setSupportLink(result) {
      var supportUrl = root.dataset.supportUrl || '/pages/contact-us';
      var separator = supportUrl.indexOf('?') === -1 ? '?' : '&';
      resultSupportLink.href = supportUrl + separator + 'planner=scenario-' + encodeURIComponent(result.scenario || 'unknown') + '&result=technical-review';
    }

    function renderResult(result) {
      state.result = result;
      transition(function () {
        forms.forEach(function (form) { form.hidden = true; });
        results.hidden = false;
        setPlannerStep('recommendation');
      });
      results.dataset.status = result.status;
      var hasProduct = Boolean(findProductRecord(result.productKey, result.productId));
      resultSupportActions.hidden = result.status !== 'support';
      resultProduct.hidden = !hasProduct;
      resultSecondaryLink.hidden = true;

      if (result.status === 'match') {
        resultKicker.textContent = result.resultType === 'multi_battery_starting_point' ? 'SYSTEM STARTING POINT' : 'PRODUCT STARTING POINT';
        resultTitle.textContent = result.model || 'A SuntNeew starting point';
        resultSummary.textContent = result.scenario === 'rv'
          ? (result.needsSystemReview ? 'This multi-battery configuration is a planning starting point. Confirm the complete bank and electrical design before installation.' : 'This is the closest current RV battery match to the energy, peak-load and space values entered.')
          : result.scenario === 'jump'
            ? 'This is the closest verified starting reference for the vehicle details entered. Confirm exact vehicle fit on the product page.'
            : 'This capacity is a starting point for the selected architecture and essential loads.';
        renderMetrics(result);
        renderProduct(result);
        track('recommendation_viewed', { scenario: result.scenario, resultType: result.resultType, energyBand: result.energyBand, peakBand: result.peakBand, productId: result.productId });
      } else {
        resultKicker.textContent = hasProduct ? 'REVIEW + REFERENCE' : 'TECHNICAL REVIEW';
        resultTitle.textContent = result.title || 'This needs a project-specific check.';
        resultSummary.textContent = [result.reason, result.guidance].filter(Boolean).join(' ');
        renderMetrics(result);
        if (hasProduct) renderProduct(result);
        setSupportLink(result);
        track('support_recommended', { scenario: result.scenario, resultType: result.resultType, energyBand: result.energyBand, peakBand: result.peakBand });
      }
      results.focus({ preventScroll: true });
      scrollToElement(results, 'start');
      writeStorage();
    }

    function submitForm(form) {
      var scenario = form.dataset.scenarioForm;
      initializeRangeControls(form, true);
      updateFormLimits(form);
      var input = collectScenarioInput(form, scenario);
      var result = scenario === 'rv' ? core.recommendRv(input) : scenario === 'jump' ? core.recommendJump(input) : core.recommendHome(input);
      if (result.status === 'invalid') {
        showFormError(form, result.reason);
        scrollToElement(form.querySelector('[data-form-error]'), 'center');
        return;
      }
      showFormError(form, '');
      renderResult(result);
      track('step_completed', { scenario: scenario, step: 'needs' });
    }

    scenarioButtons.forEach(function (button) {
      button.addEventListener('click', function () { chooseScenario(button.dataset.scenario, true); });
    });

    scenarioContinue.addEventListener('click', function () {
      if (state.scenario) openScenario(state.scenario, true, 'setup');
    });

    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        submitForm(form);
      });
      form.addEventListener('input', function (event) {
        var control = event.target.closest('[data-range-control]');
        if (control) syncRangeControl(control, event.target, false);
        var row = event.target.closest('[data-load-row]');
        if (row) syncLoadCard(row);
        updateFormLimits(form);
        writeStorage();
      });
      form.addEventListener('change', function (event) {
        var control = event.target.closest('[data-range-control]');
        if (control) syncRangeControl(control, event.target, true);
        var row = event.target.closest('[data-load-row]');
        if (row) syncLoadCard(row);
        updateFormLimits(form);
        writeStorage();
      });
    });

    root.addEventListener('click', function (event) {
      var stageContinue = event.target.closest('[data-stage-continue]');
      if (stageContinue) {
        var continueForm = stageContinue.closest('[data-scenario-form]');
        updateFormLimits(continueForm);
        showFormStage(continueForm, 'needs', true);
        track('step_completed', { scenario: continueForm.dataset.scenarioForm, step: 'setup' });
        return;
      }
      var stageBack = event.target.closest('[data-stage-back]');
      if (stageBack) {
        showFormStage(stageBack.closest('[data-scenario-form]'), 'setup', true);
        return;
      }
      var loadToggle = event.target.closest('[data-load-toggle]');
      if (loadToggle) {
        var loadRow = loadToggle.closest('[data-load-row]');
        var selected = loadRow.querySelector('[data-load-selected]');
        selected.checked = !selected.checked;
        selected.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
      var addLoad = event.target.closest('[data-add-load]');
      if (addLoad) {
        var addForm = addLoad.closest('[data-scenario-form]');
        createCustomLoad(addLoad.closest('[data-load-list]'));
        updateFormLimits(addForm);
        writeStorage();
        return;
      }
      var removeLoad = event.target.closest('[data-remove-load]');
      if (removeLoad) {
        var removeForm = removeLoad.closest('[data-scenario-form]');
        removeLoad.closest('[data-load-row]').remove();
        updateFormLimits(removeForm);
        writeStorage();
      }
    });

    Array.prototype.forEach.call(root.querySelectorAll('[data-switch-scenario]'), function (button) {
      button.addEventListener('click', returnToScenarioSelection);
    });

    Array.prototype.forEach.call(root.querySelectorAll('[data-edit-answers]'), function (button) {
      button.addEventListener('click', function () {
        results.hidden = true;
        var form = forms.find(function (candidate) { return candidate.dataset.scenarioForm === state.scenario; });
        if (form) {
          form.hidden = false;
          showFormStage(form, 'needs', true);
        }
      });
    });

    Array.prototype.forEach.call(root.querySelectorAll('[data-result-product-link], [data-result-secondary-link]'), function (link) {
      link.addEventListener('click', function () {
        if (link.href && link.getAttribute('href') !== '#') track('product_clicked', { scenario: state.scenario, productId: link.dataset.productId });
      });
    });

    resultSupportLink.addEventListener('click', function () {
      track('support_clicked', { scenario: state.scenario, resultType: state.result && state.result.resultType });
    });

    resultReset.addEventListener('click', function () {
      state.result = null;
      state.productId = null;
      returnToScenarioSelection();
    });

    window.SuntNeewPowerCalculator = {
      root: root,
      selectScenario: selectScenario,
      submitForm: submitForm,
      updateFormLimits: updateFormLimits,
      track: track
    };

    syncLoadCards(root);
    initializeRangeControls(root, true);
    forms.forEach(function (form) { updateFormLimits(form); });
    restoreStorage();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
