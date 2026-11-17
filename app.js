(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);
  const DAY = 864e5;
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmt = d => `${WD[d.getDay()]} ${MO[d.getMonth()]} ${d.getDate()}`;
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const isClosed = d => d.getDay() === 0 || d.getDay() === 1; // Google hours: closed Sun and Mon

  // Typical upkeep rhythms (industry norms, labelled "typical" on the page; the salon lists none).
  const PLANS = {
    press: {
      name: 'Silk press', service: 'Silk press', every: 'every 1 to 2 weeks',
      rhythm: '<strong>Every 1 to 2 weeks</strong> · about 2 to 3 hours · typical',
      visits: [[0, 'Silk press'], [14, 'Refresh'], [28, 'Refresh'], [42, 'Refresh'], [56, 'Trim + press'], [70, 'Refresh']],
      home: { every: 7, label: 'Sunday reset: wash the scarf, oil the ends' },
      tips: ['Wrap or pin it every night under a satin scarf.', 'Keep it dry: shower cap, umbrella, a band when you work out.', 'No flat iron at home. Let the press do the work.'],
      img: 'style-silk-press', alt: 'A silk-pressed bob with a long side-swept fringe, in the chair at Ultimate Visions', cap: 'Silk press, from the chair at 607a'
    },
    locs: {
      name: 'Locs', service: 'Loc retwist & styling', every: 'every 4 to 6 weeks',
      rhythm: '<strong>Every 4 to 6 weeks</strong> · about 2 to 3 hours · typical',
      visits: [[0, 'Retwist + style'], [35, 'Retwist'], [70, 'Retwist']],
      home: { every: 7, label: 'Wash day: cleanse, then dry fully' },
      tips: ['Wash every 1 to 2 weeks and let them dry all the way.', 'Sleep in a satin bonnet or on a satin pillowcase.', "Don't twist between visits. Let the new growth come in."],
      img: 'style-locs', alt: 'A loc retwist pinned up in a sculpted style with honey-coloured tips, at Ultimate Visions', cap: 'Loc retwist and style, at 607a'
    },
    weave: {
      name: 'Weave & sew-in', service: 'Weaves & extensions', every: 'out by 8 weeks',
      rhythm: '<strong>Out by 8 weeks</strong> · install about 3 to 4 hours · typical',
      visits: [[0, 'Install'], [28, 'Check-in'], [56, 'Take-down']],
      home: { every: 14, label: 'Scalp day: cleanse between the tracks' },
      tips: ['Cleanse your scalp every 1 to 2 weeks.', 'Wrap your leave-out every night.', "Don't stretch it past 8 weeks. Your own hair needs a break."],
      img: 'style-long-sleek', alt: 'Long, straight, sleek hair from behind, styled at Ultimate Visions', cap: 'Long and sleek, at 607a'
    },
    braids: {
      name: 'Braids', service: 'Braided styling', every: 'out in 6 to 8 weeks',
      rhythm: '<strong>Out in 6 to 8 weeks</strong> · 4 to 8 hours in the chair · typical',
      visits: [[0, 'Braids in'], [28, 'Edges check'], [49, 'Take-down']],
      home: { every: 14, label: 'Scalp day: cleanse and oil lightly' },
      tips: ['Cleanse the scalp every 2 weeks.', 'Mousse and a satin scarf keep the frizz down.', 'Out by 8 weeks to protect your edges.'],
      img: 'style-braids', alt: 'Long box braids down to the waist, inside Ultimate Visions', cap: 'Box braids, inside 607a'
    },
    pixie: {
      name: 'Pixie cut', service: 'Haircut & styling', every: 'every 3 to 4 weeks',
      rhythm: '<strong>Every 3 to 4 weeks</strong> · about 1 hour · typical',
      visits: [[0, 'Cut'], [21, 'Shape-up'], [42, 'Shape-up'], [63, 'Shape-up']],
      home: { every: 7, label: 'Wash day, then wrap it flat' },
      tips: ['Wrap or pin-curl it every night.', 'Wash weekly and keep the ends moisturised.', 'Book the shape-up before the shape goes, at 3 to 4 weeks.'],
      img: 'style-pixie', alt: 'A short copper pixie in sculpted finger waves, at Ultimate Visions', cap: 'Copper pixie, at 607a'
    },
    colour: {
      name: 'Colour', service: 'Hair color', every: 'roots every 4 to 8 weeks',
      rhythm: '<strong>Roots every 4 to 8 weeks</strong> · about 2 to 3 hours · typical',
      visits: [[0, 'Colour'], [42, 'Root touch-up'], [84, 'Root touch-up']],
      home: { every: 7, label: 'Deep condition, colour-safe wash' },
      tips: ['Wait 2 to 3 days before the first wash.', 'Use a colour-safe, sulfate-free shampoo.', 'Heat protectant every time you style.'],
      img: 'style-colour', alt: 'A custom cut and colour: honey-blonde finger waves on a short cut, at Ultimate Visions', cap: 'Custom cut and colour, at 607a'
    }
  };

  // Calendar: 12 weeks from this week's Sunday.
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(today.getTime() - today.getDay() * DAY);
  const DAYS = 84;
  let first = new Date(today.getTime() + DAY);
  while (isClosed(first)) first = new Date(first.getTime() + DAY);
  const atDay = d => new Date(start.getFullYear(), start.getMonth(), start.getDate() + d);

  const cal = $('#cal');
  const cells = [];
  if (cal) {
    const frag = document.createDocumentFragment();
    for (let w = 0; w < 12; w++) {
      const row = document.createElement('div');
      row.className = 'cal-row'; row.setAttribute('role', 'row');
      for (let k = 0; k < 7; k++) {
        const i = w * 7 + k, d = atDay(i);
        const c = document.createElement('div');
        c.setAttribute('role', 'gridcell');
        c.className = 'day' + (isClosed(d) ? ' closed' : '') + (d < today ? ' past' : '') + (+d === +today ? ' today' : '');
        c.style.setProperty('--i', i);
        const n = document.createElement('span');
        n.className = 'num';
        n.textContent = (d.getDate() === 1) ? `${MO[d.getMonth()]} ${d.getDate()}` : d.getDate();
        const lab = document.createElement('span'); lab.className = 'v-label';
        c.append(n, lab);
        c.setAttribute('aria-label', fmt(d) + (isClosed(d) ? ', salon closed' : ''));
        row.append(c); cells.push({ c, d, lab });
      }
      frag.append(row);
    }
    cal.append(frag);
  }

  let current = 'press', nextVisit = null;
  const visitDate = off => {
    let d = new Date(first.getFullYear(), first.getMonth(), first.getDate() + off);
    while (isClosed(d)) d = new Date(d.getTime() + DAY);
    return d;
  };

  function render(key, animate) {
    const p = PLANS[key]; if (!p) return;
    current = key;
    document.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-checked', String(b.dataset.style === key)));
    $('#rhythm').innerHTML = p.rhythm;
    $('#band-style').textContent = p.name;
    $('#band-every').textContent = p.every;
    $('#style-name').textContent = p.name;
    const img = $('#style-img');
    if (img && !img.src.endsWith(p.img + '.webp')) { img.src = `assets/${p.img}.webp`; img.alt = p.alt; }
    $('#style-cap').innerHTML = `${p.cap} <span>Yelp</span>`;
    const hl = $('#home-list'); hl.textContent = '';
    p.tips.forEach(t => { const li = document.createElement('li'); li.textContent = t; hl.append(li); });

    const visits = p.visits.map(([off, label]) => ({ d: visitDate(off), label })).filter(v => (v.d - start) / DAY < DAYS);
    const vmap = new Map(visits.map((v, i) => [iso(v.d), { ...v, n: i + 1 }]));
    const homeDays = new Set();
    for (let d = new Date(first.getTime()); (d - start) / DAY < DAYS; d = new Date(d.getTime() + DAY)) {
      const since = Math.round((d - first) / DAY);
      if (d.getDay() === 0 && since > 0 && Math.floor(since / 7) % (p.home.every / 7) === 0) homeDays.add(iso(d));
    }

    cal.classList.remove('run');
    cells.forEach(({ c, d, lab }) => {
      const v = vmap.get(iso(d));
      c.classList.toggle('visit', !!v);
      c.classList.toggle('athome', homeDays.has(iso(d)));
      lab.textContent = v ? v.label : '';
      c.title = v ? `${fmt(d)}: ${v.label}` : homeDays.has(iso(d)) ? `${fmt(d)}: ${p.home.label}` : '';
      c.setAttribute('aria-label', fmt(d) + (v ? `, in the chair: ${v.label}` : homeDays.has(iso(d)) ? `, at home: ${p.home.label}` : isClosed(d) ? ', salon closed' : ''));
    });
    if (animate && !reduce) { void cal.offsetWidth; cal.classList.add('run'); }

    const ol = $('#visits'); ol.textContent = '';
    visits.forEach((v, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<b>${i + 1}</b><span><strong></strong><em></em></span>`;
      li.querySelector('strong').textContent = fmt(v.d);
      li.querySelector('em').textContent = v.label;
      ol.append(li);
    });
    const li = document.createElement('li'); li.className = 'home-li';
    li.innerHTML = '<b aria-hidden="true"></b><span><strong></strong><em></em></span>';
    li.querySelector('strong').textContent = p.home.every === 7 ? 'Sundays' : 'Every other Sunday';
    li.querySelector('em').textContent = p.home.label;
    ol.append(li);

    nextVisit = visits[0];
    $('#book-text').textContent = `Request ${fmt(nextVisit.d)}`;
    $('#book-next').setAttribute('aria-label', `Request ${p.name}, ${fmt(nextVisit.d)}: fills the appointment form`);
  }

  document.querySelectorAll('.chip').forEach(b => {
    b.addEventListener('click', () => render(b.dataset.style, true));
    b.addEventListener('keydown', e => {
      const list = [...document.querySelectorAll('.chip')], i = list.indexOf(b);
      const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      const nb = list[(i + step + list.length) % list.length]; nb.focus(); nb.click();
    });
  });
  if (cal) render('press', true);

  // Book the next visit: fill the request form.
  const book = $('#book-next');
  if (book) book.addEventListener('click', () => {
    const p = PLANS[current];
    const svc = $('#service'), day = $('#preferred-day'), notes = $('#notes');
    if (svc) { [...svc.options].forEach(o => { if (o.textContent === p.service) svc.value = o.value || o.textContent; }); }
    if (day && nextVisit) day.value = iso(nextVisit.d);
    if (notes && !notes.value) notes.value = `From the Keep it up planner (${p.name}): ${nextVisit.label}.`;
    document.dispatchEvent(new Event('lf-filled'));
  });

  // "Plan a silk press" buttons in the services section
  document.querySelectorAll('.plan-link').forEach(b => b.addEventListener('click', () => {
    const key = b.dataset.plan;
    $('#plan').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => { render(key, true); const chip = document.querySelector(`.chip[data-style="${key}"]`); if (chip) chip.focus({ preventScroll: true }); }, reduce ? 0 : 450);
  }));

  // Request form: front end only, sends nothing.
  const form = $('#appointment-form');
  if (form) {
    const day = $('#preferred-day'), err = $('#form-err'), out = $('#request-result');
    if (day) day.min = iso(new Date(today.getTime() + DAY));
    const say = msg => { err.textContent = msg; };
    if (day) day.addEventListener('change', () => {
      if (!day.value) return say('');
      const [y, m, d] = day.value.split('-').map(Number), dt = new Date(y, m - 1, d);
      say(isClosed(dt) ? `The salon is closed on ${WD[dt.getDay()]}days. Pick Tuesday to Saturday.` : '');
    });
    document.addEventListener('lf-filled', () => { out.textContent = ''; out.classList.remove('show'); say(''); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#client-name'), phone = $('#client-phone');
      const digits = phone.value.replace(/\D/g, '');
      if (!name.value.trim()) { say('Add your name so the salon knows who to call.'); name.focus(); return; }
      if (digits.length < 10) { say('Add a phone number with area code.'); phone.focus(); return; }
      let when = '';
      if (day.value) {
        const [y, m, d] = day.value.split('-').map(Number), dt = new Date(y, m - 1, d);
        if (isClosed(dt)) { say(`The salon is closed on ${WD[dt.getDay()]}days. Pick Tuesday to Saturday.`); day.focus(); return; }
        when = fmt(dt);
      }
      say('');
      const t = form.querySelector('input[name=time]:checked');
      const svc = $('#service').value || 'An appointment', sty = $('#stylist').value;
      const line = [svc, when, t ? t.value : '', sty ? `with ${sty}` : ''].filter(Boolean).join(', ') + `, for ${name.value.trim()}.`;
      out.textContent = '';
      const h = document.createElement('p'); h.className = 'r-line'; h.textContent = line;
      const n = document.createElement('p'); n.className = 'r-note'; n.textContent = 'Preview only: nothing was sent. On the real site, the shop confirms by text or call.';
      out.append(h, n); out.classList.add('show'); out.focus({ preventScroll: true });
      out.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  // Reveal on scroll (house standard)
  const els = [...document.querySelectorAll('[data-reveal]')];
  if (reduce || !('IntersectionObserver' in window)) els.forEach(e => e.classList.add('is-visible'));
  else {
    const n = new Map();
    els.forEach(e => { const p = e.parentElement, i = n.get(p) || 0; e.style.setProperty('--d', i * .08 + 's'); n.set(p, i + 1); });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { threshold: .01, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
    setTimeout(() => els.forEach(e => { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('is-visible'); }), 1500);
  }
})();
