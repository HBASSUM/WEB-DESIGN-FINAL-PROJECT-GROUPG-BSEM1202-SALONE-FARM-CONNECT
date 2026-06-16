/* ════════════════════════════════════════════════════════════
   SALONE FARM CONNECT — interactive layer
   ════════════════════════════════════════════════════════════ */

/* ─── DATA ─── */
const CROPS = [
  { id: 'rice',        name: 'Rice',          latin: 'Oryza sativa',       emoji: '🌾', price: 900,  prev: 880,  district: 'Makeni',   history: [820, 840, 860, 855, 870, 880, 900] },
  { id: 'cassava',     name: 'Cassava',       latin: 'Manihot esculenta',  emoji: '🥔', price: 700,  prev: 715,  district: 'Bo',        history: [730, 725, 720, 718, 715, 710, 700] },
  { id: 'groundnut',   name: 'Groundnut',     latin: 'Arachis hypogaea',   emoji: '🥜', price: 1200, prev: 1150, district: 'Kenema',    history: [1100, 1120, 1140, 1150, 1160, 1180, 1200] },
  { id: 'pepper',      name: 'Pepper',        latin: 'Capsicum species',   emoji: '🌶️', price: 1500, prev: 1500, district: 'Kono',      history: [1450, 1460, 1470, 1480, 1490, 1500, 1500] },
  { id: 'maize',       name: 'Maize',         latin: 'Zea mays',           emoji: '🌽', price: 850,  prev: 870,  district: 'Bombali',   history: [890, 885, 880, 875, 870, 865, 850] },
  { id: 'sweetpotato', name: 'Sweet Potato',  latin: 'Ipomoea batatas',    emoji: '🍠', price: 600,  prev: 590,  district: 'Freetown',  history: [570, 575, 580, 585, 588, 590, 600] }
];

const FARMING_TIPS = [
  'Rotate cassava with groundnut to restore nitrogen in the soil between seasons.',
  'Harvest rice when 80–85% of the grains have turned golden for the best market price.',
  'Sun-dry pepper for 3–4 days on raised mats to prevent mould and fetch a higher price.',
  'Apply compost two weeks before planting maize to give nutrients time to settle into the soil.',
  'Store groundnuts in breathable jute sacks, not plastic, to avoid aflatoxin during the rainy season.',
  'Check market prices before harvest day — selling in Freetown can be more profitable than selling locally.'
];

const FAQS = [
  { q: 'How do I know the prices are accurate?', a: 'Prices are gathered daily from Bo, Kenema, Makeni, and Freetown markets and updated every morning so you always see the latest figures before you travel to sell.' },
  { q: 'Is there a fee to register or sell on the platform?', a: 'No. Registration is free and posting a harvest listing in the marketplace carries no commission — buyers contact you directly.' },
  { q: 'Can I use Salone Farm Connect without a smartphone?', a: 'Yes. The platform is built to be light on data and also offers a USSD option — dial *432# from any phone to check prices.' },
  { q: 'How are buyers verified?', a: 'Every buyer account is reviewed by our local Freetown team before they can contact farmers, so you are not negotiating with strangers.' },
  { q: 'What if I grow a crop that is not listed yet?', a: 'Reach out through the Contact page — we are actively expanding coverage beyond the current 50+ listed crops.' }
];

let harvestListings = [
  { name: 'Aminata Koroma', crop: CROPS[0], district: 'Makeni', qty: 200, price: 880 },
  { name: 'Joseph Kamara',  crop: CROPS[2], district: 'Kenema', qty: 80,  price: 1180 }
];

/* ─── PAGE ROUTER ─── */
function navigateTo(pageId) {
  document.querySelectorAll('.page-view').forEach(page => {
    page.style.setProperty('display', 'none', 'important');
    page.classList.remove('active-page');
  });

  const targetPage = document.getElementById(pageId);
  if (!targetPage) {
    console.error(`Page ID "${pageId}" could not be found in the HTML structure.`);
    return;
  }

  targetPage.style.setProperty('display', 'block', 'important');
  targetPage.classList.add('active-page');
  window.scrollTo({ top: 0, behavior: 'instant' });

  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  const navLink = document.getElementById('nav-' + pageId);
  if (navLink) navLink.classList.add('active');

  // re-run reveal/counter checks for the page that just became visible
  requestAnimationFrame(checkReveals);
}

/* ─── MOBILE MENU ─── */
function toggleMenu() {
  const nav = document.getElementById('mainNav');
  const toggle = document.getElementById('menuToggle');
  nav.classList.toggle('open');
  const spans = toggle.getElementsByTagName('span');
  if (nav.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
  } else {
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  }
}

