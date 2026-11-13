const entryScroll = document.querySelector('.entry-scroll');
const entryNav = document.querySelector('.entry-nav');

entryScroll.addEventListener('scroll', () => {
  if (document.documentElement.classList.contains('motion-screen')) return;
  const remaining = entryScroll.scrollHeight - entryScroll.clientHeight - entryScroll.scrollTop;
  entryNav.toggleAttribute('data-scroll-end', remaining <= 2);
}, { passive: true });
