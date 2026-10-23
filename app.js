(() => {
  const els = [...document.querySelectorAll('[data-reveal]')];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-visible')); return; }
  const n = new Map();
  els.forEach(e => { const p = e.parentElement, i = n.get(p) || 0; e.style.setProperty('--d', i * .08 + 's'); n.set(p, i + 1); });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { threshold: .01, rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
  setTimeout(() => els.forEach(e => { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('is-visible'); }), 1500);
})();
(() => {
  const form = document.getElementById('appointment-form');
  const value = id => document.getElementById(id).value.trim();
  { const d = document.getElementById('preferred-day'), t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset()); d.min = t.toISOString().slice(0, 10); }
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = value('client-name');
    const service = value('service') || 'Service to discuss';
    const stylist = value('stylist');
    const date = value('preferred-day');
    const time = value('preferred-time');
    const day = date ? new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(date + 'T12:00:00')) : 'Day to arrange';
    const summary = `${service} for ${name}. ${stylist ? 'Preferred stylist: ' + stylist + '.' : 'No stylist preference.'} ${day}${time ? ', ' + time.toLowerCase() : ', time to arrange'}.`;
    const result = document.getElementById('request-result');
    const title = document.createElement('h3'); title.textContent = 'Your preview request';
    const detail = document.createElement('p'); detail.textContent = summary;
    const phone = document.createElement('p'); phone.textContent = 'Preferred contact: ' + value('client-phone');
    const notice = document.createElement('p'); notice.textContent = 'Preview only: nothing was sent. On the real site, the shop confirms by text or call.';
    result.replaceChildren(title, detail, phone);
    if (value('notes')) { const notes = document.createElement('p'); notes.textContent = 'Notes: ' + value('notes'); result.append(notes); }
    result.append(notice);
  });
  form.querySelector('button[type="submit"]').disabled = false;
})();
