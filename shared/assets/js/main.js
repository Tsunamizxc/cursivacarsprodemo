/**
 * AutoImport Theme — Main JavaScript
 * Vanilla JS, no jQuery. Uses aiTheme global from wp_localize_script.
 */
(function () {
  'use strict';

  var config = window.aiTheme || {};
  var ajaxUrl = config.ajaxUrl || '/wp-admin/admin-ajax.php';
  var nonce = config.nonce || '';
  var i18n = config.i18n || {};

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function on(el, event, handler, options) {
    if (el) {
      el.addEventListener(event, handler, options || false);
    }
  }

  function formatPrice(num) {
    var n = parseFloat(num) || 0;
    if (n <= 0) {
      return i18n.pricePending || 'Цена уточняется';
    }
    return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' \u20BD';
  }

  function postForm(action, data) {
    var body = new FormData();
    body.append('action', action);
    body.append('nonce', nonce);

    Object.keys(data).forEach(function (key) {
      if (data[key] !== undefined && data[key] !== null) {
        body.append(key, data[key]);
      }
    });

    return fetch(ajaxUrl, {
      method: 'POST',
      credentials: 'same-origin',
      body: body
    }).then(function (res) {
      return res.json();
    });
  }

  function showMessage(container, text, type) {
    if (!container) return;
    var existing = container.querySelector('.ai-form-message');
    if (existing) existing.remove();

    var msg = document.createElement('div');
    msg.className = 'ai-form-message ai-form-message--' + (type || 'success');
    msg.setAttribute('role', 'alert');
    msg.textContent = text;
    container.appendChild(msg);
  }

  /* ------------------------------------------------------------------ */
  /* Custom color variables from window.aiColors                         */
  /* ------------------------------------------------------------------ */

  function applyCustomColors() {
    var colors = window.aiColors;
    if (!colors || typeof colors !== 'object') return;

    var root = document.documentElement;
    var map = {
      primary: '--ai-primary',
      secondary: '--ai-secondary',
      accent: '--ai-accent',
      bg: '--ai-bg',
      bg2: '--ai-bg-2',
      text: '--ai-text',
      muted: '--ai-muted',
      surface: '--ai-surface'
    };

    Object.keys(map).forEach(function (key) {
      if (colors[key]) {
        root.style.setProperty(map[key], colors[key]);
      }
    });

    if (colors.accent) {
      root.style.setProperty('--ai-accent-hover', colors.accent);
      root.style.setProperty('--ai-gradient-accent', 'linear-gradient(135deg, ' + colors.accent + ' 0%, ' + colors.accent + ' 100%)');
    }
  }

  /* ------------------------------------------------------------------ */
  /* Mobile menu                                                         */
  /* ------------------------------------------------------------------ */

  function initMobileMenu() {
    var burger = $('.ai-burger');
    var menu = $('.ai-mobile-menu');
    if (!burger || !menu) return;

    function toggle(open) {
      var isOpen = typeof open === 'boolean' ? open : !burger.classList.contains('is-active');
      burger.classList.toggle('is-active', isOpen);
      menu.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('ai-nav-open', isOpen);
    }

    on(burger, 'click', function () {
      toggle();
    });

    $$('.ai-mobile-menu__link', menu).forEach(function (link) {
      on(link, 'click', function () {
        toggle(false);
      });
    });

    on(document, 'keydown', function (e) {
      if (e.key === 'Escape' && burger.classList.contains('is-active')) {
        toggle(false);
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Header scroll class                                                 */
  /* ------------------------------------------------------------------ */

  function initHeaderScroll() {
    var header = $('.ai-header');
    if (!header) return;

    var threshold = 20;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > threshold);
    }

    update();
    on(window, 'scroll', update, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll reveal (IntersectionObserver)                                */
  /* ------------------------------------------------------------------ */

  function initScrollReveal() {
    document.documentElement.classList.add('ai-js');

    var elements = $$('.ai-reveal');
    if (!elements.length) return;

    function revealAll() {
      elements.forEach(function (el) {
        el.classList.add('is-visible');
      });
    }

    if (!('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '80px 0px 80px 0px', threshold: 0.01 }
    );

    elements.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 80 && rect.bottom > -80) {
        el.classList.add('is-visible');
      } else {
        observer.observe(el);
      }
    });

    // Safety: never leave content invisible if observer fails
    setTimeout(revealAll, 1200);
  }

  /* ------------------------------------------------------------------ */
  /* FAQ accordion                                                       */
  /* ------------------------------------------------------------------ */

  function initFaq() {
    var items = $$('.ai-faq__item');
    if (!items.length) return;

    items.forEach(function (item) {
      var btn = $('.ai-faq__question', item);
      if (!btn) return;

      btn.setAttribute('aria-expanded', 'false');

      on(btn, 'click', function () {
        var isOpen = item.classList.contains('is-open');

        items.forEach(function (other) {
          other.classList.remove('is-open');
          var otherBtn = $('.ai-faq__question', other);
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Smooth scroll for anchors                                           */
  /* ------------------------------------------------------------------ */

  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(function (link) {
      on(link, 'click', function (e) {
        var href = link.getAttribute('href');
        if (!href || href === '#') return;

        var target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        var header = $('.ai-header');
        var offset = header ? header.offsetHeight : 0;

        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Calculator AJAX                                                     */
  /* ------------------------------------------------------------------ */

  function initCalculator() {
    var form = $('#ai-calc-form');
    if (!form) return;

    var resultBox = $('.ai-calculator__result') || $('#ai-calc-result');
    var totalEl = $('.ai-calculator__total', resultBox);
    var breakdownEl = $('.ai-calculator__breakdown', resultBox);
    var submitBtn = form.querySelector('[type="submit"]');

    function renderBreakdown(data) {
      if (!breakdownEl) return;

      breakdownEl.innerHTML = '';

      var rows = data.breakdown || data.items || [];
      if (!rows.length && data.details) {
        rows = Object.keys(data.details).map(function (key) {
          return { label: key, value: data.details[key] };
        });
      }

      rows.forEach(function (row) {
        var div = document.createElement('div');
        div.className = 'ai-calculator__row';
        var valueText = row.value_formatted || formatPrice(row.value || row.amount || 0);
        div.innerHTML =
          '<span class="ai-calculator__row-label">' + (row.label || row.name || '') + '</span>' +
          '<span class="ai-calculator__row-value">' + valueText + '</span>';
        breakdownEl.appendChild(div);
      });
    }

    function setLoading(loading) {
      if (resultBox) resultBox.classList.toggle('is-loading', loading);
      if (submitBtn) {
        submitBtn.disabled = loading;
        if (loading) {
          submitBtn.dataset.originalText = submitBtn.textContent;
          submitBtn.textContent = i18n.calculating || 'Считаем\u2026';
        } else if (submitBtn.dataset.originalText) {
          submitBtn.textContent = submitBtn.dataset.originalText;
        }
      }
    }

    function collectFormData() {
      var formData = {};
      $$('[name]', form).forEach(function (field) {
        if (field.name && !field.disabled) {
          formData[field.name] = field.value;
        }
      });
      return formData;
    }

    function runCalculate() {
      setLoading(true);

      postForm('ai_calculate', collectFormData())
        .then(function (response) {
          setLoading(false);

          if (!response || !response.success) {
            var errMsg = (response && response.data && response.data.message) || i18n.error || 'Ошибка расчёта';
            if (resultBox) {
              showMessage(resultBox, errMsg, 'error');
            }
            return;
          }

          var data = response.data || {};
          var existing = resultBox ? resultBox.querySelector('.ai-form-message') : null;
          if (existing) existing.remove();

          if (totalEl) {
            totalEl.textContent = data.total_formatted || formatPrice(data.total || data.grand_total || 0);
          }
          renderBreakdown(data);

          if (data.note && resultBox) {
            var noteEl = resultBox.querySelector('.ai-calculator__disclaimer');
            if (noteEl && data.note) {
              noteEl.textContent = data.note;
            }
          }
        })
        .catch(function () {
          setLoading(false);
          if (resultBox) {
            showMessage(resultBox, i18n.error || 'Ошибка. Попробуйте ещё раз.', 'error');
          }
        });
    }

    /* Fill distance when city is picked from known list */
    var cityDistances = {};
    try {
      var citiesJson = form.getAttribute('data-cities');
      if (citiesJson) {
        cityDistances = JSON.parse(citiesJson) || {};
      }
    } catch (err) {
      cityDistances = {};
    }

    var cityInput = $('#ai-calc-city', form);
    var distanceInput = $('#ai-calc-distance', form);
    on(cityInput, 'change', function () {
      var city = (cityInput.value || '').trim().toLowerCase();
      if (city && cityDistances[city] !== undefined && distanceInput) {
        distanceInput.value = cityDistances[city];
      }
    });
    on(cityInput, 'input', function () {
      var city = (cityInput.value || '').trim().toLowerCase();
      if (city && cityDistances[city] !== undefined && distanceInput) {
        distanceInput.value = cityDistances[city];
      }
    });

    on(form, 'submit', function (e) {
      e.preventDefault();
      runCalculate();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Lead forms                                                          */
  /* ------------------------------------------------------------------ */

  function initLeadForms() {
    $$('.ai-lead-form').forEach(function (form) {
      on(form, 'submit', function (e) {
        e.preventDefault();

        var submitBtn = form.querySelector('[type="submit"]');
        var formData = {};

        $$('[name]', form).forEach(function (field) {
          if (field.name && !field.disabled) {
            formData[field.name] = field.value;
          }
        });

        formData.form_id = form.id || form.dataset.formId || 'lead';
        formData.page_url = window.location.href;
        if (!formData.page) {
          formData.page = window.location.href;
        }

        if (cfg.captcha && cfg.captcha.enabled) {
          var widget = form.querySelector('.ai-captcha-widget');
          var token = '';
          if (widget) {
            var tokenEl = widget.querySelector('input[name="smart-token"]');
            token = tokenEl ? tokenEl.value : '';
          }
          if (!token) {
            showMessage(form, i18n.captchaRequired || 'Подтвердите, что вы не робот.', 'error');
            return;
          }
          formData['smart-token'] = token;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.dataset.originalText = submitBtn.textContent;
          submitBtn.textContent = i18n.sending || 'Отправка\u2026';
        }

        postForm('ai_lead', formData)
          .then(function (response) {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = submitBtn.dataset.originalText || submitBtn.textContent;
            }

            if (response && response.success) {
              showMessage(form, i18n.success || 'Заявка отправлена!', 'success');
              form.reset();
              if (cfg.captcha && cfg.captcha.enabled && window.smartCaptcha) {
                var w = form.querySelector('.ai-captcha-widget');
                if (w && w.id) {
                  try { window.smartCaptcha.reset(w.id); } catch (err) { /* ignore */ }
                }
              }
            } else {
              var errMsg = (response && response.data && response.data.message) || i18n.error || 'Ошибка. Попробуйте ещё раз.';
              showMessage(form, errMsg, 'error');
            }
          })
          .catch(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = submitBtn.dataset.originalText || submitBtn.textContent;
            }
            showMessage(form, i18n.error || 'Ошибка. Попробуйте ещё раз.', 'error');
          });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Catalog filters (client-side via data attributes)                   */
  /* ------------------------------------------------------------------ */

  function initCatalogFilters() {
    var filterBar = $('.ai-catalog-filters');
    var grid = $('.ai-car-grid');
    if (!filterBar || !grid) return;

    var cards = $$('.ai-car-card', grid);
    var emptyMsg = $('.ai-catalog-empty', grid.parentElement) || $('.ai-catalog-empty');

    function getActiveFilters() {
      var filters = {};
      $$('.ai-filter-btn.is-active', filterBar).forEach(function (btn) {
        var key = btn.dataset.filter || btn.dataset.filterKey;
        var val = btn.dataset.value;
        // "all" means no constraint for this filter key
        if (key && val && val !== 'all') {
          if (!filters[key]) filters[key] = [];
          filters[key].push(val);
        }
      });

      var selects = $$('select[data-filter]', filterBar.parentElement || document);
      selects.forEach(function (sel) {
        var key = sel.dataset.filter;
        if (key && sel.value && sel.value !== 'all') {
          filters[key] = [sel.value];
        }
      });

      return filters;
    }

    function cardMatches(card, filters) {
      var keys = Object.keys(filters);
      if (!keys.length) return true;

      return keys.every(function (key) {
        var cardVal = (card.dataset[key] || '').toLowerCase();
        if (!cardVal) return false;
        var allowed = filters[key];
        return allowed.some(function (v) {
          return cardVal === String(v).toLowerCase();
        });
      });
    }

    function applyFilters() {
      var filters = getActiveFilters();
      var visible = 0;

      cards.forEach(function (card) {
        var show = cardMatches(card, filters);
        card.classList.toggle('is-hidden', !show);
        if (show) visible++;
      });

      if (emptyMsg) {
        emptyMsg.classList.toggle('is-visible', visible === 0);
      }
    }

    $$('.ai-filter-btn', filterBar).forEach(function (btn) {
      on(btn, 'click', function () {
        var key = btn.dataset.filter || btn.dataset.filterKey;
        var val = btn.dataset.value;
        var isMulti = filterBar.dataset.multi === 'true';

        if (!isMulti) {
          $$('.ai-filter-btn[data-filter="' + key + '"], .ai-filter-btn[data-filter-key="' + key + '"]', filterBar).forEach(function (b) {
            if (b !== btn) b.classList.remove('is-active');
          });
        }

        if (val === 'all') {
          $$('.ai-filter-btn[data-filter="' + key + '"]', filterBar).forEach(function (b) {
            b.classList.remove('is-active');
          });
          btn.classList.add('is-active');
        } else {
          var allBtn = $('.ai-filter-btn[data-filter="' + key + '"][data-value="all"]', filterBar);
          if (allBtn) allBtn.classList.remove('is-active');
          btn.classList.toggle('is-active');
          // if nothing active in this group, activate "all"
          var any = $$('.ai-filter-btn[data-filter="' + key + '"].is-active', filterBar).filter(function (b) {
            return b.dataset.value !== 'all';
          });
          if (!any.length && allBtn) {
            allBtn.classList.add('is-active');
          }
        }

        applyFilters();
      });
    });

    $$('select[data-filter]').forEach(function (sel) {
      on(sel, 'change', applyFilters);
    });

    /* Default: show all countries */
    var allBtn = $('.ai-filter-btn[data-filter="country"][data-value="all"]', filterBar);
    if (allBtn && !$('.ai-filter-btn[data-filter="country"].is-active', filterBar)) {
      allBtn.classList.add('is-active');
    }
    applyFilters();
  }

  /* ------------------------------------------------------------------ */
  /* Reviews slider navigation                                           */
  /* ------------------------------------------------------------------ */

  function initReviews() {
    $$('.ai-reviews').forEach(function (root) {
      var track = $('.ai-reviews__track', root);
      var dots = $$('.ai-reviews__dot', root);
      if (!track) return;

      var cards = $$('.ai-review-card', track);
      if (cards.length < 2) return;

      var index = 0;
      var timer = null;

      function cardStep() {
        var style = window.getComputedStyle(track);
        var g = parseFloat(style.columnGap || style.gap) || 20;
        return cards[0].offsetWidth + g;
      }

      function goTo(i, smooth) {
        index = ((i % cards.length) + cards.length) % cards.length;
        var left = cards[index].offsetLeft - track.offsetLeft;
        if (typeof track.scrollTo === 'function') {
          track.scrollTo({ left: left, behavior: smooth === false ? 'auto' : 'smooth' });
        } else {
          track.scrollLeft = left;
        }
        dots.forEach(function (dot, di) {
          dot.classList.toggle('is-active', di === index);
        });
      }

      function updateFromScroll() {
        var step = cardStep() || 1;
        index = Math.round(track.scrollLeft / step);
        index = Math.max(0, Math.min(cards.length - 1, index));
        dots.forEach(function (dot, di) {
          dot.classList.toggle('is-active', di === index);
        });
      }

      function startAuto() {
        stopAuto();
        timer = setInterval(function () {
          goTo(index + 1);
        }, 4500);
      }

      function stopAuto() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, i) {
        on(dot, 'click', function () {
          goTo(i);
          startAuto();
        });
      });

      on(track, 'scroll', updateFromScroll, { passive: true });
      on(root, 'mouseenter', stopAuto);
      on(root, 'mouseleave', startAuto);
      on(root, 'focusin', stopAuto);
      on(root, 'focusout', startAuto);

      track.style.display = 'flex';
      track.style.overflowX = 'auto';
      track.style.scrollSnapType = 'x mandatory';
      track.style.gridTemplateColumns = 'none';

      goTo(0, false);
      startAuto();
    });
  }

  function fillConsultMessage(carTitle) {
    var text = 'Заказать: ' + (carTitle || '').trim();
    var detailWrap = document.getElementById('ai-car-order-form');
    var pageMsg = detailWrap
      ? detailWrap.querySelector('#ai-lead-consult-message, textarea[name="message"]')
      : document.getElementById('ai-lead-consult-message');

    if (pageMsg && detailWrap && detailWrap.contains(pageMsg)) {
      pageMsg.id = 'ai-lead-consult-message';
      pageMsg.value = text;
      pageMsg.focus();
      detailWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return { mode: 'page', el: pageMsg };
    }

    var modal = document.getElementById('ai-consult-modal');
    var target = modal
      ? (document.getElementById('ai-lead-consult-modal-message') || modal.querySelector('textarea[name="message"]'))
      : null;

    if (target) {
      var existing = document.getElementById('ai-lead-consult-message');
      if (existing && existing !== target) {
        existing.removeAttribute('id');
      }
      target.id = 'ai-lead-consult-message';
      target.value = text;
    }

    return { mode: 'modal', el: target };
  }

  function initOrderButtons() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-ai-order]');
      if (!btn) return;
      e.preventDefault();
      var title = btn.getAttribute('data-ai-order') || '';
      var result = fillConsultMessage(title);
      if (result.mode === 'modal') {
        var modal = document.getElementById('ai-consult-modal');
        if (modal) {
          modal.classList.add('is-open');
          modal.setAttribute('aria-hidden', 'false');
          document.body.classList.add('ai-modal-open');
          if (result.el) {
            setTimeout(function () { result.el.focus(); }, 50);
          }
        }
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Cookie bar                                                          */
  /* ------------------------------------------------------------------ */

  function initCookieBar() {
    var bar = $('.ai-cookie');
    if (!bar) return;

    var storageKey = 'ai_cookie_accept';
    var accepted = false;

    try {
      accepted = localStorage.getItem(storageKey) === '1';
    } catch (e) {
      /* localStorage unavailable */
    }

    if (!accepted) {
      requestAnimationFrame(function () {
        bar.classList.add('is-visible');
      });
    }

    var acceptBtn = $('[data-cookie-accept]', bar) || $('.ai-cookie__accept', bar);
    on(acceptBtn, 'click', function () {
      try {
        localStorage.setItem(storageKey, '1');
      } catch (e) {
        /* ignore */
      }
      bar.classList.remove('is-visible');
    });
  }

  /* ------------------------------------------------------------------ */
  /* Modal                                                               */
  /* ------------------------------------------------------------------ */

  function initModals() {
    function openModal(id) {
      var modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('ai-modal-open');
      var focusEl = modal.querySelector('input, button, textarea, select');
      if (focusEl) focusEl.focus();
    }

    function closeModal(modal) {
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('ai-modal-open');
    }

    $$( '[data-ai-modal-open]' ).forEach(function (btn) {
      on(btn, 'click', function (e) {
        e.preventDefault();
        openModal(btn.getAttribute('data-ai-modal-open'));
      });
    });

    $$('.ai-modal').forEach(function (modal) {
      $$( '[data-ai-modal-close]', modal ).forEach(function (el) {
        on(el, 'click', function () {
          closeModal(modal);
        });
      });
    });

    on(document, 'keydown', function (e) {
      if (e.key === 'Escape') {
        $$('.ai-modal.is-open').forEach(closeModal);
      }
    });

    // Links like href="#pick" or data-open-pick
    $$('a[href="#pick"], a[href="#ai-pick-modal"]').forEach(function (link) {
      on(link, 'click', function (e) {
        e.preventDefault();
        openModal('ai-pick-modal');
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Advanced filters + favorites / compare / print                      */
  /* ------------------------------------------------------------------ */

  function getStore(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      return [];
    }
  }

  function setStore(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
  }

  function closeFavBarPanel() {
    var bar = $('#ai-fav-bar');
    var toggle = $('#ai-fav-bar-toggle');
    if (!bar) return;
    bar.classList.remove('is-open');
    document.body.classList.remove('ai-fav-bar-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function updateFavBar() {
    var feats = (config.features || {});
    var favs = getStore('ai_favorites');
    var cmp = getStore('ai_compare');
    var bar = $('#ai-fav-bar');
    var count = $('#ai-fav-count');
    var countDesk = $('[data-ai-fav-count-desk]');
    var clearBtn = $('#ai-clear-favorites');
    var total = favs.length + cmp.length;
    if (!bar) return;
    if (!feats.favorites && !feats.compare) {
      bar.hidden = true;
      closeFavBarPanel();
      return;
    }
    bar.hidden = total === 0;
    if (total === 0) closeFavBarPanel();
    if (count) count.textContent = String(favs.length);
    if (countDesk) countDesk.textContent = String(favs.length);
    if (clearBtn) clearBtn.hidden = favs.length === 0;
  }

  function syncFavButtons() {
    var favs = getStore('ai_favorites');
    var cmp = getStore('ai_compare');
    $$('[data-ai-fav]').forEach(function (btn) {
      var id = btn.getAttribute('data-ai-fav');
      btn.classList.toggle('is-active', favs.indexOf(id) >= 0);
    });
    $$('[data-ai-compare]').forEach(function (btn) {
      var id = btn.getAttribute('data-ai-compare');
      btn.classList.toggle('is-active', cmp.indexOf(id) >= 0);
    });
  }

  function initFavoritesPage() {
    var grid = $('#ai-fav-grid');
    if (!grid) return;
    var map = {};
    var dataEl = $('#ai-fav-cars-data');
    if (dataEl) {
      try {
        map = JSON.parse(dataEl.textContent.trim() || '{}');
      } catch (e) {
        map = {};
      }
    }
    if (!Object.keys(map).length && grid.getAttribute('data-all-cars')) {
      try {
        var list = JSON.parse(grid.getAttribute('data-all-cars') || '[]');
        list.forEach(function (c) {
          if (c && c.id) map[c.id] = c;
        });
      } catch (e2) {}
    }
    var ids = getStore('ai_favorites');
    var empty = $('#ai-fav-empty');
    var shown = 0;
    ids.forEach(function (id) {
      var c = map[id];
      if (!c) return;
      shown++;
      var article = document.createElement('article');
      article.className = 'ai-car-card';
      var link = c.permalink || '#';
      var price = c.price ? formatPrice(c.price) : '';
      article.innerHTML =
        '<a class="ai-car-card__media" href="' + escapeHtml(link) + '">' +
        (c.image
          ? '<img src="' + escapeHtml(c.image) + '" alt="" loading="lazy">'
          : '<div class="ai-car-card__placeholder">Нет фото</div>') +
        '</a><div class="ai-car-card__body">' +
        '<h3 class="ai-car-card__title"><a href="' + escapeHtml(link) + '">' + escapeHtml(c.title || '') + '</a></h3>' +
        '<div class="ai-car-card__price"><span class="ai-car-card__price-value">' + escapeHtml(price) + '</span></div>' +
        '</div>';
      grid.insertBefore(article, empty);
    });
    if (empty) empty.style.display = shown ? 'none' : '';
  }

  function initComparePage() {
    var root = $('#ai-compare-root');
    if (!root) return;
    var cars = {};
    var fields = {};
    var dataEl = $('#ai-compare-cars-data');
    var fieldsEl = $('#ai-compare-fields-data');
    if (dataEl) {
      try { cars = JSON.parse(dataEl.textContent.trim() || '{}'); } catch (e) { cars = {}; }
    } else {
      try { cars = JSON.parse(root.getAttribute('data-cars') || '{}'); } catch (e2) { cars = {}; }
    }
    if (fieldsEl) {
      try { fields = JSON.parse(fieldsEl.textContent.trim() || '{}'); } catch (e3) { fields = {}; }
    } else {
      try { fields = JSON.parse(root.getAttribute('data-fields') || '{}'); } catch (e4) { fields = {}; }
    }
    var ids = getStore('ai_compare').filter(function (id) { return !!cars[id]; }).slice(0, 3);
    if (!ids.length) return;
    var table = document.createElement('table');
    table.className = 'ai-compare-table';
    var thead = '<tr><th></th>';
    ids.forEach(function (id) {
      var c = cars[id];
      thead += '<th><a href="' + escapeHtml(c.permalink || '#') + '">' + escapeHtml(c.title || id) + '</a></th>';
    });
    thead += '</tr>';
    table.innerHTML = '<thead>' + thead + '</thead><tbody></tbody>';
    var tb = table.querySelector('tbody');
    Object.keys(fields).forEach(function (key) {
      if (key === 'title') return;
      var tr = document.createElement('tr');
      var html = '<th>' + escapeHtml(fields[key]) + '</th>';
      ids.forEach(function (id) {
        var v = cars[id][key];
        if (key === 'price' && v) v = formatPrice(v);
        if (key === 'mileage' && v) v = Number(v).toLocaleString('ru-RU') + ' км';
        html += '<td>' + escapeHtml(v || '—') + '</td>';
      });
      tr.innerHTML = html;
      tb.appendChild(tr);
    });
    root.innerHTML = '';
    root.appendChild(table);
  }

  function initFavBarToggle() {
    var bar = $('#ai-fav-bar');
    var toggle = $('#ai-fav-bar-toggle');
    if (!bar || !toggle) return;

    function isMobileFavBar() {
      return window.matchMedia('(max-width: 639px)').matches;
    }

    on(toggle, 'click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!isMobileFavBar()) return;
      var open = !bar.classList.contains('is-open');
      bar.classList.toggle('is-open', open);
      document.body.classList.toggle('ai-fav-bar-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    on(document, 'click', function (e) {
      if (!isMobileFavBar() || !bar.classList.contains('is-open')) return;
      if (!bar.contains(e.target)) closeFavBarPanel();
    });

    on(document, 'keydown', function (e) {
      if (e.key === 'Escape') closeFavBarPanel();
    });

    window.addEventListener('resize', function () {
      if (!isMobileFavBar()) closeFavBarPanel();
    });
  }

  function toggleId(key, id) {
    if (!id) return;
    var arr = getStore(key);
    var i = arr.indexOf(id);
    if (i >= 0) arr.splice(i, 1);
    else {
      if (key === 'ai_compare' && arr.length >= 3) arr.shift();
      arr.push(id);
    }
    setStore(key, arr);
    updateFavBar();
  }

  function clearFavorites() {
    setStore('ai_favorites', []);
    $$('[data-ai-fav].is-active').forEach(function (el) {
      el.classList.remove('is-active');
    });
    updateFavBar();
  }

  function initFavoritesCompare() {
    initFavBarToggle();
    syncFavButtons();
    updateFavBar();
    initFavoritesPage();
    initComparePage();
    document.addEventListener('click', function (e) {
      var clear = e.target.closest('[data-ai-clear-favs]');
      if (clear) {
        e.preventDefault();
        clearFavorites();
        return;
      }
      var fav = e.target.closest('[data-ai-fav]');
      var cmp = e.target.closest('[data-ai-compare]');
      if (fav) {
        e.preventDefault();
        toggleId('ai_favorites', fav.getAttribute('data-ai-fav'));
        syncFavButtons();
      }
      if (cmp) {
        e.preventDefault();
        toggleId('ai_compare', cmp.getAttribute('data-ai-compare'));
        syncFavButtons();
      }
    });
  }

  function renderApiStatus(panel, data) {
    if (!panel || !data) return;
    var okClass = data.ok ? 'is-ok' : 'is-fail';
    var lines = [
      '<div class="ai-api-status__row"><strong>Источник:</strong> ' + escapeHtml(data.source || '—') + '</div>',
      '<div class="ai-api-status__row"><strong>Провайдер:</strong> ' + escapeHtml(data.provider || '—') + '</div>',
      '<div class="ai-api-status__row"><strong>В каталоге:</strong> ' + escapeHtml(String(data.total != null ? data.total : 0)) +
        ' (ручных: ' + escapeHtml(String(data.manual_count || 0)) + ', API-выборка: ' + escapeHtml(String(data.api_sample || 0)) + ')</div>',
      '<div class="ai-api-status__row"><strong>JSON:</strong> ' + (data.json_ok ? 'OK' : 'нет') +
        (data.json_url ? ' · <a href="' + escapeHtml(data.json_url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(data.json_url) + '</a>' : '') + '</div>'
    ];
    if (data.nhtsa_ok !== null && data.nhtsa_ok !== undefined) {
      lines.push('<div class="ai-api-status__row"><strong>NHTSA:</strong> ' + (data.nhtsa_ok ? 'доступен' : 'недоступен') + '</div>');
    }
    if (data.custom_ok !== null && data.custom_ok !== undefined) {
      lines.push('<div class="ai-api-status__row"><strong>Свой API:</strong> ' + (data.custom_ok ? 'OK' : 'ошибка') + '</div>');
    }
    if (data.endpoints && data.endpoints.length) {
      lines.push('<div class="ai-api-status__row"><strong>Ссылки для Postman:</strong></div>');
      lines.push('<ul class="ai-api-status__urls">' + data.endpoints.map(function (ep) {
        var method = escapeHtml(ep.method || 'GET');
        var url = escapeHtml(ep.url || '');
        var label = escapeHtml(ep.label || 'API');
        return '<li><span class="ai-api-status__method">' + method + '</span> ' + label +
          '<br><a href="' + url + '" target="_blank" rel="noopener noreferrer"><code>' + url + '</code></a></li>';
      }).join('') + '</ul>');
    }
    if (data.messages && data.messages.length) {
      lines.push('<ul class="ai-api-status__msgs">' + data.messages.map(function (m) {
        return '<li>' + escapeHtml(m) + '</li>';
      }).join('') + '</ul>');
    }
    if (data.instructions && data.instructions.length) {
      lines.push('<div class="ai-api-status__row"><strong>Инструкция:</strong></div>');
      lines.push('<div class="ai-api-status__instructions">' + data.instructions.map(function (block) {
        return '<div class="ai-api-status__instr-block"><strong>' + escapeHtml(block.title || '') + '</strong><p>' + escapeHtml(block.text || '') + '</p></div>';
      }).join('') + '</div>');
    }
    if (data.hidden_count != null && data.hidden_count > 0) {
      lines.push('<div class="ai-api-status__row"><strong>Скрыто из каталога:</strong> ' + escapeHtml(String(data.hidden_count)) + '</div>');
    }
    panel.className = 'ai-api-status ' + okClass;
    panel.hidden = false;
    panel.innerHTML =
      '<div class="ai-api-status__badge">' + (data.ok ? 'Работает' : 'Проблема') + '</div>' +
      lines.join('');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function initApiStatus() {
    var btn = $('[data-ai-api-status]');
    var panel = $('#ai-api-status');
    if (!btn || !panel) return;

    on(btn, 'click', function () {
      btn.disabled = true;
      var label = btn.querySelector('span');
      var prev = label ? label.textContent : '';
      if (label) label.textContent = 'Проверка…';
      panel.hidden = false;
      panel.className = 'ai-api-status is-loading';
      panel.innerHTML = '<div class="ai-api-status__badge">Проверка…</div>';

      postForm('ai_catalog_status', {})
        .then(function (res) {
          if (res && res.success && res.data) {
            renderApiStatus(panel, res.data);
          } else {
            renderApiStatus(panel, {
              ok: false,
              source: '—',
              provider: '—',
              total: 0,
              messages: [(res && res.data && res.data.message) || 'Не удалось получить статус API']
            });
          }
        })
        .catch(function () {
          renderApiStatus(panel, {
            ok: false,
            source: '—',
            provider: '—',
            total: 0,
            messages: ['Сеть или сервер недоступны']
          });
        })
        .finally(function () {
          btn.disabled = false;
          if (label) label.textContent = prev || 'Статус API';
        });
    });
  }

  function renderHiddenList(listEl, countEl, items) {
    if (!listEl) return;
    items = items || [];
    if (countEl) countEl.textContent = String(items.length);
    if (!items.length) {
      listEl.innerHTML = '<li class="ai-catalog-hidden-list__empty">' + escapeHtml(i18n.hiddenEmpty || 'Скрытых автомобилей нет.') + '</li>';
      return;
    }
    listEl.innerHTML = items.map(function (item) {
      var title = escapeHtml(item.title || item.id || '—');
      var platform = item.platform ? '<span class="ai-catalog-hidden-list__platform">' + escapeHtml(item.platform) + '</span>' : '';
      return '<li class="ai-catalog-hidden-list__item">' +
        '<div class="ai-catalog-hidden-list__info">' + title + platform + '</div>' +
        '<button type="button" class="ai-btn ai-btn--ghost ai-btn--sm" data-ai-unhide-car="' + escapeHtml(item.id || '') + '">' +
        escapeHtml(i18n.restoreCar || 'Вернуть в каталог') + '</button></li>';
    }).join('');
  }

  function loadHiddenList() {
    var listEl = $('#ai-catalog-hidden-list');
    var countEl = $('[data-ai-hidden-count]');
    if (!listEl) return Promise.resolve();
    return postForm('ai_catalog_hidden_list', {}).then(function (res) {
      if (res && res.success && res.data) {
        renderHiddenList(listEl, countEl, res.data.hidden || []);
      }
    });
  }

  function initParserSync() {
    var btn = $('[data-ai-parser-sync]');
    if (!btn) return;
    on(btn, 'click', function () {
      var label = btn.textContent;
      btn.disabled = true;
      btn.textContent = i18n.syncing || 'Синхронизация…';
      postForm('ai_parser_sync', {})
        .then(function (res) {
          var panel = $('#ai-api-status');
          if (panel) {
            panel.hidden = false;
            if (res && res.success) {
              panel.className = 'ai-api-status is-ok';
              panel.innerHTML = '<div class="ai-api-status__badge">Синхронизация</div>' +
                '<div class="ai-api-status__row">' + escapeHtml((res.data && res.data.message) || 'Готово') + '</div>';
              if (res.data && res.data.results) {
                panel.innerHTML += '<ul class="ai-api-status__msgs">' + Object.keys(res.data.results).map(function (p) {
                  var r = res.data.results[p];
                  return '<li>' + escapeHtml(p) + ': ' + escapeHtml(String(r.count || 0)) + (r.error ? ' (' + escapeHtml(r.error) + ')' : '') + '</li>';
                }).join('') + '</ul>';
              }
            } else {
              panel.className = 'ai-api-status is-fail';
              panel.innerHTML = '<div class="ai-api-status__badge">Ошибка</div><div class="ai-api-status__row">' +
                escapeHtml((res && res.data && res.data.message) || 'Не удалось синхронизировать') + '</div>';
            }
          }
          setTimeout(function () { window.location.reload(); }, 1200);
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = label;
        });
    });
  }

  function renderOverridesList(listEl, countEl, items) {
    if (!listEl) return;
    items = items || [];
    if (countEl) countEl.textContent = String(items.length);
    if (!items.length) {
      listEl.innerHTML = '<li class="ai-catalog-hidden-list__empty">' + escapeHtml(i18n.overridesEmpty || 'Нет отредактированных авто.') + '</li>';
      return;
    }
    listEl.innerHTML = items.map(function (item) {
      var title = escapeHtml(item.title || item.id || '—');
      return '<li class="ai-catalog-hidden-list__item">' +
        '<div class="ai-catalog-hidden-list__info">' + title + '</div>' +
        '<button type="button" class="ai-btn ai-btn--ghost ai-btn--sm" data-ai-edit-override="' + escapeHtml(item.id || '') + '">' +
        escapeHtml(i18n.editCar || 'Редактировать') + '</button></li>';
    }).join('');
  }

  function loadOverridesList() {
    var listEl = $('#ai-catalog-overrides-list');
    var countEl = $('[data-ai-overrides-count]');
    if (!listEl) return Promise.resolve();
    return postForm('ai_catalog_overrides_list', {}).then(function (res) {
      if (res && res.success && res.data) {
        renderOverridesList(listEl, countEl, res.data.overrides || []);
      }
    });
  }

  function openCarEditModal(carId, card) {
    var modal = $('#ai-car-edit-modal');
    if (!modal) return;
    var titleEl = $('#ai-car-edit-title');
    var priceEl = $('#ai-car-edit-price');
    var excerptEl = $('#ai-car-edit-excerpt');
    var idEl = $('#ai-car-edit-id');
    var platformEl = $('#ai-car-edit-platform');
    var imageEl = $('#ai-car-edit-image');
    if (idEl) idEl.value = carId || '';
    if (platformEl) platformEl.value = card ? (card.getAttribute('data-platform') || '') : '';
    if (imageEl && card) {
      var img = card.querySelector('.ai-car-card__media img');
      imageEl.value = img ? img.getAttribute('src') : '';
    }
    if (card) {
      var editBtn = card.querySelector('[data-ai-edit-car]');
      if (titleEl) titleEl.value = editBtn ? (editBtn.getAttribute('data-car-title') || '') : '';
      if (priceEl) priceEl.value = editBtn ? (editBtn.getAttribute('data-car-price') || '') : '';
      if (excerptEl) excerptEl.value = editBtn ? (editBtn.getAttribute('data-car-excerpt') || '') : '';
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('ai-modal-open');
    if (titleEl) titleEl.focus();
  }

  function initCarEditModal() {
    var form = $('#ai-car-edit-form');
    if (!form) return;

    on(form, 'submit', function (e) {
      e.preventDefault();
      var data = {
        car_id: ($('#ai-car-edit-id') || {}).value || '',
        title: ($('#ai-car-edit-title') || {}).value || '',
        price: ($('#ai-car-edit-price') || {}).value || '',
        excerpt: ($('#ai-car-edit-excerpt') || {}).value || '',
        platform: ($('#ai-car-edit-platform') || {}).value || '',
        image: ($('#ai-car-edit-image') || {}).value || ''
      };
      postForm('ai_catalog_save_car_override', data).then(function (res) {
        if (res && res.success) {
          var modal = $('#ai-car-edit-modal');
          if (modal) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('ai-modal-open');
          }
          loadOverridesList();
          setTimeout(function () { window.location.reload(); }, 400);
        }
      });
    });

    var resetBtn = $('[data-ai-reset-car-override]');
    if (resetBtn) {
      on(resetBtn, 'click', function () {
        var carId = ($('#ai-car-edit-id') || {}).value || '';
        if (!carId) return;
        postForm('ai_catalog_delete_car_override', { car_id: carId }).then(function (res) {
          if (res && res.success) {
            loadOverridesList();
            setTimeout(function () { window.location.reload(); }, 400);
          }
        });
      });
    }
  }

  function initCatalogAdmin() {
    initCarEditModal();
    var toggle = $('[data-ai-catalog-admin-toggle]');
    var panel = $('#ai-catalog-admin-panel');
    if (toggle && panel) {
      on(toggle, 'click', function () {
        var open = panel.hidden;
        panel.hidden = !open;
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
          loadHiddenList();
          loadOverridesList();
        }
      });
      loadHiddenList();
      loadOverridesList();
    }

    document.addEventListener('click', function (e) {
      var editBtn = e.target.closest('[data-ai-edit-car]');
      if (editBtn) {
        e.preventDefault();
        var card = editBtn.closest('.ai-car-card');
        openCarEditModal(editBtn.getAttribute('data-ai-edit-car'), card);
        return;
      }

      var editOverrideBtn = e.target.closest('[data-ai-edit-override]');
      if (editOverrideBtn) {
        e.preventDefault();
        var oid = editOverrideBtn.getAttribute('data-ai-edit-override');
        var card = document.querySelector('.ai-car-card[data-car-id="' + oid + '"]');
        openCarEditModal(oid, card);
        return;
      }

      var hideBtn = e.target.closest('[data-ai-hide-car]');
      if (hideBtn) {
        e.preventDefault();
        var card = hideBtn.closest('.ai-car-card');
        if (!card) return;
        var carId = hideBtn.getAttribute('data-ai-hide-car');
        var titleEl = card.querySelector('.ai-car-card__title');
        var imgEl = card.querySelector('.ai-car-card__media img');
        postForm('ai_catalog_hide_car', {
          car_id: carId,
          title: titleEl ? titleEl.textContent.trim() : '',
          platform: card.getAttribute('data-platform') || '',
          image: imgEl ? imgEl.getAttribute('src') : ''
        }).then(function (res) {
          if (res && res.success) {
            card.classList.add('is-hidden');
            card.style.display = 'none';
            var listEl = $('#ai-catalog-hidden-list');
            var countEl = $('[data-ai-hidden-count]');
            if (res.data && res.data.hidden) {
              renderHiddenList(listEl, countEl, Object.keys(res.data.hidden).map(function (k) { return res.data.hidden[k]; }));
            }
            var adminPanel = $('#ai-catalog-admin-panel');
            if (adminPanel && adminPanel.hidden && toggle) {
              adminPanel.hidden = false;
              toggle.setAttribute('aria-expanded', 'true');
            }
          }
        });
        return;
      }

      var unhideBtn = e.target.closest('[data-ai-unhide-car]');
      if (unhideBtn) {
        e.preventDefault();
        var id = unhideBtn.getAttribute('data-ai-unhide-car');
        postForm('ai_catalog_unhide_car', { car_id: id }).then(function (res) {
          if (res && res.success && res.data && res.data.hidden) {
            renderHiddenList($('#ai-catalog-hidden-list'), $('[data-ai-hidden-count]'),
              Object.keys(res.data.hidden).map(function (k) { return res.data.hidden[k]; }));
          }
        });
      }
    });
  }

  function initPrintCard() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-ai-print]');
      if (!btn) return;
      e.preventDefault();
      window.print();
    });
  }

  function applyCardAdv(card, opts) {
    if (opts.brand && (card.dataset.brand || '') !== opts.brand) return false;
    if (opts.model && (card.dataset.model || '') !== opts.model) return false;
    var year = parseInt(card.dataset.year || '0', 10);
    if (opts.yearFrom && year && year < opts.yearFrom) return false;
    if (opts.yearTo && year && year > opts.yearTo) return false;
    var price = parseFloat(card.dataset.price || '0');
    if (opts.priceTo && price && price > opts.priceTo) return false;
    var cc = parseInt(card.dataset.engineCc || '0', 10);
    if (opts.ccTo && cc && cc > opts.ccTo) return false;
    return true;
  }

  function initAdvFilters() {
    var feats = config.features || {};
    if (!feats.advFilters) return;

    $$('[data-ai-adv-filters], #ai-catalog-adv').forEach(function (form) {
      var section = form.closest('section') || form.parentElement;
      var grid = section ? section.querySelector('.ai-car-grid') : null;
      if (!grid) grid = $('#ai-catalog-grid');
      if (!grid) return;

      var modelsJson = section ? section.querySelector('[data-ai-models]') : null;
      var modelsMap = {};
      if (modelsJson) {
        try { modelsMap = JSON.parse(modelsJson.textContent || '{}'); } catch (e) {}
      }

      var brandSel = form.querySelector('[data-filter-brand], [data-adv-brand]');
      var modelSel = form.querySelector('[data-filter-model]');
      if (brandSel && modelSel) {
        on(brandSel, 'change', function () {
          modelSel.innerHTML = '<option value=\"\">Любая</option>';
          var label = brandSel.options[brandSel.selectedIndex] ? brandSel.options[brandSel.selectedIndex].text : '';
          var list = modelsMap[label] || {};
          Object.keys(list).forEach(function (m) {
            var opt = document.createElement('option');
            opt.value = m.toLowerCase().replace(/\s+/g, '-');
            opt.textContent = m;
            modelSel.appendChild(opt);
          });
        });
      }

      function run() {
        var opts = {
          brand: (form.querySelector('[data-filter-brand], [data-adv-brand]') || {}).value || '',
          model: (form.querySelector('[data-filter-model]') || {}).value || '',
          yearFrom: parseInt((form.querySelector('[data-filter-year-from], [data-adv-year-from]') || {}).value || '0', 10) || 0,
          yearTo: parseInt((form.querySelector('[data-filter-year-to], [data-adv-year-to]') || {}).value || '0', 10) || 0,
          priceTo: parseFloat((form.querySelector('[data-adv-price-to]') || {}).value || '0') || 0,
          ccTo: parseInt((form.querySelector('[data-adv-cc-to]') || {}).value || '0', 10) || 0
        };
        var visible = 0;
        $$('.ai-car-card', grid).forEach(function (card) {
          var show = applyCardAdv(card, opts);
          card.classList.toggle('is-hidden', !show);
          if (show) visible++;
        });
        var empty = grid.querySelector('.ai-catalog-empty');
        if (empty) empty.classList.toggle('is-visible', visible === 0);

        if (feats.savedFilters) {
          try {
            var params = new URLSearchParams(window.location.search);
            Object.keys(opts).forEach(function (k) {
              if (opts[k]) params.set(k, opts[k]);
              else params.delete(k);
            });
            var qs = params.toString();
            history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
          } catch (e) {}
        }
      }

      on(form, 'submit', function (e) {
        e.preventDefault();
        run();
      });
      on(form, 'reset', function () {
        setTimeout(run, 0);
      });

      var saveBtn = form.querySelector('[data-ai-save-filters]');
      if (saveBtn) {
        on(saveBtn, 'click', function () {
          var data = {};
          $$('[name]', form).forEach(function (f) { if (f.name) data[f.name] = f.value; });
          localStorage.setItem('ai_saved_filters', JSON.stringify(data));
          saveBtn.textContent = 'Сохранено';
        });
      }
    });
  }

  function initEncarApiPager() {
    var toggle = $('[data-ai-encar-pager-toggle]');
    var panel = $('#ai-encar-api-pager');
    if (!toggle || !panel || !aiTheme.encarOffersUrl) return;

    var pageInput = panel.querySelector('[data-ai-encar-page]');
    var liveInput = panel.querySelector('[data-ai-encar-live]');
    var resultEl = panel.querySelector('[data-ai-encar-result]');
    var prevBtn = panel.querySelector('[data-ai-encar-prev]');
    var nextBtn = panel.querySelector('[data-ai-encar-next]');
    var fetchBtn = panel.querySelector('[data-ai-encar-fetch]');
    var closeBtn = panel.querySelector('[data-ai-encar-pager-close]');

    function currentPage() {
      return Math.max(1, parseInt(pageInput && pageInput.value, 10) || 1);
    }

    function setPage(n) {
      if (pageInput) pageInput.value = String(Math.max(1, n));
    }

    function buildUrl(page) {
      var url = aiTheme.encarOffersUrl + '?page=' + encodeURIComponent(String(page));
      if (liveInput && liveInput.checked) url += '&live=1';
      return url;
    }

    function fetchPage() {
      var page = currentPage();
      if (fetchBtn) fetchBtn.disabled = true;
      if (resultEl) {
        resultEl.hidden = false;
        resultEl.textContent = 'Загрузка…';
      }
      fetch(buildUrl(page), { credentials: 'same-origin' })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (payload) {
          if (!resultEl) return;
          var data = payload.data || {};
          var meta = data.meta || {};
          var count = (data.result && data.result.length) || 0;
          var summary = 'page=' + (meta.page || page) +
            ', per_page=' + (meta.per_page || '—') +
            ', total=' + (meta.total != null ? meta.total : '—') +
            ', pages=' + (meta.pages != null ? meta.pages : '—') +
            ', items=' + count +
            (meta.live ? ', live' : ', cache');
          resultEl.textContent = summary + '\n\n' + JSON.stringify(data, null, 2);
          if (meta.pages) setPage(Math.min(page, meta.pages));
        })
        .catch(function (err) {
          if (resultEl) resultEl.textContent = 'Ошибка: ' + (err && err.message ? err.message : String(err));
        })
        .finally(function () {
          if (fetchBtn) fetchBtn.disabled = false;
        });
    }

    on(toggle, 'click', function () {
      panel.hidden = !panel.hidden;
      if (!panel.hidden && resultEl && resultEl.hidden) fetchPage();
    });
    if (closeBtn) on(closeBtn, 'click', function () { panel.hidden = true; });
    if (prevBtn) on(prevBtn, 'click', function () { setPage(currentPage() - 1); fetchPage(); });
    if (nextBtn) on(nextBtn, 'click', function () { setPage(currentPage() + 1); fetchPage(); });
    if (fetchBtn) on(fetchBtn, 'click', fetchPage);
    if (pageInput) on(pageInput, 'change', fetchPage);
  }

  function initCatalogPagination() {
    var nav = $('[data-ai-catalog-pagination]');
    if (!nav) return;
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.has('catalog_page')) {
        nav.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (e) {}
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                */
  /* ------------------------------------------------------------------ */

  function init() {
    applyCustomColors();
    initMobileMenu();
    initHeaderScroll();
    initScrollReveal();
    initFaq();
    initSmoothScroll();
    initCalculator();
    initLeadForms();
    initCatalogFilters();
    initAdvFilters();
    initFavoritesCompare();
    initOrderButtons();
    initApiStatus();
    initParserSync();
    initCatalogAdmin();
    initEncarApiPager();
    initCatalogPagination();
    initPrintCard();
    initReviews();
    initCookieBar();
    initModals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
