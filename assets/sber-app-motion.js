/* Approved Sber screens; movement is only on the three composited tracks. */
(() => {
  const dimensions = {home:9612,catalog:4796,profile:5007,orders:6580,empty:3128,detail:3596,chat:3244,payment:3372};
  const columns = [['home','detail'],['catalog','profile','chat'],['orders','empty','payment']];
  let observer;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function markup(language, {href,labels = ""}) {
    const lang = language === 'ru' ? 'ru' : 'en';
    const group = names => `<span class="sber-app-motion-group">${names.map(name => {
      const height = name === 'profile' && lang === 'ru' ? 5068 : dimensions[name];
      return `<span class="sber-app-motion-screen"><img src="assets/sber/app-motion/${lang}/${name}.webp?v=1" width="720" height="${Math.round(height / 1496 * 720)}" alt="" decoding="async"></span>`;
    }).join('')}</span>`;
    return `<div class="sber-app-showcase" data-running="false">
      <a class="sber-app-motion-link" href="${href}" aria-label="${lang === 'ru' ? 'СберПраво — приложение' : 'SberPravo — app'}">
        <span class="sber-app-motion-columns" aria-hidden="true">${columns.map(names => `<span class="sber-app-motion-track">${group(names)}${group(names)}</span>`).join('')}</span>
        ${labels}
      </a>
    </div>`;
  }
  function sync(element) {
    element.dataset.running = String(element.dataset.visible === 'true' && !document.hidden && !reduced.matches);
  }
  function syncAll() { document.querySelectorAll('.sber-app-showcase').forEach(sync); }
  function gentlePace(amplitude, phase, cycles) {
    const samples = 128;
    const values = Array.from({length:samples + 1}, (_,i) => {
      const t = i / samples;
      return (t + amplitude / (Math.PI * 2 * cycles) * (Math.sin(Math.PI * 2 * cycles * t + phase) - Math.sin(phase))).toFixed(7);
    });
    return `linear(${values.join(',')})`;
  }
  const paces = [gentlePace(.05,0,3),gentlePace(.04,2.1,4),gentlePace(.06,4.2,3)];
  function mount() {
    observer?.disconnect();
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.dataset.visible = String(entry.isIntersecting); sync(entry.target);
    }), {threshold:0.01});
    document.querySelectorAll('.sber-app-showcase').forEach(element => {
      element.querySelectorAll('.sber-app-motion-track').forEach((track,i) => {
        if(CSS.supports('animation-timing-function',paces[i])) track.style.animationTimingFunction = paces[i];
      });
      sync(element); observer.observe(element);
    });
  }
  document.addEventListener('visibilitychange', syncAll);
  reduced.addEventListener('change', syncAll);
  window.SberAppMotion = {markup, mount};
})();
