const params = new URLSearchParams(location.search);
const phone = document.querySelector('.phone');
phone.classList.add('doctor-list-scroll');

if (params.get('flow') === 'clinic') {
  document.querySelector('.smartmed-chip[aria-pressed="true"]').textContent = 'Gastroscopy';
  document.querySelector('#zimin-card input[name="flow"]').disabled = false;
}

if (params.get('view') === 'slots') {
  window.addEventListener('load', () => {
    phone.scrollTop = document.querySelector('#zimin-card').offsetTop - 330;
  }, { once: true });
}
