const phone = document.querySelector('.booking-phone');
const submit = document.querySelector('#submit-booking');
const beforeBooking = document.querySelectorAll('[data-before-booking]');
const booked = document.querySelectorAll('[data-booked]');
const content = document.querySelector('.booking-content');
const action = document.querySelector('.booking-action');

content.addEventListener('scroll', () => {
  if (document.documentElement.classList.contains('motion-screen')) return;
  const atEnd = content.scrollHeight - content.clientHeight - content.scrollTop <= 2;
  action.toggleAttribute('data-scroll-end', atEnd);
});
const params = new URLSearchParams(location.search);
const clinicFlow = params.get('flow') === 'clinic';

function setBookingState(state) {
  const isBooking = state === 'booking';
  const isBooked = state === 'booked';
  phone.dataset.state = state;
  if (clinicFlow) {
    phone.querySelector('.back').href = isBooked
      ? 'medsi-diagnostics-entry.html'
      : 'medsi-diagnostics-select.html?flow=clinic';
  }
  beforeBooking.forEach(element => { element.hidden = isBooked; });
  booked.forEach(element => { element.hidden = !isBooked; });
  submit.disabled = isBooking;
  submit.setAttribute('aria-busy', String(isBooking));
  submit.querySelector('.submit-label').setAttribute('aria-hidden', String(isBooking));
  submit.querySelector('.submit-progress').setAttribute('aria-hidden', String(!isBooking));
  document.title = isBooked ? 'Appointment details · MEDSI' : 'Confirm your details · MEDSI';
}

const preview = params.get('state');
setBookingState(['booking', 'booked'].includes(preview) ? preview : 'confirm');

submit.addEventListener('click', () => {
  setBookingState('booking');
  setTimeout(() => {
    content.scrollTop = 0;
    setBookingState('booked');
  }, 1350);
});

const payment = document.querySelector('.payment-sheet');
const pay = document.querySelector('#appointment-payment');
const paymentStatus = document.querySelector('#payment-status');
const paymentRow = paymentStatus.parentElement;
let lastPaid;

function setPaid(paid) {
  if (paid === lastPaid) return;
  lastPaid = paid;
  paymentRow.toggleAttribute('data-paid', paid);
  pay.hidden = paid;
  paymentStatus.textContent = paid ? 'Payment successful' : 'Appointment not paid';

}

function openPayment() {
  payment.returnValue = '';
  payment.showModal();
}

pay.addEventListener('click', openPayment);
if (preview === 'booked' && params.get('view') === 'payment') openPayment();
if (preview === 'booked' && params.get('view') === 'paid') setPaid(true);
payment.addEventListener('close', () => {
  if (payment.returnValue === 'paid') setPaid(true);
});

window.bookingPreview = { setPaid, payment };
