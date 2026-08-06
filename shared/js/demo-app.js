/**
 * AutoImport static Netlify demo — role switch, catalog JSON, lite visual editor.
 */
(function () {
  'use strict';

  var STORAGE_ROLE = 'ai_demo_role';
  var STORAGE_HIDDEN = 'ai_demo_hidden_cars';
  var STORAGE_OVERRIDES = 'ai_demo_car_overrides';
  var PER_PAGE = 12;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  function getPackageSlug() {
    var m = document.body.className.match(/ai-package-(start|pro|maximum)/);
    return m ? m[1] : 'start';
  }

  function getPkg() {
    return window.AI_PACKAGES[getPackageSlug()] || window.AI_PACKAGES.start;
  }

  function toast(msg) {
    var el = $('#demo-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'demo-toast';
      el.className = 'demo-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
  }

  function formatPrice(n) {
    n = parseFloat(n) || 0;
    if (n <= 0) return 'Цена уточняется';
    return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' \u20BD';
  }

  function countryLabel(c) {
    return { china: 'Китай', japan: 'Япония', korea: 'Корея' }[c] || c;
  }

  function statusLabel(s) {
    return { available: 'В наличии', in_transit: 'В пути', reserved: 'Бронь', sold: 'Продан' }[s] || s;
  }

  function fuelLabel(f) {
    return { petrol: 'Бензин', diesel: 'Дизель', hybrid: 'Гибрид', electric: 'Электро', phev: 'PHEV' }[f] || f;
  }

  function loadJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJson(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function isAdmin() {
    return document.documentElement.classList.contains('is-demo-admin');
  }

  function setRole(role) {
    var admin = role === 'admin';
    document.documentElement.classList.toggle('is-demo-admin', admin);
    localStorage.setItem(STORAGE_ROLE, role);
    $$('[data-demo-role]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-demo-role') === role);
    });
    document.body.classList.toggle('ai-demo-admin', admin);
  }

  function initRoleBar() {
    $$('[data-demo-role]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setRole(btn.getAttribute('data-demo-role'));
      });
    });
    setRole(localStorage.getItem(STORAGE_ROLE) || 'user');
  }

  function applyPackageFeatures() {
    var pkg = getPkg();
    document.body.classList.add('ai-design-' + pkg.designTheme);

    $$('[data-feature]').forEach(function (el) {
      var feat = el.getAttribute('data-feature');
      var map = {
        favorites: pkg.favorites,
        compare: pkg.compareCars,
        print: pkg.printCard,
        compare_calc: pkg.compareCalculator,
        multi_office: pkg.multiOffice
      };
      if (feat in map) {
        el.setAttribute('data-feature-hidden', map[feat] ? 'false' : 'true');
      }
    });

    var topbar = $('#ai-topbar');
    if (topbar && pkg.multiOffice && pkg.offices.length) {
      topbar.innerHTML = '<div class="ai-container ai-topbar__inner">' + pkg.offices.map(function (o) {
        return '<span class="ai-topbar__office"><strong>' + o.title + ':</strong> ' + o.address + '</span>';
      }).join('') + '</div>';
      topbar.hidden = false;
    } else if (topbar) {
      topbar.hidden = true;
    }

    var badge = $('#demo-package-badge');
    if (badge) badge.textContent = 'AutoImport ' + pkg.label;
  }

  function getHiddenIds() {
    return loadJson(STORAGE_HIDDEN, []);
  }

  function getOverrides() {
    return loadJson(STORAGE_OVERRIDES, {});
  }

  function applyCarOverrides(car) {
    var ov = getOverrides()[car.id];
    if (!ov) return car;
    var copy = Object.assign({}, car, ov);
    copy._overridden = true;
    return copy;
  }

  function renderCarCard(car, opts) {
    opts = opts || {};
    var pkg = getPkg();
    var admin = isAdmin();
    var isApi = car.id && car.id.indexOf('manual-') !== 0;
    var price = car.price || 0;
    var brand = car.brand || (car.title || '').split(' ')[0];
    var tools = '';
    if (pkg.favorites || pkg.compareCars) {
      tools = '<div class="ai-car-card__tools">';
      if (pkg.favorites) {
        tools += '<button type="button" class="ai-car-card__tool" data-ai-fav="' + car.id + '" aria-label="Избранное">♥</button>';
      }
      if (pkg.compareCars) {
        tools += '<button type="button" class="ai-car-card__tool" data-ai-compare="' + car.id + '" aria-label="Сравнить">⇄</button>';
      }
      tools += '</div>';
    }
    var adminBtns = '';
    if (admin && isApi) {
      adminBtns = '<button type="button" class="ai-car-card__edit" data-demo-admin data-ai-edit-car="' + car.id + '" title="Редактировать">✎</button>' +
        '<button type="button" class="ai-car-card__hide" data-demo-admin data-ai-hide-car="' + car.id + '" title="Скрыть">&times;</button>';
    }
    return '<article class="ai-car-card" id="car-' + car.id + '" data-country="' + (car.country || '') + '" data-status="' + (car.status || '') + '" data-brand="' + brand.toLowerCase() + '" data-year="' + (car.year || '') + '" data-price="' + price + '" data-engine-cc="' + (car.engine_cc || '') + '" data-car-id="' + car.id + '">' +
      '<div class="ai-car-card__media-wrap">' + adminBtns +
      '<a href="' + (car.permalink || '#') + '" class="ai-car-card__media">' +
      (car.image ? '<img src="' + car.image + '" alt="' + car.title + '" loading="lazy" width="640" height="420">' : '<div class="ai-car-card__placeholder">Нет фото</div>') +
      '<div class="ai-car-card__badges"><span class="ai-badge ai-badge--' + (car.country || 'china') + '">' + countryLabel(car.country) + '</span></div></a>' +
      '<span class="ai-car-card__status">' + statusLabel(car.status || 'available') + '</span></div>' +
      '<div class="ai-car-card__body">' +
      (car._overridden ? '<span class="ai-car-card__override-badge">Изм.</span>' : '') +
      '<h3 class="ai-car-card__title"><a href="' + (car.permalink || '#') + '">' + car.title + '</a></h3>' +
      '<div class="ai-car-card__meta">' +
      (car.year ? '<span>' + car.year + ' г.</span>' : '') +
      (car.mileage ? '<span>' + car.mileage.toLocaleString('ru-RU') + ' км</span>' : '') +
      (car.engine_cc ? '<span>' + car.engine_cc.toLocaleString('ru-RU') + ' см³</span>' : '') +
      '</div>' +
      '<div class="ai-car-card__price' + (price > 0 ? '' : ' ai-car-card__price--pending') + '">' +
      '<span class="ai-car-card__price-value">' + formatPrice(price) + '</span>' +
      (price > 0 ? '<span class="ai-car-card__price-note">под ключ</span>' : '') + '</div>' +
      '<div class="ai-car-card__footer"><button type="button" class="ai-btn ai-btn--primary ai-btn--sm ai-car-card__order" data-ai-order="' + car.title + '">Заказать</button>' + tools + '</div></div></article>';
  }

  function fetchCars() {
    return fetch('shared/data/cars.json').then(function (r) { return r.json(); }).then(function (data) {
      return (data.cars || []).map(applyCarOverrides).filter(function (c) {
        return getHiddenIds().indexOf(c.id) === -1;
      });
    });
  }

  function renderCatalogGrid(cars, page) {
    var grid = $('#ai-catalog-grid');
    if (!grid) return;
    page = page || 1;
    var start = (page - 1) * PER_PAGE;
    var slice = cars.slice(start, start + PER_PAGE);
    grid.innerHTML = slice.map(function (c) { return renderCarCard(c); }).join('') +
      '<p class="ai-catalog-empty">По выбранным фильтрам автомобили не найдены.</p>';
    renderPagination(cars.length, page);
    initCatalogFilters();
    bindCarAdminActions();
  }

  function renderPagination(total, page) {
    var nav = $('#ai-catalog-pagination');
    if (!nav) return;
    var pages = Math.max(1, Math.ceil(total / PER_PAGE));
    if (pages <= 1) { nav.innerHTML = ''; return; }
    var html = '<nav class="ai-catalog-pagination" data-ai-catalog-pagination>';
    if (page > 1) html += '<a class="ai-catalog-pagination__btn" href="#" data-page="' + (page - 1) + '">← Назад</a>';
    html += '<div class="ai-catalog-pagination__pages">';
    for (var i = 1; i <= pages; i++) {
      html += i === page ? '<span class="ai-catalog-pagination__page is-current">' + i + '</span>' :
        '<a class="ai-catalog-pagination__page" href="#" data-page="' + i + '">' + i + '</a>';
    }
    html += '</div>';
    if (page < pages) html += '<a class="ai-catalog-pagination__btn" href="#" data-page="' + (page + 1) + '">Вперёд →</a>';
    html += '<p class="ai-catalog-pagination__summary">Страница ' + page + ' из ' + pages + ' · всего ' + total + ' авто</p></nav>';
    nav.innerHTML = html;
    $$('[data-page]', nav).forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        window.__catalogPage = parseInt(a.getAttribute('data-page'), 10);
        refreshCatalog();
      });
    });
  }

  function filterCars(cars) {
    var country = window.__filterCountry || 'all';
    var status = window.__filterStatus || 'all';
    return cars.filter(function (c) {
      if (country !== 'all' && c.country !== country) return false;
      if (status !== 'all' && c.status !== status) return false;
      return true;
    });
  }

  function refreshCatalog() {
    fetchCars().then(function (cars) {
      renderCatalogGrid(filterCars(cars), window.__catalogPage || 1);
    });
  }

  function initCatalogFilters() {
    var bar = $('.ai-catalog-filters');
    if (!bar || bar._bound) return;
    bar._bound = true;
    $$('.ai-filter-btn', bar).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var type = btn.getAttribute('data-filter');
        var val = btn.getAttribute('data-value');
        $$('.ai-filter-btn[data-filter="' + type + '"]', bar).forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        if (type === 'country') window.__filterCountry = val;
        if (type === 'status') window.__filterStatus = val;
        window.__catalogPage = 1;
        refreshCatalog();
      });
    });
  }

  function renderHomePreview() {
    var grid = $('#ai-home-catalog-grid');
    if (!grid) return;
    fetchCars().then(function (cars) {
      grid.innerHTML = cars.slice(0, 6).map(function (c) { return renderCarCard(c); }).join('');
      bindCarAdminActions();
    });
  }

  function bindCarAdminActions() {
    $$('[data-ai-hide-car]').forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute('data-ai-hide-car');
        var hidden = getHiddenIds();
        if (hidden.indexOf(id) === -1) hidden.push(id);
        saveJson(STORAGE_HIDDEN, hidden);
        toast('Автомобиль скрыт из каталога');
        refreshCatalog();
        renderHomePreview();
      };
    });
    $$('[data-ai-edit-car]').forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute('data-ai-edit-car');
        var modal = $('#ai-car-edit-modal');
        if (!modal) return;
        fetchCars().then(function (cars) {
          var car = cars.find(function (c) { return c.id === id; }) || {};
          $('#ai-car-edit-id').value = id;
          $('#ai-car-edit-title').value = car.title || '';
          $('#ai-car-edit-price').value = car.price || '';
          $('#ai-car-edit-excerpt').value = car.excerpt || '';
          modal.classList.add('is-open');
          modal.setAttribute('aria-hidden', 'false');
        });
      };
    });
  }

  function initModals() {
    $$('[data-ai-modal-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-ai-modal-open');
        var m = document.getElementById(id);
        if (m) { m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); }
      });
    });
    $$('[data-ai-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var m = btn.closest('.ai-modal');
        if (m) { m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); }
      });
    });
    var editForm = $('#ai-car-edit-form');
    if (editForm) {
      editForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var id = $('#ai-car-edit-id').value;
        var ov = getOverrides();
        ov[id] = {
          title: $('#ai-car-edit-title').value,
          price: parseFloat($('#ai-car-edit-price').value) || 0,
          excerpt: $('#ai-car-edit-excerpt').value
        };
        saveJson(STORAGE_OVERRIDES, ov);
        toast('Изменения сохранены');
        var m = $('#ai-car-edit-modal');
        if (m) { m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); }
        refreshCatalog();
        renderHomePreview();
      });
    }
  }

  function initCatalogAdmin() {
    var toggle = $('#ai-catalog-admin-toggle');
    var panel = $('#ai-catalog-admin-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var open = panel.hidden;
        panel.hidden = !open;
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    var syncBtn = $('#ai-parser-sync-btn');
    if (syncBtn) {
      syncBtn.addEventListener('click', function () {
        toast('Синхронизация завершена (демо)');
        refreshCatalog();
      });
    }
    var statusBtn = $('#ai-api-status-btn');
    var statusPanel = $('#ai-api-status');
    if (statusBtn && statusPanel) {
      statusBtn.addEventListener('click', function () {
        statusPanel.hidden = false;
        statusPanel.className = 'ai-api-status is-ok';
        statusPanel.innerHTML = '<div class="ai-api-status__badge">Работает</div><div class="ai-api-status__row">Демо: JSON-каталог · 24 авто</div>';
      });
    }
  }

  function initLiteVE() {
    var fab = $('#ai-ve-fab');
    var panel = $('#ai-ve-panel');
    if (!fab || !panel) return;

    fab.addEventListener('click', function () {
      var open = panel.getAttribute('aria-hidden') !== 'true';
      panel.setAttribute('aria-hidden', open ? 'true' : 'false');
      fab.setAttribute('aria-expanded', open ? 'false' : 'true');
      panel.classList.toggle('is-open', !open);
    });
    var close = $('#ai-ve-close');
    if (close) close.addEventListener('click', function () {
      panel.setAttribute('aria-hidden', 'true');
      panel.classList.remove('is-open');
      fab.setAttribute('aria-expanded', 'false');
    });

    $$('.ai-ve-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var name = tab.getAttribute('data-ve-tab');
        $$('.ai-ve-tab').forEach(function (t) { t.classList.toggle('is-active', t === tab); });
        $$('.ai-ve-pane').forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-ve-pane') === name); });
      });
    });

    var blocks = $$('[data-ai-ve-block]');
    var list = $('#ai-ve-blocks');
    if (list) {
      list.innerHTML = blocks.map(function (el, i) {
        var label = el.getAttribute('data-ai-ve-label') || ('Блок ' + (i + 1));
        return '<li class="ai-ve-blocks__item"><button type="button" class="ai-ve-blocks__btn" data-ve-scroll="#' + el.id + '">' + label + '</button></li>';
      }).join('');
      $$('[data-ve-scroll]', list).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var t = document.querySelector(btn.getAttribute('data-ve-scroll'));
          if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }

    var pkg = getPkg();
    var themesEl = $('#ai-ve-design-themes');
    if (themesEl) {
      var themeLabels = { classic: 'Classic', showroom: 'Showroom', harbor: 'Harbor' };
      themesEl.innerHTML = pkg.designThemes.map(function (slug) {
        return '<button type="button" class="ai-ve-design-theme' + (slug === pkg.designTheme ? ' is-active' : '') + '" data-design-theme="' + slug + '">' + themeLabels[slug] + '</button>';
      }).join('');
      $$('[data-design-theme]', themesEl).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var slug = btn.getAttribute('data-design-theme');
          document.body.classList.remove('ai-design-classic', 'ai-design-showroom', 'ai-design-harbor');
          document.body.classList.add('ai-design-' + slug);
          $$('[data-design-theme]', themesEl).forEach(function (b) { b.classList.toggle('is-active', b === btn); });
          toast('Тема: ' + themeLabels[slug]);
        });
      });
    }

    var colorsEl = $('#ai-ve-colors');
    if (colorsEl) {
      var presets = [
        { name: 'Ocean', primary: '#0B1F33', accent: '#1DB8A6' },
        { name: 'Sunset', primary: '#2D1B4E', accent: '#FF6B4A' },
        { name: 'Forest', primary: '#1A2E1A', accent: '#4CAF50' }
      ];
      colorsEl.innerHTML = presets.map(function (p) {
        return '<button type="button" class="ai-ve-color-preset" data-primary="' + p.primary + '" data-accent="' + p.accent + '">' + p.name + '</button>';
      }).join('');
      $$('.ai-ve-color-preset', colorsEl).forEach(function (btn) {
        btn.addEventListener('click', function () {
          document.documentElement.style.setProperty('--ai-primary', btn.getAttribute('data-primary'));
          document.documentElement.style.setProperty('--ai-accent', btn.getAttribute('data-accent'));
          toast('Палитра применена');
        });
      });
    }

    var savePage = $('#ai-ve-save-page');
    if (savePage) {
      savePage.addEventListener('click', function () {
        var heroTitle = $('#ai-ve-hero-title');
        if (heroTitle) {
          var val = $('#ai-ve-field-hero-title');
          if (val && val.value) {
            heroTitle.textContent = val.value;
          }
        }
        toast('Настройки страницы сохранены (демо)');
      });
    }

    $$('[data-ai-ve-block]').forEach(function (block) {
      if (block.querySelector('.ai-ve-block-tools')) return;
      var tools = document.createElement('div');
      tools.className = 'ai-ve-block-tools';
      tools.setAttribute('data-demo-admin', '');
      tools.innerHTML = '<button type="button" class="ai-btn ai-btn--ghost ai-btn--sm" data-ve-edit-block>✎ Блок</button>';
      block.style.position = 'relative';
      block.appendChild(tools);
      tools.querySelector('[data-ve-edit-block]').addEventListener('click', function () {
        var modal = $('#ai-ve-modal');
        if (modal) {
          modal.hidden = false;
          modal.setAttribute('aria-hidden', 'false');
          modal.classList.add('is-open');
          $('#ai-ve-modal-title').textContent = block.getAttribute('data-ai-ve-label') || 'Блок';
          var t = $('[data-ai-ve-title]', block);
          var s = $('[data-ai-ve-subtitle]', block);
          if ($('#ai-ve-field-title')) $('#ai-ve-field-title').value = t ? t.textContent.trim() : '';
          if ($('#ai-ve-field-subtitle')) $('#ai-ve-field-subtitle').value = s ? s.textContent.trim() : '';
          modal._target = block;
        }
      });
    });

    var modal = $('#ai-ve-modal');
    if (modal) {
      $$('[data-ai-ve-modal-close]', modal).forEach(function (btn) {
        btn.addEventListener('click', function () {
          modal.hidden = true;
          modal.setAttribute('aria-hidden', 'true');
          modal.classList.remove('is-open');
        });
      });
      var apply = $('#ai-ve-modal-apply');
      if (apply) {
        apply.addEventListener('click', function () {
          var block = modal._target;
          if (block) {
            var t = $('[data-ai-ve-title]', block);
            var s = $('[data-ai-ve-subtitle]', block);
            if (t && $('#ai-ve-field-title')) t.textContent = $('#ai-ve-field-title').value;
            if (s && $('#ai-ve-field-subtitle')) s.textContent = $('#ai-ve-field-subtitle').value;
          }
          modal.hidden = true;
          modal.classList.remove('is-open');
          toast('Блок обновлён');
        });
      }
    }
  }

  function initSiteUi() {
    var burger = $('.ai-burger');
    var menu = $('#ai-mobile-menu');
    if (burger && menu) {
      burger.addEventListener('click', function () {
        var open = menu.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    var cookie = $('.ai-cookie');
    var accept = $('[data-cookie-accept]');
    if (cookie && accept && !localStorage.getItem('ai_cookie_ok')) {
      cookie.classList.add('is-visible');
      accept.addEventListener('click', function () {
        localStorage.setItem('ai_cookie_ok', '1');
        cookie.classList.remove('is-visible');
      });
    } else if (cookie) {
      cookie.classList.remove('is-visible');
    }
    $$('.ai-faq-item__question').forEach(function (q) {
      q.addEventListener('click', function () {
        q.parentElement.classList.toggle('is-open');
      });
    });
  }

  function initFavoritesCompare() {
    document.body.addEventListener('click', function (e) {
      var fav = e.target.closest('[data-ai-fav]');
      var cmp = e.target.closest('[data-ai-compare]');
      if (fav) {
        e.preventDefault();
        fav.classList.toggle('is-active');
        toast(fav.classList.contains('is-active') ? 'Добавлено в избранное' : 'Убрано из избранного');
        updateFavCount();
      }
      if (cmp) {
        e.preventDefault();
        cmp.classList.toggle('is-active');
        toast('Сравнение (демо)');
      }
    });
    var toggle = $('#ai-fav-bar-toggle');
    var panel = $('#ai-fav-bar-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var open = panel.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  function updateFavCount() {
    var n = $$('[data-ai-fav].is-active').length;
    $$('#ai-fav-count, [data-ai-fav-count-desk]').forEach(function (el) {
      if (el) el.textContent = String(n);
    });
  }

  function initCalculator() {
    var form = $('#ai-calc-form');
    var result = $('#ai-calc-result');
    if (!form || !result) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var price = parseFloat(($('#ai-calc-price') || {}).value) || 2500000;
      var year = parseInt(($('#ai-calc-year') || {}).value, 10) || 2022;
      var cc = parseInt(($('#ai-calc-engine') || {}).value, 10) || 2000;
      var age = Math.max(0, new Date().getFullYear() - year);
      var duty = price * (0.08 + age * 0.005);
      var util = cc > 3000 ? 5200 * 30 : 3400 * 30;
      var logistics = 180000;
      var total = price + duty + util + logistics;
      $('.ai-calculator__total', result).textContent = formatPrice(total);
      $('.ai-calculator__breakdown', result).innerHTML =
        '<p>Авто: ' + formatPrice(price) + '</p>' +
        '<p>Пошлина (ориент.): ' + formatPrice(duty) + '</p>' +
        '<p>Утильсбор: ' + formatPrice(util) + '</p>' +
        '<p>Логистика: ' + formatPrice(logistics) + '</p>';
    });
  }

  function init() {
    initRoleBar();
    applyPackageFeatures();
    initModals();
    initCatalogAdmin();
    initLiteVE();
    initSiteUi();
    initFavoritesCompare();
    initCalculator();
    if ($('#ai-catalog-grid')) refreshCatalog();
    if ($('#ai-home-catalog-grid')) renderHomePreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
