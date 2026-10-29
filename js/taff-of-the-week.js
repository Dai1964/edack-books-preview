// Taff of the week, on the home page.
// The page already shows photo 1 as normal HTML, so it works with JavaScript off.
// This swaps in the right photo for this week, from data/taff-weeks.json.
// Week 1 starts Monday 26 October 2026 with photo 1. After the last photo it loops back to photo 1.
// It only reads the list and the photo from this site. No cookies, and nothing is saved.

(function () {
  'use strict';

  const card = document.getElementById('taff-week');
  if (!card) {
    return;
  }

  const DAY = 24 * 60 * 60 * 1000;

  // Which photo for this date? Counts whole weeks since the start Monday, using the visitor's own calendar date.
  function photoNumber(today, start, count) {
    const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const [y, m, d] = start.split('-').map(Number);
    const weeks = Math.floor((todayDay - Date.UTC(y, m - 1, d)) / (7 * DAY));
    return ((weeks % count) + count) % count;
  }

  // Only plain photo names from images/taff/, never a link to somewhere else.
  const isSafeFile = (file) => typeof file === 'string' && /^taff-\d{2}-[a-z0-9-]+\.jpg$/.test(file);

  function isUsable(week) {
    return Boolean(week)
      && isSafeFile(week.file)
      && ['caption', 'idea', 'ideaMore', 'alt'].every((key) => typeof week[key] === 'string')
      && Number.isInteger(week.width) && Number.isInteger(week.height);
  }

  function show(week) {
    const image = card.querySelector('.taff-photo');
    image.width = week.width;
    image.height = week.height;
    image.alt = week.alt;
    image.src = 'images/taff/' + week.file;
    card.querySelector('.taff-caption').textContent = week.caption;
    card.querySelector('.taff-idea-title').textContent = 'Lean idea: ' + week.idea;
    card.querySelector('.taff-idea-more').textContent = week.ideaMore;
  }

  fetch('data/taff-weeks.json')
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error('No list'))))
    .then((list) => {
      if (!list || typeof list.start !== 'string' || !Array.isArray(list.weeks) || list.weeks.length === 0) {
        return;
      }
      const week = list.weeks[photoNumber(new Date(), list.start, list.weeks.length)];
      if (isUsable(week) && week.file !== card.querySelector('.taff-photo').getAttribute('src').split('/').pop()) {
        show(week);
      }
    })
    .catch(() => {
      // If the list can't be read, photo 1 stays on the page.
    });
})();
