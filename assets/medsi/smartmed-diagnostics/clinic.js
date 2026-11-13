const phone = document.querySelector('.clinic-phone');
const screens = [...phone.querySelectorAll('[data-screen]')];
const title = document.querySelector('#clinic-title');
const terms = document.querySelector('.clinic-terms input');
const submit = document.querySelector('[data-next="loading"]');

function showScreen(name) {
  phone.dataset.state = name;
  screens.forEach(screen => { screen.hidden = screen.dataset.screen !== name; });
  title.textContent = {
    select: 'Step 2 of 3',
    confirmation: 'Confirmation',
    details: 'Appointment details'
  }[name] ?? '';
}

const preview = new URLSearchParams(location.search).get('state');
showScreen(screens.some(screen => screen.dataset.screen === preview) ? preview : 'select');

phone.addEventListener('click', event => {
  const next = event.target.closest('[data-next]')?.dataset.next;
  if (!next) return;
  showScreen(next);
  if (next === 'loading') window.setTimeout(() => showScreen('details'), 1350);
});

phone.querySelector('.back').addEventListener('click', () => showScreen('select'));
terms.addEventListener('change', () => { submit.disabled = !terms.checked; });
