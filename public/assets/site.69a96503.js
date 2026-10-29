

(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var root = document.documentElement;
  var gaId = root.getAttribute('data-ga');
  var pxId = root.getAttribute('data-pixel');

  var awId = root.getAttribute('data-aw') || '';
  var awLead = root.getAttribute('data-aw-lead') || '';
  var awCall = root.getAttribute('data-aw-call') || '';

  var gate = document.getElementById('cc');
  var KEY = 'es-consent';
  var started = false;

  function startTrackers() {
    if (started) return;
    started = true;
    if (gaId || awId) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      if (gaId) window.gtag('config', gaId);
      if (awId) window.gtag('config', awId);

      if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
        var g = document.createElement('script');
        g.async = true;
        g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId || awId);
        document.head.appendChild(g);
      }
    }

    if (pxId) {

      !function (f, b, e, v, n, t, s2) {
        if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v;
        s2 = b.getElementsByTagName(e)[0]; s2.parentNode.insertBefore(t, s2);
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', pxId);
      window.fbq('track', 'PageView');
    }
  }

  var q = [];

  function conv(label) {
    if (!window.gtag || !awId || !label) return;
    window.gtag('event', 'conversion', { send_to: awId + '/' + label });
  }
  window.track = function (name, params) {
    if (!started) { q.push([name, params]); return; }
    if (window.gtag) window.gtag('event', name, params || {});
    if (name === 'Lead') conv(awLead);
    if (window.fbq) {
      var STD = { Lead: 1, Contact: 1, PageView: 1 };
      window.fbq(STD[name] ? 'track' : 'trackCustom', name, params || {});
    }
  };
  function flush() { var c = q.slice(); q.length = 0; c.forEach(function (e) { window.track(e[0], e[1]); }); }

  function clearCookies() {
    var host = location.hostname.replace(/^www\./, '');
    var domains = ['', location.hostname, '.' + host];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!/^(_ga|_gcl|_fbp|_fbc)/.test(name)) return;
      domains.forEach(function (dm) {
        document.cookie = name + '=; Max-Age=0; path=/' + (dm ? '; domain=' + dm : '');
      });
    });
  }
  function showGate() {
    if (!gate) return;
    gate.hidden = false;
    document.body.classList.add('cc-open');
    root.style.setProperty('--cc-h', gate.offsetHeight + 'px');
  }

  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  if (stored === 'yes') { startTrackers(); flush(); }
  else if (stored === 'no') clearCookies();
  else showGate();

  if (gate) {
    gate.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-cc]') : null;
      if (!b) return;
      var yes = b.getAttribute('data-cc') === 'yes';
      try { localStorage.setItem(KEY, yes ? 'yes' : 'no'); } catch (e2) {}
      gate.hidden = true;
      document.body.classList.remove('cc-open');
      if (yes) { startTrackers(); flush(); return; }
      q.length = 0;
      if (gaId) window['ga-disable-' + gaId] = true;
      if (awId) window['ga-disable-' + awId] = true;
      clearCookies();
      if (started) location.reload();
    });
  }
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-cookie-settings]') : null;
    if (!t) return;
    e.preventDefault();
    showGate();
  });

  var ev = function (name, params) {
    if (window.gtag) window.gtag('event', name, params || {});
  };

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;

    if (a.hasAttribute('data-quiz-send')) return;
    var href = a.getAttribute('href') || '';
    var label = (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);

    if (/^tel:/i.test(href)) {
      ev('click_to_call', { link_url: href, link_text: label, method: 'phone' });
      conv(awCall);
    } else if (/(^https?:)?\/\/(wa\.me|api\.whatsapp\.com)/i.test(href)) {
      ev('click_whatsapp', { link_url: href, link_text: label, method: 'whatsapp' });
    } else if (/^mailto:/i.test(href)) {
      ev('click_email', { link_url: href, link_text: label, method: 'email' });
    }
  }, true);

  var yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();

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

  var slides = $$('.hero-slide');
  if (slides.length > 1) {
    var si = 0;
    setInterval(function () {
      slides[si].classList.remove('is-on');
      si = (si + 1) % slides.length;
      slides[si].classList.add('is-on');
    }, 5500);
  }

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

  $$('.faq__i').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      var group = d.closest('.faq');
      if (!group) return;
      $$('.faq__i', group).forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  var form = $('#quoteForm');
  if (form) {
    var WA = form.getAttribute('data-wa') || '447464695657';
    form.addEventListener('submit', function (e) {
      e.preventDefault();

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

      var src = form.getAttribute('data-from');
      if (src) lines.push('', 'Sent from ' + src);

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

(function () {
  var LEAD_URL = "https://script.google.com/macros/s/AKfycbxM5pk0gwWT7Dmj2Lzqep5WAqpp2aogvklq0JHrVFa_rAv0auqs3Tm5oJhVdE_CW3g2KA/exec";

  if (LEAD_URL.indexOf('https://script.google.com/') !== 0) return;

  var TEST = /[?&]test=1/.test(location.search);

  var AK = 'es-attrib';
  function attrib() {
    var keep = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
                'utm_term', 'fbclid', 'gclid'];
    var found = {}, any = false;
    try {
      var q = new URLSearchParams(location.search);
      keep.forEach(function (k) {
        var v = q.get(k);
        if (v) { found[k] = String(v).slice(0, 200); any = true; }
      });
    } catch (e) {}
    try {
      if (any) { sessionStorage.setItem(AK, JSON.stringify(found)); return found; }
      var saved = sessionStorage.getItem(AK);
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return found; }
  }

  function send(d) {
    try {
      d.page = location.pathname || '/';
      d.referrer = document.referrer || '';
      var a = attrib();
      for (var k in a) { if (a.hasOwnProperty(k) && !d[k]) d[k] = a[k]; }
      if (TEST) d.test = true;
      fetch(LEAD_URL, {
        method: 'POST',
        mode: 'no-cors',
        keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(d)
      })['catch'](function () {   });
    } catch (e) {   }
  }

  function where(el) {
    if (!el || !el.closest) return 'page';
    if (el.closest('.wa')) return 'whatsapp float';
    if (el.closest('.callbar')) return 'sticky call bar';
    if (el.closest('.nav')) return 'nav';
    if (el.closest('.hero')) return 'hero';
    if (el.closest('.phead')) return 'page header';
    if (el.closest('.form')) return 'contact form';
    if (el.closest('.band')) return 'mid-page CTA';
    if (el.closest('.fcta')) return 'bottom CTA';
    if (el.closest('.ft')) return 'footer';
    return 'page';
  }

  window.sendLead = send;

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var a = t.closest('a[href]');
    if (!a) return;

    if (a.hasAttribute('data-quiz-send')) return;
    var h = a.getAttribute('href') || '';

    if (h.indexOf('tel:') === 0) {
      send({ type: 'Call click', phone: h.replace('tel:', ''), source: where(a) });
    } else if (/wa\.me|api\.whatsapp\.com|whatsapp:/i.test(h)) {
      send({ type: 'WhatsApp click', source: where(a) });
    } else if (h.indexOf('mailto:') === 0) {
      send({ type: 'Email click', details: h.replace('mailto:', '').split('?')[0], source: where(a) });
    }
  }, true);

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

(function () {
  'use strict';
  var quiz = document.querySelector('[data-quiz]');

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  var ups = document.querySelectorAll('.up');
  if (ups.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      Array.prototype.forEach.call(ups, function (el) { io.observe(el); });
    } else {

      Array.prototype.forEach.call(ups, function (el) { el.classList.add('in'); });
    }
  }

  if (!quiz) return;

  var root = document.documentElement;
  var WA = root.getAttribute('data-wa') || '';
  var SMS = root.getAttribute('data-sms') || '';

  var steps = quiz.querySelectorAll('.qstep');
  var fill = quiz.querySelector('[data-quiz-fill]');
  var count = quiz.querySelector('[data-quiz-count]');
  var back = quiz.querySelector('[data-quiz-back]');
  var nameEl = quiz.querySelector('[data-quiz-name]');
  var phoneEl = quiz.querySelector('[data-quiz-phone]');
  var addrEl = quiz.querySelector('[data-quiz-address]');
  var botEl = quiz.querySelector('[data-quiz-bot]');
  var errEl = quiz.querySelector('[data-quiz-error]');
  var sumEl = quiz.querySelector('[data-quiz-summary]');

  function validate(name, phone, addr) {
    var digits = phone.replace(/\D/g, '');
    if (name.length < 2) return { el: nameEl, msg: 'Please add your name.' };
    if (digits.length < 10 || digits.length > 13) return { el: phoneEl, msg: 'Please add a phone number we can ring you on.' };
    if (addr.length < 4) return { el: addrEl, msg: 'Please add the address or postcode of the roof.' };
    return null;
  }
  function showError(p, quiet) {
    [nameEl, phoneEl, addrEl].forEach(function (el) { if (el) el.classList.remove('bad'); });
    if (!p) { if (errEl) errEl.hidden = true; return; }
    if (errEl) { errEl.textContent = p.msg; errEl.hidden = false; }
    if (p.el) { p.el.classList.add('bad'); if (!quiet) p.el.focus(); }
  }

  var tried = false;
  function recheck() {
    if (!tried) return;
    showError(validate(nameEl ? nameEl.value.trim() : '', phoneEl ? phoneEl.value.trim() : '', addrEl ? addrEl.value.trim() : ''), true);
  }
  var TOTAL = steps.length;
  var current = 1;

  var KEYS = [], LABELS = {}, answers = {};
  Array.prototype.forEach.call(steps, function (s) {
    var k = s.getAttribute('data-key');
    if (!k) return;
    KEYS.push(k);
    LABELS[k] = s.getAttribute('data-label') || k;
    answers[k] = '';
  });
  var WORK = quiz.getAttribute('data-work') || '';
  var FROM = quiz.getAttribute('data-from') || 'the ad landing page';
  var SOURCE = quiz.getAttribute('data-source') || 'ad landing page';
  var job = function () { return WORK || answers.work || ''; };

  var lines = function () {
    var out = [];
    if (WORK) out.push('Job: ' + WORK);
    KEYS.forEach(function (k) { if (answers[k]) out.push(LABELS[k] + ': ' + answers[k]); });
    return out;
  };

  function show(n) {
    current = Math.min(Math.max(n, 1), TOTAL);
    Array.prototype.forEach.call(steps, function (s) {
      s.classList.toggle('on', Number(s.getAttribute('data-step')) === current);
    });
    if (fill) fill.style.width = (current / TOTAL * 100) + '%';
    if (count) count.textContent = 'Step ' + current + ' of ' + TOTAL;
    if (back) back.hidden = current === 1;
    if (current === TOTAL) render();
  }

  function message() {
    var name = nameEl ? nameEl.value.trim() : '';
    var phone = phoneEl ? phoneEl.value.trim() : '';
    var addr = addrEl ? addrEl.value.trim() : '';
    var out = ['Hello E Stewart Roofing, I would like a free quote.', ''].concat(lines());
    if (name) out.push('Name: ' + name);
    if (phone) out.push('Phone: ' + phone);
    if (addr) out.push('Address: ' + addr);
    out.push('', 'Sent from ' + FROM + ' on estewartroofingltd.co.uk');
    return out.join('\n');
  }

  function render() {
    if (sumEl) {
      sumEl.textContent = 'Your answers: ' + KEYS.map(function (k) { return answers[k]; })
        .filter(Boolean).join('  |  ');
    }
    var text = encodeURIComponent(message());
    var wa = quiz.querySelector('[data-quiz-send="whatsapp"]');
    var sms = quiz.querySelector('[data-quiz-send="sms"]');
    if (wa) wa.href = 'https://wa.me/' + WA + '?text=' + text;

    if (sms) sms.href = 'sms:' + SMS + '?&body=' + text;
  }

  quiz.addEventListener('click', function (e) {
    var opt = e.target && e.target.closest ? e.target.closest('.opt') : null;
    if (!opt) return;
    var stepEl = opt.closest('.qstep');
    var step = Number(stepEl.getAttribute('data-step'));
    var key = stepEl.getAttribute('data-key') || KEYS[step - 1];
    answers[key] = opt.getAttribute('data-val') || '';

    if (step === 1 && window.track) window.track('funnel_start', { answer: answers[key] });
    if (window.track) window.track('funnel_step', { step: step, answer: answers[key] });
    show(step + 1);
  });

  if (back) back.addEventListener('click', function () { show(current - 1); });
  [nameEl, phoneEl, addrEl].forEach(function (el) {
    if (el) el.addEventListener('input', function () { render(); recheck(); });
  });

  Array.prototype.forEach.call(quiz.querySelectorAll('[data-quiz-send]'), function (btn) {
    btn.addEventListener('click', function (e) {
      var name = nameEl ? nameEl.value.trim() : '';
      var phone = phoneEl ? phoneEl.value.trim() : '';
      var addr = addrEl ? addrEl.value.trim() : '';

      var problem = validate(name, phone, addr);
      if (problem) { e.preventDefault(); tried = true; showError(problem); return; }
      showError(null);
      if (window.sendLead) {

        window.sendLead({
          type: 'Quote funnel',
          name: name,

          phone: phone,
          area: addr,
          service: job(),
          details: lines().join(' | '),
          source: SOURCE,
          botcheck: botEl ? botEl.value : ''
        });
      }

      if (window.track) {
        window.track('Lead', {
          content_name: 'Quote funnel',
          method: btn.getAttribute('data-quiz-send'),
          job: job(),
          urgency: answers.urgency || ''
        });
      }
    }, false);
  });

  var float = document.querySelector('[data-quiz-wa]');
  if (float) {
    float.addEventListener('click', function () {
      float.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(message());
    });
  }

  show(1);
})();
