/**
 * Why Choose Us  — v10  Production-ready · fully dynamic · modular
 * ─────────────────────────────────────────────────────────────────
 * ADDING A NEW FEATURE: edit FEATURES array only — everything else
 * (cards, nav dots, counter, animations) updates automatically.
 *
 * Architecture
 * ────────────
 *  FEATURES  → data layer
 *  CFG       → layout & timing config (tweak without touching logic)
 *  S         → runtime state (internal — do not mutate directly)
 *  D         → cached DOM references
 *  rotateToNext() → single public entry point for ALL click targets
 */
(function () {
    'use strict';

    /* ═══════════════════════════════════════════════════════════
       DATA — edit this array to add / remove / reorder features
    ═══════════════════════════════════════════════════════════ */
    var FEATURES = [
        { icon:'fa-solid fa-medal',          title:'5-Year Warranty',    desc:'Every project backed by our comprehensive craftsmanship guarantee.',  img:'assets/img/bg-img/lv1.jpg' },
        { icon:'fa-solid fa-ruler-combined', title:'Precision Design',   desc:'Millimeter-perfect layouts shaped by decades of unbroken expertise.', img:'assets/img/bg-img/lv2.jpg' },
        { icon:'fa-solid fa-user-tie',       title:'Expert Consultants', desc:'Dedicated designers who listen, then translate vision into reality.',  img:'assets/img/bg-img/lv3.jpg' },
        { icon:'fa-solid fa-couch',          title:'Luxury Materials',   desc:"Sourced from the world's finest suppliers for enduring beauty.",        img:'assets/img/bg-img/lv4.jpg' },
        { icon:'fa-solid fa-award',          title:'Award-Winning',      desc:'Globally recognised for excellence in residential interior design.',    img:'assets/img/bg-img/lv5.jpg' },
        { icon:'fa-solid fa-house',          title:'End-to-End Service', desc:'From first sketch to final reveal — every detail managed for you.',    img:'assets/img/bg-img/kmain.jpg' },
    ];

    /* ═══════════════════════════════════════════════════════════
       CONFIG — layout & timing — no logic here
    ═══════════════════════════════════════════════════════════ */
    var CFG = {
        gap     : 18,    /* px gap: image-ring outer edge → card edge */
        cardH   : 162,   /* MUST match CSS --wcu-ch value             */
        enterDur: 0.76,  /* new-card fly-in duration (s)              */
        moveDur : 0.82,  /* card-to-card move duration (s)            */
        exitDur : 0.55,  /* right-card exit duration (s)              */
    };

    /* ═══════════════════════════════════════════════════════════
       STATE — managed entirely by module functions
    ═══════════════════════════════════════════════════════════ */
    var S = {
        cTop     : null,   /* DOM: card in TOP position                */
        cLeft    : null,   /* DOM: card in LEFT position               */
        cRight   : null,   /* DOM: card in RIGHT position              */
        slots    : {},     /* current slot coordinates (recalculated)  */
        nextIdx  : 3,      /* index of next feature to enter from left */
        activeIdx: 0,      /* index of active feature (TOP card)       */
        isAnim   : false,
        clicked  : false,  /* true after first user interaction        */
        floats   : [],     /* { card, tween } idle-float tweens        */
        imgR     : 174,    /* half of imgWrap.offsetWidth              */
        cursor   : null,   /* custom cursor element                    */
    };

    /* ═══════════════════════════════════════════════════════════
       DOM REFERENCES — gathered once in init()
    ═══════════════════════════════════════════════════════════ */
    var D = {
        stage  : null, layer   : null, imgWrap: null,
        glare  : null, hint    : null, parEl  : null,
        navDots: null, navLabel: null, ctaBtn : null, canvas : null,
    };

    /* ═══════════════════════════════════════════════════════════
       BOOT
    ═══════════════════════════════════════════════════════════ */
    document.addEventListener('DOMContentLoaded', function () {
        var section = document.getElementById('why-choose-us');
        if (!section || !window.gsap) return;

        /* Gather DOM refs */
        D.stage   = document.getElementById('wcuStage');
        D.layer   = document.getElementById('wcuCardsLayer');
        D.imgWrap = document.getElementById('wcuImgWrap');
        D.glare   = document.getElementById('wcuGlare');
        D.hint    = document.getElementById('wcuHint');
        D.parEl   = document.getElementById('wcuParallax');
        D.navDots = document.getElementById('wcuNavDots');
        D.navLabel= document.getElementById('wcuNavLabel');
        D.ctaBtn  = document.getElementById('wcuCta');
        D.canvas  = document.getElementById('wcuParticles');

        if (!D.stage || !D.layer || !D.imgWrap) return;

        var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

        /* Preload feature images in the background */
        preloadImages();

        /* Set initial center image to match FEATURES[0] */
        var initImg = D.imgWrap.querySelector('.wcu__img');
        if (initImg && FEATURES[0] && FEATURES[0].img) initImg.src = FEATURES[0].img;

        /* Live image radius from rendered DOM */
        S.imgR = D.imgWrap.offsetWidth / 2 || S.imgR;

        /* Compute initial slot positions */
        recomputeSlots();

        /* Spawn 3 initial cards at directional entry positions (hidden) */
        S.cTop   = spawnCard(0, entryPos('top'));
        S.cLeft  = spawnCard(1, entryPos('left'));
        S.cRight = spawnCard(2, entryPos('right'));

        /* Wire all click/hover interactions */
        wireCard(S.cTop);   wireCard(S.cLeft);   wireCard(S.cRight);
        bindTilt(S.cTop);   bindTilt(S.cLeft);   bindTilt(S.cRight);
        wireImage(D.imgWrap);

        /* Build nav dots dynamically */
        buildNav();

        /* Custom cursor */
        if (!rm) S.cursor = buildCursor();

        /* Entrance animation or immediate display */
        if (!rm && window.ScrollTrigger) {
            buildEntrance(section);
        } else {
            placeCards();
            startFloats();
            setActive();
        }

        /* Stage: cursor / parallax / glare */
        initStageHover();
        if (!rm) initGlare();

        /* CTA button */
        initMagnet(D.ctaBtn);
        initRipple(D.ctaBtn);

        /* Canvas particles */
        if (D.canvas) initParticles(D.canvas);

        /* Touch swipe (mobile) */
        initTouchSwipe(D.stage);

        /* Resize: recompute slots, snap cards */
        var resId;
        window.addEventListener('resize', function () {
            clearTimeout(resId);
            resId = setTimeout(onResize, 220);
        });
    });

    /* ═══════════════════════════════════════════════════════════
       SLOT CALCULATION — all positions derived from live DOM
    ═══════════════════════════════════════════════════════════ */
    function recomputeSlots() {
        var sw = (D.stage ? D.stage.offsetWidth  : 0) || window.innerWidth  * 0.6;
        var sh = (D.stage ? D.stage.offsetHeight : 0) || window.innerHeight;
        if (sh < 100) sh = window.innerHeight;

        var cx = sw / 2, cy = sh / 2;
        var ir = Math.min(S.imgR, sh * 0.28);
        var cw = cssInt('--wcu-cw', 260);
        var ch = CFG.cardH;
        var g  = CFG.gap;

        S.slots = {
            top        : { x: cx - cw/2,             y: Math.max(10, cy - ir - g - ch) },
            left       : { x: cx - ir - g - cw,       y: cy - ch/2                       },
            right      : { x: cx + ir + g,             y: cy - ch/2                       },
            enterLeft  : { x: cx - ir - g - cw - 120, y: cy - ch/2                       },
            exitRight  : { x: cx + ir + g + 65,       y: cy + ir + 65                    },
        };
    }

    /* Entry position for each card during initial spawn */
    function entryPos(slot) {
        recomputeSlots();
        var s = S.slots;
        if (slot === 'top')   return { x: s.top.x,          y: s.top.y - 90,   opacity:0, scale:0.85, filter:'blur(6px)' };
        if (slot === 'left')  return { x: s.left.x - 110,   y: s.left.y,       opacity:0, scale:0.85, filter:'blur(6px)' };
        if (slot === 'right') return { x: s.right.x + 110,  y: s.right.y,      opacity:0, scale:0.85, filter:'blur(6px)' };
    }

    /* Snap visible cards to their slots after resize */
    function onResize() {
        S.imgR = D.imgWrap.offsetWidth / 2 || S.imgR;
        recomputeSlots();
        if (!S.isAnim) {
            var s = S.slots;
            gsap.set(S.cTop,   { x:s.top.x,   y:s.top.y   });
            gsap.set(S.cLeft,  { x:s.left.x,  y:s.left.y  });
            gsap.set(S.cRight, { x:s.right.x, y:s.right.y });
        }
    }

    /* Immediately place cards at their slot positions */
    function placeCards() {
        var s = S.slots;
        gsap.set(S.cTop,   { x:s.top.x,   y:s.top.y,   opacity:1, scale:1, filter:'blur(0px)' });
        gsap.set(S.cLeft,  { x:s.left.x,  y:s.left.y,  opacity:1, scale:1, filter:'blur(0px)' });
        gsap.set(S.cRight, { x:s.right.x, y:s.right.y, opacity:1, scale:1, filter:'blur(0px)' });
    }

    /* ═══════════════════════════════════════════════════════════
       CENTER IMAGE — cross-fades to the active feature's image
    ═══════════════════════════════════════════════════════════ */
    function updateCenterImage(newIdx) {
        var circle = D.imgWrap ? D.imgWrap.querySelector('.wcu__img-circle') : null;
        if (!circle) return;
        var curImg = circle.querySelector('.wcu__img:not(.wcu__img--next)');
        if (!curImg) return;
        var f = FEATURES[newIdx % FEATURES.length];
        if (!f || !f.img) return;

        /* Overlay the incoming image on top (position:absolute so it stacks) */
        var nextImg = document.createElement('img');
        nextImg.className   = 'wcu__img wcu__img--next';
        nextImg.alt         = 'Luxury interior — ' + f.title;
        nextImg.draggable   = false;
        nextImg.style.cssText =
            'position:absolute;inset:0;width:100%;height:100%;' +
            'object-fit:cover;display:block;pointer-events:none;user-select:none;' +
            'opacity:0;z-index:1;';
        circle.insertBefore(nextImg, curImg.nextSibling);

        /* Start loading, then cross-fade */
        function doFade() {
            gsap.timeline()
                .to(curImg,  { opacity:0, scale:1.05, duration:0.32, ease:'power2.in' })
                .to(nextImg, { opacity:1, scale:1,    duration:0.44, ease:'power2.out' }, '-=0.14')
                .call(function () {
                    /* Replace base image, clear GSAP transforms, strip overlay */
                    curImg.src = f.img;
                    gsap.set(curImg, { opacity:1, scale:1, clearProps:'transform' });
                    if (nextImg.parentNode) nextImg.remove();
                });
        }

        if (nextImg.complete && nextImg.naturalWidth) {
            doFade();
        } else {
            nextImg.onload  = doFade;
            nextImg.onerror = function () { if (nextImg.parentNode) nextImg.remove(); };
        }
        nextImg.src = f.img;
    }

    /* Preload all feature images so cross-fades are instant */
    function preloadImages() {
        FEATURES.forEach(function (f) {
            if (!f.img) return;
            var img = new Image();
            img.src = f.img;
        });
    }

    /* ═══════════════════════════════════════════════════════════
       CARD FACTORY — generates DOM from FEATURES data
    ═══════════════════════════════════════════════════════════ */
    function makeCard(rawIdx) {
        var f   = FEATURES[rawIdx % FEATURES.length];
        var el  = document.createElement('article');
        el.className = 'wcu__card';
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', 'Click to explore: ' + f.title);
        el.dataset.fi = rawIdx % FEATURES.length;
        /* Horizontal rectangle layout: icon + dot header, then title, desc */
        el.innerHTML =
            '<div class="wcu__card-inner">' +
                '<div class="wcu__card-header">' +
                    '<div class="wcu__card-icon">' +
                        '<i class="' + f.icon + '" aria-hidden="true"></i>' +
                    '</div>' +
                    '<span class="wcu__card-dot" aria-hidden="true"></span>' +
                '</div>' +
                '<h3 class="wcu__card-title">' + f.title + '</h3>' +
                '<p class="wcu__card-desc">'   + f.desc  + '</p>' +
            '</div>';
        return el;
    }

    function spawnCard(rawIdx, initState) {
        var el = makeCard(rawIdx);
        gsap.set(el, initState);
        D.layer.appendChild(el);
        return el;
    }

    /* ═══════════════════════════════════════════════════════════
       THE SINGLE ROTATION ENTRY POINT
       Called identically from: card click · image click · key press
    ═══════════════════════════════════════════════════════════ */
    function rotateToNext() {
        if (S.isAnim) return;
        markClicked();
        doForward();
    }

    /* ═══════════════════════════════════════════════════════════
       FORWARD TRANSITION — data-driven GSAP timeline
       LEFT → TOP  ·  TOP → RIGHT  ·  RIGHT exits  ·  NEW enters LEFT
    ═══════════════════════════════════════════════════════════ */
    function doForward() {
        S.isAnim = true;
        stopFloats();
        recomputeSlots();   /* always re-read in case of resize */

        var sl   = S.slots;
        var oldR = S.cRight, oldT = S.cTop, oldL = S.cLeft;

        /* ── RIGHT exits: fade + blur + scale down ── */
        gsap.to(oldR, {
            x:sl.exitRight.x, y:sl.exitRight.y,
            opacity:0, scale:0.72, filter:'blur(12px)',
            duration:CFG.exitDur, ease:'power2.in',
            onComplete: function(){ if(oldR.parentNode) oldR.remove(); },
        });

        /* ── TOP smoothly moves to RIGHT ── */
        gsap.to(oldT, {
            x:sl.right.x, y:sl.right.y, scale:1, filter:'blur(0px)',
            duration:CFG.moveDur, ease:'power3.inOut',
        });

        /* ── LEFT smoothly moves to TOP ── */
        gsap.to(oldL, {
            x:sl.top.x, y:sl.top.y, scale:1, filter:'blur(0px)',
            duration:CFG.moveDur, ease:'power3.inOut',
        });

        /* ── NEW card slides in from off-screen LEFT ── */
        var nc = makeCard(S.nextIdx++);
        gsap.set(nc, {
            x:sl.enterLeft.x, y:sl.enterLeft.y,
            opacity:0, scale:0.84, filter:'blur(8px)',
        });
        D.layer.appendChild(nc);
        gsap.to(nc, {
            x:sl.left.x, y:sl.left.y,
            opacity:1, scale:1, filter:'blur(0px)',
            duration:CFG.enterDur, delay:0.14, ease:'power2.out',
        });

        /* Wire new card */
        wireCard(nc); bindTilt(nc);

        /* Update references */
        S.cRight = oldT; S.cTop = oldL; S.cLeft = nc;

        /* Active state: TOP card is always "active" */
        oldT.classList.remove('is-active');   /* now cRight — not active   */
        oldL.classList.add('is-active');       /* now cTop  — becomes active */

        /* Update pagination counter + sync center image */
        S.activeIdx = (S.activeIdx + 1) % FEATURES.length;
        updateCenterImage(S.activeIdx);
        updateNav();

        /* Restart floats after transition completes */
        gsap.delayedCall(0.92, function () {
            S.isAnim = false;
            startFloat(S.cTop,   sl.top.y,   0);
            startFloat(S.cLeft,  sl.left.y,  0.5);
            startFloat(S.cRight, sl.right.y, 1.0);
        });
    }

    /* ═══════════════════════════════════════════════════════════
       INTERACTION WIRING
    ═══════════════════════════════════════════════════════════ */
    /* Wire a feature card — all clicks call rotateToNext() */
    function wireCard(card) {
        card.onclick   = null;
        card.onkeydown = null;
        card.onclick = function (e) {
            if (S.isAnim) return;
            addCardRipple(card, e);
            pressCard(card);
            cursorShrink();
            rotateToNext();
        };
        card.onkeydown = function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
        };
    }

    /* Wire the center image — identical rotation to card clicks */
    function wireImage(imgEl) {
        imgEl.addEventListener('click', function () {
            if (S.isAnim) return;
            pressImage(imgEl);
            cursorShrink();
            rotateToNext();
        });
        imgEl.addEventListener('mouseenter', function () { cursorHover(true); });
        imgEl.addEventListener('mouseleave', function () { cursorHover(false); });
    }

    /* ── Card press animation ── */
    function pressCard(card) {
        var inner = card.querySelector('.wcu__card-inner');
        if (!inner) return;
        gsap.timeline()
            .to(inner, { scale:0.94, duration:0.08, ease:'power3.in' })
            .to(inner, { scale:1,    duration:0.42, ease:'back.out(2.5)' });
    }

    /* ── Image press animation ── */
    function pressImage(imgEl) {
        gsap.timeline()
            .to(imgEl, { scale:0.96, duration:0.08, ease:'power3.in' })
            .to(imgEl, { scale:1,    duration:0.45, ease:'back.out(2)' });
    }

    /* ── Card ripple at click position ── */
    function addCardRipple(card, e) {
        var r   = card.getBoundingClientRect();
        var size= Math.max(r.width, r.height) * 1.8;
        var rpl = document.createElement('span');
        rpl.className = 'wcu__card-ripple';
        rpl.style.cssText =
            'width:'+size+'px;height:'+size+'px;' +
            'left:'+(e.clientX-r.left-size/2)+'px;' +
            'top:' +(e.clientY-r.top -size/2)+'px;';
        card.appendChild(rpl);
        setTimeout(function(){ if(rpl.parentNode) rpl.remove(); }, 700);
    }

    /* ── 3-D tilt on card hover ── */
    function bindTilt(card) {
        if (!card) return;
        var inner = card.querySelector('.wcu__card-inner');
        if (!inner) return;
        card.addEventListener('mouseenter', function () { cursorHover(true); });
        card.addEventListener('mouseleave', function () {
            cursorHover(false);
            gsap.to(inner, { rotationX:0, rotationY:0, duration:0.55, ease:'elastic.out(1,0.48)' });
        });
        card.addEventListener('mousemove', function (e) {
            var r  = card.getBoundingClientRect();
            var dx = (e.clientX-(r.left+r.width /2))/(r.width /2);
            var dy = (e.clientY-(r.top +r.height/2))/(r.height/2);
            gsap.to(inner, { rotationX:-dy*7, rotationY:dx*7,
                             transformPerspective:700, duration:0.28, ease:'power2.out' });
        });
    }

    /* ── Touch swipe (mobile) ── */
    function initTouchSwipe(el) {
        if (!el) return;
        var startX = 0;
        el.addEventListener('touchstart', function (e) {
            startX = e.touches[0].clientX;
        }, { passive:true });
        el.addEventListener('touchend', function (e) {
            if (Math.abs(e.changedTouches[0].clientX - startX) > 50) rotateToNext();
        }, { passive:true });
    }

    /* ═══════════════════════════════════════════════════════════
       ACTIVE CARD — cTop always receives .is-active
    ═══════════════════════════════════════════════════════════ */
    function setActive() {
        [S.cTop, S.cLeft, S.cRight].forEach(function(c){ if(c) c.classList.remove('is-active'); });
        if (S.cTop) S.cTop.classList.add('is-active');
    }

    /* ═══════════════════════════════════════════════════════════
       IDLE FLOAT ANIMATIONS — independent per card
    ═══════════════════════════════════════════════════════════ */
    function startFloat(card, baseY, delay) {
        if (!card) return;
        var tw = gsap.to(card, {
            y: baseY - (6 + Math.random() * 4),
            duration: 2.6 + Math.random() * 0.8,
            ease:'sine.inOut', yoyo:true, repeat:-1,
            delay: delay || 0,
        });
        S.floats.push({ card:card, tween:tw });
    }
    function stopFloats() {
        S.floats.forEach(function(f){ f.tween.kill(); });
        S.floats = [];
    }
    function startFloats() {
        var s = S.slots;
        startFloat(S.cTop,   s.top.y,   0);
        startFloat(S.cLeft,  s.left.y,  0.7);
        startFloat(S.cRight, s.right.y, 1.3);
    }

    /* ═══════════════════════════════════════════════════════════
       DYNAMIC NAVIGATION — fully driven by FEATURES.length
    ═══════════════════════════════════════════════════════════ */
    function buildNav() {
        if (!D.navDots) return;
        /* Generate one dot per feature — no hardcoded HTML */
        D.navDots.innerHTML = '';
        FEATURES.forEach(function(_, i) {
            var d = document.createElement('span');
            d.className = 'wcu__nav-dot' + (i === 0 ? ' is-active' : '');
            d.setAttribute('role', 'listitem');
            d.setAttribute('aria-label', 'Feature ' + (i + 1) + ' of ' + FEATURES.length);
            D.navDots.appendChild(d);
        });
        updateNav();
    }

    function updateNav() {
        /* Dots */
        var dots = D.navDots ? D.navDots.querySelectorAll('.wcu__nav-dot') : [];
        var cur  = S.activeIdx % FEATURES.length;
        dots.forEach(function(d, i){ d.classList.toggle('is-active', i === cur); });

        /* Counter: "Feature 02 / 06" — never hardcoded */
        if (D.navLabel) {
            D.navLabel.textContent =
                'Feature ' + pad(cur + 1) + ' / ' + pad(FEATURES.length);
        }
    }

    /* ═══════════════════════════════════════════════════════════
       HINT
    ═══════════════════════════════════════════════════════════ */
    function showHint() {
        if (!S.clicked && D.hint) D.hint.classList.add('is-visible');
    }
    function markClicked() {
        if (S.clicked) return;
        S.clicked = true;
        if (D.hint) { D.hint.classList.remove('is-visible'); D.hint.classList.add('is-gone'); }
    }

    /* ═══════════════════════════════════════════════════════════
       PULSE DEMO — cards breathe to teach clickability
    ═══════════════════════════════════════════════════════════ */
    function doPulseDemo() {
        if (S.clicked) return;
        [S.cTop, S.cLeft, S.cRight].forEach(function(card, i){
            if (!card) return;
            gsap.timeline({ delay: i * 0.35 })
                .to(card, { boxShadow:'0 12px 50px rgba(198,163,79,0.32),0 0 0 2px rgba(198,163,79,0.26)', duration:0.42, ease:'power2.out' })
                .to(card, { boxShadow:'0 8px 36px rgba(22,41,80,0.10),0 2px 8px rgba(0,0,0,0.06)',         duration:0.52, ease:'power2.in' });
        });
        gsap.delayedCall(2 * 0.35 + 0.42 + 0.52 + 0.3, showHint);
    }

    /* ═══════════════════════════════════════════════════════════
       CINEMATIC ENTRANCE — GSAP ScrollTrigger timeline
    ═══════════════════════════════════════════════════════════ */
    function buildEntrance(section) {
        /* Set initial hidden states (cards start at directional entry positions) */
        gsap.set(['.wcu__badge','.wcu__title','.wcu__body',
                  '.wcu__btn','.wcu__trust','.wcu__trusted'], { opacity:0, y:28 });
        gsap.set('#wcuCenterWrap',     { opacity:0, scale:0.72 });
        gsap.set('.wcu__glow',         { opacity:0, scale:0.60 });
        gsap.set('.wcu__ambient-ring', { opacity:0, scale:0.50 });
        /* Cards already at entry positions from spawnCard() */

        var s  = S.slots;
        var tl = gsap.timeline({
            scrollTrigger: { trigger:section, start:'top 74%', toggleActions:'play none none none' },
            defaults: { ease:'power2.out' },
            onComplete: function () {
                startFloats();
                setActive();
                gsap.delayedCall(0.5, doPulseDemo);
            },
        });

        /* ── Left panel stagger ── */
        tl.to('.wcu__glow',        { opacity:1, scale:1, duration:0.68 })
          .to('.wcu__badge',       { opacity:1, y:0, duration:0.46 },    '-=0.28')
          .to('.wcu__title',       { opacity:1, y:0, duration:0.60 },    '-=0.28')
          .to('.wcu__body',        { opacity:1, y:0, duration:0.50 },    '-=0.30')
          .to('.wcu__btn',         { opacity:1, y:0, duration:0.46, ease:'back.out(1.4)' }, '-=0.24')
          .to('.wcu__trust',       { opacity:1, y:0, duration:0.42 },    '-=0.20')
          .to('.wcu__trusted',     { opacity:1, y:0, duration:0.38 },    '-=0.16')

        /* ── Center image scales in ── */
          .to('#wcuCenterWrap',    { opacity:1, scale:1, duration:0.90, ease:'back.out(1.5)' }, '-=0.28')
          .to('.wcu__ambient-ring',{ opacity:1, scale:1, duration:0.60, ease:'back.out(1.3)' }, '-=0.56')

        /* ── Cards fly from entry positions into their orbit slots ── */
          .to(S.cTop,   { x:s.top.x,   y:s.top.y,   opacity:1, scale:1, filter:'blur(0px)', duration:0.70, ease:'back.out(1.3)' }, 'cards')
          .to(S.cLeft,  { x:s.left.x,  y:s.left.y,  opacity:1, scale:1, filter:'blur(0px)', duration:0.70, ease:'back.out(1.3)' }, 'cards+=0.15')
          .to(S.cRight, { x:s.right.x, y:s.right.y, opacity:1, scale:1, filter:'blur(0px)', duration:0.70, ease:'back.out(1.3)' }, 'cards+=0.30')

        /* ── Nav fades in last ── */
          .to('.wcu__nav', { opacity:1, duration:0.40 }, '-=0.10');
    }

    /* ═══════════════════════════════════════════════════════════
       CUSTOM CURSOR — always reads "CLICK"
    ═══════════════════════════════════════════════════════════ */
    function buildCursor() {
        var el = document.createElement('div');
        el.id = 'wcuCursor';
        el.className = 'wcu-cursor';
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML =
            '<div class="wcu-cursor__rule"></div>' +
            '<span class="wcu-cursor__text">CLICK</span>' +
            '<i class="fa-solid fa-arrow-right wcu-cursor__icon" aria-hidden="true"></i>';
        document.body.appendChild(el);

        /* Center cursor on mouse */
        gsap.set(el, { xPercent:-50, yPercent:-50 });
        var qsX = gsap.quickSetter(el, 'x', 'px');
        var qsY = gsap.quickSetter(el, 'y', 'px');

        var cx = 0, cy = 0, tx = 0, ty = 0;
        window.addEventListener('mousemove', function(e){ tx=e.clientX; ty=e.clientY; });

        /* rAF: lerp position + directional rotation */
        var prevX = 0;
        (function raf(){
            prevX = cx;
            cx += (tx-cx)*0.13;  cy += (ty-cy)*0.13;
            qsX(cx); qsY(cy);
            var vel = cx - prevX;
            if (Math.abs(vel) > 0.4) gsap.set(el, { rotation: clamp(vel*5,-18,18) });
            requestAnimationFrame(raf);
        })();

        return el;
    }

    function cursorHover(on) {
        if (!S.cursor) return;
        S.cursor.classList.toggle('is-hover', on);
    }

    function cursorShrink() {
        if (!S.cursor) return;
        S.cursor.classList.add('is-click');
        gsap.timeline()
            .to(S.cursor, { scale:0.76, duration:0.09, ease:'power3.in' })
            .to(S.cursor, { scale:1,    duration:0.44, ease:'back.out(2.5)',
                            onComplete: function(){ S.cursor.classList.remove('is-click'); } });
    }

    /* ═══════════════════════════════════════════════════════════
       STAGE HOVER — show/hide cursor, parallax, restore on leave
    ═══════════════════════════════════════════════════════════ */
    function initStageHover() {
        var st = D.stage, par = D.parEl;
        if (!st) return;

        st.addEventListener('mouseenter', function(e) {
            /* Teleport cursor to avoid position jump */
            if (S.cursor) {
                st.classList.add('show-cursor');
                gsap.to(S.cursor, { opacity:1, scale:1, duration:0.38, ease:'back.out(1.5)' });
            }
        });
        st.addEventListener('mouseleave', function() {
            if (S.cursor) {
                st.classList.remove('show-cursor');
                gsap.to(S.cursor, { opacity:0, scale:0.55, duration:0.26, ease:'power2.in',
                                    onComplete: function(){ S.cursor.classList.remove('is-hover'); } });
            }
            if (par) gsap.to(par, { rotationY:0, rotationX:0, x:0, y:0,
                                    duration:1.1, ease:'elastic.out(1,0.44)' });
        });
        st.addEventListener('mousemove', function(e) {
            if (!par) return;
            var r  = st.getBoundingClientRect();
            var dx = (e.clientX-(r.left+r.width /2))/(r.width /2);
            var dy = (e.clientY-(r.top +r.height/2))/(r.height/2);
            gsap.to(par, { rotationY:dx*9, rotationX:-dy*9, x:dx*12, y:dy*6,
                           transformPerspective:900, duration:0.82, ease:'power2.out' });
        });
    }

    /* ═══════════════════════════════════════════════════════════
       DYNAMIC GLARE — cursor-driven radial highlight on image
    ═══════════════════════════════════════════════════════════ */
    function initGlare() {
        var gl = D.glare, iw = D.imgWrap, st = D.stage;
        if (!gl || !iw || !st) return;
        st.addEventListener('mousemove', function(e) {
            var r  = iw.getBoundingClientRect();
            var px = clamp(((e.clientX-r.left)/r.width )*100, 0, 100);
            var py = clamp(((e.clientY-r.top )/r.height)*100, 0, 100);
            gl.style.background =
                'radial-gradient(circle at '+px+'% '+py+'%,rgba(255,255,255,0.22) 0%,transparent 58%)';
        });
        st.addEventListener('mouseleave', function(){
            gl.style.background =
                'radial-gradient(circle at 30% 30%,rgba(255,255,255,0.18) 0%,transparent 55%)';
        });
    }

    /* ═══════════════════════════════════════════════════════════
       CTA BUTTON — magnetic hover + ripple
    ═══════════════════════════════════════════════════════════ */
    function initMagnet(btn) {
        if (!btn) return;
        btn.addEventListener('mousemove', function(e){
            var r=btn.getBoundingClientRect();
            gsap.to(btn,{x:(e.clientX-(r.left+r.width/2))*0.27,y:(e.clientY-(r.top+r.height/2))*0.27,duration:0.30,ease:'power2.out'});
        });
        btn.addEventListener('mouseleave',function(){
            gsap.to(btn,{x:0,y:0,duration:0.65,ease:'elastic.out(1,0.42)'});
        });
    }
    function initRipple(btn) {
        if (!btn) return;
        btn.addEventListener('click',function(e){
            var r=btn.getBoundingClientRect();
            var size=Math.max(r.width,r.height)*2.4;
            var rpl=document.createElement('span');
            rpl.className='wcu__ripple';
            rpl.style.cssText='width:'+size+'px;height:'+size+'px;left:'+(e.clientX-r.left-size/2)+'px;top:'+(e.clientY-r.top-size/2)+'px;';
            btn.appendChild(rpl);
            setTimeout(function(){if(rpl.parentNode)rpl.remove();},750);
        });
    }

    /* ═══════════════════════════════════════════════════════════
       CANVAS PARTICLES
    ═══════════════════════════════════════════════════════════ */
    function initParticles(cvs) {
        var ctx=cvs.getContext('2d'),W=0,H=0;
        function resize(){W=cvs.width=cvs.offsetWidth;H=cvs.height=cvs.offsetHeight;}
        resize();
        window.addEventListener('resize',function(){setTimeout(resize,220);});
        var pts=[];
        for(var i=0;i<60;i++){
            pts.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+0.35,vx:(Math.random()-0.5)*0.21,vy:(Math.random()-0.5)*0.21,a:Math.random()*0.26+0.05,c:Math.random()>0.55?'#C6A34F':'#162950'});
        }
        (function draw(){
            ctx.clearRect(0,0,W,H);
            pts.forEach(function(p){ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.c;ctx.globalAlpha=p.a;ctx.fill();p.x=(p.x+p.vx+W)%W;p.y=(p.y+p.vy+H)%H;});
            ctx.globalAlpha=1;requestAnimationFrame(draw);
        })();
    }

    /* ═══════════════════════════════════════════════════════════
       UTILITIES
    ═══════════════════════════════════════════════════════════ */
    function clamp(v,lo,hi){ return v<lo?lo:v>hi?hi:v; }
    function pad(n)         { return String(n).padStart(2,'0'); }

    /* Read a CSS custom property as an integer */
    function cssInt(prop, fallback) {
        return parseInt(
            getComputedStyle(document.documentElement).getPropertyValue(prop) || fallback, 10
        ) || fallback;
    }

})();
