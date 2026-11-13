const duration = 24;
const paymentTap = 19.80;
const paymentExit = paymentTap + .5;
const stage = document.querySelector('.stage');
const camera = document.querySelector('.camera');
const device = document.querySelector('.device');
const play = document.querySelector('#play');
const slider = document.querySelector('#timeline');
const output = document.querySelector('output');
const capture = new URLSearchParams(location.search).has('capture');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const frames = [...device.querySelectorAll('iframe')];
const screens = Object.fromEntries(frames.map(frame => [frame.dataset.screen, frame]));

document.body.classList.toggle('capture', capture);
slider.max = duration;

const navigation = [
  [0, 'entry'],
  [5.30, 'catalog'],
  [6.20, 'types'],
  [8.80, 'doctors'],
  [11.65, 'confirm'],
  [16.25, 'booked'],
  [22.65, 'entry']
];
const taps = [
  [5.30, 'entry', '.entry-services a'],
  [6.20, 'catalog', '.specialty-list a'],
  [8.80, 'types', '.specialty-list a'],
  [11.65, 'doctors', '#zimin-card button[type=submit]'],
  [15.10, 'confirm', '#submit-booking'],
  [17.95, 'booked', '#appointment-payment'],
  [paymentTap, 'booked', '#confirm-payment'],
  [22.65, 'booked', '.back']
];

const clamp = value => Math.max(0, Math.min(1, value));
const slide = [.32, .72, 0, 1];
const easeOut = [.23, 1, .32, 1];
const easeInOut = [.42, 0, .58, 1];

function progress(time, start, end, [x1, y1, x2, y2] = easeInOut) {
  const x = clamp((time - start) / (end - start));
  if (x === 0 || x === 1) return x;
  const cubic = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 14; i++) {
    const mid = (low + high) / 2;
    if (cubic(mid, x1, x2) < x) low = mid;
    else high = mid;
  }
  return cubic((low + high) / 2, y1, y2);
}

const find = (name, selector) => screens[name].contentDocument.querySelector(selector);
const maxScroll = element => element.scrollHeight - element.clientHeight;

function renderNavigation(time, moving) {
  const index = navigation.findLastIndex(([start]) => time >= start);
  const [start, name] = navigation[index];
  const previous = navigation[index - 1]?.[1];
  const travelTime = name === 'types' ? .68 : .52;
  const amount = previous ? progress(time, start, start + travelTime, easeInOut) : 1;
  const back = name === 'entry' && previous;
  for (const [id, frame] of Object.entries(screens)) {
    const incoming = id === name;
    const visible = incoming || (id === previous && amount < 1);
    frame.setAttribute("aria-hidden", String(!visible));
    if (!visible) continue;
    frame.style.zIndex = incoming ? 2 : 1;
    const x = incoming ? (1 - amount) * (back ? -28 : 100) : amount * (back ? 100 : -28);
    frame.style.transform = moving ? `translateX(${x}%)` : '';
    frame.style.opacity = moving || !incoming ? '1' : amount;
    if (back) frame.style.zIndex = incoming ? 1 : 2;
  }
}

const searchPrefix = 'Search by ';
const searchPrompts = [
  ['doctor...', 0, .76, 1.03],
  ['specialty...', 1.27, 1.87, 2.14],
  ['clinic...', 2.38, 3.03, 3.30]
];
function searchPlaceholder(time) {
  for (const [suffix, start, erase, end] of searchPrompts) {
    if (time < start || time >= end) continue;
    const letters = time >= erase
      ? Math.ceil(suffix.length * (1 - (time - erase) / (end - erase)))
      : start === 0 ? suffix.length : Math.floor((time - start) * 80);
    return searchPrefix + suffix.slice(0, letters);
  }
  if (time >= 4.97) return searchPrefix + 'doctor...'.slice(0, Math.floor((time - 4.97) * 80));
  return searchPrefix;
}

let scroll;
function measureScroll() {
  const entry = find('entry', '.entry-scroll');
  const tests = find('types', '.specialty-list');
  const doctors = find('doctors', '.phone');
  const confirmation = find('confirm', '.booking-content');
  scroll = {
    entryContent: entry.querySelector('.entry-scroll-content'),
    entryNav: find('entry', '.entry-nav'),
    field: entry.querySelector('input'),
    entryEnd: maxScroll(entry),
    tests,
    testsEnd: tests.querySelector('a').offsetTop - tests.offsetTop - 235,
    doctors,
    doctorsEnd: find('doctors', '#zimin-card').offsetTop - 214,
    confirmation,
    confirmationEnd: maxScroll(confirmation)
  };
}

