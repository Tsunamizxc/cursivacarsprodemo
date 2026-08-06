/**
 * AutoImport Netlify demo — role switcher, VE/catalog AJAX mocks, admin gate.
 */
(function () {
  'use strict';

  var STORAGE_ROLE = 'ai_demo_role';
  var script = document.currentScript || document.querySelector('script[data-demo-package]');
  var pkgSlug = (script && script.getAttribute('data-demo-package')) || 'start';

  var ADMIN_CLICK_SEL = [
    '[data-ai-edit-block]',
    '[data-ai-edit-car]',
    '[data-ai-hide-car]',
    '[data-ai-edit-override]',
    '[data-ai-unhide-car]',
    '[data-ai-catalog-admin-toggle]',
    '[data-ai-parser-sync]',
    '[data-ai-api-status]',
    '[data-ai-encar-pager-toggle]',
    '[data-ai-encar-fetch]',
    '[data-ai-encar-pager-close]',
    '#ai-ve-fab',
    '.ai-ve-block-item__drag',
    '.ai-ve-tab',
    '.ai-ve-btn',
    '#ai-ve-save-page',
    '#ai-ve-save-colors',
    '#ai-ve-modal-apply',
    '#ai-ve-save-block',
    '#ai-ve-reset-all-blocks',
    '#ai-ve-pick-image',
    '#ai-ve-clear-image',
    '.ai-block-toolbar__btn'
  ].join(',');

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

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

  function isAdmin() {
    return document.documentElement.classList.contains('is-demo-admin');
  }

  function blocksStorageKey() {
    var postId = (window.aiVisualEditor && window.aiVisualEditor.postId) || '0';
    var page = (location.pathname.split('/').pop() || 'index.html');
    return 'ai_demo_ve_blocks_' + postId + '_' + page;
  }

  function cloneBlocks(list) {
    try {
      return JSON.parse(JSON.stringify(list || []));
    } catch (e) {
      return (list || []).slice();
    }
  }

  function getDemoBlocks() {
    if (!window.aiVisualEditor) return [];
    try {
      var stored = localStorage.getItem(blocksStorageKey());
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) {
          window.aiVisualEditor.blocks = parsed;
          return parsed;
        }
      }
    } catch (e) { /* ignore */ }
    var blocks = cloneBlocks(window.aiVisualEditor.blocks || []);
    saveDemoBlocks(blocks);
    return blocks;
  }

  function saveDemoBlocks(blocks) {
    if (window.aiVisualEditor) {
      window.aiVisualEditor.blocks = blocks;
    }
    try {
      localStorage.setItem(blocksStorageKey(), JSON.stringify(blocks));
    } catch (e) { /* ignore */ }
  }

  function closeAdminUi() {
    $$('.ai-modal.is-open, .ai-modal[aria-hidden="false"]').forEach(function (m) {
      m.classList.remove('is-open');
      m.setAttribute('aria-hidden', 'true');
    });
    var panel = $('.ai-ve-panel');
    if (panel) {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
    }
    var modal = $('.ai-ve-modal');
    if (modal) {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
    }
    var backdrop = $('.ai-ve-backdrop');
    if (backdrop) {
      backdrop.hidden = true;
      backdrop.classList.remove('is-visible');
    }
    document.body.classList.remove('ai-ve-open');
    var fab = $('#ai-ve-fab');
    if (fab) fab.setAttribute('aria-expanded', 'false');
    var catalogPanel = $('#ai-catalog-admin-panel');
    if (catalogPanel) catalogPanel.hidden = true;
    var catalogToggle = $('[data-ai-catalog-admin-toggle]');
    if (catalogToggle) catalogToggle.setAttribute('aria-expanded', 'false');
  }

  function setRole(role) {
    var admin = role === 'admin';
    document.documentElement.classList.toggle('is-demo-admin', admin);
    document.body.classList.toggle('ai-demo-admin', admin);
    localStorage.setItem(STORAGE_ROLE, role);
    $$('[data-demo-role]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-demo-role') === role);
    });
    if (!admin) {
      closeAdminUi();
    }
  }

  function initRoleBar() {
    $$('[data-demo-role]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setRole(btn.getAttribute('data-demo-role'));
      });
    });
    setRole(localStorage.getItem(STORAGE_ROLE) || 'user');
  }

  /** Block admin interactions in visitor mode (capture phase). */
  function initAdminGate() {
    document.addEventListener('click', function (e) {
      if (isAdmin()) return;
      if (e.target.closest('.demo-role-bar')) return;
      var hit = e.target.closest(ADMIN_CLICK_SEL);
      if (!hit) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }, true);

    document.addEventListener('mousedown', function (e) {
      if (isAdmin()) return;
      if (e.target.closest('.ai-ve-block-item__drag')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }, true);

    document.addEventListener('submit', function (e) {
      if (isAdmin()) return;
      var form = e.target;
      if (form && (form.id === 'ai-car-edit-form' || form.closest('.ai-ve-panel'))) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }

  function stubWpMedia() {
    if (window.wp && window.wp.media) return;
    window.wp = window.wp || {};
    window.wp.media = function () {
      var frame = {
        on: function (ev, cb) {
          if (ev === 'select') frame._selectCb = cb;
          return frame;
        },
        open: function () {
          if (!isAdmin()) return;
          var url = window.prompt('URL изображения для демо:', 'https://picsum.photos/seed/autoimport/800/500');
          if (!url || !frame._selectCb) return;
          frame._selectCb({
            first: function () {
              return { toJSON: function () { return { id: 0, url: url }; } };
            }
          });
        },
        close: function () {}
      };
      return frame;
    };
  }

  function fdGet(fd, key) {
    return fd && fd.get ? fd.get(key) : null;
  }

  function fdGetAll(fd, key) {
    if (!fd || !fd.getAll) return [];
    var withBrackets = fd.getAll(key + '[]');
    if (withBrackets.length) return withBrackets;
    return fd.getAll(key);
  }

  function handleVeAjax(action, fd) {
    var blocks = getDemoBlocks();
    var ok = function (data) {
      return { success: true, data: data || {} };
    };

    if (action === 'ai_ve_reorder') {
      var order = fdGetAll(fd, 'order').map(function (v) { return parseInt(v, 10); });
      if (!order.length || !blocks.length) {
        return ok({ blocks: blocks });
      }
      var reordered = order.map(function (oldIdx, newIdx) {
        if (!blocks[oldIdx]) return null;
        var b = cloneBlocks([blocks[oldIdx]])[0];
        b.index = newIdx;
        return b;
      }).filter(Boolean);
      if (reordered.length !== blocks.length) {
        return { success: false, data: { message: 'Order mismatch' } };
      }
      saveDemoBlocks(reordered);
      return ok({ blocks: reordered });
    }

    if (action === 'ai_ve_toggle_block') {
      var tIdx = parseInt(fdGet(fd, 'index'), 10);
      var hidden = fdGet(fd, 'hidden') === '1' || fdGet(fd, 'hidden') === 1;
      blocks.forEach(function (b) {
        if (b.index === tIdx) b.hidden = hidden;
      });
      saveDemoBlocks(blocks);
      return ok({});
    }

    if (action === 'ai_ve_set_preset') {
      var pIdx = parseInt(fdGet(fd, 'index'), 10);
      var preset = fdGet(fd, 'preset') || 'v1';
      blocks.forEach(function (b) {
        if (b.index === pIdx) b.preset = preset;
      });
      saveDemoBlocks(blocks);
      return ok({ index: pIdx, preset: preset });
    }

    if (action === 'ai_ve_update_block') {
      var uIdx = parseInt(fdGet(fd, 'index'), 10);
      blocks.forEach(function (b) {
        if (b.index !== uIdx) return;
        var title = fdGet(fd, 'title');
        var subtitle = fdGet(fd, 'subtitle');
        if (title !== null) b.title = title;
        if (subtitle !== null) b.subtitle = subtitle;
        if (fdGet(fd, 'preset')) b.preset = fdGet(fd, 'preset');
        if (fdGet(fd, 'btn1_text')) b.btn1_text = fdGet(fd, 'btn1_text');
        if (fdGet(fd, 'btn1_link')) b.btn1_link = fdGet(fd, 'btn1_link');
        if (fdGet(fd, 'btn2_text')) b.btn2_text = fdGet(fd, 'btn2_text');
        if (fdGet(fd, 'btn2_link')) b.btn2_link = fdGet(fd, 'btn2_link');
        if (fdGet(fd, 'cards_count')) b.cards_count = parseInt(fdGet(fd, 'cards_count'), 10);
        if (fdGet(fd, 'card_style')) b.card_style = fdGet(fd, 'card_style');
        if (fdGet(fd, 'grid_columns')) b.grid_columns = parseInt(fdGet(fd, 'grid_columns'), 10);
        if (fdGet(fd, 'grid_rows')) b.grid_rows = parseInt(fdGet(fd, 'grid_rows'), 10);
        if (fdGet(fd, 'grid_cards_per_row')) b.grid_cards_per_row = parseInt(fdGet(fd, 'grid_cards_per_row'), 10);
        if (fdGet(fd, 'image_url')) b.image_url = fdGet(fd, 'image_url');
      });
      saveDemoBlocks(blocks);
      return ok({ blocks: blocks });
    }

    if (action === 'ai_ve_set_block_image') {
      var iIdx = parseInt(fdGet(fd, 'index'), 10);
      var imgUrl = fdGet(fd, 'image_url') || '';
      blocks.forEach(function (b) {
        if (b.index === iIdx) {
          b.image_url = imgUrl;
          b.image_id = parseInt(fdGet(fd, 'image_id'), 10) || 0;
        }
      });
      saveDemoBlocks(blocks);
      return ok({ index: iIdx, image_url: imgUrl });
    }

    if (action === 'ai_ve_reset_block') {
      var rIdx = parseInt(fdGet(fd, 'index'), 10);
      blocks.forEach(function (b) {
        if (b.index === rIdx) {
          b.preset = 'v1';
          b.card_style = 'c1';
          if (b.fallback_image) b.image_url = b.fallback_image;
        }
      });
      saveDemoBlocks(blocks);
      var rb = blocks.find(function (b) { return b.index === rIdx; });
      return ok({ blocks: blocks, image_url: rb ? (rb.fallback_image || rb.image_url || '') : '' });
    }

    if (action === 'ai_ve_reset_all_blocks') {
      blocks.forEach(function (b) {
        b.preset = 'v1';
        b.card_style = 'c1';
        if (b.fallback_image) b.image_url = b.fallback_image;
      });
      saveDemoBlocks(blocks);
      return ok({ blocks: blocks });
    }

    if (action === 'ai_ve_set_design_theme') {
      var theme = fdGet(fd, 'theme') || 'classic';
      document.body.classList.remove('ai-design-classic', 'ai-design-showroom', 'ai-design-harbor');
      document.body.classList.add('ai-design-' + theme);
      return ok({ theme: theme });
    }

    if (action === 'ai_ve_set_color' || action === 'ai_ve_set_custom_colors' || action === 'ai_ve_save_page' ||
        action === 'ai_ve_save_site' || action === 'ai_ve_save_catalog' || action === 'ai_ve_save_car') {
      return ok({ message: 'Сохранено (демо)' });
    }

    if (action.indexOf('ai_ve_') === 0) {
      return ok({});
    }

    return null;
  }

  function handleCatalogAjax(action) {
    if (action === 'ai_catalog_hide_car' || action === 'ai_catalog_restore_car' ||
        action === 'ai_catalog_save_car_override' || action === 'ai_catalog_unhide_car') {
      if (!isAdmin()) {
        return { success: false, data: { message: 'Недоступно в режиме посетителя' } };
      }
      toast('Сохранено (демо)');
      return { success: true, data: { hidden: {}, message: 'Сохранено (демо)' } };
    }
    if (action === 'ai_parser_sync') {
      toast('Синхронизация недоступна в демо');
      return { success: false, data: { message: 'Демо-режим' } };
    }
    return null;
  }

  function patchFetch() {
    var native = window.fetch;
    if (!native || native._aiDemoPatched) return;

    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      if (url.indexOf('admin-ajax') === -1 && url.indexOf('admin-ajax.stub') === -1) {
        return native.apply(this, arguments);
      }

      var body = init && init.body;
      var fd = body instanceof FormData ? body : null;
      var action = fd ? (fdGet(fd, 'action') || '') : '';

      if (action.indexOf('ai_ve_') === 0 && !isAdmin()) {
        return Promise.resolve(new Response(JSON.stringify({
          success: false,
          data: { message: 'Недоступно в режиме посетителя' }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }

      var ve = handleVeAjax(action, fd);
      if (ve) {
        return Promise.resolve(new Response(JSON.stringify(ve), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      if (action === 'ai_calc') {
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: { total: '3 250 000 ₽', breakdown: [] }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }

      if (action === 'ai_submit_lead') {
        toast('Заявка отправлена (демо)');
        return Promise.resolve(new Response(JSON.stringify({ success: true, data: {} }), {
          status: 200, headers: { 'Content-Type': 'application/json' }
        }));
      }

      var catalog = handleCatalogAjax(action);
      if (catalog) {
        return Promise.resolve(new Response(JSON.stringify(catalog), {
          status: 200, headers: { 'Content-Type': 'application/json' }
        }));
      }

      return Promise.resolve(new Response(JSON.stringify({ success: true, data: {} }), {
        status: 200, headers: { 'Content-Type': 'application/json' }
      }));
    };
    window.fetch._aiDemoPatched = true;
  }

  function applyPackageFeatures() {
    var pkg = (window.AI_PACKAGES && window.AI_PACKAGES[pkgSlug]) || {};
    if (!pkg.label) return;

    if (!pkg.favorites) {
      $$('[data-feature="favorites"], .ai-fav-bar__btn[href*="favorites"]').forEach(function (el) {
        el.setAttribute('data-feature-hidden', 'true');
      });
    }
    if (!pkg.compareCars) {
      $$('[data-feature="compare"], .ai-fav-bar__btn[href*="compare"]').forEach(function (el) {
        el.setAttribute('data-feature-hidden', 'true');
      });
    }
    if (!pkg.compareCalculator) {
      $$('[data-feature="compare_calc"]').forEach(function (el) {
        el.setAttribute('data-feature-hidden', 'true');
      });
    }
  }

  stubWpMedia();
  patchFetch();
  initRoleBar();
  initAdminGate();
  applyPackageFeatures();

  document.addEventListener('DOMContentLoaded', function () {
    applyPackageFeatures();
    if (window.aiVisualEditor) {
      getDemoBlocks();
    }
    if (window.aiTheme && !window.aiTheme.homeUrl) {
      window.aiTheme.homeUrl = './';
    }
  });
})();