/* ─── TOAST ─── */
let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  toastText.innerText = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
}

/* ─── FORMAT HELPERS ─── */
function formatLe(n) {
  return 'Le ' + Math.round(n).toLocaleString('en-US');
}
function trendOf(crop) {
  if (crop.price > crop.prev) return 'up';
  if (crop.price < crop.prev) return 'down';
  return 'flat';
}
function trendArrow(trend) {
  return trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—';
}

/* ─── CROP EXCHANGE TICKER ─── */
function buildTicker() {
  const track = document.getElementById('tickerTrack');
  const itemsHtml = CROPS.map(c => {
    const t = trendOf(c);
    return `<span class="ticker-item">
      <span class="t-name">${c.emoji} ${c.name}</span>
      <span class="t-price">${formatLe(c.price)}/kg</span>
      <span class="t-trend ${t}">${trendArrow(t)}</span>
    </span>`;
  }).join('');
  // duplicate content so the scrolling loop is seamless
  track.innerHTML = itemsHtml + itemsHtml;
}

/* ─── MARKET: SEARCH / SORT / FILTER ─── */
const marketState = { search: '', sort: 'name', district: 'All', expandedId: null };

function setSort(sortKey) {
  marketState.sort = sortKey;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.toggle('active', b.dataset.sort === sortKey));
  renderMarket();
}

function buildDistrictChips() {
  const districts = ['All', ...new Set(CROPS.map(c => c.district))];
  const wrap = document.getElementById('districtChips');
  wrap.innerHTML = districts.map(d =>
    `<button class="chip ${d === marketState.district ? 'active' : ''}" data-district="${d}">${d}</button>`
  ).join('');
  wrap.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      marketState.district = chip.dataset.district;
      wrap.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderMarket();
    });
  });
}

