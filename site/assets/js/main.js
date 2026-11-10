/* Madagascar Data Camp — interactions */
(function () {
  'use strict';

  /* ===== RÉGLAGES ===== */
  // Afficher les prix du catalogue (en Ariary par participant) : true / false
  var SHOW_PRICES = false;
  // Adresse Formspree (https://formspree.io) pour recevoir les messages par e-mail.
  // Laisser vide : le formulaire ouvre alors la messagerie du visiteur.
  var FORM_ENDPOINT = '';
  // Option recommandée : envoyer les demandes directement dans HubSpot (formulaire HubSpot existant).
  // Renseigner l'ID du portail et le GUID du formulaire (HubSpot > Marketing > Formulaires).
  // Le formulaire HubSpot doit contenir les champs : firstname, email, company, phone, message.
  var HUBSPOT_PORTAL_ID = '';
  var HUBSPOT_FORM_GUID = '';
  var CONTACT_EMAIL = 'contact@datacamp.business';
  var TYPED_WORDS = ['Excel', 'Power BI', 'intelligence artificielle', 'Notion', 'tableaux de bord'];

  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ----- Thème clair / sombre ----- */
  $('#themeBtn').addEventListener('click', function () {
    var current = doc.getAttribute('data-theme') || 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    doc.setAttribute('data-theme', next);
    try { localStorage.setItem('mdc-theme', next); } catch (e) {}
  });

  /* ----- Menu mobile ----- */
  var burger = $('#burger'), nav = $('#nav');
  function closeNav() { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  /* ----- En-tête, barre de progression, retour en haut ----- */
  var header = $('.header'), bar = $('.progress span'), totop = $('.totop');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, h = document.body.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 10);
    bar.style.setProperty('--p', h > 0 ? (y / h).toFixed(4) : 0);
    totop.classList.toggle('is-visible', y > 900);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ----- Lien actif dans la navigation ----- */
  var navLinks = $$('.nav a[href^="#"]:not(.nav__cta)');
  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) secObs.observe(s); });
  }

  /* ----- Compteurs ----- */
  function countUp(el) {
    if (el.hasAttribute('data-plain')) return;
    var to = parseInt(el.getAttribute('data-to'), 10), t0 = null, dur = 1400;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ----- Apparition au défilement ----- */
  $$('.reveal').forEach(function (el) {
    var sib = $$('.reveal', el.parentNode).indexOf(el);
    if (sib > 0) el.style.setProperty('--rd', Math.min(sib * 0.07, 0.42) + 's');
  });
  if ('IntersectionObserver' in window && !reduce) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        $$('.count', en.target).forEach(countUp);
        obs.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(function (el) { obs.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
    $$('.count').forEach(countUp);
  }

  /* ----- Texte tapé (hero) ----- */
  var typed = $('#typed');
  if (typed && !reduce) {
    var wi = 0, ci = TYPED_WORDS[0].length, del = true;
    var loop = function () {
      var wait;
      if (del) { ci--; wait = 45; if (ci === 0) { del = false; wi = (wi + 1) % TYPED_WORDS.length; wait = 300; } }
      else { ci++; wait = 85; if (ci === TYPED_WORDS[wi].length) { del = true; wait = 1900; } }
      typed.textContent = TYPED_WORDS[wi].slice(0, ci) || '\u200b';
      setTimeout(loop, wait);
    };
    setTimeout(loop, 1900);
  }

  /* ----- Onglets du catalogue ----- */
  var tabs = $$('.tab'), ink = $('.tabs__ink');
  function moveInk(tab) {
    if (!ink || !tab) return;
    ink.style.width = tab.offsetWidth + 'px';
    ink.style.transform = 'translateX(' + tab.offsetLeft + 'px)';
    ink.style.setProperty('--c', getComputedStyle(tab).getPropertyValue('--c'));
  }
  function selectTab(name, focus) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === name;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) { moveInk(t); if (focus) t.focus(); }
    });
    $$('.panel').forEach(function (p) {
      var on = p.getAttribute('data-panel') === name;
      p.hidden = !on; p.classList.toggle('is-active', on);
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t.getAttribute('data-tab')); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); selectTab(tabs[(i + d + tabs.length) % tabs.length].getAttribute('data-tab'), true); }
    });
  });
  $$('[data-goto]').forEach(function (a) { a.addEventListener('click', function () { selectTab(a.getAttribute('data-goto')); }); });
  window.addEventListener('load', function () { moveInk($('.tab.is-active')); });
  window.addEventListener('resize', function () { moveInk($('.tab.is-active')); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveInk($('.tab.is-active')); });

  /* ----- Prix ----- */
  var fmt = new Intl.NumberFormat('fr-FR');
  $$('.price').forEach(function (p) {
    p.innerHTML = SHOW_PRICES
      ? fmt.format(+p.getAttribute('data-price')) + ' Ar <small>/ participant</small>'
      : '<small>Tarif sur demande</small>';
  });

  /* ----- Sujet pré-rempli selon le bouton cliqué ----- */
  var subj = $('#f-subject'), dom = $('#f-dom');
  $$('[data-subject]').forEach(function (a) {
    a.addEventListener('click', function () {
      var s = a.getAttribute('data-subject');
      subj.value = s;
      if (s === 'Programme sur mesure') dom.value = 'Programme sur mesure';
      if (s === 'Formation financée FMFP') $('input[name="fmfp"]').checked = true;
    });
  });
  /* ----- Fiche détaillée de chaque formation ----- */
  var CAT = window.MDC_CATALOGUE || {};
  var INCLUS = ['Test de positionnement avant la formation', 'Supports PDF, exercices corrigés et jeux de données',
    'Contact du formateur après la formation', 'Attestation si présence ≥ 80 %'];
  var DOMAINES = { excel: 'Excel', pbi: 'Power BI', ia: 'Intelligence artificielle', notion: 'Notion' };
  var modal = $('#courseModal'), current = null;
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function list(arr) { return '<ul class="mlist">' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
  function openCourse(c) {
    var id = c.getAttribute('data-id'), d = CAT[id] || {}, panel = c.closest('.panel');
    current = c;
    modal.style.setProperty('--c', getComputedStyle(panel).getPropertyValue('--c'));
    $('#mLvl').textContent = $('.course__lvl', c).textContent;
    $('#mTitle').textContent = $('h3', c).textContent;
    var facts = ['<span>◷ ' + esc($('.course__meta span', c).textContent) + '</span>', '<span>' + DOMAINES[panel.getAttribute('data-panel')] + '</span>'];
    if (SHOW_PRICES) facts.push('<span>' + fmt.format(+$('.price', c).getAttribute('data-price')) + ' Ar / participant</span>');
    if (d.format) facts.push('<span>' + esc(d.format) + '</span>');
    $('#mFacts').innerHTML = facts.join('');
    var h = '';
    if (d.resume && !d.niveau) h += '<p class="mlead">' + esc(d.resume) + '</p>';
    var side = '';
    if (d.niveau) side += '<div class="mbox"><h4>Niveau</h4><p>' + esc(d.niveau) + '</p></div>';
    if (d.public) side += '<div class="mbox"><h4>Public</h4><p>' + esc(d.public) + '</p></div>';
    if (d.prerequis) side += '<div class="mbox"><h4>Prérequis</h4><p>' + esc(d.prerequis) + '</p></div>';
    if (side) h += '<div class="mgrid">' + side + '</div>';
    if (d.objectifs && d.objectifs.length) h += '<section><h4>Objectifs</h4>' + list(d.objectifs) + '</section>';
    if (d.programme && d.programme.length) {
      h += '<section><h4>Programme</h4><ol class="mprog">' + d.programme.map(function (m, i) {
        if (typeof m === 'string') return '<li><span class="mprog__n">' + (i + 1) + '</span><div><b>' + esc(m) + '</b></div></li>';
        return '<li><span class="mprog__n">' + (i + 1) + '</span><div><b>' + esc(m.titre) + '</b>' + (m.points ? list(m.points) : '') + '</div></li>';
      }).join('') + '</ol></section>';
    }
    if (d.contient) h += '<section><h4>Ce pack regroupe</h4>' + list(d.contient) + '</section>';
    if (d.intro) h += '<p class="mintro">' + esc(d.intro) + '</p>';
    if (!h) h = '<p class="mlead">Le programme détaillé de cette formation vous est envoyé sur demande.</p>';
    h += '<section class="mincl"><h4>Inclus dans chaque formation</h4>' + list(INCLUS) + '</section>';
    $('#mBody').innerHTML = h;
    $('#mBody').scrollTop = 0;
    if (modal.showModal) modal.showModal(); else modal.setAttribute('open', '');
    doc.classList.add('modal-open');
  }
  function closeModal() {
    modal.classList.add('is-closing');
    setTimeout(function () { modal.classList.remove('is-closing'); if (modal.close) modal.close(); else modal.removeAttribute('open'); doc.classList.remove('modal-open'); if (current) current.focus(); }, reduce ? 0 : 220);
  }
  $$('[data-close]', modal).forEach(function (b) { b.addEventListener('click', closeModal); });
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  modal.addEventListener('cancel', function (e) { e.preventDefault(); closeModal(); });
  $('#mQuote').addEventListener('click', function () {
    var c = current, name = $('h3', c).textContent;
    subj.value = 'Demande : ' + name;
    dom.value = DOMAINES[c.closest('.panel').getAttribute('data-panel')];
    var msg = $('#f-msg');
    if (!msg.value) msg.value = 'Bonjour, je souhaite un devis pour la formation « ' + name + ' ».';
    closeModal();
    setTimeout(function () { $('#contact').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }, 240);
    setTimeout(function () { $('#f-name').focus({ preventScroll: true }); }, 900);
  });
  $$('.course').forEach(function (c) {
    var d = CAT[c.getAttribute('data-id')], desc = $('[data-desc]', c);
    if (d && d.resume && desc) desc.textContent = d.resume; else if (desc) desc.remove();
    c.addEventListener('click', function () { openCourse(c); });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCourse(c); } });
  });

  /* ----- Titres : apparition mot par mot ----- */
  if (!reduce) {
    $$('h2').forEach(function (h) {
      var walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), nodes = [], n, i = 0;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(function (node) {
        var isGrad = node.parentNode.classList && node.parentNode.classList.contains('grad');
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var w = document.createElement('span'), inner = document.createElement('span');
          w.className = 'wl'; inner.className = 'w' + (isGrad ? ' grad' : ''); inner.textContent = part;
          inner.style.transitionDelay = (i++ * 0.05) + 's';
          w.appendChild(inner); frag.appendChild(w);
        });
        node.parentNode.replaceChild(frag, node);
      });
      $$('.grad', h).forEach(function (g) { if (!g.classList.contains('w')) g.classList.add('grad--parent'); });
      h.classList.add('split');
    });
  }

  /* ----- Formulaire ----- */
  var form = $('#contactForm'), status = $('#formStatus');
  function validate() {
    var ok = true;
    [['#f-name', function (v) { return v.trim().length > 1; }],
     ['#f-mail', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }],
     ['#f-msg', function (v) { return v.trim().length > 4; }]].forEach(function (r) {
      var el = $(r[0]), good = r[1](el.value);
      el.closest('.field').classList.toggle('is-invalid', !good);
      if (!good && ok) { el.focus(); ok = false; }
    });
    return ok;
  }
  $$('input, textarea', form).forEach(function (el) {
    el.addEventListener('input', function () { var f = el.closest('.field'); if (f) f.classList.remove('is-invalid'); });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form__status'; status.textContent = '';
    if (!validate()) return;
    var data = new FormData(form);
    if (data.get('_gotcha')) return;
    if (HUBSPOT_PORTAL_ID && HUBSPOT_FORM_GUID) {
      var details = ['Type : ' + data.get('type'), 'Formation : ' + data.get('formation'), 'Participants : ' + (data.get('participants') || '-'),
        'FMFP : ' + (data.get('fmfp') ? 'Oui' : 'Non'), 'Sujet : ' + data.get('sujet'), '', data.get('message')].join('\n');
      var hs = { fields: [
        { name: 'firstname', value: data.get('nom') }, { name: 'email', value: data.get('email') },
        { name: 'company', value: data.get('organisation') || '' }, { name: 'phone', value: data.get('telephone') || '' },
        { name: 'message', value: details }],
        context: { pageUri: location.href, pageName: document.title } };
      form.classList.add('is-loading');
      fetch('https://api.hsforms.com/submissions/v3/integration/submit/' + HUBSPOT_PORTAL_ID + '/' + HUBSPOT_FORM_GUID,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(hs) })
        .then(function (r) { if (!r.ok) throw new Error(); form.reset(); status.className = 'form__status ok'; status.textContent = 'Merci ! Votre demande est envoyée, nous revenons vers vous rapidement.'; })
        .catch(function () { status.className = 'form__status ko'; status.textContent = 'Envoi impossible. Écrivez-nous à ' + CONTACT_EMAIL + '.'; })
        .then(function () { form.classList.remove('is-loading'); });
      return;
    }
    if (!FORM_ENDPOINT) {
      var lines = [];
      data.forEach(function (v, k) { if (k !== '_gotcha' && k !== 'sujet' && v) lines.push(k.charAt(0).toUpperCase() + k.slice(1) + ' : ' + v); });
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(data.get('sujet') + ' — site web') + '&body=' + encodeURIComponent(lines.join('\n'));
      status.className = 'form__status ok';
      status.textContent = 'Votre messagerie s\'ouvre avec le message prêt à envoyer.';
      return;
    }
    form.classList.add('is-loading');
    fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(); form.reset(); status.className = 'form__status ok'; status.textContent = 'Merci ! Votre demande est envoyée, nous revenons vers vous rapidement.'; })
      .catch(function () { status.className = 'form__status ko'; status.textContent = 'Envoi impossible. Écrivez-nous à ' + CONTACT_EMAIL + '.'; })
      .then(function () { form.classList.remove('is-loading'); });
  });

  /* ----- Effets au survol (ordinateur uniquement) ----- */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var dash = $('.tilt'), vis = $('.hero__visual');
    if (dash && vis) {
      vis.addEventListener('mousemove', function (e) {
        var r = vis.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        dash.style.transform = 'rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg)';
      });
      vis.addEventListener('mouseleave', function () { dash.style.transform = ''; });
    }
    $$('.magnetic').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.25 + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* ----- Lumière qui suit la souris sur les cartes + halo global + parallaxe ----- */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.course:not(.course--top), .tile, .step, .value, .stat, .acc details, .form').forEach(function (el) {
      el.classList.add('spot');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    var glow = $('.cursor-glow'), gx = 0, gy = 0, tx = 0, ty = 0;
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; glow.classList.add('on'); }, { passive: true });
    (function follow() {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = 'translate(' + gx + 'px,' + gy + 'px)';
      requestAnimationFrame(follow);
    })();
  }
  /* Le fond change doucement de teinte au fil de la page */
  var orbs = $('.ambient__orbs');
  if (orbs && !reduce) {
    window.addEventListener('scroll', function () {
      var p = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      orbs.style.transform = 'rotate(' + (p * 90) + 'deg) scale(' + (1 + p * 0.15) + ')';
    }, { passive: true });
  }

  $('#year').textContent = new Date().getFullYear();
})();
