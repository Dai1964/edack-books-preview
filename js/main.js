// A little JavaScript for EDACK Books.
// The page works without it. This only adds the gentle fade-ins,
// closes the phone menu after you tap a link, and builds the
// free printables gallery from freebies.json.

// Tell the styles that JavaScript is on, so the fade-ins can start hidden.
document.documentElement.classList.add('js');

// Close the phone menu when a link inside it is tapped.
const nav = document.getElementById('site-nav');

if (nav && typeof nav.hidePopover === 'function') {
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a') && nav.matches(':popover-open')) {
      nav.hidePopover();
    }
  });
}

// Fade cards in as they scroll into view, once each.
const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  // Very old browsers: just show everything straight away.
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// Free printables gallery.
// The cards come from freebies.json (see HOW-TO-ADD-A-FREEBIE.md).
// If the list can't be read, the Yellow Belt card already in the page stays as it is.
const freebieGrid = document.getElementById('freebie-grid');

// A link may go to a file on this site or to a web address, never to hidden code.
const isSafeLink = (link) => typeof link === 'string' && !/^\s*javascript:/i.test(link);

function isUsable(freebie) {
  return Boolean(freebie)
    && typeof freebie.title === 'string'
    && isSafeLink(freebie.image)
    && Array.isArray(freebie.downloads)
    && freebie.downloads.length > 0
    && freebie.downloads.every((d) => d && typeof d.label === 'string' && isSafeLink(d.file));
}

function makeText(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  element.textContent = text;
  return element;
}

function makeFreebieCard(freebie) {
  const card = document.createElement('article');
  card.className = 'freebie-card';

  const imageBox = document.createElement('div');
  imageBox.className = 'freebie-image';
  const image = document.createElement('img');
  image.src = freebie.image;
  image.alt = freebie.alt || `Preview of ${freebie.title}`;
  image.loading = 'lazy';
  image.decoding = 'async';
  imageBox.append(image);

  const body = document.createElement('div');
  body.className = 'freebie-body';
  if (freebie.ages) {
    body.append(makeText('p', 'pill', freebie.ages));
  }
  body.append(makeText('h3', '', freebie.title));
  if (freebie.description) {
    body.append(makeText('p', '', freebie.description));
  }

  // The first button is gold, any others are dark.
  const buttons = document.createElement('div');
  buttons.className = 'button-row';
  freebie.downloads.forEach((download, index) => {
    const button = makeText('a', index === 0 ? 'btn btn-primary' : 'btn btn-secondary', download.label);
    button.href = download.file;
    button.setAttribute('download', '');
    buttons.append(button);
  });
  body.append(buttons);

  card.append(imageBox, body);
  return card;
}

if (freebieGrid && 'fetch' in window) {
  fetch('freebies.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`freebies.json could not be loaded (${response.status})`);
      }
      return response.json();
    })
    .then((freebies) => {
      const cards = (Array.isArray(freebies) ? freebies : []).filter(isUsable).map(makeFreebieCard);
      if (cards.length > 0) {
        freebieGrid.replaceChildren(...cards);
      }
    })
    .catch(() => {
      // Something is wrong with the list (for example a missing comma).
      // Keep the Yellow Belt card that is already in the page.
    });
}
