/* Clínica FisioZhen · demo */
(() => {
  const WA = '34625302753';
  // Horario por día (0 = domingo), minutos desde las 00:00.
  const HORARIO = {
    0: [], 1: [[480, 900], [930, 1260]], 2: [[480, 1320]], 3: [[480, 840], [900, 1260]],
    4: [[480, 1320]], 5: [[480, 1020]], 6: []
  };
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const burger = $('.nav__burger'), menu = $('#menu');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); menu.classList.toggle('is-open', open);
  });
  $$('#menu a').forEach(a => a.addEventListener('click', () => { burger.setAttribute('aria-expanded', 'false'); menu.classList.remove('is-open'); }));

  const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const hhmm = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  const pintarEstado = () => {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    const dia = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(g('weekday'));
    const min = (+g('hour') % 24) * 60 + +g('minute');
    const el = $('[data-estado]'); let txt;
    const tramo = HORARIO[dia].find(([a, b]) => min >= a && min < b);
    if (tramo) { txt = `Abierto ahora · hasta las ${hhmm(tramo[1])}`; el.className = 'estado is-open'; }
    else {
      el.className = 'estado is-closed';
      const luego = HORARIO[dia].find(([a]) => a > min);
      if (luego) txt = `Cerrado · abre hoy a las ${hhmm(luego[0])}`;
      else for (let i = 1; i <= 7; i++) { const d = (dia + i) % 7; if (HORARIO[d].length) { txt = `Cerrado · abre ${i === 1 ? 'mañana' : 'el ' + dias[d]} a las ${hhmm(HORARIO[d][0][0])}`; break; } }
    }
    $('.estado__txt', el).textContent = txt;
    $$('.horario tr').forEach(tr => tr.classList.toggle('hoy', +tr.dataset.dia === dia));
  };
  pintarEstado(); setInterval(pintarEstado, 60000);

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 90}ms`; io.observe(el); });
  } else $$('.reveal').forEach(el => el.classList.add('is-in'));

  const form = $('#form-cita'), err = $('.form__err', form);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    if (!nombre) { err.hidden = false; form.nombre.focus(); return; }
    err.hidden = true;
    const zonas = $$('input[name="zona"]:checked', form).map(i => i.value);
    const trat = $('input[name="trat"]:checked', form).value;
    const franja = $('input[name="franja"]:checked', form).value;
    const l = [
      `¡Hola! Soy ${nombre} y quería pedir cita${form.primera.checked ? ' (es mi primera visita)' : ''}.`, ``,
      ...(zonas.length ? [`• Me molesta: ${zonas.join(', ')}`] : []),
      `• Me interesa: ${trat}`,
      `• Mejor por la ${franja === 'me da igual' ? 'mañana o la tarde, me da igual' : franja}`
    ];
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(l.join('\n'))}`, '_blank', 'noopener');
  });

  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
