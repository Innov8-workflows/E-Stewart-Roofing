/* E Stewart Roofing Ltd
   Shared behaviour for every page. Each block guards its own hooks, because
   pages differ in what they contain: only the homepage has a hero video, only
   some pages carry the reviews carousel or the gallery. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- GA4 ----
     The measurement ID arrives as data-ga on <html> rather than in an inline
     <script>, because the CSP is script-src 'self' with no 'unsafe-inline'
     and the stock Google snippet's second block would be refused silently:
     the page would look perfectly fine and report zero users forever.
     The loader tag itself is external, so it only needs the host allowlisting.
     dataLayer queues, so config order against the async loader does not
     matter. */
  var gaId = document.documentElement.getAttribute('data-ga');
  if (gaId) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', gaId);
  }

  /* ---- conversion events ----
     Matched on the href, NOT on a data-track attribute. Three links on the
     site were missing the attribute, including the WhatsApp float, which is
     one of the busiest paths on a trade site. Matching the destination means
     a new link cannot be added untracked.

     Delegated from document so it also covers anything rendered later.
     GA4 sends these over the Beacon API, so navigating away does not lose
     them and there is no need to delay the click. */
  var ev = function (name, params) {
    if (window.gtag) window.gtag('event', name, params || {});
  };

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var label = (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);

    if (/^tel:/i.test(href)) {
      ev('click_to_call', { link_url: href, link_text: label, method: 'phone' });
    } else if (/(^https?:)?\/\/(wa\.me|api\.whatsapp\.com)/i.test(href)) {
      ev('click_whatsapp', { link_url: href, link_text: label, method: 'whatsapp' });
    } else if (/^mailto:/i.test(href)) {
      ev('click_email', { link_url: href, link_text: label, method: 'email' });
    }
  }, true);

  /* ---- current year in the footer ---- */
  var yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- mobile menu ---- */
  var burger = $('#burger'), panel = $('#navPanel');
  if (burger && panel) {
    burger.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('a', panel).forEach(function (a) {
      a.addEventListener('click', function () {
        panel.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- hero photo slider (absent when a hero video is in place) ---- */
  var slides = $$('.hero-slide');
  if (slides.length > 1) {
    var si = 0;
    setInterval(function () {
      slides[si].classList.remove('is-on');
      si = (si + 1) % slides.length;
      slides[si].classList.add('is-on');
    }, 5500);
  }

  /* ---- reviews carousel ---- */
  var track = $('#rvTrack'), dotsBox = $('#rvDots'), rv = $('#rv');
  if (track && dotsBox && rv) {
    var cards = $$('.rv__card', track);
    var page = 0, timer = null;
    var perView = function () { return window.matchMedia('(min-width:860px)').matches ? 3 : 1; };
    var pages = function () { return Math.ceil(cards.length / perView()); };

    var render = function () {
      var pv = perView(), max = pages();
      if (page > max - 1) page = max - 1;
      if (page < 0) page = 0;
      track.style.transform = 'translateX(' + (-page * 100) + '%)';
      dotsBox.innerHTML = '';
      for (var i = 0; i < max; i++) {
        var b = document.createElement('button');
        b.className = 'rv__dot' + (i === page ? ' on' : '');
        b.setAttribute('aria-label', 'Go to review page ' + (i + 1));
        (function (n) { b.addEventListener('click', function () { page = n; render(); restart(); }); })(i);
        dotsBox.appendChild(b);
      }
      cards.forEach(function (c, i) {
        c.setAttribute('aria-hidden', (i >= page * pv && i < (page + 1) * pv) ? 'false' : 'true');
      });
    };
    var go = function (d) { var max = pages(); page = (page + d + max) % max; render(); };
    var restart = function () { clearInterval(timer); timer = setInterval(function () { go(1); }, 6000); };

    var nx = $('#rvNext'), pr = $('#rvPrev');
    if (nx) nx.addEventListener('click', function () { go(1); restart(); });
    if (pr) pr.addEventListener('click', function () { go(-1); restart(); });
    rv.addEventListener('mouseenter', function () { clearInterval(timer); });
    rv.addEventListener('mouseleave', restart);

    var x0 = null;
    track.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) { go(dx < 0 ? 1 : -1); restart(); }
      x0 = null;
    }, { passive: true });

    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(render, 150); });
    render(); restart();
  }

  /* ---- gallery lightbox ---- */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbX = $('#lbX');
  if (lb && lbImg) {
    $$('.gal__i img').forEach(function (img) {
      img.parentNode.addEventListener('click', function () {
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    var closeLb = function () {
      lb.classList.remove('open'); lbImg.src = ''; document.body.style.overflow = '';
    };
    if (lbX) lbX.addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('open')) closeLb();
    });
  }

  /* ---- FAQ accordions ----
     Built on <details>, so every answer sits in the DOM and is readable by
     crawlers and answer engines whether or not it happens to be open.
     This handler only closes the siblings; <details> does the rest. */
  $$('.faq__i').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      var group = d.closest('.faq');
      if (!group) return;
      $$('.faq__i', group).forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---- quote form -> WhatsApp ---- */
  var form = $('#quoteForm');
  if (form) {
    var WA = form.getAttribute('data-wa') || '447464695657';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      /* read through .elements: form.name and form.action are reserved
         properties on HTMLFormElement and would shadow the inputs */
      var el = e.target.elements;
      var val = function (n) { return el[n] && el[n].value ? el[n].value.trim() : ''; };
      var name = val('name'), phone = val('phone');
      if (!name || !phone) {
        var miss = el[!name ? 'name' : 'phone'];
        if (miss && miss.focus) miss.focus();
        alert('Please add your name and phone number so we can get back to you.');
        return;
      }
      var lines = ['Hello E Stewart Roofing, I would like a quote.', '',
                   'Name: ' + name, 'Phone: ' + phone];
      if (val('area')) lines.push('Area: ' + val('area'));
      if (val('job')) lines.push('Job: ' + val('job'));
      if (val('message')) lines.push('', 'Details: ' + val('message'));
      /* Where it came from, so this is distinguishable from a message sent
         straight to the number. The label is written into data-src at build
         time rather than hardcoded here, so the domain lives in data.js. */
      var src = form.getAttribute('data-src');
      if (src) lines.push('', 'Sent from ' + src);
      /* Fired before the redirect. GA4 uses the Beacon API, so it survives
         the navigation; the alternative, delaying the redirect on a callback,
         costs the user time and drops the lead if the callback never fires. */
      ev('generate_lead', {
        method: 'whatsapp_form',
        form_id: 'quoteForm',
        job_type: val('job') || '(not given)',
        area: val('area') || '(not given)'
      });
      window.location.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n'));
    });
  }
})();