function buildSparkline(history) {
  const max = Math.max(...history), min = Math.min(...history);
  const range = (max - min) || 1;
  const points = history.map((v, i) => {
    const x = (i / (history.length - 1)) * 100;
    const y = 32 - ((v - min) / range) * 28 - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return `<svg class="sparkline" viewBox="0 0 100 32" preserveAspectRatio="none"><polyline points="${points}"></polyline></svg>`;
}

function renderMarket() {
  marketState.search = (document.getElementById('cropSearch')?.value || '').toLowerCase();
  let list = CROPS.filter(c =>
    c.name.toLowerCase().includes(marketState.search) &&
    (marketState.district === 'All' || c.district === marketState.district)
  );

  if (marketState.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  if (marketState.sort === 'price-high') list.sort((a, b) => b.price - a.price);
  if (marketState.sort === 'price-low') list.sort((a, b) => a.price - b.price);

  const grid = document.getElementById('marketGrid');
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `<div class="no-results">No crops match "${marketState.search}". Try a different search.</div>`;
    return;
  }

  grid.innerHTML = list.map(c => {
    const t = trendOf(c);
    const expanded = marketState.expandedId === c.id;
    return `
    <div class="price-card ${expanded ? 'expanded' : ''}" data-id="${c.id}">
      <div class="price-card-top">
        <div class="price-card-left">
          <div class="price-card-emoji">${c.emoji}</div>
          <div>
            <div class="price-card-name">${c.name}</div>
            <div class="price-card-sub">${c.latin}</div>
          </div>
        </div>
        <div class="price-card-right">
          <div class="price-card-amount">${formatLe(c.price)}</div>
          <div class="price-card-unit">per kg</div>
          <div class="price-card-trend ${t}">${trendArrow(t)} ${Math.abs(c.price - c.prev)}</div>
        </div>
      </div>
      <span class="price-card-district">${c.district} market</span>
      <div class="price-card-expand">${buildSparkline(c.history)}</div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.price-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      marketState.expandedId = marketState.expandedId === id ? null : id;
      renderMarket();
    });
  });
}

/* ─── EARNINGS CALCULATOR ─── */
function populateCalcCropSelect() {
  const select = document.getElementById('calcCrop');
  if (!select) return;
  select.innerHTML = CROPS.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');
}

function updateCalculator() {
  const select = document.getElementById('calcCrop');
  const qtyInput = document.getElementById('calcQty');
  const resultEl = document.getElementById('calcResult');
  if (!select || !qtyInput || !resultEl) return;

  const crop = CROPS.find(c => c.id === select.value) || CROPS[0];
  const qty = Math.max(0, Number(qtyInput.value) || 0);
  const target = crop.price * qty;

  const current = Number(resultEl.dataset.value || 0);
  animateValue(resultEl, current, target, 400);
  resultEl.dataset.value = target;
}

function animateValue(el, from, to, duration) {
  const start = performance.now();
  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    const value = from + (to - from) * progress;
    el.textContent = formatLe(value);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ─── COMMUNITY LISTINGS / HARVEST MODAL ─── */
function openHarvestModal() {
  const select = document.getElementById('hCrop');
  select.innerHTML = CROPS.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');
  document.getElementById('harvestModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeHarvestModal() {
  document.getElementById('harvestModal').classList.remove('open');
  document.body.style.overflow = '';
}

function submitHarvest(event) {
  event.preventDefault();
  const name = document.getElementById('hName').value.trim();
  const cropId = document.getElementById('hCrop').value;
  const district = document.getElementById('hDistrict').value;
  const qty = Number(document.getElementById('hQty').value);
  const price = Number(document.getElementById('hPrice').value);
  const crop = CROPS.find(c => c.id === cropId);

  harvestListings.unshift({ name, crop, district, qty, price });
  renderListings();
  closeHarvestModal();
  document.getElementById('harvestForm').reset();
  showToast(`Listing posted for ${name}! Buyers can now see it.`);
  navigateTo('market-page');
}

function renderListings() {
  const grid = document.getElementById('listingsGrid');
  if (!grid) return;
  if (harvestListings.length === 0) {
    grid.innerHTML = `<div class="listing-empty">No listings yet. Be the first to post your harvest!</div>`;
    return;
  }
  grid.innerHTML = harvestListings.map(l => `
    <div class="listing-card reveal revealed">
      <div class="listing-top">
        <div class="listing-emoji">${l.crop.emoji}</div>
        <div>
          <div class="listing-name">${l.name}</div>
          <div class="listing-meta">${l.district} District</div>
        </div>
      </div>
      <div class="listing-row"><span>Crop</span><strong>${l.crop.name}</strong></div>
      <div class="listing-row"><span>Quantity</span><strong>${l.qty} kg</strong></div>
      <div class="listing-row"><span>Asking price</span><strong>${formatLe(l.price)}/kg</strong></div>
    </div>
  `).join('');
}

/* ─── TESTIMONIAL CAROUSEL ─── */
let carouselIndex = 0;
let carouselAutoplay;

function buildCarouselDots() {
  const slides = document.querySelectorAll('#carouselTrack .testimonial-card');
  const dotsWrap = document.getElementById('carouselDots');
  dotsWrap.innerHTML = Array.from(slides).map((_, i) =>
    `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to testimonial ${i + 1}"></button>`
  ).join('');
  dotsWrap.querySelectorAll('.carousel-dot').forEach(dot => {
    dot.addEventListener('click', () => goToSlide(Number(dot.dataset.index)));
  });
}

function goToSlide(index) {
  const slides = document.querySelectorAll('#carouselTrack .testimonial-card');
  carouselIndex = (index + slides.length) % slides.length;
  document.getElementById('carouselTrack').style.transform = `translateX(-${carouselIndex * 100}%)`;
  document.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === carouselIndex));
}

function moveCarousel(direction) {
  goToSlide(carouselIndex + direction);
}

function startCarouselAutoplay() {
  clearInterval(carouselAutoplay);
  carouselAutoplay = setInterval(() => moveCarousel(1), 5000);
}

function setupCarouselInteractions() {
  const carousel = document.getElementById('testimonialCarousel');
  if (!carousel) return;
  carousel.addEventListener('mouseenter', () => clearInterval(carouselAutoplay));
  carousel.addEventListener('mouseleave', startCarouselAutoplay);

  let touchStartX = 0;
  const track = document.getElementById('carouselTrack');
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; clearInterval(carouselAutoplay); }, { passive: true });
  track.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) moveCarousel(delta < 0 ? 1 : -1);
    startCarouselAutoplay();
  }, { passive: true });
}

/* ─── FAQ ACCORDION ─── */
function buildFAQ() {
  const wrap = document.getElementById('faqList');
  if (!wrap) return;
  wrap.innerHTML = FAQS.map((item, i) => `
    <div class="faq-item" data-index="${i}">
      <button class="faq-question" aria-expanded="false">
        ${item.q}
        <span class="faq-icon">+</span>
      </button>
      <div class="faq-answer">
        <div class="faq-answer-inner">${item.a}</div>
      </div>
    </div>
  `).join('');

  wrap.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      wrap.querySelectorAll('.faq-item.open').forEach(open => {
        open.classList.remove('open');
        open.querySelector('.faq-answer').style.maxHeight = null;
        open.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ─── FARMING TIP ─── */
let tipIndex = Math.floor(Math.random() * FARMING_TIPS.length);
function showFarmingTip() {
  document.getElementById('farmingTip').textContent = FARMING_TIPS[tipIndex];
}
function nextFarmingTip() {
  tipIndex = (tipIndex + 1) % FARMING_TIPS.length;
  showFarmingTip();
}

/* ─── REVEAL ON SCROLL ─── */
let revealObserver;
function checkReveals() {
  document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) el.classList.add('revealed');
  });
}
function setupRevealObserver() {
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  } else {
    checkReveals();
  }
}

