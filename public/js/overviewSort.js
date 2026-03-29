import { showAlert } from './alert';

const SORT_API = {
  newest: '-createdAt',
  'price-asc': 'price',
  'price-desc': '-price',
  rating: '-ratingsAverage',
  'duration-asc': 'duration',
  'duration-desc': '-duration',
  name: 'name',
};

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(isoOrDate) {
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function cardHtml(tour) {
  const name = escapeHtml(tour.name);
  const summary = escapeHtml(tour.summary);
  const loc = escapeHtml(tour.startLocation?.description || '');
  const slug = escapeHtml(tour.slug);
  const diff = escapeHtml(tour.difficulty);
  const dateStr = formatDate(tour.startDates?.[0]);
  const stops = tour.locations?.length ?? 0;
  const img = escapeHtml(tour.imageCover);

  return `
<article class="card">
  <div class="card__header">
    <div class="card__picture">
      <div class="card__picture-overlay">&nbsp;</div>
      <img class="card__picture-img" src="/img/tours/${img}" alt="${name}" />
    </div>
    <h3 class="heading-tertirary"><span>${name}</span></h3>
  </div>
  <div class="card__details">
    <h4 class="card__sub-heading">${diff} ${tour.duration}-day tour</h4>
    <p class="card__text">${summary}</p>
    <div class="card__data">
      <svg class="card__icon"><use xlink:href="/img/icons.svg#icon-map-pin"></use></svg>
      <span>${loc}</span>
    </div>
    <div class="card__data">
      <svg class="card__icon"><use xlink:href="/img/icons.svg#icon-calendar"></use></svg>
      <span>${dateStr}</span>
    </div>
    <div class="card__data">
      <svg class="card__icon"><use xlink:href="/img/icons.svg#icon-flag"></use></svg>
      <span>${stops} stops</span>
    </div>
    <div class="card__data">
      <svg class="card__icon"><use xlink:href="/img/icons.svg#icon-user"></use></svg>
      <span>${tour.maxGroupSize} people</span>
    </div>
  </div>
  <div class="card__footer">
    <p class="card__footer-link">
      <span class="card__footer-value">$${tour.price}</span>
      <span class="card__footer-text"> per person</span>
    </p>
    <p class="card__ratings">
      <span class="card__footer-value">${tour.ratingsAverage}</span>
      <span class="card__footer-text"> rating (${tour.ratingsQuantity})</span>
    </p>
  </div>
  <a class="btn btn--green btn--small" href="/tour/${slug}">Details</a>
</article>`;
}

export function initOverviewSort() {
  const main = document.querySelector('.main--tours-overview');
  const select = document.getElementById('sort-tours');
  const grid = document.getElementById('tour-cards');
  const emptyEl = document.getElementById('tour-sort-empty');

  if (!main || !select || !grid) return;

  const setLoading = (on) => {
    grid.classList.toggle('card-container--loading', on);
    select.disabled = on;
  };

  const showEmpty = (show) => {
    if (emptyEl) emptyEl.hidden = !show;
  };

  const applyTours = (tours) => {
    if (!tours.length) {
      grid.innerHTML = '';
      showEmpty(true);
      return;
    }
    showEmpty(false);
    grid.innerHTML = tours.map((t) => cardHtml(t)).join('');
  };

  const runSort = async (sortKey) => {
    const apiSort = SORT_API[sortKey] || SORT_API.newest;
    const params = new URLSearchParams({
      sort: apiSort,
      limit: '200',
    });
    const url = `/api/v1/tours?${params.toString()}`;

    setLoading(true);
    try {
      const res = await fetch(url, {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const json = await res.json();
      const tours = json.data?.tours || json.data?.tour || [];
      applyTours(tours);

      const next = new URL(window.location.href);
      next.searchParams.set('sort', sortKey);
      window.history.replaceState({}, '', next.toString());
    } catch (e) {
      console.error(e);
      showAlert('error', 'Could not update tour order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  select.addEventListener('change', () => {
    runSort(select.value);
  });
}
