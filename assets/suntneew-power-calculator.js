(function () {
  'use strict';

  function boot() {
    var root = document.querySelector('[data-suntneew-calculator]');
    var core = window.SuntNeewPowerCalculatorCore;

    if (!root || !core) return;

    var storageKey = 'suntneew-power-planner-v4';
    var customLoadSequence = 0;
    var state = {
      scenario: null,
      result: null,
      productId: null,
      startTracked: false
    };

    var scenarioButtons = Array.prototype.slice.call(root.querySelectorAll('[data-scenario]'));
    var forms = Array.prototype.slice.call(root.querySelectorAll('[data-scenario-form]'));
    var scenarioStage = root.querySelector('[data-scenario-stage]');
    var scenarioContinue = root.querySelector('[data-scenario-continue]');
    var stepItems = Array.prototype.slice.call(root.querySelectorAll('[data-planner-step-item]'));
    var progress = root.querySelector('[data-progress]');
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
      var snapped = Math.floor((value - safeMinimum + 0.0000001) / safeStep) * safeStep + safeMinimum;
      return Number(snapped.toFixed(6));
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
            var numberMin = Number(number.min);
            var numberMax = Number(number.max);
            if (Number.isFinite(numberMin)) value = Math.max(numberMin, value);
            if (Number.isFinite(numberMax)) value = Math.min(numberMax, value);
            value = snapDown(value, number.step, numberMin);
            number.value = value;
          }
          var min = Number(range.min);
          var max = Number(range.max);
          range.value = Math.max(min, Math.min(max, value));
        }
      }

      updateRangeVisual(range);
    }

    function setRangeControlMax(control, maximum, suffix) {
      if (!control || !Number.isFinite(Number(maximum))) return false;
      var range = control.querySelector('[data-range-input]');
      var number = control.querySelector('[data-range-number]');
      if (!range || !number) return false;

      var minimum = Number(number.min);
      var step = Number(number.step);
      var safeMaximum = Math.max(Number.isFinite(minimum) ? minimum : 0, snapDown(Number(maximum), step, minimum));
      var previousValue = Number(number.value);
      if (!range.dataset.baseMax) range.dataset.baseMax = range.max;
      number.max = String(safeMaximum);
      range.min = Number.isFinite(minimum) ? String(minimum) : range.min;
      range.max = String(Math.max(Number(range.min), Math.min(safeMaximum, Number(range.dataset.baseMax))));
      if (Number.isFinite(Number(number.value)) && Number(number.value) > safeMaximum) number.value = safeMaximum;
      if (Number.isFinite(Number(range.value)) && Number(range.value) > Number(range.max)) range.value = range.max;

      var scale = control.querySelector('.sn-power-calculator__range-scale');
      var lastScale = scale && scale.lastElementChild;
      if (lastScale && suffix) lastScale.textContent = String(range.max) + suffix;
      syncRangeControl(control, number, true);
      return Number.isFinite(previousValue) && previousValue > safeMaximum;
    }

    function initializeRangeControls(scope, commit) {
      Array.prototype.forEach.call((scope || root).querySelectorAll('[data-range-control]'), function (control) {
        syncRangeControl(control, control.querySelector('[data-range-number]'), commit === true);
      });
    }

    function writeStorage() {
      var storage = safeStorage();
      if (!storage) return;

      var payload = {
        scenario: state.scenario,
        forms: forms.map(function (form) {
          return {
            customLoadCount: form.querySelectorAll('[data-load-row].is-custom').length,
            fields: Array.prototype.slice.call(form.querySelectorAll('input, select')).map(function (field) {
              return {
                value: field.value,
                checked: field.checked,
                type: field.type
              };
            })
          };
        })
      };

      try {
        storage.setItem(storageKey, JSON.stringify(payload));
      } catch (error) {
        // Session persistence is optional when storage is unavailable or full.
      }
    }

    function restoreStorage() {
      var saved = readStorage();
      if (!saved) return;

      if (Array.isArray(saved.forms)) {
        saved.forms.forEach(function (savedForm, formIndex) {
          var form = forms[formIndex];
          if (!form || !savedForm || !Array.isArray(savedForm.fields)) return;

          var loadList = form.querySelector('[data-load-list]');
          var customLoadCount = Math.min(Number(savedForm.customLoadCount) || 0, 10);
          for (var loadIndex = 0; loadIndex < customLoadCount; loadIndex += 1) {
            createCustomLoad(loadList);
          }

          var currentFields = form.querySelectorAll('input, select');
          savedForm.fields.forEach(function (savedField, fieldIndex) {
            var field = currentFields[fieldIndex];
            if (!field || !savedField) return;
            if (field.type === 'checkbox' || field.type === 'radio') {
              field.checked = savedField.checked === true;
            } else if (typeof savedField.value === 'string') {
              field.value = savedField.value;
            }
          });
        });
      }

      if (saved.scenario === 'rv' || saved.scenario === 'jump' || saved.scenario === 'home') {
        selectScenario(saved.scenario, false);
      }

      forms.forEach(function (form) { updateFormLimits(form, null, true); });
      initializeRangeControls(root, true);
    }

    function hasAnalyticsConsent() {
      var privacy = window.Shopify && window.Shopify.customerPrivacy;
      if (!privacy) return false;

      try {
        if (typeof privacy.analyticsProcessingAllowed === 'function') {
          return privacy.analyticsProcessingAllowed() === true;
        }

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
      // This adapter deliberately emits nothing until Shopify analytics consent is granted.
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

    function formatWh(value) {
      if (!Number.isFinite(Number(value))) return '—';
      var rounded = Math.round(Number(value));
      return rounded >= 1000 ? (rounded / 1000).toFixed(rounded % 1000 === 0 ? 0 : 1) + 'kWh' : rounded + 'Wh';
    }

    function formatW(value) {
      if (!Number.isFinite(Number(value))) return '—';
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
          simultaneous: simultaneous && (simultaneous.type === 'checkbox' ? simultaneous.checked : simultaneous.value === 'true')
        };
      });
    }

    function collectScenarioInput(form, scenario) {
      if (scenario === 'rv') {
        return {
          loads: collectLoads(form),
          backupDays: form.querySelector('[data-rv-backup-days]').value,
          fit: form.querySelector('[data-rv-fit]').value,
          seriesCount: form.querySelector('[data-rv-series]').value
        };
      }

      if (scenario === 'jump') {
        return {
          fuel: form.querySelector('[data-jump-fuel]').value,
          engineLiters: form.querySelector('[data-jump-engine]').value,
          voltage: form.querySelector('[data-jump-voltage]').value,
          environment: getSelectedRadio(form, '[data-jump-environment]') || 'standard',
          priority: form.querySelector('[data-jump-priority]').value
        };
      }

      return {
        loads: collectLoads(form),
        backupHours: form.querySelector('[data-home-backup-hours]').value,
        architecture: getSelectedRadio(form, '[data-home-architecture]') || 'auto'
      };
    }

    function formatDecimal(value, maximumDigits) {
      return Number(value).toLocaleString(undefined, {
        maximumFractionDigits: maximumDigits == null ? 1 : maximumDigits
      });
    }

    function setSelectAvailability(select, availableValues, fallbackValue) {
      if (!select) return false;
      var changed = false;
      Array.prototype.forEach.call(select.options, function (option) {
        option.disabled = availableValues.indexOf(option.value) === -1;
      });
      if (select.selectedOptions.length && select.selectedOptions[0].disabled) {
        var fallback = Array.prototype.find.call(select.options, function (option) {
          return !option.disabled && (!fallbackValue || option.value === fallbackValue);
        }) || Array.prototype.find.call(select.options, function (option) { return !option.disabled; });
        if (fallback) {
          select.value = fallback.value;
          changed = true;
        }
      }
      return changed;
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
        var watts = row.querySelector('[data-load-watts]');
        var hours = row.querySelector('[data-load-hours]');
        clamped = setRangeControlMax(watts && watts.closest('[data-range-control]'), loadLimit.maxWatts, 'W') || clamped;
        clamped = setRangeControlMax(hours && hours.closest('[data-range-control]'), loadLimit.maxHours, 'h') || clamped;
      });
      return clamped;
    }

    function setLimitNote(form, message, clamped) {
      var note = form.querySelector('[data-limit-note]');
      if (!note) return;
      note.textContent = (clamped ? 'A value was reduced to remain within the verified product range. ' : '') + message;
      note.classList.toggle('is-adjusted', clamped);
    }

    function updateRvLimits(form) {
      var input = collectScenarioInput(form, 'rv');
      var seriesSelect = form.querySelector('[data-rv-series]');
      var fitSelect = form.querySelector('[data-rv-fit]');
      var limits = core.getRvInputLimits(input);
      var clamped = false;

      clamped = setSelectAvailability(seriesSelect, limits.availableSeriesCounts.map(String), '1') || clamped;
      if (String(input.seriesCount) !== seriesSelect.value) input = collectScenarioInput(form, 'rv');
      limits = core.getRvInputLimits(input);
      var availableFits = Object.keys(limits.availableFits).filter(function (fit) { return limits.availableFits[fit]; });
      clamped = setSelectAvailability(fitSelect, availableFits, 'flexible') || clamped;
      input = collectScenarioInput(form, 'rv');

      for (var pass = 0; pass < 3; pass += 1) {
        limits = core.getRvInputLimits(input);
        clamped = applyLoadLimits(form, limits.loadLimits) || clamped;
        input = collectScenarioInput(form, 'rv');
      }
      limits = core.getRvInputLimits(input);
      clamped = setRangeControlMax(form.querySelector('[data-rv-backup-days]').closest('[data-range-control]'), limits.maxBackupDays, ' days') || clamped;
      input = collectScenarioInput(form, 'rv');
      limits = core.getRvInputLimits(input);
      setLimitNote(
        form,
        'Verified ' + formatDecimal(limits.nominalSystemVoltage, 1) + 'V range: up to ' + limits.maximumBatteryCount + ' batteries (' + limits.seriesCount + 'S' + limits.maximumParallelStrings + 'P), ' + formatWh(limits.maxStoredEnergyWh) + ' stored energy and ' + formatW(limits.maxPeakW) + ' peak.',
        clamped
      );
      return limits;
    }

    function updateJumpLimits(form) {
      var input = collectScenarioInput(form, 'jump');
      var limits = core.getJumpInputLimits(input);
      var voltageSelect = form.querySelector('[data-jump-voltage]');
      var clamped = setSelectAvailability(voltageSelect, limits.availableVoltages, limits.availableVoltages[0]);
      input = collectScenarioInput(form, 'jump');
      limits = core.getJumpInputLimits(input);
      clamped = setRangeControlMax(form.querySelector('[data-jump-engine]').closest('[data-range-control]'), limits.maxEngineLiters, 'L') || clamped;
      setLimitNote(
        form,
        'Verified ' + input.voltage.toUpperCase() + ' range for these conditions: up to ' + formatDecimal(limits.maxEngineLiters, 1) + 'L ' + input.fuel + '.',
        clamped
      );
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
      clamped = setRangeControlMax(form.querySelector('[data-home-backup-hours]').closest('[data-range-control]'), limits.maxBackupHours, 'h') || clamped;
      input = collectScenarioInput(form, 'home');
      limits = core.getHomeInputLimits(input);
      var architectureLabel = limits.architecture === 'low' ? 'low-voltage' : limits.architecture === 'high' ? 'high-voltage' : 'automatic architecture';
      setLimitNote(
        form,
        'Verified ' + architectureLabel + ' range: up to ' + formatWh(limits.maxStoredEnergyWh) + ' stored energy and ' + formatW(limits.maxPeakW) + ' peak.',
        clamped
      );
      return limits;
    }

    function updateFormLimits(form) {
      if (!form) return null;
      var scenario = form.dataset.scenarioForm;
      if (scenario === 'rv') return updateRvLimits(form);
      if (scenario === 'jump') return updateJumpLimits(form);
      return updateHomeLimits(form);
    }

    function showFormError(form, message) {
      var error = form.querySelector('[data-form-error]');
      if (!error) return;
      error.textContent = message || '';
      error.hidden = !message;
    }

    function setPlannerStep(step) {
      var stepOrder = ['scenario', 'details', 'recommendation'];
      var currentIndex = stepOrder.indexOf(step);

      root.dataset.plannerStep = step;
      stepItems.forEach(function (item) {
        var itemIndex = stepOrder.indexOf(item.dataset.plannerStepItem);
        var isCurrent = itemIndex === currentIndex;
        item.classList.toggle('is-active', isCurrent);
        item.classList.toggle('is-complete', itemIndex < currentIndex);
        if (isCurrent) {
          item.setAttribute('aria-current', 'step');
        } else {
          item.removeAttribute('aria-current');
        }
      });
    }

    function scrollToElement(element, block) {
      if (!element) return;
      var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      element.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: block || 'start' });
    }

    function chooseScenario(scenario, announce) {
      state.scenario = scenario;
      state.result = null;
      state.productId = null;

      scenarioButtons.forEach(function (button) {
        var active = button.dataset.scenario === scenario;
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      if (scenarioContinue) scenarioContinue.disabled = false;
      setPlannerStep('scenario');
      results.hidden = true;

      if (announce) {
        if (!state.startTracked) state.startTracked = track('start', { scenario: scenario, step: 'scenario' });
        track('scenario_selected', { scenario: scenario, step: 'scenario' });
      }
      writeStorage();
    }

    function openScenario(scenario, shouldScroll) {
      chooseScenario(scenario, false);
      if (scenarioStage) scenarioStage.hidden = true;

      forms.forEach(function (form) {
        var active = form.dataset.scenarioForm === scenario;
        form.hidden = !active;
        if (active) showFormError(form, '');
      });

      progress.hidden = false;
      progress.textContent = 'Step 2: Add your power needs';
      results.hidden = true;
      setPlannerStep('details');
      writeStorage();

      if (shouldScroll) {
        var activeForm = forms.find(function (form) { return form.dataset.scenarioForm === scenario; });
        scrollToElement(activeForm, 'start');
      }
    }

    function selectScenario(scenario, announce) {
      chooseScenario(scenario, announce);
      openScenario(scenario, false);
    }

    function returnToScenarioSelection() {
      forms.forEach(function (form) { form.hidden = true; });
      results.hidden = true;
      progress.hidden = true;
      if (scenarioStage) scenarioStage.hidden = false;
      setPlannerStep('scenario');
      scrollToElement(scenarioStage, 'start');
    }

    function createCustomLoad(list) {
      if (!list) return null;
      customLoadSequence += 1;
      var inputId = 'sn-custom-load-' + customLoadSequence;
      var row = document.createElement('div');
      row.className = 'sn-power-calculator__load-row is-custom';
      row.setAttribute('data-load-row', '');
      row.innerHTML = '<div class="sn-power-calculator__load-heading"><div class="sn-power-calculator__field sn-power-calculator__custom-name"><label for="' + inputId + '-name">Custom load</label><input id="' + inputId + '-name" type="text" maxlength="40" value="" data-load-name></div><div class="sn-power-calculator__load-options"><label class="sn-power-calculator__load-check"><input type="checkbox" checked data-load-selected> Include</label><label class="sn-power-calculator__load-check"><input type="checkbox" checked data-load-simultaneous> Peak</label></div></div>' +
        '<div class="sn-power-calculator__range-control" data-range-control><div class="sn-power-calculator__range-head"><label for="' + inputId + '-watts">Power draw</label><span class="sn-power-calculator__range-value"><input id="' + inputId + '-watts" type="number" min="1" max="10000" step="1" value="100" data-load-watts data-range-number inputmode="decimal"><span>W</span></span></div><input class="sn-power-calculator__range" type="range" min="10" max="10000" step="10" value="100" data-range-input aria-label="Custom load power draw"><div class="sn-power-calculator__range-scale" aria-hidden="true"><span>10W</span><span>10kW</span></div></div>' +
        '<div class="sn-power-calculator__range-control" data-range-control><div class="sn-power-calculator__range-head"><label for="' + inputId + '-hours">Daily run time</label><span class="sn-power-calculator__range-value"><input id="' + inputId + '-hours" type="number" min="0.1" max="24" step="0.1" value="1" data-load-hours data-range-number inputmode="decimal"><span>hours/day</span></span></div><input class="sn-power-calculator__range" type="range" min="0.1" max="24" step="0.1" value="1" data-range-input aria-label="Custom load daily run time"><div class="sn-power-calculator__range-scale" aria-hidden="true"><span>0.1h</span><span>24h</span></div></div>' +
        '<button type="button" class="sn-power-calculator__remove" data-remove-load aria-label="Remove custom load">Remove</button>';
      list.appendChild(row);
      row.querySelector('[data-remove-load]').addEventListener('click', function () {
        var form = row.closest('[data-scenario-form]');
        row.remove();
        updateFormLimits(form);
        writeStorage();
      });
      initializeRangeControls(row);
      updateFormLimits(row.closest('[data-scenario-form]'));
      return row;
    }

    function addCustomLoad(button) {
      var form = button.closest('[data-scenario-form]');
      var list = button.closest('.sn-power-calculator__step').querySelector('[data-load-list]');
      if (!form || !list) return;

      createCustomLoad(list);
      writeStorage();
    }

    function renderMetrics(result) {
      var metrics = [];

      if (result.scenario === 'jump') {
        var verifiedCoverage = Number.isFinite(Number(result.coverageLiters)) ? result.coverageLiters + 'L' : '12V only';
        metrics = [
          { value: result.fuel === 'diesel' ? 'Diesel' : 'Gasoline', label: 'Fuel reference' },
          { value: Number.isFinite(Number(result.engineLiters)) ? result.engineLiters + 'L' : 'Review', label: 'Engine input' },
          { value: verifiedCoverage, label: result.voltage === '12v' ? 'Verified coverage' : 'Verified product voltage' },
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
      if (resultProductLabel) {
        resultProductLabel.textContent = result.status === 'support'
          ? (result.referenceType === 'alternative_starting_point' ? 'ALTERNATIVE STARTING POINT' : 'CLOSEST VERIFIED REFERENCE')
          : 'RECOMMENDED STARTING POINT';
      }
      resultProductTitle.textContent = result.model || record.model;
      resultProductCopy.textContent = record.description;
      if (resultProductNote) {
        resultProductNote.textContent = result.productCaveat || '';
        resultProductNote.hidden = !result.productCaveat;
      }
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
      } else if (result.scenario === 'jump') {
        specs = [result.variant || 'Model variant', result.coverageLiters + 'L ' + result.fuel, '12V vehicle use'];
      } else if (result.quantity > 1) {
        specs = [result.quantity + ' units', formatWh(result.nominalWh) + ' each', formatWh(result.combinedWh) + ' nominal'];
      } else {
        specs = [formatWh(result.nominalWh), result.architecture === 'high_voltage' ? 'High voltage' : 'Low voltage', result.status === 'support' ? 'Review required' : 'System starting point'];
      }
      resultProductSpecs.innerHTML = specs.map(function (spec) {
        return '<span class="sn-power-calculator__product-spec">' + escapeHtml(spec) + '</span>';
      }).join('');

      var alternateKey = result.alternateKey;
      var alternateRecord = alternateKey ? findProductRecord(alternateKey, result.alternateId) : null;
      if (alternateRecord && alternateKey !== result.productKey) {
        resultSecondaryLink.hidden = false;
        resultSecondaryLink.href = alternateRecord.url;
        resultSecondaryLink.textContent = result.alternateModel ? 'Compare ' + result.alternateModel : 'Compare another option';
        resultSecondaryLink.dataset.productId = result.alternateId || alternateRecord.id;
      } else if (alternateRecord && alternateKey === result.productKey && result.alternateId) {
        resultSecondaryLink.hidden = false;
        resultSecondaryLink.href = alternateRecord.url;
        resultSecondaryLink.textContent = 'Compare another ' + alternateRecord.model + ' variant';
        resultSecondaryLink.dataset.productId = result.alternateId;
      } else {
        resultSecondaryLink.hidden = true;
        resultSecondaryLink.removeAttribute('href');
      }
    }

    function setSupportLink(result) {
      var supportUrl = root.dataset.supportUrl || '/pages/request-for-quote';
      var separator = supportUrl.indexOf('?') === -1 ? '?' : '&';
      var safeQuery = 'planner=scenario-' + encodeURIComponent(result.scenario || 'unknown') + '&result=technical-review';
      resultSupportLink.href = supportUrl + separator + safeQuery;
    }

    function renderResult(result) {
      state.result = result;
      forms.forEach(function (form) { form.hidden = true; });
      results.hidden = false;
      results.dataset.status = result.status;
      var hasProduct = Boolean(findProductRecord(result.productKey, result.productId));
      resultSupportActions.hidden = result.status !== 'support';
      resultProduct.hidden = !hasProduct;
      resultSecondaryLink.hidden = true;

      if (result.status === 'match') {
        resultKicker.textContent = result.resultType === 'multi_battery_starting_point' ? 'SYSTEM STARTING POINT' : 'PRODUCT STARTING POINT';
        resultTitle.textContent = result.model || 'A SuntNeew starting point';
        resultSummary.textContent = result.scenario === 'rv'
          ? (result.needsSystemReview ? 'This is a multi-battery planning starting point. Confirm wiring, protection, charging and inverter limits as one system.' : 'This is the closest standard RV battery match to the energy and peak-load values entered.')
          : result.scenario === 'jump'
            ? 'This model is the closest verified starting reference for the vehicle details entered. Confirm the exact vehicle fit on its product page.'
            : 'This capacity is a starting point for the selected architecture. Confirm inverter compatibility, transfer equipment and installation requirements.';
        renderMetrics(result);
        renderProduct(result);
        track('recommendation_viewed', {
          scenario: result.scenario,
          resultType: result.resultType,
          energyBand: result.energyBand,
          peakBand: result.peakBand,
          productId: result.productId
        });
      } else if (result.status === 'support') {
        resultKicker.textContent = hasProduct ? 'REVIEW + REFERENCE' : 'TECHNICAL REVIEW';
        resultTitle.textContent = result.title || 'This needs a project-specific check.';
        resultSummary.textContent = [result.reason, result.guidance].filter(Boolean).join(' ');
        renderMetrics(result);
        if (hasProduct) renderProduct(result);
        setSupportLink(result);
        track('support_recommended', {
          scenario: result.scenario,
          resultType: result.resultType,
          energyBand: result.energyBand,
          peakBand: result.peakBand
        });
      } else {
        resultKicker.textContent = 'CHECK THE INPUTS';
        resultTitle.textContent = 'Add one more detail to continue.';
        resultSummary.textContent = result.reason;
        resultMetrics.innerHTML = '';
      }

      progress.hidden = false;
      progress.textContent = 'Step 3: Review your recommendation';
      setPlannerStep('recommendation');
      results.focus({ preventScroll: true });
      scrollToElement(results, 'start');
      writeStorage();
    }

    function submitForm(form) {
      var scenario = form.dataset.scenarioForm;
      initializeRangeControls(form, true);
      updateFormLimits(form);
      initializeRangeControls(form, true);
      var input = collectScenarioInput(form, scenario);
      var result = scenario === 'rv'
        ? core.recommendRv(input)
        : scenario === 'jump'
          ? core.recommendJump(input)
          : core.recommendHome(input);

      if (result.status === 'invalid') {
        showFormError(form, result.reason);
        scrollToElement(form.querySelector('[data-form-error]'), 'center');
        return;
      }

      showFormError(form, '');
      renderResult(result);
      track('step_completed', { scenario: scenario, step: 'details' });
    }

    function editAnswers() {
      results.hidden = true;
      var activeForm = forms.find(function (form) { return form.dataset.scenarioForm === state.scenario; });
      if (activeForm) {
        activeForm.hidden = false;
        showFormError(activeForm, '');
      }
      progress.hidden = false;
      progress.textContent = 'Step 2: Add your power needs';
      setPlannerStep('details');
      scrollToElement(activeForm, 'start');
    }

    scenarioButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        chooseScenario(button.dataset.scenario, true);
      });
    });

    if (scenarioContinue) {
      scenarioContinue.addEventListener('click', function () {
        if (state.scenario) openScenario(state.scenario, true);
      });
    }

    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        submitForm(form);
      });

      form.addEventListener('input', function (event) {
        var rangeControl = event.target.closest('[data-range-control]');
        if (rangeControl) syncRangeControl(rangeControl, event.target, false);
        updateFormLimits(form);
        writeStorage();
      });
      form.addEventListener('change', function (event) {
        var rangeControl = event.target.closest('[data-range-control]');
        if (rangeControl) syncRangeControl(rangeControl, event.target, true);
        updateFormLimits(form);
        writeStorage();
      });
    });

    Array.prototype.forEach.call(root.querySelectorAll('[data-add-load]'), function (button) {
      button.addEventListener('click', function () { addCustomLoad(button); });
    });

    Array.prototype.forEach.call(root.querySelectorAll('[data-switch-scenario]'), function (button) {
      button.addEventListener('click', returnToScenarioSelection);
    });

    Array.prototype.forEach.call(root.querySelectorAll('[data-edit-answers]'), function (button) {
      button.addEventListener('click', editAnswers);
    });

    Array.prototype.forEach.call(root.querySelectorAll('[data-result-product-link], [data-result-secondary-link]'), function (link) {
      link.addEventListener('click', function () {
        if (link.href && link.getAttribute('href') !== '#') {
          track('product_clicked', { scenario: state.scenario, productId: link.dataset.productId });
        }
      });
    });

    if (resultSupportLink) {
      resultSupportLink.addEventListener('click', function () {
        track('support_clicked', { scenario: state.scenario, resultType: state.result && state.result.resultType });
      });
    }

    if (resultReset) {
      resultReset.addEventListener('click', function () {
        state.result = null;
        state.productId = null;
        returnToScenarioSelection();
      });
    }

    window.SuntNeewPowerCalculator = {
      root: root,
      selectScenario: selectScenario,
      submitForm: submitForm,
      updateFormLimits: updateFormLimits,
      track: track
    };

    forms.forEach(function (form) { updateFormLimits(form); });
    initializeRangeControls(root, true);
    restoreStorage();
    forms.forEach(function (form) { updateFormLimits(form); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
