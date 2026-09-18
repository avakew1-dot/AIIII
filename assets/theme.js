document.addEventListener('DOMContentLoaded', function () {
  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('[data-mobile-nav-toggle]');
  var closeBtn = document.querySelector('[data-mobile-nav-close]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      toggle.setAttribute('aria-expanded', 'true');
    });
  }
  if (closeBtn && mobileNav) {
    closeBtn.addEventListener('click', function () {
      mobileNav.classList.remove('is-open');
      document.body.style.overflow = '';
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  /* ---------- Cart drawer ---------- */
  var cartDrawer = document.querySelector('[data-cart-drawer]');
  var cartOpeners = document.querySelectorAll('[data-cart-open]');
  var cartClosers = cartDrawer ? cartDrawer.querySelectorAll('[data-cart-close]') : [];

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  cartOpeners.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (btn.dataset.cartOpen === 'drawer') {
        e.preventDefault();
        openCart();
      }
    });
  });
  cartClosers.forEach(function (btn) {
    btn.addEventListener('click', closeCart);
  });

  function refreshCartDrawer() {
    if (!cartDrawer) return;
    fetch('/?section_id=cart-drawer')
      .then(function (res) { return res.text(); })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var fresh = doc.querySelector('[data-cart-drawer]');
        if (fresh) {
          cartDrawer.innerHTML = fresh.innerHTML;
        }
        updateCartCount();
      });
  }

  function updateCartCount() {
    fetch('/cart.js')
      .then(function (res) { return res.json(); })
      .then(function (cart) {
        document.querySelectorAll('[data-cart-count]').forEach(function (el) {
          el.textContent = cart.item_count;
          el.classList.toggle('hidden', cart.item_count === 0);
        });
      });
  }

  /* Intercept product-form add-to-cart for drawer mode */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-product-form]');
    if (!form) return;
    if (document.body.dataset.cartType !== 'drawer') return;
    e.preventDefault();
    var formData = new FormData(form);
    var submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.setAttribute('disabled', 'disabled');
    fetch('/cart/add.js', { method: 'POST', body: formData })
      .then(function (res) { return res.json(); })
      .then(function () {
        refreshCartDrawer();
        openCart();
      })
      .catch(function (err) { console.error(err); })
      .finally(function () {
        if (submitBtn) submitBtn.removeAttribute('disabled');
      });
  });

  /* Cart line quantity / remove inside drawer (event delegation) */
  document.addEventListener('click', function (e) {
    var removeBtn = e.target.closest('[data-cart-remove]');
    if (removeBtn) {
      e.preventDefault();
      var key = removeBtn.dataset.cartRemove;
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: 0 })
      }).then(refreshCartDrawer);
    }
  });

  /* ---------- Quantity selectors ---------- */
  document.addEventListener('click', function (e) {
    var stepper = e.target.closest('[data-quantity-step]');
    if (!stepper) return;
    var wrapper = stepper.closest('.quantity-selector');
    var input = wrapper && wrapper.querySelector('input[type="number"]');
    if (!input) return;
    var step = parseInt(stepper.dataset.quantityStep, 10);
    var min = parseInt(input.min || '1', 10);
    var newVal = Math.max(min, (parseInt(input.value, 10) || min) + step);
    input.value = newVal;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  /* ---------- Product gallery thumbnails ---------- */
  document.querySelectorAll('[data-gallery]').forEach(function (gallery) {
    var mainImg = gallery.querySelector('[data-gallery-main] img');
    gallery.querySelectorAll('[data-gallery-thumb]').forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        if (!mainImg) return;
        mainImg.src = thumb.dataset.fullSrc || thumb.querySelector('img').src;
        gallery.querySelectorAll('[data-gallery-thumb]').forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
      });
    });
  });

  /* ---------- Selling plan selector -> updates hidden selling_plan input + button label ---------- */
  document.querySelectorAll('[data-selling-plan-input]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      var wrapper = radio.closest('[data-product-form-wrapper]');
      var form = radio.closest('form');
      var hidden = form && form.querySelector('input[name="selling_plan"]');
      if (hidden) hidden.value = radio.value === 'one-time' ? '' : radio.value;
      if (!wrapper) return;
      var btn = wrapper.querySelector('[data-submit-button]');
      var label = wrapper.querySelector('[data-submit-button-text]');
      if (btn && label && !btn.hasAttribute('data-force-soldout')) {
        label.textContent = radio.value === 'one-time' ? btn.dataset.labelCart : btn.dataset.labelSubscribe;
      }
    });
  });

  /* ---------- Money formatting (mirrors Shopify's money_format tokens) ---------- */
  function formatMoney(cents, format) {
    format = format || window.themeMoneyFormat || '£{{amount}}';
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    function defaultTo(value, defaultValue) { return value == null || value !== value ? defaultValue : value; }
    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultTo(precision, 2);
      thousands = defaultTo(thousands, ',');
      decimal = defaultTo(decimal, '.');
      if (isNaN(number) || number == null) return '0';
      number = (number / 100.0).toFixed(precision);
      var parts = number.split('.');
      var dollars = parts[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + thousands);
      var cents2 = parts[1] ? decimal + parts[1] : '';
      return dollars + cents2;
    }
    var match = format.match(placeholderRegex);
    if (!match) return format;
    switch (match[1]) {
      case 'amount': value = formatWithDelimiters(cents, 2); break;
      case 'amount_no_decimals': value = formatWithDelimiters(cents, 0); break;
      case 'amount_with_comma_separator': value = formatWithDelimiters(cents, 2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': value = formatWithDelimiters(cents, 0, '.', ','); break;
      case 'amount_with_space_separator': value = formatWithDelimiters(cents, 2, ' ', '.'); break;
      default: value = formatWithDelimiters(cents, 2);
    }
    return format.replace(placeholderRegex, value);
  }

  /* ---------- Variant picker: swap variant id, price and availability on option change ---------- */
  document.querySelectorAll('[data-product-form-wrapper]').forEach(function (wrapper) {
    var selects = wrapper.querySelectorAll('[data-option-select]');
    if (!selects.length) return;
    var variantsScript = wrapper.querySelector('[data-product-variants]');
    var variants = [];
    try { variants = JSON.parse(variantsScript.textContent); } catch (e) { variants = []; }

    function currentOptions() {
      return Array.prototype.map.call(selects, function (select) { return select.value; });
    }
    function findVariant() {
      var options = currentOptions();
      return variants.find(function (variant) {
        return options.every(function (value, index) { return variant.options[index] === value; });
      });
    }
    function updateForVariant(variant) {
      var hiddenId = wrapper.querySelector('[data-variant-id]');
      var btn = wrapper.querySelector('[data-submit-button]');
      var label = wrapper.querySelector('[data-submit-button-text]');
      var priceEl = wrapper.querySelector('[data-onetime-price]');
      if (!variant) {
        if (btn) { btn.setAttribute('disabled', 'disabled'); btn.setAttribute('data-force-soldout', 'true'); }
        if (label && btn) label.textContent = btn.dataset.labelSoldout;
        return;
      }
      if (hiddenId) hiddenId.value = variant.id;
      if (priceEl) priceEl.textContent = formatMoney(variant.price);
      if (btn) {
        btn.removeAttribute('data-force-soldout');
        if (variant.available) {
          btn.removeAttribute('disabled');
        } else {
          btn.setAttribute('disabled', 'disabled');
        }
        if (label) {
          var activePlanRadio = wrapper.querySelector('[data-selling-plan-input]:checked');
          if (!variant.available) {
            label.textContent = btn.dataset.labelSoldout;
          } else if (activePlanRadio && activePlanRadio.value !== 'one-time') {
            label.textContent = btn.dataset.labelSubscribe;
          } else {
            label.textContent = btn.dataset.labelCart;
          }
        }
      }
    }

    selects.forEach(function (select) {
      select.addEventListener('change', function () { updateForVariant(findVariant()); });
    });
  });
});
