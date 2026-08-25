(() => {
  if (window.suntneewPurchasePanelReady) return;
  window.suntneewPurchasePanelReady = true;

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-suntneew-buy-now]');
    if (!button) return;

    event.preventDefault();

    const formId = button.getAttribute('form');
    const form = formId ? document.getElementById(formId) : button.closest('form');
    if (!form || button.disabled || button.getAttribute('aria-busy') === 'true') return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    button.setAttribute('aria-busy', 'true');
    button.disabled = true;

    try {
      const formData = new FormData(form);
      const response = await fetch(`${Shopify.routes.root}cart/add.js`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      const responseJson = await response.json();

      if (!response.ok) {
        form.dispatchEvent(new CustomEvent('cart:error', {
          bubbles: true,
          detail: { error: responseJson.description || responseJson.message || 'This item could not be added to the cart.' }
        }));
        return;
      }

      window.location.assign(`${Shopify.routes.root}checkout`);
    } catch (error) {
      form.dispatchEvent(new CustomEvent('cart:error', {
        bubbles: true,
        detail: { error: 'The checkout could not be opened. Please try again.' }
      }));
    } finally {
      button.removeAttribute('aria-busy');
      button.disabled = false;
    }
  });
})();
