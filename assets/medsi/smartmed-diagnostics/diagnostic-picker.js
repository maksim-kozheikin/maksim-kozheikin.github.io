const search = document.querySelector('.specialty-search input');
const list = document.querySelector('.specialty-list');
const rows = [...list.children];
const empty = document.querySelector('.specialty-empty');

search.addEventListener('input', () => {
  const query = search.value.trim().toLowerCase();
  for (const row of rows) {
    const aliases = row.firstElementChild.dataset.search ?? '';
    row.hidden = !`${row.textContent} ${aliases}`.toLowerCase().includes(query);
  }
  empty.hidden = rows.some(row => !row.hidden);
  list.scrollTop = 0;
});

if (new URLSearchParams(location.search).get('view') === 'selected') {
  document.fonts.ready.then(() => {
    list.querySelector('a').scrollIntoView({ block: 'center' });
  });
}