function renderScroll(time) {
  const descent = progress(time, .72, 4.12, [.65, 0, .78, 1]);
  const ascent = progress(time, 4.33, 5.17);
  scroll.entryContent.style.transform = `translateY(${-scroll.entryEnd * (descent - ascent)}px)`;
  const glassFade = progress(time, 3.90, 4.12) - progress(time, 4.33, 4.58);
  scroll.entryNav.style.setProperty('--glass-opacity', 1 - glassFade);
  const placeholder = searchPlaceholder(time);
  if (scroll.field.placeholder !== placeholder) scroll.field.placeholder = placeholder;
  scroll.tests.scrollTop = scroll.testsEnd * progress(time, 6.95, 8.09);
  scroll.doctors.scrollTop = scroll.doctorsEnd * progress(time, 9.45, 10.88);
  scroll.confirmation.scrollTop = scroll.confirmationEnd * progress(time, 12.40, 13.78);
}

function fitCamera() {
  const scale = stage.clientHeight * .87 / 600;
  camera.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

function renderBooking(time, moving) {
  const action = find('confirm', '.booking-action');
  action.style.setProperty('--glass-opacity', 1 - progress(time, 13.55, 13.95));
  action.style.setProperty('--booking-label', 1 - progress(time, 15.10, 15.22, easeOut));
  action.style.setProperty('--booking-progress', progress(time, 15.22, 15.41, easeOut));
  action.style.setProperty('--booking-copy-progress', progress(time, 15.10, 15.44));
  action.querySelector('.submit-progress img').style.transform = moving
    ? `rotate(${Math.max(0, time - 15.22) * 450}deg)` : '';
}

function renderPayment(time, moving) {
  const { payment, setPaid } = screens.booked.contentWindow.bookingPreview;
  const sheet = progress(time, 17.95, 18.27, slide) - progress(time, paymentExit, paymentExit + .32, easeInOut);
  payment.toggleAttribute('open', sheet > 0);
  payment.style.transform = moving ? `translateY(${(1 - sheet) * 100}%)` : '';
  payment.style.opacity = moving ? 1 : sheet;

  const phone = find('booked', '.booking-phone');
  phone.style.setProperty('--demo-payment-dim', sheet * .25);
  const confirmButton = payment.querySelector('#confirm-payment');
  const pressFeedback = progress(time, paymentTap, paymentTap + .10, easeOut)
    - progress(time, paymentExit, paymentExit + .24, easeOut);
  confirmButton.style.setProperty('--payment-feedback', pressFeedback);

  const amount = progress(time, paymentExit + .42, paymentExit + .84);
  setPaid(amount >= .5);
  const remaining = 1 - amount;
  phone.style.setProperty('--payment-button-space', remaining);
  find('booked', '.payment-paid path').style.strokeDashoffset = remaining;
  find('booked', '.payment-unpaid').style.opacity = remaining;
  find('booked', '#appointment-payment').style.opacity = remaining;
  find('booked', '#payment-status').style.opacity = Math.abs(1 - 2 * amount);
}

let pressed;
function renderTap(time, moving) {
  if (pressed) {
    pressed.style.transform = '';
    pressed.style.filter = '';
  }
  const tap = taps.find(([at]) => time >= at - .08 && time < at + .04);
  pressed = tap ? find(tap[1], tap[2]) : null;
  if (!pressed) return;
  const amount = progress(time, tap[0] - .08, tap[0], easeOut);
  pressed.style.transform = moving ? `scale(${1 - .025 * amount})` : '';
  pressed.style.filter = `brightness(${1 - .08 * amount})`;
}

function drawFrame(time) {
  const moving = capture || !reducedMotion.matches;
  renderNavigation(time, moving);
  renderScroll(time);
  renderBooking(time, moving);
  renderPayment(time, moving);
  renderTap(time, moving);
  slider.value = time;
  output.value = `${time.toFixed(1)} / ${duration} s`;
}

window.drawFrame = drawFrame;
window.motionDuration = duration;
const loaded = document.readyState === 'complete'
  ? Promise.resolve()
  : new Promise(resolve => addEventListener('load', resolve, { once: true }));

window.readyForCapture = loaded.then(async () => {
  for (const frame of frames) {
    const doc = frame.contentDocument;
    doc.documentElement.classList.add('motion-screen');
    await doc.fonts.ready;
    const missing = [...doc.images].filter(img => !img.naturalWidth);
    if (missing.length) throw Error(missing.map(img => img.src).join(', '));
  }

  measureScroll();
  fitCamera();
  let playing = !capture && !reducedMotion.matches;
  let position = 0;
  let previous = performance.now();
  const update = now => {
    if (playing) {
      position = (position + (now - previous) / 1000) % duration;
      drawFrame(position);
    }
    previous = now;
    requestAnimationFrame(update);
  };
  drawFrame(0);
  if (!capture) requestAnimationFrame(update);
  play.textContent = playing ? 'Pause' : 'Play';
  play.addEventListener('click', () => {
    playing = !playing;
    play.textContent = playing ? 'Pause' : 'Play';
  });
  slider.addEventListener('input', () => {
    position = Number(slider.value);
    drawFrame(position);
  });
  addEventListener('resize', fitCamera);
});
