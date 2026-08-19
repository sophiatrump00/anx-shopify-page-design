(function () {
  'use strict';

  function boot() {
    var root = document.querySelector('[data-suntneew-calculator]');
    var core = window.SuntNeewPowerCalculatorCore;

    if (!root || !core) return;

    var storageKey = 'suntneew-power-planner-v3';
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
    var resultProductTitle = root.querySelector('[data-result-product-title]');
    var resultProductSpecs = root.querySelector('[data-result-product-specs]');
    var resultProductCopy = root.querySelector('[data-result-product-copy]');
    var resultProductLink = root.querySelector('[data-result-product-link]');
    var resultSecondaryLink = root.querySelector('[data-result-secondary-link]');
    var resultSupportActions = root.querySelector('[data-result-support-actions]');
    var resultSupportLink = root.querySelector('[data-result-support-link]');
    var resultReset = root.querySelector('[data-result-reset]');
    var productRecords = {};

    Array.prototype.forEach.call(root.querySelectorAll('[data-product-record]'), function (record) {
      productRecords[record.dataset.productKey] = {
        id: record.dataset.productId,
        model: record.dataset.productModel,
        url: record.dataset.productUrl,
        image: record.dataset.productImage,
        description: record.dataset.productDescription
      };
    });

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

    function syncRangeControl(control, source) {
      if (!control) return;
      var range = control.querySelector('[data-range-input]');
      var number = control.querySelector('[data-range-number]');
      if (!range || !number) return;

      if (source === range) {
        number.value = range.value;
      } else {
        var value = Number(number.value);
        if (Number.isFinite(value)) {
          var min = Number(range.min);
          var max = Number(range.max);
          range.value = Math.max(min, Math.min(max, value));
        }
      }

      updateRangeVisual(range);
    }

    function initializeRangeControls(scope) {
      Array.prototype.forEach.call((scope || root).querySelectorAll('[data-range-control]'), function (control) {
        syncRangeControl(control, control.querySelector('[data-range-number]'));
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

      initializeRangeControls(root);
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
          fit: form.querySelector('[data-rv-fit]').value
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
        architecture: getSelectedRadio(form, '[data-home-architecture]') || 'unsure'
      };
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
        row.remove();
        writeStorage();
      });
      initializeRangeControls(row);
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
        metrics = [
          { value: result.fuel === 'diesel' ? 'Diesel' : 'Gasoline', label: 'Fuel reference' },
          { value: Number.isFinite(Number(result.engineLiters)) ? result.engineLiters + 'L' : 'Review', label: 'Engine input' },
          { value: result.coverageLiters ? result.coverageLiters + 'L' : 'Review', label: 'Reference coverage' },
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

    function renderProduct(result) {
      var record = productRecords[result.productKey];
      if (!record) {
        resultProduct.hidden = true;
        return;
      }

      state.productId = result.productId || record.id;
      resultProduct.hidden = false;
      resultProductImage.src = record.image;
      resultProductImage.alt = record.model;
      resultProductTitle.textContent = result.model || record.model;
      resultProductCopy.textContent = record.description;
      resultProductLink.href = record.url;
      resultProductLink.dataset.productId = state.productId;

      var specs = [];
      if (result.scenario === 'rv') {
        specs = [
          result.quantity > 1 ? result.quantity + ' units' : '1 unit',
          formatWh(result.unitCapacityWh) + ' each',
          formatW(result.unitOutputW) + ' each'
        ];
      } else if (result.scenario === 'jump') {
        specs = [result.variant || 'Model variant', result.coverageLiters + 'L ' + result.fuel, '12V vehicle use'];
      } else {
        specs = [formatWh(result.nominalWh), result.architecture === 'high_voltage' ? 'High voltage' : 'Low voltage', 'System review required'];
      }
      resultProductSpecs.innerHTML = specs.map(function (spec) {
        return '<span class="sn-power-calculator__product-spec">' + escapeHtml(spec) + '</span>';
      }).join('');

      var alternateKey = result.alternateKey;
      var alternateRecord = alternateKey ? productRecords[alternateKey] : null;
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
      resultSupportActions.hidden = result.status !== 'support';
      resultProduct.hidden = result.status !== 'match';
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
        resultKicker.textContent = 'TECHNICAL REVIEW';
        resultTitle.textContent = 'This needs a project-specific check.';
        resultSummary.textContent = result.reason;
        renderMetrics(result);
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
      var input = collectScenarioInput(form, scenario);
      var result = scenario === 'rv'
        ? core.recommendRv(input)
        : scenario === 'jump'
          ? core.recommendJump(input)
          : core.recommendHome(input);

      showFormError(form, result.status === 'invalid' ? result.reason : '');
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
        if (rangeControl) syncRangeControl(rangeControl, event.target);
        writeStorage();
      });
      form.addEventListener('change', function (event) {
        var rangeControl = event.target.closest('[data-range-control]');
        if (rangeControl) syncRangeControl(rangeControl, event.target);
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
      track: track
    };

    initializeRangeControls(root);
    restoreStorage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
