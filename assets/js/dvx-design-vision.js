/* =====================================================================
   DVX MYSTERY DECK — Design Your Vision
   Premium interactive showcase: 8 category cards -> shuffle/fan deck ->
   a gallery of 10 style cards (shuffled into place). Clicking a style
   registers it as that room's pick for the existing lead-capture flow
   (contact form -> "Visualise My Design" -> mosaic -> Formspree),
   loads its photo directly into that category's deck card, and sends
   the picked card to the end of the fan.
   Built with GSAP, ScrollTrigger, Flip and CustomEase. Vanilla JS only.
===================================================================== */
(function () {

    var board = document.getElementById('dvxBoard');
    if (!board) return;

    /* ---------------------------------------------------------------
       GSAP setup
    --------------------------------------------------------------- */
    gsap.registerPlugin(ScrollTrigger, Flip, CustomEase);

    // Signature "premium" easing curve used across the deck.
    CustomEase.create('dvxEase', '0.16, 1, 0.3, 1');

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------------------------------------------
       Data
    --------------------------------------------------------------- */
    var ROOMS = [
        { id: 'kitchen',  label: 'Kitchen'     },
        { id: 'living',   label: 'Living Room' },
        { id: 'bedroom',  label: 'Bedroom'     },
        { id: 'bathroom', label: 'Bathroom'    },
        { id: 'dining',   label: 'Dining Room' },
        { id: 'office',   label: 'Home Office' },
        { id: 'foyer',    label: 'Foyer'       },
        { id: 'balcony',  label: 'Balcony'     }
    ];

    var ROOM_LABEL = {};
    ROOMS.forEach(function (r) { ROOM_LABEL[r.id] = r.label; });

    var DVX_OPTIONS = {
        kitchen: [
            { value: 'Scandinavian Kitchen', text: 'Scandinavian', img: 'assets/img/config-images/Scandinavian-kitchen.png' },
            { value: 'Glam Kitchen',         text: 'Glam',         img: 'assets/img/config-images/glam-kitchen.png' },
            { value: 'Modern Kitchen',       text: 'Modern',       img: 'assets/img/config-images/Modern-kitchen.png' },
            { value: 'Mid-Century Kitchen',  text: 'Mid-century',  img: 'assets/img/config-images/Mid-century-kitchen.png' },
            { value: 'Minimal Kitchen',      text: 'Minimal',      img: 'assets/img/config-images/minimal-kitchen.png' },
            { value: 'Contemporary Kitchen', text: 'Contemporary', img: 'assets/img/config-images/contemporary-kitchen.png' },
            { value: 'Classic Kitchen',      text: 'Classic',      img: 'assets/img/config-images/classic-kitchen.png' },
            { value: 'Boho Kitchen',         text: 'Boho',         img: 'assets/img/config-images/boho-kitchen.png' },
            { value: 'Japandi Kitchen',      text: 'Japandi',      img: 'assets/img/config-images/japandi-kitchen.png' },
            { value: 'Transitional Kitchen', text: 'Transitional', img: 'assets/img/config-images/transitional-kitchen.png' }
        ],
        living: [
            { value: 'Scandinavian Living',  text: 'Scandinavian', img: 'assets/img/config-images/Scandinavian-living.png' },
            { value: 'Glam Living',          text: 'Glam',         img: 'assets/img/config-images/Glam-living.png' },
            { value: 'Modern Living',        text: 'Modern',       img: 'assets/img/config-images/Modern-living.png' },
            { value: 'Mid-century Living',   text: 'Mid-century',  img: 'assets/img/config-images/Mid-century-living.png' },
            { value: 'Minimal Living',       text: 'Minimal',      img: 'assets/img/config-images/Minimal-living.png' },
            { value: 'Contemporary Living',  text: 'Contemporary', img: 'assets/img/config-images/Contemporary-living.png' },
            { value: 'Classic Living',       text: 'Classic',      img: 'assets/img/config-images/Classic-living.png' },
            { value: 'Boho Living',          text: 'Boho',         img: 'assets/img/config-images/Boho-living.png' },
            { value: 'Japandi Living',       text: 'Japandi',      img: 'assets/img/config-images/Japandi-living.png' },
            { value: 'Transitional Living',  text: 'Transitional', img: 'assets/img/config-images/Transitional-living.png' }
        ],
        bedroom: [
            { value: 'Scandinavian Living',  text: 'Scandinavian', img: 'assets/img/config-images/bedroom_Scandinavian.png' },
            { value: 'Glam Living',          text: 'Glam',         img: 'assets/img/config-images/bedroom_Glam.png' },
            { value: 'Modern Living',        text: 'Modern',       img: 'assets/img/config-images/bedroom_Modern.png' },
            { value: 'Mid-century Living',   text: 'Mid-century',  img: 'assets/img/config-images/bedroom_Midcentury.png' },
            { value: 'Minimal Living',       text: 'Minimal',      img: 'assets/img/config-images/bedroom_Minimal.png' },
            { value: 'Contemporary Living',  text: 'Contemporary', img: 'assets/img/config-images/bedroom_Contemporary.png' },
            { value: 'Classic Living',       text: 'Classic',      img: 'assets/img/config-images/bedroom_Classic.png' },
            { value: 'Boho Living',          text: 'Boho',         img: 'assets/img/config-images/bedroom_Boho.png' },
            { value: 'Japandi Living',       text: 'Japandi',      img: 'assets/img/config-images/bedroom_Japandi.png' },
            { value: 'Transitional Living',  text: 'Transitional', img: 'assets/img/config-images/bedroom_Transitional.png' }
        ],
        bathroom: [
            { value: 'Scandinavian Living',  text: 'Scandinavian', img: 'assets/img/config-images/bathroom_Scandinavian.png' },
            { value: 'Glam Living',          text: 'Glam',         img: 'assets/img/config-images/bathroom_Glam.png' },
            { value: 'Modern Living',        text: 'Modern',       img: 'assets/img/config-images/bathroom_Modern.png' },
            { value: 'Mid-century Living',   text: 'Mid-century',  img: 'assets/img/config-images/bathroom_Midcentury.png' },
            { value: 'Minimal Living',       text: 'Minimal',      img: 'assets/img/config-images/bathroom_Minimal.png' },
            { value: 'Contemporary Living',  text: 'Contemporary', img: 'assets/img/config-images/bathroom_Contemporary.png' },
            { value: 'Classic Living',       text: 'Classic',      img: 'assets/img/config-images/bathroom_Classic.png' },
            { value: 'Boho Living',          text: 'Boho',         img: 'assets/img/config-images/bathroom_Boho.png' },
            { value: 'Japandi Living',       text: 'Japandi',      img: 'assets/img/config-images/bathroom_Japandi.png' },
            { value: 'Transitional Living',  text: 'Transitional', img: 'assets/img/config-images/bathroom_Transitional.png' }
        ],
        dining: [
            { value: 'Scandinavian Living',  text: 'Scandinavian', img: 'assets/img/config-images/Scandinavian-dining.png' },
            { value: 'Glam Living',          text: 'Glam',         img: 'assets/img/config-images/Glam-dining.png' },
            { value: 'Modern Living',        text: 'Modern',       img: 'assets/img/config-images/Modern-dining.png' },
            { value: 'Mid-century Living',   text: 'Mid-century',  img: 'assets/img/config-images/Midcentury-dining.png' },
            { value: 'Minimal Living',       text: 'Minimal',      img: 'assets/img/config-images/Minimal-dining.png' },
            { value: 'Contemporary Living',  text: 'Contemporary', img: 'assets/img/config-images/Contemporary-dining.png' },
            { value: 'Classic Living',       text: 'Classic',      img: 'assets/img/config-images/Classic-dining.png' },
            { value: 'Boho Living',          text: 'Boho',         img: 'assets/img/config-images/Boho-dining.png' },
            { value: 'Japandi Living',       text: 'Japandi',      img: 'assets/img/config-images/Japandi-dining.png' },
            { value: 'Transitional Living',  text: 'Transitional', img: 'assets/img/config-images/Transitional-dining.png' }
        ],
        office: [
            { value: 'Scandinavian Living',  text: 'Scandinavian', img: 'assets/img/config-images/home_office_Scandinavian.png' },
            { value: 'Glam Living',          text: 'Glam',         img: 'assets/img/config-images/home_office_Glam.png' },
            { value: 'Modern Living',        text: 'Modern',       img: 'assets/img/config-images/home_office_Modern.png' },
            { value: 'Mid-century Living',   text: 'Mid-century',  img: 'assets/img/config-images/home_office_Midcentury.png' },
            { value: 'Minimal Living',       text: 'Minimal',      img: 'assets/img/config-images/home_office_Minimal.png' },
            { value: 'Contemporary Living',  text: 'Contemporary', img: 'assets/img/config-images/home_office_Contemporary.png' },
            { value: 'Classic Living',       text: 'Classic',      img: 'assets/img/config-images/home_office_Classic.png' },
            { value: 'Boho Living',          text: 'Boho',         img: 'assets/img/config-images/home_office_Boho.png' },
            { value: 'Japandi Living',       text: 'Japandi',      img: 'assets/img/config-images/home_office_Japandi.png' },
            { value: 'Transitional Living',  text: 'Transitional', img: 'assets/img/config-images/home_office_Transitional.png' }
        ],
        foyer: [
            { value: 'Scandinavian Living',  text: 'Scandinavian', img: 'assets/img/config-images/foyer_Scandinavian.png' },
            { value: 'Glam Living',          text: 'Glam',         img: 'assets/img/config-images/foyer_Glam.png' },
            { value: 'Modern Living',        text: 'Modern',       img: 'assets/img/config-images/foyer_Modern.png' },
            { value: 'Mid-century Living',   text: 'Mid-century',  img: 'assets/img/config-images/foyer_Midcentury.png' },
            { value: 'Minimal Living',       text: 'Minimal',      img: 'assets/img/config-images/foyer_Minimal.png' },
            { value: 'Contemporary Living',  text: 'Contemporary', img: 'assets/img/config-images/foyer_Contemporary.png' },
            { value: 'Classic Living',       text: 'Classic',      img: 'assets/img/config-images/foyer_Classic.png' },
            { value: 'Boho Living',          text: 'Boho',         img: 'assets/img/config-images/foyer_Boho.png' },
            { value: 'Japandi Living',       text: 'Japandi',      img: 'assets/img/config-images/foyer_Japandi.png' },
            { value: 'Transitional Living',  text: 'Transitional', img: 'assets/img/config-images/foyer_Transitional.png' }
        ],
        balcony: [
            { value: 'Scandinavian Living',  text: 'Scandinavian', img: 'assets/img/config-images/balcony_Scandinavian.png' },
            { value: 'Glam Living',          text: 'Glam',         img: 'assets/img/config-images/balcony_Glam.png' },
            { value: 'Modern Living',        text: 'Modern',       img: 'assets/img/config-images/balcony_Modern.png' },
            { value: 'Mid-century Living',   text: 'Mid-century',  img: 'assets/img/config-images/balcony_Midcentury.png' },
            { value: 'Minimal Living',       text: 'Minimal',      img: 'assets/img/config-images/balcony_Minimal.png' },
            { value: 'Contemporary Living',  text: 'Contemporary', img: 'assets/img/config-images/balcony_Contemporary.png' },
            { value: 'Classic Living',       text: 'Classic',      img: 'assets/img/config-images/balcony_Classic.png' },
            { value: 'Boho Living',          text: 'Boho',         img: 'assets/img/config-images/balcony_Boho.png' },
            { value: 'Japandi Living',       text: 'Japandi',      img: 'assets/img/config-images/balcony_Japandi.png' },
            { value: 'Transitional Living',  text: 'Transitional', img: 'assets/img/config-images/balcony_Transitional.png' }
        ]
    };

    /* ---------------------------------------------------------------
       DOM references
    --------------------------------------------------------------- */
    var deck            = document.getElementById('dvxDeck');
    var cards           = Array.prototype.slice.call(deck.querySelectorAll('.dvx-card'));
    var originalCardOrder = cards.slice();
    var gallery         = document.getElementById('dvxGallery');
    var galleryHead     = document.getElementById('dvxGalleryHead');
    var galleryHint     = galleryHead.querySelector('.dvx-gallery-hint');
    var subGrid         = document.getElementById('dvxSubGrid');
    var backBtn         = document.getElementById('dvxBackBtn');
    var liveRegion      = document.getElementById('dvxLiveRegion');

    /* ---------------------------------------------------------------
       State machine
    --------------------------------------------------------------- */
    var state = {
        mode: 'deck',          // 'deck' | 'gallery'
        activeRoom: null,
        activeCard: null,
        isAnimating: false,
        isMobile: false
    };

    function announce(msg) { liveRegion.textContent = msg; }

    function lockBoard()   { state.isAnimating = true;  board.classList.add('is-busy'); }
    function unlockBoard() { state.isAnimating = false; board.classList.remove('is-busy'); }

    /* =================================================================
       LEAD-CAPTURE INTEGRATION (adapted from the previous configurator)
       Selecting a style in the gallery registers it as that room's pick,
       exactly like the old radio-based selection did. The contact form,
       "Visualise My Design" CTA, mosaic overlay and Formspree submission
       below the deck are preserved as-is.
    ================================================================= */
    var FORMSPREE_URL = 'https://formspree.io/f/mnjokvql';

    var selectedImg = {}, selectedLabel = {}, selectedStyleName = {}, selections = {};
    ROOMS.forEach(function (r) { selectedImg[r.id] = null; selectedLabel[r.id] = null; selectedStyleName[r.id] = null; selections[r.id] = null; });

    var mosaicCells = ROOMS.map(function (r) { return '<div class="dv-mosaic-cell" id="dvCell-' + r.id + '"></div>'; }).join('');

    var overlayHTML = [
        '<div id="dvOverlayRoot" role="dialog" aria-modal="true" aria-label="Your Design Vision">',
            '<div class="dv-overlay-backdrop" id="overlayBackdrop"></div>',
            '<div class="dv-overlay-panel">',
                '<button class="dv-overlay-close" id="overlayClose" aria-label="Close"><svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1l12 12M13 1L1 13" stroke-width="1.5" stroke-linecap="round" stroke="rgba(255,255,255,0.7)"/></svg></button>',
                '<div class="dv-result-mosaic" id="dvResultMosaic">' + mosaicCells + '</div>',
                '<div class="dv-result-bar" id="dvResultBar"><button class="dv-submit-btn" id="dvSubmitBtn" type="button">Submit My Vision <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>',
                '<div class="dv-success-msg" id="dvSuccessMsg"><div class="dv-success-icon"><svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10l4 4 8-8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div><h4>Thank you — we\'ll be in touch.</h4><p>Your design preferences have been shared with our team.<br>Expect a call within 24 hours.</p></div>',
            '</div>',
        '</div>'
    ].join('');

    document.body.insertAdjacentHTML('beforeend', overlayHTML);

    var visualiseBtn   = document.getElementById('visualiseBtn');
    var resetBtn       = document.getElementById('resetBtn');
    var progressText   = document.getElementById('progressText');
    var overlay        = document.getElementById('dvOverlayRoot');
    var overlayClose   = document.getElementById('overlayClose');
    var overlayBD      = document.getElementById('overlayBackdrop');
    var submitBtn      = document.getElementById('dvSubmitBtn');
    var successMsg     = document.getElementById('dvSuccessMsg');
    var resultBar      = document.getElementById('dvResultBar');
    var nameInput      = document.getElementById('dvName');
    var phoneInput     = document.getElementById('dvPhone');
    var emailInput     = document.getElementById('dvEmail');
    var cfName         = document.getElementById('dvCfName');
    var cfPhone        = document.getElementById('dvCfPhone');
    var cfEmail        = document.getElementById('dvCfEmail');

    function countSelected() { return ROOMS.filter(function (r) { return selections[r.id]; }).length; }

    function updateUI() {
        var n = countSelected();
        progressText.querySelector('span').textContent = n;
        visualiseBtn.disabled = n < 8;
    }

    // Loads the chosen style's photo directly into a category's deck
    // card (replacing its icon) so the deck itself shows what's been
    // picked, or restores the card to its empty/icon state otherwise.
    function renderCardThumbnail(roomId) {
        var card = cards.filter(function (c) { return c.dataset.room === roomId; })[0];
        if (!card) return;
        var img    = card.querySelector('.dvx-card-img');
        var metaEl = card.querySelector('.dvx-card-meta');
        var src    = selectedImg[roomId];
        var name   = selectedStyleName[roomId];

        if (!metaEl.dataset.defaultMeta) metaEl.dataset.defaultMeta = metaEl.textContent;

        if (src) {
            img.classList.remove('is-loaded');
            var loader = new Image();
            loader.onload = function () {
                img.src = src;
                img.alt = name + ' ' + ROOM_LABEL[roomId];
                requestAnimationFrame(function () { img.classList.add('is-loaded'); });
            };
            loader.src = src;
            metaEl.textContent = name + ' Style';
        } else {
            img.classList.remove('is-loaded');
            img.removeAttribute('src');
            img.alt = '';
            metaEl.textContent = metaEl.dataset.defaultMeta;
        }
    }

    function emptyCell() {
        return '<div class="dv-mosaic-empty"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="28" height="28" rx="1" stroke="#c9a96e" stroke-width="1"/><circle cx="11" cy="11" r="3" stroke="#c9a96e" stroke-width="1"/><path d="M2 22l8-7 7 6 5-4 8 6" stroke="#c9a96e" stroke-width="1"/></svg></div>';
    }

    function renderMosaicCell(roomId) {
        var cell  = document.getElementById('dvCell-' + roomId);
        var label = ROOM_LABEL[roomId];
        var img   = selectedImg[roomId];
        var style = selectedLabel[roomId];
        if (!cell) return;
        if (img) {
            var imgEl = new Image();
            imgEl.onload = function () {
                cell.innerHTML = '<img src="' + img + '" alt="' + style + '"><div class="dv-mosaic-label"><span class="dv-mosaic-room-tag">' + label + '</span><div class="dv-mosaic-style-name">' + style + '</div></div>';
                var i = cell.querySelector('img');
                if (i) { if (i.complete) { i.classList.add('loaded'); } else { i.addEventListener('load', function () { this.classList.add('loaded'); }); } }
            };
            imgEl.onerror = function () { cell.innerHTML = emptyCell(); };
            imgEl.src = img;
        } else { cell.innerHTML = emptyCell(); }
    }

    // Registers (or toggles) a style as the pick for a room. Called when a
    // gallery subcard is selected directly. Mirrors the old radio
    // behaviour, but also drives the new card / subcard "picked" badges
    // and loads the chosen photo into the category's deck card.
    function registerSelection(roomId, opt) {
        selections[roomId]        = opt.value;
        selectedImg[roomId]       = opt.img;
        selectedStyleName[roomId] = opt.text;
        // Preserve the exact original label text used in the mosaic / Formspree payload.
        selectedLabel[roomId] = opt.value;

        var card = cards.filter(function (c) { return c.dataset.room === roomId; })[0];
        if (card) card.classList.add('is-picked');

        if (overlay.classList.contains('active')) renderMosaicCell(roomId);
        renderCardThumbnail(roomId);
        updateUI();
    }

    function validate() {
        var missing = [];
        [cfName, cfPhone, cfEmail].forEach(function (f) { f.classList.remove('dv-cf-error'); });
        if (!nameInput.value.trim())  { cfName.classList.add('dv-cf-error');  missing.push('<i class="fa-solid fa-user" style="margin-right:8px;color:#C6A34F;"></i>Your Name'); }
        if (!phoneInput.value.trim()) { cfPhone.classList.add('dv-cf-error'); missing.push('<i class="fa-solid fa-phone" style="margin-right:8px;color:#C6A34F;"></i>Phone Number'); }
        if (!emailInput.value.trim() || emailInput.value.indexOf('@') === -1) { cfEmail.classList.add('dv-cf-error'); missing.push('<i class="fa-solid fa-envelope" style="margin-right:8px;color:#C6A34F;"></i>Valid Email Address'); }
        if (missing.length > 0) { Swal.fire({ customClass: { popup: 'swal-entrust' }, title: 'Details needed', html: '<div style="text-align:left;line-height:2.2;font-size:13px;">' + missing.join('<br>') + '</div>', icon: 'warning', confirmButtonText: 'Got it' }); return false; }
        return true;
    }

    [nameInput, phoneInput, emailInput].forEach(function (inp) { inp.addEventListener('input', function () { this.closest('.dv-cf').classList.remove('dv-cf-error'); }); });

    resetBtn.addEventListener('click', function () {
        ROOMS.forEach(function (r) {
            selections[r.id] = null; selectedImg[r.id] = null; selectedLabel[r.id] = null; selectedStyleName[r.id] = null;
            renderCardThumbnail(r.id);
        });
        cards.forEach(function (c) { c.classList.remove('is-picked'); });
        subGrid.querySelectorAll('.dvx-subcard.is-selected').forEach(function (s) { s.classList.remove('is-selected'); });
        nameInput.value = ''; phoneInput.value = ''; emailInput.value = '';
        [cfName, cfPhone, cfEmail].forEach(function (f) { f.classList.remove('dv-cf-error'); });

        // Restore the deck's original card order/arc, undoing any
        // "picked cards move to the end" reshuffling.
        if (!state.isMobile && state.mode === 'deck') {
            cards = originalCardOrder.slice();
            layoutPositions = computeLayout();
            applyLayout(layoutPositions, true);
        }

        updateUI();
    });

    visualiseBtn.addEventListener('click', function () {
        if (!validate()) { document.getElementById('dvContactWrap').scrollIntoView({ behavior: 'smooth', block: 'center' }); visualiseBtn.classList.add('shake'); setTimeout(function () { visualiseBtn.classList.remove('shake'); }, 500); return; }
        ROOMS.forEach(function (r) { renderMosaicCell(r.id); });
        resultBar.style.display = ''; successMsg.style.display = 'none'; submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit My Vision <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        overlay.classList.add('active'); document.body.style.overflow = 'hidden';
    });

    submitBtn.addEventListener('click', function () {
        submitBtn.disabled = true; submitBtn.textContent = 'Sending…';
        var payload = { name: nameInput.value.trim(), phone: phoneInput.value.trim(), email: emailInput.value.trim(), kitchen: selectedLabel['kitchen'] || '—', living_room: selectedLabel['living'] || '—', bedroom: selectedLabel['bedroom'] || '—', bathroom: selectedLabel['bathroom'] || '—', dining_room: selectedLabel['dining'] || '—', home_office: selectedLabel['office'] || '—', foyer: selectedLabel['foyer'] || '—', balcony: selectedLabel['balcony'] || '—', _subject: 'Design Vision Enquiry from ' + nameInput.value.trim() };
        fetch(FORMSPREE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) })
            .then(function (res) { if (res.ok) { resultBar.style.display = 'none'; successMsg.style.display = 'block'; } else { return res.json().then(function (d) { throw new Error(d.error || 'Failed'); }); } })
            .catch(function (err) { console.error('Formspree error:', err); submitBtn.disabled = false; submitBtn.textContent = 'Try Again'; });
    });

    function closeResultOverlay() { overlay.classList.remove('active'); document.body.style.overflow = ''; }
    overlayClose.addEventListener('click', closeResultOverlay);
    overlayBD.addEventListener('click', closeResultOverlay);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('active')) closeResultOverlay(); });

    updateUI();

    /* =================================================================
       FAN / ARC LAYOUT
       Each card's resting transform on desktop is computed from its
       index so the 8-card deck reads as a gentle curved arc. The same
       array drives the entrance cinematic's final phase and the
       hover lift (which animates relative to these base values).
    ================================================================= */
    var layoutPositions = [];

    function computeLayout() {
        var n = cards.length;
        var center = (n - 1) / 2;
        var cardW = parseFloat(getComputedStyle(board).getPropertyValue('--dvx-card-w')) || 200;
        var spacing = cardW * 0.62;
        var arcLift = cardW * 0.07;
        return cards.map(function (card, i) {
            var offset = i - center;
            return {
                x: offset * spacing,
                y: Math.pow(offset, 2) * arcLift,
                rotation: offset * 8,
                zIndex: 100 - Math.round(Math.abs(offset) * 2)
            };
        });
    }

    function applyLayout(positions, animate) {
        cards.forEach(function (card, i) {
            var p = positions[i];
            if (animate) {
                gsap.to(card, { x: p.x, y: p.y, rotation: p.rotation, zIndex: p.zIndex, duration: 0.6, ease: 'dvxEase' });
            } else {
                gsap.set(card, { x: p.x, y: p.y, rotation: p.rotation, zIndex: p.zIndex });
            }
        });
    }

    /* Moves a card to the end of the `cards` array (rightmost slot in
       the fan) so that, on the next computeLayout()/applyLayout() pass,
       a just-completed selection visually slides to the back of the deck. */
    function moveCardToEnd(card) {
        var idx = cards.indexOf(card);
        if (idx === -1 || idx === cards.length - 1) return;
        cards.splice(idx, 1);
        cards.push(card);
    }

    /* =================================================================
       HOVER: 3D tilt, lift, magnetic attraction, icon glow
       The outer .dvx-card carries the fan-layout transform (x/y/rotation
       from layoutPositions); hover effects are applied as deltas on top
       of that base so the resting fan position is never clobbered. The
       inner .dvx-card-face carries the 3D tilt (rotationX/rotationY) and
       a subtle scale "lift", kept separate to avoid transform conflicts.
    ================================================================= */
    function bindCardHover(card) {
        var face = card.querySelector('.dvx-card-face');
        var setRotX  = gsap.quickTo(face, 'rotationX', { duration: 0.6, ease: 'power3' });
        var setRotY  = gsap.quickTo(face, 'rotationY', { duration: 0.6, ease: 'power3' });
        // Note: the 'scale' shorthand recurses infinitely via quickTo on an
        // element that already has rotationX/rotationY quickTo's (GSAP 3.11
        // CSSPlugin bug) — drive scaleX/scaleY individually instead.
        var setScaleX = gsap.quickTo(face, 'scaleX', { duration: 0.4, ease: 'power3' });
        var setScaleY = gsap.quickTo(face, 'scaleY', { duration: 0.4, ease: 'power3' });
        var setX     = gsap.quickTo(card, 'x',         { duration: 0.5, ease: 'power3' });
        var setY     = gsap.quickTo(card, 'y',         { duration: 0.5, ease: 'power3' });

        function onMove(e) {
            if (state.isAnimating || state.mode !== 'deck') return;
            // Always above every other card (and any picked-card glow), no
            // matter how the fan's resting z-indices are distributed. Set
            // this first so it always lands even if a later tween bails.
            gsap.set(card, { zIndex: 200 });

            var rect = card.getBoundingClientRect();
            var px = (e.clientX - rect.left) / rect.width - 0.5;
            var py = (e.clientY - rect.top) / rect.height - 0.5;
            setRotY(px * 16);
            setRotX(py * -16);
            setScaleX(1.045);
            setScaleY(1.045);
            var base = layoutPositions[cards.indexOf(card)] || { x: 0, y: 0, zIndex: 1 };
            // Magnetic lift: nudge toward the cursor and rise slightly.
            setX(base.x + px * 12);
            setY(base.y - 16 + py * 6);
        }

        function onLeave() {
            setRotX(0); setRotY(0); setScaleX(1); setScaleY(1);
            var base = layoutPositions[cards.indexOf(card)] || { x: 0, y: 0, zIndex: 1 };
            setX(base.x); setY(base.y);
            gsap.set(card, { zIndex: base.zIndex });
        }

        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
        card._dvxHover = { onMove: onMove, onLeave: onLeave };
    }

    function unbindCardHover(card) {
        if (!card._dvxHover) return;
        card.removeEventListener('mousemove', card._dvxHover.onMove);
        card.removeEventListener('mouseleave', card._dvxHover.onLeave);
        delete card._dvxHover;
    }

    /* =================================================================
       ENTRANCE CINEMATIC (desktop, scroll-triggered, plays once)

       Phase 1 — invisible: every card is scattered far outside the
                 deck at a random angle/distance, randomly rotated and
                 fully transparent.
       Phase 2 — fly in: cards fade in and converge toward the centre
                 in a randomised arrival order with gentle rotation.
       Phase 3 — gather: cards square up into a tight cascading stack,
                 like a hand of cards being collected.
       Phase 4 — shuffle: opposing pairs swap places with z-index
                 swaps, rotational momentum and a soft scale "bounce".
       Phase 5 — fan out: the deck settles into its final curved arc
                 using layoutPositions.
    ================================================================= */
    function runEntranceCinematic(positions) {
        var n = cards.length;

        cards.forEach(function (card, i) {
            var angle = gsap.utils.random(0, 360);
            var dist  = gsap.utils.random(500, 950);
            gsap.set(card, {
                opacity: 0,
                x: Math.cos(angle * Math.PI / 180) * dist,
                y: Math.sin(angle * Math.PI / 180) * dist,
                rotation: gsap.utils.random(-160, 160),
                scale: 0.55,
                zIndex: i
            });
        });

        var tl = gsap.timeline({
            defaults: { ease: 'dvxEase' },
            scrollTrigger: { trigger: deck, start: 'top 78%', once: true }
        });

        // Phase 2 — fly in
        tl.to(cards, {
            opacity: 1,
            x: function () { return gsap.utils.random(-18, 18); },
            y: function () { return gsap.utils.random(-14, 14); },
            rotation: function () { return gsap.utils.random(-14, 14); },
            scale: 1,
            duration: 0.85,
            stagger: { each: 0.06, from: 'random' }
        });

        // Phase 3 — gather into a squared-up stack
        tl.set(cards, { zIndex: function (i) { return i; } });
        tl.to(cards, {
            x: function (i) { return (i - (n - 1) / 2) * 3; },
            y: function (i) { return i * 1.5; },
            rotation: function (i) { return (i - (n - 1) / 2) * 1.4; },
            duration: 0.45,
            stagger: 0.02
        }, '-=0.15');

        // Phase 4 — shuffle: overlapping pairs swap with momentum + bounce
        var pairs = [[0, 7], [2, 5], [1, 6], [3, 4]];
        pairs.forEach(function (pair, idx) {
            var a = cards[pair[0]], b = cards[pair[1]];
            var t = idx * 0.13;
            tl.set(a, { zIndex: 61 + idx * 2 }, t);
            tl.set(b, { zIndex: 60 + idx * 2 }, t);
            tl.to(a, { x: '+=46', y: '-=22', rotation: '+=14', duration: 0.2, ease: 'power1.inOut' }, t);
            tl.to(b, { x: '-=46', y: '+=22', rotation: '-=14', duration: 0.2, ease: 'power1.inOut' }, t);
            tl.to([a, b], { scale: 1.06, duration: 0.12, ease: 'power1.out' }, t + 0.2);
            tl.to([a, b], { scale: 1, duration: 0.22, ease: 'back.out(3)' }, t + 0.32);
        });

        // Phase 5 — fan out into the final curved arc
        tl.set(cards, { zIndex: function (i) { return positions[i].zIndex; } }, '+=0.05');
        tl.to(cards, {
            x: function (i) { return positions[i].x; },
            y: function (i) { return positions[i].y; },
            rotation: function (i) { return positions[i].rotation; },
            scale: 1,
            duration: 1,
            stagger: { each: 0.05, from: 'center' }
        }, '<');
    }

    /* =================================================================
       RESPONSIVE SETUP
       Desktop (>900px): absolutely-positioned fan/arc deck with the
       full cinematic entrance + 3D tilt hover.
       Mobile/Tablet (<=900px): static 2-column grid, simple fade/slide
       entrance, no tilt (handled by CSS media query).
    ================================================================= */
    var mm = gsap.matchMedia();

    mm.add({ isDesktop: '(min-width: 901px)', isMobile: '(max-width: 900px)' }, function (context) {
        var isDesktop = context.conditions.isDesktop;
        state.isMobile = !isDesktop;

        if (isDesktop) {
            layoutPositions = computeLayout();
            cards.forEach(bindCardHover);

            if (prefersReducedMotion) {
                applyLayout(layoutPositions, false);
                gsap.set(cards, { opacity: 1, scale: 1 });
            } else {
                runEntranceCinematic(layoutPositions);
            }
        } else {
            gsap.set(cards, { clearProps: 'transform,opacity,scale,zIndex,rotationX,rotationY' });
            gsap.fromTo(cards,
                { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 28 },
                {
                    opacity: 1, y: 0, duration: 0.6, ease: 'dvxEase', stagger: 0.08,
                    scrollTrigger: { trigger: deck, start: 'top 88%', once: true }
                }
            );
        }

        return function () { cards.forEach(unbindCardHover); };
    });

    // Recompute the fan layout on resize while at rest in the deck view.
    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (state.isMobile || state.mode !== 'deck') return;
            layoutPositions = computeLayout();
            applyLayout(layoutPositions, false);
        }, 200);
    });

    /* =================================================================
       GALLERY: subcategory cards for the active room
       Built on demand when a category card opens and torn down again
       on close, so each room always shows its own fresh, lazy-loaded
       set of 10 style cards.
    ================================================================= */
    function buildSubcards(roomId) {
        subGrid.innerHTML = '';
        var frag = document.createDocumentFragment();

        DVX_OPTIONS[roomId].forEach(function (opt, i) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'dvx-subcard';
            btn.setAttribute('role', 'listitem');
            btn.setAttribute('aria-label', opt.text + ' style');
            btn.dataset.room  = roomId;
            btn.dataset.value = opt.value;
            btn.dataset.text  = opt.text;
            btn.dataset.img   = opt.img;
            if (selections[roomId] === opt.value) btn.classList.add('is-selected');

            var num = (i + 1 < 10 ? '0' : '') + (i + 1);
            btn.innerHTML =
                '<span class="dvx-subcard-media">' +
                    '<img class="dvx-subcard-img" src="' + opt.img + '" alt="' + opt.text + ' ' + ROOM_LABEL[roomId] + '" loading="lazy">' +
                    '<span class="dvx-subcard-sheen" aria-hidden="true"></span>' +
                '</span>' +
                '<span class="dvx-subcard-body">' +
                    '<span class="dvx-subcard-label">' + opt.text + '</span>' +
                    '<span class="dvx-subcard-meta">Style ' + num + '</span>' +
                '</span>' +
                '<span class="dvx-subcard-check" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

            btn.addEventListener('click', function () { selectSubcard(btn); });
            if (!prefersReducedMotion && !state.isMobile) bindSubcardHover(btn);

            frag.appendChild(btn);
        });

        subGrid.appendChild(frag);
    }

    // Shuffle-style entrance for the freshly built subcards: scatter off
    // to random positions, fly toward center, swap a few pairs with a
    // playful bounce (echoing the deck's entrance cinematic), then settle
    // into the final grid arrangement.
    function revealSubcards() {
        var subcards = Array.prototype.slice.call(subGrid.querySelectorAll('.dvx-subcard'));
        var n = subcards.length;
        if (!n) return;
        if (prefersReducedMotion) { gsap.set(subcards, { clearProps: 'all' }); return; }

        gsap.set(subcards, {
            opacity: 0,
            x: function () { return gsap.utils.random(-220, 220); },
            y: function () { return gsap.utils.random(-160, 160); },
            rotation: function () { return gsap.utils.random(-50, 50); },
            scale: 0.6,
            zIndex: function (i) { return i; }
        });

        var tl = gsap.timeline({ defaults: { ease: 'dvxEase' } });

        // Fly toward center, slightly tumbling.
        tl.to(subcards, {
            opacity: 1,
            x: function () { return gsap.utils.random(-16, 16); },
            y: function () { return gsap.utils.random(-12, 12); },
            rotation: function () { return gsap.utils.random(-8, 8); },
            scale: 0.94,
            duration: 0.55,
            stagger: { each: 0.04, from: 'random' }
        });

        // Shuffle: opposing pairs swap with momentum + a soft bounce.
        var pairs = [];
        for (var i = 0; i < Math.floor(n / 2); i++) pairs.push([i, n - 1 - i]);
        pairs.forEach(function (pair, idx) {
            var a = subcards[pair[0]], b = subcards[pair[1]];
            var t = idx * 0.07;
            tl.set(a, { zIndex: 20 + idx * 2 }, t);
            tl.set(b, { zIndex: 19 + idx * 2 }, t);
            tl.to(a, { x: '+=26', y: '-=14', rotation: '+=10', duration: 0.16, ease: 'power1.inOut' }, t);
            tl.to(b, { x: '-=26', y: '+=14', rotation: '-=10', duration: 0.16, ease: 'power1.inOut' }, t);
            tl.to([a, b], { scale: 1.05, duration: 0.1, ease: 'power1.out' }, t + 0.16);
        });

        // Settle into the final grid position.
        tl.to(subcards, {
            x: 0, y: 0, rotation: 0, scale: 1, zIndex: 1,
            duration: 0.55,
            stagger: { each: 0.03, from: 'center' },
            clearProps: 'transform,zIndex'
        }, '+=0.05');
    }

    // Subtle 3D tilt + float on hover, mirrors the deck cards but lighter.
    function bindSubcardHover(card) {
        var setRX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
        var setRY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
        var setY  = gsap.quickTo(card, 'y',         { duration: 0.4, ease: 'power3' });

        function onMove(e) {
            if (state.isAnimating) return;
            var r = card.getBoundingClientRect();
            var px = (e.clientX - r.left) / r.width  - 0.5;
            var py = (e.clientY - r.top)  / r.height - 0.5;
            setRX(py * -8);
            setRY(px * 8);
            setY(-6);
        }
        function onLeave() { setRX(0); setRY(0); setY(0); }

        card.addEventListener('pointermove', onMove);
        card.addEventListener('pointerleave', onLeave);
    }

    /* =================================================================
       OPEN ROOM (deck -> gallery)
       Flip-morphs the chosen card from its fanned deck position into
       the gallery header, where it becomes the room title. The other
       7 cards fade/scale/blur away, then the subcategory grid reveals.
    ================================================================= */
    function openRoom(card) {
        if (state.isAnimating || state.mode !== 'deck') return;
        lockBoard();

        var roomId = card.dataset.room;
        state.mode       = 'gallery';
        state.activeRoom = roomId;
        state.activeCard = card;
        gallery.dataset.room = roomId;

        var others = cards.filter(function (c) { return c !== card; });

        // Capture the card's current (fanned) box before any DOM changes.
        var flipState = Flip.getState(card);

        // Reveal the gallery as a borderless overlay on top of the deck so
        // the morphing card has somewhere visible to land while the deck
        // cards fade beneath it. Restored to normal flow once settled.
        gallery.hidden = false;
        gsap.set(gallery, { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5 });
        gsap.set([backBtn, galleryHint], { opacity: 0 });

        gsap.set(card, { clearProps: 'transform' });
        card.classList.add('dvx-card--active');
        galleryHead.insertBefore(card, galleryHint);

        gallery.classList.add('is-open');

        gsap.to(others, {
            opacity: 0, scale: 0.85, filter: 'blur(6px)',
            duration: prefersReducedMotion ? 0 : 0.5,
            stagger: 0.03, ease: 'dvxEase'
        });

        Flip.from(flipState, {
            duration: prefersReducedMotion ? 0 : 0.9,
            ease: 'dvxEase',
            absolute: true,
            onComplete: function () {
                gsap.set(card, { clearProps: 'position,top,left,width,height' });
                deck.hidden = true;
                gsap.set(gallery, { clearProps: 'position,top,left,right,zIndex' });

                gsap.to([backBtn, galleryHint], { opacity: 1, duration: 0.5, ease: 'dvxEase', delay: 0.05 });

                buildSubcards(roomId);
                revealSubcards();
                announce(ROOM_LABEL[roomId] + ' — choose a style');
                unlockBoard();
            }
        });
    }

    /* =================================================================
       BACK NAVIGATION (gallery -> deck)
       Physically-correct reversal of openRoom: collapses the subcards,
       Flip-morphs the active card from the gallery header back to its
       fanned deck position, then fades the other 7 cards back in.
    ================================================================= */
    function closeRoom() {
        if (state.isAnimating || state.mode === 'deck') return;
        returnToDeck();
    }

    function returnToDeck(reorder) {
        lockBoard();

        var card     = state.activeCard;
        var roomId   = state.activeRoom;
        var subcards = subGrid.querySelectorAll('.dvx-subcard');

        var collapseTl = gsap.timeline();

        if (subcards.length && !prefersReducedMotion) {
            collapseTl.to(subcards, {
                opacity: 0, y: 28, scale: 0.94,
                duration: 0.35, ease: 'dvxEase',
                stagger: { each: 0.02, from: 'end' }
            }, 0);
        } else {
            gsap.set(subcards, { opacity: 0 });
        }
        collapseTl.to([backBtn, galleryHint], { opacity: 0, duration: 0.25, ease: 'dvxEase' }, 0);

        collapseTl.add(function () {
            deck.hidden = false;
            gsap.set(gallery, { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5 });

            var flipState = Flip.getState(card);
            card.classList.remove('dvx-card--active');
            deck.appendChild(card);

            Flip.from(flipState, {
                duration: prefersReducedMotion ? 0 : 0.8,
                ease: 'dvxEase',
                absolute: true,
                onComplete: function () {
                    gsap.set(card, { clearProps: 'position,top,left,width,height' });

                    gallery.hidden = true;
                    gallery.classList.remove('is-open');
                    gsap.set(gallery, { clearProps: 'position,top,left,right,zIndex' });
                    subGrid.innerHTML = '';

                    var others = cards.filter(function (c) { return c !== card; });
                    gsap.to(others, {
                        opacity: 1, scale: 1, filter: 'blur(0px)',
                        duration: 0.6, stagger: 0.04, ease: 'dvxEase'
                    });

                    if (reorder && !state.isMobile) {
                        moveCardToEnd(card);
                        layoutPositions = computeLayout();
                        gsap.set(card, { scale: 0.94 });
                        applyLayout(layoutPositions, true);
                        gsap.to(card, { scale: 1, duration: 0.7, ease: 'dvxEase' });
                    } else {
                        var pos = layoutPositions[cards.indexOf(card)] || { x: 0, y: 0, rotation: 0, zIndex: 1 };
                        gsap.fromTo(card,
                            { scale: 0.94 },
                            { x: pos.x, y: pos.y, rotation: pos.rotation, zIndex: pos.zIndex, scale: 1, duration: 0.7, ease: 'dvxEase' }
                        );
                    }

                    state.mode       = 'deck';
                    state.activeRoom = null;
                    state.activeCard = null;
                    announce('Back to all categories');
                    unlockBoard();
                }
            });
        });
    }

    /* =================================================================
       SELECT A STYLE (gallery -> direct pick, no modal)
       Clicking a subcard immediately registers it as that room's pick:
       the other 9 cards fade/scale away while the chosen one pulses and
       flips on its gold "is-selected" ring, then the board returns to
       the deck (via returnToDeck(true)) with the category card now
       showing the picked photo in place of its icon, and the card
       reordered to the end (rightmost) of the fan.
    ================================================================= */
    function selectSubcard(btn) {
        if (state.isAnimating) return;
        lockBoard();

        var roomId = btn.dataset.room;
        var opt = { value: btn.dataset.value, text: btn.dataset.text, img: btn.dataset.img };

        subGrid.querySelectorAll('.dvx-subcard.is-selected').forEach(function (s) {
            if (s !== btn) s.classList.remove('is-selected');
        });
        btn.classList.add('is-selected');

        registerSelection(roomId, opt);
        announce(opt.text + ' selected for ' + ROOM_LABEL[roomId] + '. Returning to categories.');

        if (prefersReducedMotion) {
            gsap.delayedCall(0.3, function () { returnToDeck(true); });
            return;
        }

        var others = Array.prototype.filter.call(subGrid.querySelectorAll('.dvx-subcard'), function (s) { return s !== btn; });
        gsap.set(btn, { zIndex: 30 });

        var tl = gsap.timeline({ onComplete: function () { returnToDeck(true); } });
        tl.to(others, {
            opacity: 0, scale: 0.9, y: 14, filter: 'blur(4px)',
            duration: 0.35, ease: 'dvxEase',
            stagger: { each: 0.02, from: 'end' }
        }, 0);
        tl.fromTo(btn, { scale: 1 }, {
            scale: 1.08, duration: 0.18, ease: 'power1.out', yoyo: true, repeat: 1
        }, 0);
    }

    /* =================================================================
       EVENT WIRING
    ================================================================= */
    cards.forEach(function (card) {
        card.addEventListener('click', function () { openRoom(card); });
    });

    backBtn.addEventListener('click', closeRoom);

})();