/* ─── ANIMATED COUNTERS (trigger on scroll into view) ─── */
function animateCounter(el) {
  const target = Number(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    const value = Math.floor(target * progress);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(tick);
}

function setupCounterObserver() {
  const counters = document.querySelectorAll('.counter');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => obs.observe(c));
  } else {
    counters.forEach(animateCounter);
  }
}

/* ─── TILT CARDS ─── */
function setupTiltCards() {
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!supportsHover || reducedMotion) return;

  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ─── PHONE VALIDATION ─── */
function validatePhone(input) {
  const hint = document.querySelector(`.field-hint[data-hint-for="${input.id}"]`);
  const digits = input.value.replace(/\s|-/g, '');
  const valid = /^(\+232\d{8}|0\d{9})$/.test(digits);
  input.classList.remove('valid', 'invalid');
  if (digits.length === 0) {
    if (hint) hint.textContent = '';
    return;
  }
  if (valid) {
    input.classList.add('valid');
    if (hint) { hint.textContent = 'Looks good'; hint.classList.add('ok'); }
  } else {
    input.classList.add('invalid');
    if (hint) { hint.textContent = 'Use format +232 7X XXXXXX'; hint.classList.remove('ok'); }
  }
}

/* ─── AUTH FORMS ─── */
function setLoading(button, isLoading) {
  button.disabled = isLoading;
  button.classList.toggle('loading', isLoading);
}

function handleLogin(event) {
  event.preventDefault();
  const button = event.target.querySelector('.form-submit-btn');
  setLoading(button, true);

  setTimeout(() => {
    document.getElementById('lphone').value = '';
    document.getElementById('lpassword').value = '';
    setLoading(button, false);
    showToast('Welcome back! Loading your dashboard...');
    navigateTo('home-page');
  }, 700);
}

function handleRegistration(event) {
  event.preventDefault();
  const button = event.target.querySelector('.form-submit-btn');
  const fullName = document.getElementById('fname').value;
  setLoading(button, true);

  setTimeout(() => {
    setLoading(button, false);
    const successMessage = document.getElementById('successMsg');
    if (successMessage) successMessage.classList.add('show');
    showToast(`Account created for ${fullName}!`);

    setTimeout(() => {
      if (successMessage) successMessage.classList.remove('show');
      navigateTo('home-page');
    }, 1400);
  }, 700);
}

/* ─── HEADER SCROLL + BACK TO TOP ─── */
function setupScrollEffects() {
  const header = document.getElementById('mainHeader');
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
    backToTop.classList.toggle('visible', window.scrollY > 400);
    checkReveals();
  });
}

/* ─── CLOSE MOBILE MENU AFTER CLICK ─── */
function setupMobileMenuAutoclose() {
  document.querySelectorAll('#mainNav a').forEach(link => {
    link.addEventListener('click', () => {
      const nav = document.getElementById('mainNav');
      if (nav.classList.contains('open')) toggleMenu();
    });
  });
}

/* ─── LIVE PRICE UPDATE TIME ─── */
function updateTimestamp() {
  const updateTime = document.getElementById('updateTime');
  if (!updateTime) return;
  const now = new Date();
  updateTime.innerHTML =
    now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) +
    ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) +
    ' <span>(Live)</span>';
}

/* ─── ESCAPE KEY CLOSES MODAL ─── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('harvestModal').classList.contains('open')) {
    closeHarvestModal();
  }
});

/* ─── INITIALIZE WEBSITE ─── */
window.addEventListener('DOMContentLoaded', () => {
  navigateTo('home-page');
  updateTimestamp();
  setInterval(updateTimestamp, 60000);

  buildTicker();
  buildDistrictChips();
  renderMarket();
  populateCalcCropSelect();
  updateCalculator();
  renderListings();
  buildCarouselDots();
  startCarouselAutoplay();
  setupCarouselInteractions();
  buildFAQ();
  showFarmingTip();

  setupRevealObserver();
  setupCounterObserver();
  setupTiltCards();
  setupScrollEffects();
  setupMobileMenuAutoclose();

  checkReveals();
});