/* ============================================================
   LEAD LOGGER  ->  Google Sheet + email alert + innov8 CRM
   via the Apps Script web app.

   NEVER navigator.sendBeacon here. Brave, uBlock and Firefox's strict
   tracking protection block the beacon WHILE sendBeacon() still returns
   true, so the common `if (sendBeacon(...)) return; fetch(...)` shape
   skips the working fetch and the lead vanishes with no error anywhere.
   fetch + keepalive survives the WhatsApp hand-off just as well and
   cannot report a success it did not achieve.

   Not consent-gated: it sets no cookies and stores no identifier, and a
   submitted enquiry is data the customer chose to send. PECR consent
   governs device storage, which this has none of. A declined cookie
   banner must never cost a real enquiry.

   The type strings below MUST stay identical to NOTIFY_TYPES in the
   Apps Script. A mismatch silently disables every alert for that action.
   ============================================================ */
(function () {
  var LEAD_URL = "https://script.google.com/macros/s/AKfycbxM5pk0gwWT7Dmj2Lzqep5WAqpp2aogvklq0JHrVFa_rAv0auqs3Tm5oJhVdE_CW3g2KA/exec";

  /* Inert until the real deployment URL is pasted in, so a build shipped
     mid-setup cannot fire requests at nothing. */
  if (LEAD_URL.indexOf('https://script.google.com/') !== 0) return;

  /* ?test=1 flags the payload so a check submission is identifiable.
     NOTE the CRM does not separate test leads - delete them afterwards. */
  var TEST = /[?&]test=1/.test(location.search);

  function send(d) {
    try {
      d.page = location.pathname || '/';
      d.referrer = document.referrer || '';
      if (TEST) d.test = true;
      fetch(LEAD_URL, {
        method: 'POST',
        mode: 'no-cors',            /* we never read the reply, only deliver it */
        keepalive: true,            /* survives unload and the app-switch */
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },  /* no preflight */
        body: JSON.stringify(d)
      })['catch'](function () { /* never break the page */ });
    } catch (e) { /* never break the page */ }
  }

  /* Where on the page it happened -> the Source column, so "four calls off
     the bottom CTA" is an answerable question. */
  function where(el) {
    if (!el || !el.closest) return 'page';
    if (el.closest('.wa')) return 'whatsapp float';
    if (el.closest('.nav')) return 'nav';
    if (el.closest('.hero')) return 'hero';
    if (el.closest('.phead')) return 'page header';
    if (el.closest('.form')) return 'contact form';
    if (el.closest('.band')) return 'mid-page CTA';
    if (el.closest('.fcta')) return 'bottom CTA';
    if (el.closest('.ft')) return 'footer';
    return 'page';
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var a = t.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href') || '';

    if (h.indexOf('tel:') === 0) {
      send({ type: 'Call click', phone: h.replace('tel:', ''), source: where(a) });
    } else if (/wa\.me|api\.whatsapp\.com|whatsapp:/i.test(h)) {
      send({ type: 'WhatsApp click', source: where(a) });
    } else if (h.indexOf('mailto:') === 0) {
      send({ type: 'Email click', details: h.replace('mailto:', '').split('?')[0], source: where(a) });
    }
  }, true);

  /* Capture phase on document, so this runs BEFORE the handler above carries
     the tab off to WhatsApp and while the fields are still populated.
     Read through .elements for the same reason that handler does: form.name
     and form.action are reserved properties and would shadow the inputs.
     The name/phone guard mirrors that handler exactly - it alerts and aborts
     when either is missing, so logging then would record a lead that never
     actually left the page. */
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || f.id !== 'quoteForm') return;
    var el = f.elements;
    var v = function (n) { return el[n] && el[n].value ? String(el[n].value).trim() : ''; };
    if (!v('name') || !v('phone')) return;
    send({
      type: 'Quote form',
      name: v('name'),
      phone: v('phone'),
      area: v('area'),
      service: v('job'),
      details: v('message'),
      source: where(f)
    });
  }, true);
})();
