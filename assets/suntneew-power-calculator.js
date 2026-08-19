(function () {
  'use strict';

  function boot() {
    var root = document.querySelector('[data-suntneew-calculator]');
    var core = window.SuntNeewPowerCalculatorCore;

    if (!root || !core) return;

    var storageKey = 'suntneew-power-planner-v2';
    var state = {
      scenario: null,
      result: null,
      productId: null,
      startTracked: false
    };

    var scenarioButtons = Array.prototype.slice.call(root.querySelectorAll('[data-scenario]'));
    var forms = Array.prototype.slice.call(root.querySelectorAll('[data-scenario-form]'));
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

    function selectScenario(scenario, announce) {
      state.scenario = scenario;
      state.result = null;
      state.productId = null;

      scenarioButtons.forEach(function (button) {
        var active = button.dataset.scenario === scenario;
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      forms.forEach(function (form) {
        var active = form.dataset.scenarioForm === scenario;
        form.hidden = !active;
        if (active) showFormError(form, '');
      });

      progress.hidden = false;
      progress.textContent = 'Step 2 · Add a few system details';
      results.hidden = true;
      if (announce) {
        if (!state.startTracked) state.startTracked = track('start', { scenario: scenario, step: 'scenario' });
        track('scenario_selected', { scenario: scenario, step: 'scenario' });
      }
      writeStorage();
    }

    function createCustomLoad(list) {
      if (!list) return null;
      var row = document.createElement('div');
      row.className = 'sn-power-calculator__load-row is-custom';
      row.setAttribute('data-load-row', '');
      row.innerHTML = '<div class="sn-power-calculator__field"><label>Custom load</label><input type="text" maxlength="40" value="" data-load-name aria-label="Custom load name"></div>' +
        '<div class="sn-power-calculator__field"><label>Watts</label><input type="number" min="1" max="10000" value="100" data-load-watts inputmode="decimal" aria-label="Custom load watts"></div>' +
        '<div class="sn-power-calculator__field"><label>Hours</label><input type="number" min="0.1" max="24" step="0.1" value="1" data-load-hours inputmode="decimal" aria-label="Custom load hours per day"></div>' +
        '<label class="sn-power-calculator__load-check"><input type="checkbox" checked data-load-selected> Include</label>' +
        '<label class="sn-power-calculator__load-check"><input type="checkbox" checked data-load-simultaneous> Peak</label>' +
        '<button type="button" class="sn-power-calculator__remove" data-remove-load aria-label="Remove custom load">Remove</button>';
      list.appendChild(row);
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

      results.focus({ preventScroll: true });
      results.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    scenarioButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        selectScenario(button.dataset.scenario, true);
      });
    });

    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        submitForm(form);
      });

      form.addEventListener('input', writeStorage);
      form.addEventListener('change', writeStorage);
    });

    root.addEventListener('click', function (event) {
      var addButton = event.target.closest('[data-add-load]');
      var removeButton = event.target.closest('[data-remove-load]');
      var switchButton = event.target.closest('[data-switch-scenario]');
      var productLink = event.target.closest('[data-result-product-link], [data-result-secondary-link]');
      var supportLink = event.target.closest('[data-result-support-link]');

      if (addButton) addCustomLoad(addButton);

      if (removeButton) {
        var row = removeButton.closest('[data-load-row]');
        if (row) row.remove();
        writeStorage();
      }

      if (switchButton) {
        results.hidden = true;
        var scenarioGrid = root.querySelector('.sn-power-calculator__scenario-grid');
        if (scenarioGrid) scenarioGrid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (productLink && productLink.href && productLink.getAttribute('href') !== '#') {
        track('product_clicked', { scenario: state.scenario, productId: productLink.dataset.productId });
      }

      if (supportLink) {
        track('support_clicked', { scenario: state.scenario, resultType: state.result && state.result.resultType });
      }
    });

    if (resultReset) {
      resultReset.addEventListener('click', function () {
        results.hidden = true;
        state.result = null;
        state.productId = null;
        var activeForm = forms.find(function (form) { return form.dataset.scenarioForm === state.scenario; });
        if (activeForm) showFormError(activeForm, '');
        var scenarioGrid = root.querySelector('.sn-power-calculator__scenario-grid');
        if (scenarioGrid) scenarioGrid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    window.SuntNeewPowerCalculator = {
      root: root,
      selectScenario: selectScenario,
      submitForm: submitForm,
      track: track
    };

    restoreStorage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
