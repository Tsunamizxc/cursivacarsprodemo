/**
 * AutoImport — Front-end Visual Editor Panel
 * Depends on: SortableJS, aiVisualEditor (wp_localize_script), wp.media
 */
(function () {
	'use strict';

	if (typeof aiVisualEditor === 'undefined') {
		return;
	}

	var cfg = aiVisualEditor;
	var i18n = cfg.i18n || {};
	var blocks = Array.isArray(cfg.blocks) ? cfg.blocks.slice() : [];
	var activeIndex = null;
	var sortableInstance = null;
	var statusTimer = null;

	var PRESETS = ['v1', 'v2', 'v3', 'v4'];
	var CARD_STYLES = ['c1', 'c2', 'c3', 'c4'];
	var CARD_ITEM_SELECTORS = ['.ai-card-item', '.ai-car-card', '.ai-step', '.ai-adv-card', '.ai-faq-item'];

	var els = {};

	function $(id) {
		return document.getElementById(id);
	}

	function qs(sel, root) {
		return (root || document).querySelector(sel);
	}

	function qsa(sel, root) {
		return Array.prototype.slice.call((root || document).querySelectorAll(sel));
	}

	function cacheElements() {
		els.fab = $('ai-ve-fab');
		els.panel = $('ai-ve-panel');
		els.backdrop = $('ai-ve-backdrop');
		els.close = $('ai-ve-close');
		els.openGlobal = $('ai-ve-open-global');
		els.pageTitle = $('ai-ve-page-title');
		els.blocksList = $('ai-ve-blocks');
		els.blocksHint = $('ai-ve-blocks-hint');
		els.resetAllBlocks = $('ai-ve-reset-all-blocks');
		els.blocksFoot = $('ai-ve-blocks-foot');
		els.colors = $('ai-ve-colors');
		els.designThemes = $('ai-ve-design-themes');
		els.status = $('ai-ve-status');
		els.editAdmin = $('ai-ve-edit-admin');
		els.tabs = qsa('.ai-ve-tab');
		els.panes = qsa('.ai-ve-pane');

		els.modal = $('ai-ve-modal');
		els.modalTitle = $('ai-ve-modal-title');
		els.modalSub = $('ai-ve-modal-sub');
		els.fieldTitle = $('ai-ve-field-title');
		els.fieldSubtitle = $('ai-ve-field-subtitle');
		els.fieldBtn1 = $('ai-ve-field-btn1');
		els.fieldBtn1Link = $('ai-ve-field-btn1-link');
		els.fieldBtn2 = $('ai-ve-field-btn2');
		els.fieldBtn2Link = $('ai-ve-field-btn2-link');
		els.fieldPreset = $('ai-ve-field-preset');
		els.presetThumbs = $('ai-ve-preset-thumbs');
		els.fieldCardsCount = $('ai-ve-field-cards-count');
		els.fieldGridColumns = $('ai-ve-field-grid-columns');
		els.fieldGridRows = $('ai-ve-field-grid-rows');
		els.fieldGridPerRow = $('ai-ve-field-grid-per-row');
		els.fieldCardStyle = $('ai-ve-field-card-style');
		els.cardStyles = $('ai-ve-card-styles');
		els.cardsFields = $('ai-ve-cards-fields');
		els.cardsNa = $('ai-ve-cards-na');
		els.imageFields = $('ai-ve-image-fields');
		els.imageNa = $('ai-ve-image-na');
		els.imagePreview = $('ai-ve-image-preview');
		els.imagePreviewImg = $('ai-ve-image-preview-img');
		els.imagePreviewEmpty = $('ai-ve-image-preview-empty');
		els.fieldImageId = $('ai-ve-field-image-id');
		els.fieldImageUrl = $('ai-ve-field-image-url');
		els.pickImage = $('ai-ve-pick-image');
		els.clearImage = $('ai-ve-clear-image');
		els.saveBlock = $('ai-ve-save-block');
		els.modalTabs = qsa('[data-modal-tab]');
		els.modalPanes = qsa('[data-modal-pane]');
		els.mediaFrame = null;

		els.cPrimary = $('ai-ve-c-primary');
		els.cSecondary = $('ai-ve-c-secondary');
		els.cAccent = $('ai-ve-c-accent');
		els.cBg = $('ai-ve-c-bg');
		els.cText = $('ai-ve-c-text');
		els.colorPreview = $('ai-ve-color-preview');
		els.saveColors = $('ai-ve-save-colors');

		els.pageFieldTitle = $('ai-ve-page-field-title');
		els.pageFieldExcerpt = $('ai-ve-page-field-excerpt');
		els.pageFieldSlug = $('ai-ve-page-field-slug');
		els.pageFieldsDefault = $('ai-ve-page-fields-default');
		els.catalogFields = $('ai-ve-catalog-fields');
		els.catalogTitle = $('ai-ve-catalog-title');
		els.catalogSubtitle = $('ai-ve-catalog-subtitle');
		els.catalogSource = $('ai-ve-catalog-source');
		els.carFields = $('ai-ve-car-fields');
		els.apiCarNote = $('ai-ve-api-car-note');
		els.carTitle = $('ai-ve-car-title');
		els.carPrice = $('ai-ve-car-price');
		els.carYear = $('ai-ve-car-year');
		els.carMileage = $('ai-ve-car-mileage');
		els.carEngine = $('ai-ve-car-engine');
		els.carFuel = $('ai-ve-car-fuel');
		els.carTransmission = $('ai-ve-car-transmission');
		els.carDrive = $('ai-ve-car-drive');
		els.carColor = $('ai-ve-car-color');
		els.carCountry = $('ai-ve-car-country');
		els.carStatus = $('ai-ve-car-status');
		els.carContent = $('ai-ve-car-content');
		els.carImageId = $('ai-ve-car-image-id');
		els.carImagePreview = $('ai-ve-car-image-preview');
		els.carImagePreviewImg = $('ai-ve-car-image-preview-img');
		els.carImagePreviewEmpty = $('ai-ve-car-image-preview-empty');
		els.carPickImage = $('ai-ve-car-pick-image');
		els.carClearImage = $('ai-ve-car-clear-image');
		els.siteLogo = $('ai-ve-site-logo');
		els.sitePhone = $('ai-ve-site-phone');
		els.sitePhone2 = $('ai-ve-site-phone2');
		els.siteEmail = $('ai-ve-site-email');
		els.siteCompany = $('ai-ve-site-company');
		els.siteAddress = $('ai-ve-site-address');
		els.siteHours = $('ai-ve-site-hours');
		els.siteTagline = $('ai-ve-site-tagline');
		els.savePage = $('ai-ve-save-page');
		els.carMediaFrame = null;
	}

	function escapeHtml(str) {
		return String(str == null ? '' : str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function showStatus(msg, type) {
		if (!els.status) {
			return;
		}
		els.status.textContent = msg || '';
		els.status.className = 'ai-ve-status' + (type ? ' is-' + type : '');
		clearTimeout(statusTimer);
		if (msg && type) {
			statusTimer = setTimeout(function () {
				els.status.textContent = '';
				els.status.className = 'ai-ve-status';
			}, 3200);
		}
	}

	function ajax(action, data) {
		var body = new FormData();
		body.append('action', action);
		body.append('nonce', cfg.nonce || '');
		Object.keys(data || {}).forEach(function (key) {
			var val = data[key];
			if (val === undefined || val === null) {
				return;
			}
			if (Object.prototype.toString.call(val) === '[object Array]') {
				val.forEach(function (item) {
					body.append(key + '[]', item);
				});
				return;
			}
			body.append(key, val);
		});
		return fetch(cfg.ajaxUrl, {
			method: 'POST',
			credentials: 'same-origin',
			body: body
		}).then(function (res) {
			return res.json();
		});
	}

	function shortPresetLabel(key) {
		var k = key || 'v1';
		if (cfg.presetLabels && cfg.presetLabels[k]) {
			return k.toUpperCase() + ' · ' + cfg.presetLabels[k];
		}
		return k;
	}

	function presetClass(preset) {
		return 'ai-block-style-' + (preset || 'v1');
	}

	function cardStyleClass(style) {
		return 'ai-cards-' + (style || 'c1');
	}

	function getPageBlock(index) {
		return document.getElementById('ai-block-' + index);
	}

	function scrollToBlock(index) {
		var el = getPageBlock(index);
		if (!el) {
			return;
		}
		var adminBar = document.getElementById('wpadminbar');
		var offset = adminBar ? adminBar.offsetHeight : 0;
		offset += 16;
		var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
		window.scrollTo({ top: top, behavior: 'smooth' });
		el.classList.add('is-ve-flash');
		setTimeout(function () {
			el.classList.remove('is-ve-flash');
		}, 900);
	}

	function syncBlocksData(list) {
		blocks = Array.isArray(list) ? list.slice() : [];
		cfg.blocks = blocks;
	}

	function openPanel() {
		if (!els.panel) {
			return;
		}
		els.panel.classList.add('is-open');
		els.panel.setAttribute('aria-hidden', 'false');
		if (els.backdrop) {
			els.backdrop.hidden = false;
			els.backdrop.classList.add('is-visible');
		}
		if (els.fab) {
			els.fab.setAttribute('aria-expanded', 'true');
		}
		document.body.classList.add('ai-ve-open');
	}

	function closePanel() {
		if (!els.panel) {
			return;
		}
		els.panel.classList.remove('is-open');
		els.panel.setAttribute('aria-hidden', 'true');
		if (els.backdrop) {
			els.backdrop.classList.remove('is-visible');
			setTimeout(function () {
				if (els.backdrop && !els.backdrop.classList.contains('is-visible')) {
					els.backdrop.hidden = true;
				}
			}, 280);
		}
		if (els.fab) {
			els.fab.setAttribute('aria-expanded', 'false');
		}
		document.body.classList.remove('ai-ve-open');
	}

	function isModalOpen() {
		return !!(els.modal && els.modal.classList.contains('is-open'));
	}

	function openModal(index, mode) {
		var block = blocks.find(function (b) {
			return b.index === index;
		});
		if (!block || !els.modal) {
			return;
		}
		activeIndex = index;
		populateModalFields(block);
		var tab = 'look';
		if (mode === 'text') {
			tab = 'text';
		} else if (mode === 'cards') {
			tab = 'cards';
		} else if (mode === 'image') {
			tab = 'image';
		}
		switchModalTab(tab);
		els.modal.hidden = false;
		els.modal.setAttribute('aria-hidden', 'false');
		els.modal.classList.add('is-open');
		document.body.classList.add('ai-ve-modal-open');
		if (els.modalTitle) {
			els.modalTitle.textContent = i18n.editBlock || 'Редактирование блока';
		}
		if (els.modalSub) {
			els.modalSub.textContent = block.label || block.layout || '';
		}
		qsa('.ai-ve-block-item', els.blocksList).forEach(function (item) {
			item.classList.toggle('is-active', parseInt(item.getAttribute('data-ve-block-index'), 10) === index);
		});
		scrollToBlock(index);
	}

	function closeModal() {
		activeIndex = null;
		if (!els.modal) {
			return;
		}
		els.modal.classList.remove('is-open');
		els.modal.setAttribute('aria-hidden', 'true');
		els.modal.hidden = true;
		document.body.classList.remove('ai-ve-modal-open');
		qsa('.ai-ve-block-item', els.blocksList).forEach(function (item) {
			item.classList.remove('is-active');
		});
	}

	function switchTab(tabName) {
		els.tabs.forEach(function (tab) {
			var isActive = tab.getAttribute('data-ve-tab') === tabName;
			tab.classList.toggle('is-active', isActive);
			tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
		});
		els.panes.forEach(function (pane) {
			pane.classList.toggle('is-active', pane.getAttribute('data-ve-pane') === tabName);
		});
	}

	function switchModalTab(tabName) {
		if (!blockHasCards(activeIndex) && tabName === 'cards') {
			tabName = 'look';
		}
		if (!blockHasImage(activeIndex) && tabName === 'image') {
			tabName = 'look';
		}
		els.modalTabs.forEach(function (tab) {
			var name = tab.getAttribute('data-modal-tab');
			var isActive = name === tabName;
			tab.classList.toggle('is-active', isActive);
			if (name === 'cards') {
				tab.hidden = !blockHasCards(activeIndex);
			}
			if (name === 'image') {
				tab.hidden = !blockHasImage(activeIndex);
			}
		});
		els.modalPanes.forEach(function (pane) {
			pane.classList.toggle('is-active', pane.getAttribute('data-modal-pane') === tabName);
		});
	}

	function blockHasCards(index) {
		var block = blocks.find(function (b) {
			return b.index === index;
		});
		return !!(block && block.has_cards);
	}

	function blockHasImage(index) {
		var block = blocks.find(function (b) {
			return b.index === index;
		});
		return !!(block && block.has_image);
	}

	function applyPresetToBlock(index, preset) {
		var el = getPageBlock(index);
		if (!el) {
			return;
		}
		PRESETS.forEach(function (p) {
			el.classList.remove('ai-block-style-' + p);
		});
		el.classList.add(presetClass(preset));
		el.setAttribute('data-ai-preset', preset);
	}

	function applyCardStyleToBlock(index, style) {
		var el = getPageBlock(index);
		if (!el) {
			return;
		}
		CARD_STYLES.forEach(function (c) {
			el.classList.remove('ai-cards-' + c);
		});
		el.classList.add(cardStyleClass(style));
		el.setAttribute('data-ai-card-style', style);
	}

	function applyCardsCount(index, count) {
		var el = getPageBlock(index);
		if (!el || !count || count < 1) {
			return;
		}
		CARD_ITEM_SELECTORS.forEach(function (selector) {
			var items = qsa(selector, el);
			items.forEach(function (item, i) {
				item.hidden = i >= count;
				item.style.display = i >= count ? 'none' : '';
			});
		});
	}

	function updateBlockListItemPreset(index, preset) {
		var item = qs('[data-ve-block-index="' + index + '"]', els.blocksList);
		if (!item) {
			return;
		}
		var chip = qs('.ai-ve-preset-chip', item);
		if (chip) {
			chip.className = 'ai-ve-preset-chip ai-ve-preset-chip--' + preset;
			chip.textContent = shortPresetLabel(preset);
		}
	}

	function renderPresetThumbs(selected) {
		if (!els.presetThumbs) {
			return;
		}
		els.presetThumbs.innerHTML = '';
		PRESETS.forEach(function (key) {
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'ai-ve-preset-thumb' + (key === selected ? ' is-active' : '');
			btn.setAttribute('data-preset', key);
			btn.innerHTML = '<span class="ai-ve-preset-thumb__label">' + escapeHtml(shortPresetLabel(key)) + '</span>';
			btn.addEventListener('click', function () {
				onPresetPick(key);
			});
			els.presetThumbs.appendChild(btn);
		});
		if (els.fieldPreset) {
			els.fieldPreset.value = selected || 'v1';
		}
	}

	function renderCardStyles(selected) {
		if (!els.cardStyles) {
			return;
		}
		els.cardStyles.innerHTML = '';
		CARD_STYLES.forEach(function (key) {
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'ai-ve-card-style' + (key === selected ? ' is-active' : '');
			btn.setAttribute('data-card-style', key);
			btn.textContent = (cfg.cardStyleLabels && cfg.cardStyleLabels[key]) ? cfg.cardStyleLabels[key] : key;
			btn.addEventListener('click', function () {
				onCardStylePick(key);
			});
			els.cardStyles.appendChild(btn);
		});
		if (els.fieldCardStyle) {
			els.fieldCardStyle.value = selected || 'c1';
		}
	}

	function onPresetPick(preset) {
		if (activeIndex === null) {
			return;
		}
		if (els.fieldPreset) {
			els.fieldPreset.value = preset;
		}
		qsa('.ai-ve-preset-thumb', els.presetThumbs).forEach(function (thumb) {
			thumb.classList.toggle('is-active', thumb.getAttribute('data-preset') === preset);
		});
		applyPresetToBlock(activeIndex, preset);
		updateBlockListItemPreset(activeIndex, preset);
		var blockData = blocks.find(function (b) {
			return b.index === activeIndex;
		});
		if (blockData) {
			blockData.preset = preset;
		}
		ajax('ai_ve_set_preset', {
			post_id: cfg.postId,
			index: activeIndex,
			preset: preset
		}).then(function (json) {
			showStatus((json && json.success) ? (i18n.saved || 'Сохранено') : (i18n.error || 'Ошибка'), json && json.success ? 'success' : 'error');
		}).catch(function () {
			showStatus(i18n.error || 'Ошибка сохранения', 'error');
		});
	}

	function onCardStylePick(style) {
		if (activeIndex === null) {
			return;
		}
		if (els.fieldCardStyle) {
			els.fieldCardStyle.value = style;
		}
		qsa('.ai-ve-card-style', els.cardStyles).forEach(function (btn) {
			btn.classList.toggle('is-active', btn.getAttribute('data-card-style') === style);
		});
		applyCardStyleToBlock(activeIndex, style);
		var blockData = blocks.find(function (b) {
			return b.index === activeIndex;
		});
		if (blockData) {
			blockData.card_style = style;
		}
	}

	function setImageFields(block) {
		var hasImage = !!block.has_image;
		if (els.imageFields) {
			els.imageFields.hidden = !hasImage;
		}
		if (els.imageNa) {
			els.imageNa.hidden = hasImage;
		}
		var id = block.image_id || 0;
		var url = block.image_url || block.fallback_image || '';
		if (els.fieldImageId) {
			els.fieldImageId.value = String(id);
		}
		if (els.fieldImageUrl) {
			els.fieldImageUrl.value = url;
		}
		updateImagePreview(url);
	}

	function updateImagePreview(url) {
		if (els.imagePreviewImg) {
			if (url) {
				els.imagePreviewImg.src = url;
				els.imagePreviewImg.hidden = false;
			} else {
				els.imagePreviewImg.removeAttribute('src');
				els.imagePreviewImg.hidden = true;
			}
		}
		if (els.imagePreviewEmpty) {
			els.imagePreviewEmpty.hidden = !!url;
		}
		if (els.imagePreview) {
			els.imagePreview.classList.toggle('has-image', !!url);
		}
	}

	function populateModalFields(block) {
		if (els.fieldTitle) {
			els.fieldTitle.value = block.title || '';
		}
		if (els.fieldSubtitle) {
			els.fieldSubtitle.value = block.subtitle || '';
		}
		if (els.fieldBtn1) {
			els.fieldBtn1.value = block.btn1_text || '';
		}
		if (els.fieldBtn1Link) {
			els.fieldBtn1Link.value = block.btn1_link || '';
		}
		if (els.fieldBtn2) {
			els.fieldBtn2.value = block.btn2_text || '';
		}
		if (els.fieldBtn2Link) {
			els.fieldBtn2Link.value = block.btn2_link || '';
		}
		renderPresetThumbs(block.preset || 'v1');
		var hasCards = !!block.has_cards;
		if (els.cardsFields) {
			els.cardsFields.hidden = !hasCards;
		}
		if (els.cardsNa) {
			els.cardsNa.hidden = hasCards;
		}
		var cardsCount = block.cards_count || block.count || block.items_total || 4;
		if (els.fieldCardsCount) {
			els.fieldCardsCount.value = cardsCount;
			els.fieldCardsCount.max = Math.min(48, block.items_total || 48);
			els.fieldCardsCount.min = 1;
		}
		if (els.fieldGridColumns) {
			els.fieldGridColumns.value = block.grid_columns || 3;
		}
		if (els.fieldGridRows) {
			els.fieldGridRows.value = block.grid_rows || 2;
		}
		if (els.fieldGridPerRow) {
			els.fieldGridPerRow.value = block.grid_cards_per_row || block.grid_columns || 3;
		}
		renderCardStyles(block.card_style || 'c1');
		setImageFields(block);
		if (hasCards) {
			applyCardsCount(block.index, parseInt(cardsCount, 10));
		}
	}

	function openMediaLibrary() {
		if (activeIndex === null) {
			return;
		}
		if (typeof wp === 'undefined' || !wp.media) {
			showStatus(i18n.error || 'Медиатека недоступна', 'error');
			return;
		}
		if (!els.mediaFrame) {
			els.mediaFrame = wp.media({
				title: i18n.pickImage || 'Выберите изображение',
				button: { text: i18n.pickImage || 'Использовать' },
				library: { type: 'image' },
				multiple: false
			});
			els.mediaFrame.on('select', function () {
				var attachment = els.mediaFrame.state().get('selection').first().toJSON();
				var url = attachment.url || '';
				if (attachment.sizes) {
					if (attachment.sizes.large && attachment.sizes.large.url) {
						url = attachment.sizes.large.url;
					} else if (attachment.sizes.full && attachment.sizes.full.url) {
						url = attachment.sizes.full.url;
					}
				}
				persistBlockImage(attachment.id, url);
			});
		}
		els.mediaFrame.open();
	}

	function clearBlockImage() {
		if (activeIndex === null) {
			return;
		}
		var block = blocks.find(function (b) {
			return b.index === activeIndex;
		});
		persistBlockImage(0, block && block.fallback_image ? block.fallback_image : '');
	}

	function persistBlockImage(imageId, imageUrl) {
		if (activeIndex === null) {
			return;
		}
		if (els.fieldImageId) {
			els.fieldImageId.value = String(imageId || 0);
		}
		if (els.fieldImageUrl) {
			els.fieldImageUrl.value = imageUrl || '';
		}
		updateImagePreview(imageUrl || '');
		applyImageToBlock(activeIndex, imageUrl || '');
		showStatus('…');
		ajax('ai_ve_set_block_image', {
			post_id: cfg.postId,
			index: activeIndex,
			image_id: imageId || 0
		}).then(function (json) {
			if (!json || !json.success) {
				showStatus(i18n.error || 'Ошибка сохранения', 'error');
				return;
			}
			var url = json.data && json.data.image_url ? json.data.image_url : imageUrl;
			var id = json.data && typeof json.data.image_id !== 'undefined' ? json.data.image_id : imageId;
			if (json.data && json.data.blocks) {
				syncBlocksData(json.data.blocks);
			} else {
				var block = blocks.find(function (b) {
					return b.index === activeIndex;
				});
				if (block) {
					block.image_id = id;
					block.image_url = url;
				}
			}
			updateImagePreview(url || '');
			applyImageToBlock(activeIndex, url || '');
			renderBlocksList();
			showStatus(i18n.saved || 'Сохранено', 'success');
		}).catch(function () {
			showStatus(i18n.error || 'Ошибка сохранения', 'error');
		});
	}

	function applyImageToBlock(index, url) {
		var el = getPageBlock(index);
		if (!el || !url) {
			return;
		}
		var safe = String(url).replace(/"/g, '\\"');
		var bust = url + (url.indexOf('?') >= 0 ? '&' : '?') + 've=' + Date.now();
		var layout = el.getAttribute('data-ai-layout') || '';

		qsa('img[data-ai-ve-img], .ai-hero__bg img, .ai-about-image', el).forEach(function (img) {
			img.src = bust;
			img.removeAttribute('srcset');
			img.hidden = false;
		});

		qsa('[data-ai-ve-img="bg"]:not(img), .ai-cta', el).forEach(function (node) {
			node.style.setProperty(
				'background-image',
				'linear-gradient(135deg,rgba(11,31,51,.88),rgba(21,58,85,.75)),url("' + safe + '")'
			);
			node.style.setProperty('background-size', 'cover');
			node.style.setProperty('background-position', 'center');
		});

		if (layout === 'video') {
			var iframe = qs('iframe', el);
			if (iframe) {
				iframe.setAttribute('data-poster', url);
			}
		}

		el.classList.add('is-ve-flash');
		setTimeout(function () {
			el.classList.remove('is-ve-flash');
		}, 900);
	}

	function resetBlockSettings(index) {
		if (!cfg.postId) {
			return;
		}
		if (!window.confirm(i18n.resetConfirm || 'Сбросить вид, карточки и картинки этого блока?')) {
			return;
		}
		showStatus('…');
		ajax('ai_ve_reset_block', { post_id: cfg.postId, index: index }).then(function (json) {
			if (!json || !json.success) {
				showStatus(i18n.error || 'Ошибка сохранения', 'error');
				return;
			}
			if (json.data && json.data.blocks) {
				syncBlocksData(json.data.blocks);
			}
			applyPresetToBlock(index, 'v1');
			applyCardStyleToBlock(index, 'c1');
			if (json.data && json.data.image_url) {
				applyImageToBlock(index, json.data.image_url);
			}
			renderBlocksList();
			showStatus(i18n.saved || 'Сохранено', 'success');
		}).catch(function () {
			showStatus(i18n.error || 'Ошибка сохранения', 'error');
		});
	}

	function resetAllBlocks() {
		if (!cfg.postId || !blocks.length) {
			return;
		}
		if (!window.confirm(i18n.resetAllConfirm || 'Сбросить настройки всех блоков на этой странице?')) {
			return;
		}
		showStatus('…');
		ajax('ai_ve_reset_all_blocks', { post_id: cfg.postId }).then(function (json) {
			if (!json || !json.success) {
				showStatus(i18n.error || 'Ошибка сохранения', 'error');
				return;
			}
			if (json.data && json.data.blocks) {
				syncBlocksData(json.data.blocks);
			}
			blocks.forEach(function (block) {
				applyPresetToBlock(block.index, 'v1');
				applyCardStyleToBlock(block.index, 'c1');
				if (block.has_image && (block.fallback_image || block.image_url)) {
					applyImageToBlock(block.index, block.fallback_image || block.image_url);
				}
			});
			closeModal();
			renderBlocksList();
			showStatus(i18n.saved || 'Сохранено', 'success');
		}).catch(function () {
			showStatus(i18n.error || 'Ошибка сохранения', 'error');
		});
	}

	function renderDesignThemes() {
		if (!els.designThemes) {
			return;
		}
		els.designThemes.innerHTML = '';
		var themes = cfg.designThemes || {};
		var active = cfg.activeDesign || 'classic';
		Object.keys(themes).forEach(function (key) {
			var theme = themes[key] || {};
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'ai-ve-design-card' + (key === active ? ' is-active' : '');
			btn.setAttribute('data-design-theme', key);
			var swatches = '';
			if (theme.colors) {
				['primary', 'accent', 'bg'].forEach(function (c) {
					if (theme.colors[c]) {
						swatches += '<span class="ai-ve-design-card__swatch" style="background:' + theme.colors[c] + '"></span>';
					}
				});
			}
			btn.innerHTML =
				'<div class="ai-ve-design-card__top">' +
				'<strong>' + escapeHtml(theme.label || key) + '</strong>' +
				'<span class="ai-ve-design-card__swatches">' + swatches + '</span></div>' +
				'<span class="ai-ve-design-card__tag">' + escapeHtml(theme.tagline || '') + '</span>' +
				'<p class="ai-ve-design-card__desc">' + escapeHtml(theme.description || '') + '</p>';
			btn.addEventListener('click', function () {
				setDesignTheme(key);
			});
			els.designThemes.appendChild(btn);
		});
	}

	function setDesignTheme(theme) {
		showStatus('…');
		ajax('ai_ve_set_design_theme', { theme: theme }).then(function (json) {
			if (!json || !json.success) {
				showStatus(i18n.error || 'Ошибка сохранения', 'error');
				return;
			}
			showStatus(i18n.saved || 'Сохранено', 'success');
			window.setTimeout(function () {
				window.location.reload();
			}, 300);
		}).catch(function () {
			showStatus(i18n.error || 'Ошибка сохранения', 'error');
		});
	}

	function renderBlocksList() {
		if (!els.blocksList) {
			return;
		}
		els.blocksList.innerHTML = '';
		if (els.blocksFoot) {
			els.blocksFoot.hidden = !blocks.length;
		}
		if (!blocks.length) {
			if (els.blocksHint) {
				var ctx = cfg.context || '';
				els.blocksHint.textContent = (ctx === 'car' || ctx === 'api_car')
					? (i18n.noBlocksCar || i18n.noBlocks || 'Нет блоков.')
					: (i18n.noBlocks || 'На этой странице нет конструктора блоков.');
			}
			return;
		}
		if (els.blocksHint) {
			els.blocksHint.textContent = i18n.dragHint || 'Перетащите блоки для смены порядка';
		}
		blocks.forEach(function (block) {
			var li = document.createElement('li');
			li.className = 'ai-ve-block-item' + (block.hidden ? ' is-hidden-item' : '');
			li.setAttribute('data-ve-block-index', String(block.index));
			li.setAttribute('data-old-index', String(block.index));
			var preset = block.preset || 'v1';
			li.innerHTML =
				'<span class="ai-ve-block-item__drag" aria-hidden="true">⠿</span>' +
				'<div class="ai-ve-block-item__main">' +
				'<span class="ai-ve-block-item__label">' + escapeHtml(block.label || block.layout || ('#' + (block.index + 1))) + '</span>' +
				'<div class="ai-ve-block-item__meta">' +
				'<span class="ai-ve-preset-chip ai-ve-preset-chip--' + preset + '">' + escapeHtml(shortPresetLabel(preset)) + '</span>' +
				(block.has_image ? '<span class="ai-ve-preset-chip ai-ve-preset-chip--img">IMG</span>' : '') +
				'</div></div>' +
				'<div class="ai-ve-block-item__actions">' +
				'<button type="button" class="ai-ve-btn ai-ve-btn--sm" data-ve-edit-text="' + block.index + '">' + escapeHtml(i18n.editText || 'Редактировать текст') + '</button>' +
				'<button type="button" class="ai-ve-btn ai-ve-btn--sm" data-ve-edit-look="' + block.index + '">' + escapeHtml(i18n.editBlock || 'Редактировать блок') + '</button>' +
				(block.has_image ? '<button type="button" class="ai-ve-btn ai-ve-btn--sm" data-ve-edit-image="' + block.index + '">' + escapeHtml(i18n.editImage || 'Картинка') + '</button>' : '') +
				'<button type="button" class="ai-ve-btn ai-ve-btn--sm ai-ve-btn--ghost" data-ve-reset="' + block.index + '">' + escapeHtml(i18n.resetBlock || 'Сбросить настройки') + '</button>' +
				'<button type="button" class="ai-ve-btn ai-ve-btn--sm' + (block.hidden ? ' ai-ve-btn--danger' : '') + '" data-ve-hide="' + block.index + '">' +
				escapeHtml(block.hidden ? (i18n.show || 'Показать') : (i18n.hide || 'Скрыть')) +
				'</button></div>';

			var editTextBtn = li.querySelector('[data-ve-edit-text]');
			var editLookBtn = li.querySelector('[data-ve-edit-look]');
			var editImageBtn = li.querySelector('[data-ve-edit-image]');
			var resetBtn = li.querySelector('[data-ve-reset]');
			var hideBtn = li.querySelector('[data-ve-hide]');
			if (editTextBtn) {
				editTextBtn.addEventListener('click', function () { openModal(block.index, 'text'); });
			}
			if (editLookBtn) {
				editLookBtn.addEventListener('click', function () { openModal(block.index, 'look'); });
			}
			if (editImageBtn) {
				editImageBtn.addEventListener('click', function () { openModal(block.index, 'image'); });
			}
			if (resetBtn) {
				resetBtn.addEventListener('click', function () { resetBlockSettings(block.index); });
			}
			if (hideBtn) {
				hideBtn.addEventListener('click', function () { toggleBlockHidden(block.index); });
			}
			li.addEventListener('click', function (e) {
				if (e.target.closest('[data-ve-edit-text], [data-ve-edit-look], [data-ve-edit-image], [data-ve-reset], [data-ve-hide], .ai-ve-block-item__drag')) {
					return;
				}
				scrollToBlock(block.index);
				qsa('.ai-ve-block-item', els.blocksList).forEach(function (item) { item.classList.remove('is-active'); });
				li.classList.add('is-active');
			});
			els.blocksList.appendChild(li);
		});
		initSortable();
	}

	function initSortable() {
		if (!els.blocksList || typeof Sortable === 'undefined' || !blocks.length) {
			return;
		}
		if (sortableInstance) {
			sortableInstance.destroy();
		}
		sortableInstance = Sortable.create(els.blocksList, {
			handle: '.ai-ve-block-item__drag',
			animation: 160,
			onEnd: function () {
				var order = qsa('.ai-ve-block-item', els.blocksList).map(function (item) {
					return parseInt(item.getAttribute('data-old-index'), 10);
				});
				ajax('ai_ve_reorder', { post_id: cfg.postId, order: order }).then(function (json) {
					if (json && json.success && json.data && json.data.blocks) {
						syncBlocksData(json.data.blocks);
						reorderDomBlocks(order);
						renderBlocksList();
						showStatus(i18n.saved || 'Сохранено', 'success');
					} else {
						showStatus(i18n.error || 'Ошибка сохранения', 'error');
					}
				}).catch(function () {
					showStatus(i18n.error || 'Ошибка сохранения', 'error');
				});
			}
		});
	}

	function reorderDomBlocks(oldOrder) {
		var parent = null;
		var nodes = [];
		oldOrder.forEach(function (oldIdx) {
			var el = getPageBlock(oldIdx);
			if (el) {
				parent = el.parentNode;
				nodes.push(el);
			}
		});
		if (!parent) {
			return;
		}
		nodes.forEach(function (el, newIdx) {
			parent.appendChild(el);
			el.id = 'ai-block-' + newIdx;
			el.setAttribute('data-ai-block-index', String(newIdx));
			var toolbar = qs('.ai-block-toolbar', el);
			if (toolbar) {
				toolbar.setAttribute('data-ai-toolbar', String(newIdx));
			}
			qsa('[data-ai-edit-block]', el).forEach(function (btn) {
				btn.setAttribute('data-ai-edit-block', String(newIdx));
			});
		});
	}

	function toggleBlockHidden(index) {
		var block = blocks.find(function (b) {
			return b.index === index;
		});
		if (!block) {
			return;
		}
		var hidden = !block.hidden;
		ajax('ai_ve_toggle_block', {
			post_id: cfg.postId,
			index: index,
			hidden: hidden ? 1 : 0
		}).then(function (json) {
			if (!json || !json.success) {
				showStatus(i18n.error || 'Ошибка сохранения', 'error');
				return;
			}
			block.hidden = hidden;
			var el = getPageBlock(index);
			if (el) {
				el.classList.toggle('is-ve-hidden', hidden);
			}
			renderBlocksList();
			showStatus(i18n.saved || 'Сохранено', 'success');
		}).catch(function () {
			showStatus(i18n.error || 'Ошибка сохранения', 'error');
		});
	}

	function saveBlock() {
		if (activeIndex === null) {
			return;
		}
		var title = els.fieldTitle ? els.fieldTitle.value : '';
		var subtitle = els.fieldSubtitle ? els.fieldSubtitle.value : '';
		var preset = els.fieldPreset ? els.fieldPreset.value : 'v1';
		var btn1Text = els.fieldBtn1 ? els.fieldBtn1.value : '';
		var btn1Link = els.fieldBtn1Link ? els.fieldBtn1Link.value : '';
		var btn2Text = els.fieldBtn2 ? els.fieldBtn2.value : '';
		var btn2Link = els.fieldBtn2Link ? els.fieldBtn2Link.value : '';
		var cardsCount = els.fieldCardsCount ? parseInt(els.fieldCardsCount.value, 10) : null;
		var cardStyle = els.fieldCardStyle ? els.fieldCardStyle.value : 'c1';
		showStatus('…');
		var payload = {
			post_id: cfg.postId,
			index: activeIndex,
			title: title,
			subtitle: subtitle,
			preset: preset,
			btn1_text: btn1Text,
			btn1_link: btn1Link,
			btn2_text: btn2Text,
			btn2_link: btn2Link
		};
		if (blockHasCards(activeIndex) && cardsCount > 0) {
			payload.cards_count = cardsCount;
			payload.card_style = cardStyle;
			if (els.fieldGridColumns) {
				payload.grid_columns = parseInt(els.fieldGridColumns.value, 10) || 3;
			}
			if (els.fieldGridRows) {
				payload.grid_rows = parseInt(els.fieldGridRows.value, 10) || 2;
			}
			if (els.fieldGridPerRow) {
				payload.grid_cards_per_row = parseInt(els.fieldGridPerRow.value, 10) || 3;
			}
		}
		if (blockHasImage(activeIndex) && els.fieldImageId) {
			payload.image_id = parseInt(els.fieldImageId.value, 10) || 0;
		}
		ajax('ai_ve_update_block', payload).then(function (json) {
			if (!json || !json.success) {
				showStatus(i18n.error || 'Ошибка сохранения', 'error');
				return;
			}
			if (json.data && json.data.blocks) {
				syncBlocksData(json.data.blocks);
			}
			var idx = activeIndex;
			applyPresetToBlock(idx, preset);
			applyCardStyleToBlock(idx, cardStyle);
			if (cardsCount > 0) {
				applyCardsCount(idx, cardsCount);
			}
			updateLiveBlockContent(idx, {
				title: title,
				subtitle: subtitle,
				btn1_text: btn1Text,
				btn1_link: btn1Link,
				btn2_text: btn2Text,
				btn2_link: btn2Link
			});
			if (els.fieldImageUrl && els.fieldImageUrl.value) {
				applyImageToBlock(idx, els.fieldImageUrl.value);
			}
			renderBlocksList();
			closeModal();
			showStatus(i18n.saved || 'Сохранено', 'success');
		}).catch(function () {
			showStatus(i18n.error || 'Ошибка сохранения', 'error');
		});
	}

	function updateLiveBlockContent(index, data) {
		var el = getPageBlock(index);
		if (!el) {
			return;
		}
		var title = qs('h1, .ai-section__title, .ai-cta__title', el);
		if (title && data.title) {
			title.textContent = data.title;
		}
		var sub = qs('.ai-hero__subtitle, .ai-section__desc, .ai-cta__desc, .ai-text-muted', el);
		if (sub && data.subtitle) {
			sub.textContent = data.subtitle;
		}
	}

	function applyColorPreset(presetKey, colors) {
		if (!colors) {
			return;
		}
		var root = document.documentElement;
		if (colors.primary) {
			root.style.setProperty('--ai-primary', colors.primary);
		}
		if (colors.secondary) {
			root.style.setProperty('--ai-secondary', colors.secondary);
		}
		if (colors.accent) {
			root.style.setProperty('--ai-accent', colors.accent);
		}
		if (colors.bg) {
			root.style.setProperty('--ai-bg', colors.bg);
		}
		if (colors.text) {
			root.style.setProperty('--ai-text', colors.text);
		}
		updateColorPreview(colors);
	}

	function getCustomColorsFromInputs() {
		return {
			primary: els.cPrimary ? els.cPrimary.value : '',
			secondary: els.cSecondary ? els.cSecondary.value : '',
			accent: els.cAccent ? els.cAccent.value : '',
			bg: els.cBg ? els.cBg.value : '',
			text: els.cText ? els.cText.value : ''
		};
	}

	function updateColorPreview(colors) {
		if (!els.colorPreview || !colors) {
			return;
		}
		els.colorPreview.style.setProperty('--ai-primary', colors.primary || '');
		els.colorPreview.style.setProperty('--ai-accent', colors.accent || '');
		els.colorPreview.style.background = colors.bg || '';
		els.colorPreview.style.color = colors.text || '';
	}

	function onCustomColorInput() {
		var colors = getCustomColorsFromInputs();
		applyColorPreset('custom', colors);
	}

	function renderColorSwatches() {
		if (!els.colors) {
			return;
		}
		els.colors.innerHTML = '';
		var presets = cfg.colorPresets || {};
		var active = cfg.activeColor || 'ocean';
		Object.keys(presets).forEach(function (key) {
			var c = presets[key] || {};
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'ai-ve-color-swatch' + (key === active ? ' is-active' : '');
			btn.setAttribute('data-color-preset', key);
			btn.innerHTML =
				'<span class="ai-ve-color-swatch__bar" style="background:linear-gradient(90deg,' + (c.primary || '#000') + ',' + (c.accent || '#999') + ')"></span>' +
				'<span class="ai-ve-color-swatch__name">' + escapeHtml(key) + '</span>';
			btn.addEventListener('click', function () {
				ajax('ai_ve_set_color', { preset: key }).then(function (json) {
					if (!json || !json.success) {
						showStatus(i18n.error || 'Ошибка', 'error');
						return;
					}
					cfg.activeColor = key;
					applyColorPreset(key, json.data.colors || c);
					qsa('.ai-ve-color-swatch', els.colors).forEach(function (sw) {
						sw.classList.toggle('is-active', sw.getAttribute('data-color-preset') === key);
					});
					showStatus(i18n.saved || 'Сохранено', 'success');
				}).catch(function () {
					showStatus(i18n.error || 'Ошибка сохранения', 'error');
				});
			});
			els.colors.appendChild(btn);
		});
	}

	function saveCustomColors() {
		var colors = getCustomColorsFromInputs();
		showStatus('…');
		ajax('ai_ve_set_custom_colors', colors).then(function (json) {
			if (!json || !json.success) {
				showStatus(i18n.error || 'Ошибка сохранения', 'error');
				return;
			}
			var saved = json.data && json.data.colors ? json.data.colors : colors;
			applyColorPreset('custom', saved);
			cfg.activeColor = 'custom';
			qsa('.ai-ve-color-swatch', els.colors).forEach(function (sw) {
				sw.classList.remove('is-active');
			});
			showStatus(i18n.saved || 'Сохранено', 'success');
		}).catch(function () {
			showStatus(i18n.error || 'Ошибка сохранения', 'error');
		});
	}

	function formatPrice(value) {
		var n = parseFloat(value) || 0;
		try {
			return new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
		} catch (e) {
			return String(Math.round(n)) + ' ₽';
		}
	}

	function updateCarImagePreview(url) {
		if (els.carImagePreviewImg) {
			if (url) {
				els.carImagePreviewImg.src = url;
				els.carImagePreviewImg.hidden = false;
			} else {
				els.carImagePreviewImg.removeAttribute('src');
				els.carImagePreviewImg.hidden = true;
			}
		}
		if (els.carImagePreviewEmpty) {
			els.carImagePreviewEmpty.hidden = !!url;
		}
		if (els.carImagePreview) {
			els.carImagePreview.classList.toggle('has-image', !!url);
		}
	}

	function openCarMediaLibrary() {
		if (typeof wp === 'undefined' || !wp.media) {
			showStatus(i18n.error || 'Медиатека недоступна', 'error');
			return;
		}
		if (!els.carMediaFrame) {
			els.carMediaFrame = wp.media({
				title: i18n.pickImage || 'Выберите изображение',
				button: { text: i18n.pickImage || 'Использовать' },
				library: { type: 'image' },
				multiple: false
			});
			els.carMediaFrame.on('select', function () {
				var attachment = els.carMediaFrame.state().get('selection').first().toJSON();
				var url = attachment.url || '';
				if (attachment.sizes && attachment.sizes.large) {
					url = attachment.sizes.large.url;
				}
				if (els.carImageId) {
					els.carImageId.value = String(attachment.id || 0);
				}
				updateCarImagePreview(url);
			});
		}
		els.carMediaFrame.open();
	}

	function clearCarImage() {
		if (els.carImageId) {
			els.carImageId.value = '0';
		}
		updateCarImagePreview('');
	}

	function applyContextLive(data) {
		var context = cfg.context || 'page';
		if (context === 'catalog') {
			var cat = data.catalog || {
				title: els.catalogTitle ? els.catalogTitle.value : '',
				subtitle: els.catalogSubtitle ? els.catalogSubtitle.value : ''
			};
			var titleEl = qs('[data-ai-ve-catalog-title]');
			var subEl = qs('[data-ai-ve-catalog-subtitle]');
			if (titleEl) {
				titleEl.textContent = cat.title || '';
			}
			if (subEl) {
				subEl.textContent = cat.subtitle || '';
				subEl.hidden = !cat.subtitle;
			}
			if (els.pageTitle) {
				els.pageTitle.textContent = cat.title || cfg.pageTitle;
			}
			cfg.catalogData = cat;
			return;
		}
		if (context === 'car') {
			var car = data.car || {};
			var root = qs('[data-ai-ve-car]');
			var t = qs('[data-ai-ve-car-title]', root);
			if (t) {
				t.textContent = car.title || (els.carTitle ? els.carTitle.value : '');
			}
			var p = qs('[data-ai-ve-car-price]', root);
			if (p && typeof car.price !== 'undefined') {
				p.textContent = formatPrice(car.price);
			}
			var c = qs('[data-ai-ve-car-content]', root);
			if (c && typeof car.content !== 'undefined') {
				c.textContent = car.content || '';
				c.hidden = !car.content;
			}
			var img = qs('[data-ai-ve-car-image]', root);
			var empty = qs('[data-ai-ve-car-image-empty]', root);
			if (img && car.image_url) {
				img.src = car.image_url;
				img.hidden = false;
				if (empty) {
					empty.hidden = true;
				}
			}
			if (els.pageTitle && car.title) {
				els.pageTitle.textContent = car.title;
			}
			cfg.carData = car;
			return;
		}
		if (data.reload && context === 'page') {
			window.location.reload();
		}
	}

	function savePage() {
		var context = cfg.context || 'page';
		showStatus('…');
		var payload = {
			post_id: cfg.postId,
			context: context,
			logo: els.siteLogo ? els.siteLogo.value : '',
			phone: els.sitePhone ? els.sitePhone.value : '',
			phone2: els.sitePhone2 ? els.sitePhone2.value : '',
			email: els.siteEmail ? els.siteEmail.value : '',
			company: els.siteCompany ? els.siteCompany.value : '',
			address: els.siteAddress ? els.siteAddress.value : '',
			hours: els.siteHours ? els.siteHours.value : '',
			tagline: els.siteTagline ? els.siteTagline.value : ''
		};
		if (context === 'catalog') {
			payload.catalog_title = els.catalogTitle ? els.catalogTitle.value : '';
			payload.catalog_subtitle = els.catalogSubtitle ? els.catalogSubtitle.value : '';
			payload.catalog_source = els.catalogSource ? els.catalogSource.value : 'both';
		} else if (context === 'car') {
			payload.car_title = els.carTitle ? els.carTitle.value : '';
			payload.car_price = els.carPrice ? els.carPrice.value : '';
			payload.car_year = els.carYear ? els.carYear.value : '';
			payload.car_mileage = els.carMileage ? els.carMileage.value : '';
			payload.car_engine = els.carEngine ? els.carEngine.value : '';
			payload.car_fuel = els.carFuel ? els.carFuel.value : '';
			payload.car_transmission = els.carTransmission ? els.carTransmission.value : '';
			payload.car_drive = els.carDrive ? els.carDrive.value : '';
			payload.car_color = els.carColor ? els.carColor.value : '';
			payload.car_country = els.carCountry ? els.carCountry.value : '';
			payload.car_status = els.carStatus ? els.carStatus.value : '';
			payload.car_content = els.carContent ? els.carContent.value : '';
			payload.car_image_id = els.carImageId ? parseInt(els.carImageId.value, 10) || 0 : 0;
		} else if (context === 'page') {
			payload.title = els.pageFieldTitle ? els.pageFieldTitle.value : '';
			payload.excerpt = els.pageFieldExcerpt ? els.pageFieldExcerpt.value : '';
			payload.slug = els.pageFieldSlug ? els.pageFieldSlug.value : '';
		}
		ajax('ai_ve_save_page', payload).then(function (json) {
			if (!json || !json.success) {
				showStatus(i18n.error || 'Ошибка сохранения', 'error');
				return;
			}
			applyContextLive(json.data || {});
			showStatus(i18n.saved || 'Сохранено', 'success');
		}).catch(function () {
			showStatus(i18n.error || 'Ошибка сохранения', 'error');
		});
	}

	function initCustomColors() {
		var colors = cfg.activeColors || {};
		if (els.cPrimary && colors.primary) {
			els.cPrimary.value = colors.primary;
		}
		if (els.cSecondary && colors.secondary) {
			els.cSecondary.value = colors.secondary;
		}
		if (els.cAccent && colors.accent) {
			els.cAccent.value = colors.accent;
		}
		if (els.cBg && colors.bg) {
			els.cBg.value = colors.bg;
		}
		if (els.cText && colors.text) {
			els.cText.value = colors.text;
		}
		updateColorPreview(colors);
	}

	function initPageFields() {
		var context = cfg.context || 'page';
		var pageData = cfg.pageData || {};
		var site = cfg.site || {};
		var catalog = cfg.catalogData || {};
		var car = cfg.carData || {};

		if (els.pageFieldsDefault) {
			els.pageFieldsDefault.hidden = context !== 'page';
		}
		if (els.catalogFields) {
			els.catalogFields.hidden = context !== 'catalog';
		}
		if (els.carFields) {
			els.carFields.hidden = context !== 'car';
		}
		if (els.apiCarNote) {
			els.apiCarNote.hidden = context !== 'api_car';
		}

		if (els.pageFieldTitle) {
			els.pageFieldTitle.value = pageData.title || '';
		}
		if (els.pageFieldExcerpt) {
			els.pageFieldExcerpt.value = pageData.excerpt || '';
		}
		if (els.pageFieldSlug) {
			els.pageFieldSlug.value = pageData.slug || '';
		}
		if (els.catalogTitle) {
			els.catalogTitle.value = catalog.title || '';
		}
		if (els.catalogSubtitle) {
			els.catalogSubtitle.value = catalog.subtitle || '';
		}
		if (els.catalogSource) {
			els.catalogSource.value = catalog.source || 'both';
		}
		if (els.carTitle) {
			els.carTitle.value = car.title || '';
		}
		if (els.carPrice) {
			els.carPrice.value = car.price || '';
		}
		if (els.carYear) {
			els.carYear.value = car.year || '';
		}
		if (els.carMileage) {
			els.carMileage.value = car.mileage || '';
		}
		if (els.carEngine) {
			els.carEngine.value = car.engine || '';
		}
		if (els.carFuel && car.fuel) {
			els.carFuel.value = car.fuel;
		}
		if (els.carTransmission && car.transmission) {
			els.carTransmission.value = car.transmission;
		}
		if (els.carDrive && car.drive) {
			els.carDrive.value = car.drive;
		}
		if (els.carColor) {
			els.carColor.value = car.color || '';
		}
		if (els.carCountry && car.country) {
			els.carCountry.value = car.country;
		}
		if (els.carStatus && car.status) {
			els.carStatus.value = car.status;
		}
		if (els.carContent) {
			els.carContent.value = car.content || '';
		}
		if (els.carImageId) {
			els.carImageId.value = String(car.image_id || 0);
		}
		updateCarImagePreview(car.image_url || '');

		if (els.siteLogo) {
			els.siteLogo.value = site.logo || '';
		}
		if (els.sitePhone) {
			els.sitePhone.value = site.phone || '';
		}
		if (els.sitePhone2) {
			els.sitePhone2.value = site.phone2 || '';
		}
		if (els.siteEmail) {
			els.siteEmail.value = site.email || '';
		}
		if (els.siteCompany) {
			els.siteCompany.value = site.company || '';
		}
		if (els.siteAddress) {
			els.siteAddress.value = site.address || '';
		}
		if (els.siteHours) {
			els.siteHours.value = site.hours || '';
		}
		if (els.siteTagline) {
			els.siteTagline.value = site.tagline || '';
		}

		if (context === 'catalog' || context === 'car' || context === 'api_car') {
			switchTab('page');
		}
	}

	function initPageMeta() {
		if (els.pageTitle) {
			els.pageTitle.textContent = cfg.pageTitle || document.title;
		}
		if (els.editAdmin && cfg.editUrl) {
			els.editAdmin.href = cfg.editUrl;
		}
	}

	function bindToolbarButtons() {
		document.addEventListener('click', function (e) {
			var btn = e.target.closest('[data-ai-edit-block]');
			if (!btn) {
				return;
			}
			e.preventDefault();
			var index = parseInt(btn.getAttribute('data-ai-edit-block'), 10);
			if (isNaN(index)) {
				return;
			}
			openModal(index, btn.getAttribute('data-ai-edit-mode') || 'text');
		});
	}

	function bindEvents() {
		if (els.fab) {
			els.fab.addEventListener('click', function () {
				if (els.panel && els.panel.classList.contains('is-open')) {
					closePanel();
				} else {
					openPanel();
				}
			});
		}
		if (els.close) {
			els.close.addEventListener('click', closePanel);
		}
		if (els.backdrop) {
			els.backdrop.addEventListener('click', closePanel);
		}
		if (els.openGlobal) {
			els.openGlobal.addEventListener('click', function () {
				openPanel();
				switchTab('global');
			});
		}
		document.addEventListener('keydown', function (e) {
			if (e.key !== 'Escape') {
				return;
			}
			if (isModalOpen()) {
				closeModal();
				return;
			}
			if (els.panel && els.panel.classList.contains('is-open')) {
				closePanel();
			}
		});
		els.tabs.forEach(function (tab) {
			tab.addEventListener('click', function () {
				switchTab(tab.getAttribute('data-ve-tab'));
			});
		});
		els.modalTabs.forEach(function (tab) {
			tab.addEventListener('click', function () {
				switchModalTab(tab.getAttribute('data-modal-tab'));
			});
		});
		qsa('[data-ai-ve-modal-close]').forEach(function (btn) {
			btn.addEventListener('click', closeModal);
		});
		if (els.saveBlock) {
			els.saveBlock.addEventListener('click', saveBlock);
		}
		if (els.pickImage) {
			els.pickImage.addEventListener('click', openMediaLibrary);
		}
		if (els.clearImage) {
			els.clearImage.addEventListener('click', clearBlockImage);
		}
		if (els.resetAllBlocks) {
			els.resetAllBlocks.addEventListener('click', resetAllBlocks);
		}
		if (els.fieldCardsCount) {
			els.fieldCardsCount.addEventListener('input', function () {
				if (activeIndex === null) {
					return;
				}
				var count = parseInt(els.fieldCardsCount.value, 10);
				if (count > 0) {
					applyCardsCount(activeIndex, count);
				}
			});
		}
		if (els.saveColors) {
			els.saveColors.addEventListener('click', saveCustomColors);
		}
		[els.cPrimary, els.cSecondary, els.cAccent, els.cBg, els.cText].forEach(function (input) {
			if (input) {
				input.addEventListener('input', onCustomColorInput);
			}
		});
		if (els.savePage) {
			els.savePage.addEventListener('click', savePage);
		}
		if (els.carPickImage) {
			els.carPickImage.addEventListener('click', openCarMediaLibrary);
		}
		if (els.carClearImage) {
			els.carClearImage.addEventListener('click', clearCarImage);
		}
		bindToolbarButtons();
	}

	function init() {
		cacheElements();
		if (!els.panel) {
			return;
		}
		initPageMeta();
		initPageFields();
		initCustomColors();
		renderBlocksList();
		renderColorSwatches();
		renderDesignThemes();
		bindEvents();
		document.body.classList.add('ai-ve-active');
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
