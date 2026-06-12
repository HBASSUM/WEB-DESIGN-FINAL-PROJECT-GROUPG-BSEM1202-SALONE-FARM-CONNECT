// ─── ROUTER ENGINE WITH INTERLOCKING PAGE TRANSITIONS ───
function navigateTo(pageId) {
  const pages = document.querySelectorAll('.page-view');

  pages.forEach(page => {
    page.classList.remove('active-page');
  });

  const activeTarget = document.getElementById(pageId);

  if (activeTarget) {
    activeTarget.classList.add('active-page');
  }

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  const navLinks = document.querySelectorAll('#mainNav a');

  navLinks.forEach(link => {
    link.classList.remove('active');
  });

  const activeNavLink = document.getElementById(`nav-${pageId}`);

  if (activeNavLink) {
    activeNavLink.classList.add('active');
  }

  if (pageId === 'home-page') {
    animateStats();
  }
}

// ─── COUNTER ANIMATION ───
function animateStats() {
  const metrics = [
    { id: 'stat1', target: 500 },
    { id: 'stat2', target: 16 },
    { id: 'stat3', target: 1000 },
    { id: 'stat4', target: 50 }
  ];

  metrics.forEach(metric => {
    const element = document.getElementById(metric.id);

    if (!element) return;

    let current = 0;
    const increment = metric.target / 60;

    const timer = setInterval(() => {
      current += increment;

      if (current >= metric.target) {
        element.innerText =
          metric.target + (metric.target !== 16 ? '+' : '');
        clearInterval(timer);
      } else {
        element.innerText = Math.floor(current) + '+';
      }
    }, 16);
  });
}

// ─── MOBILE MENU ───
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

// ─── CLOSE MOBILE MENU AFTER CLICK ───
document.querySelectorAll('#mainNav a').forEach(link => {
  link.addEventListener('click', () => {
    const nav = document.getElementById('mainNav');

    if (nav.classList.contains('open')) {
      toggleMenu();
    }
  });
});

// ─── HEADER SCROLL EFFECT ───
window.addEventListener('scroll', () => {
  const header = document.getElementById('mainHeader');

  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ─── TOAST NOTIFICATION ───
let toastTimer;

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');

  toastText.innerText = message;

  toast.classList.add('visible');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 3000);
}

// ─── REGISTRATION FORM ───
function registerFarmer(event) {
  event.preventDefault();

  const name = document.getElementById('fname').value;
  const successMsg = document.getElementById('successMsg');

  successMsg.classList.add('show');

  showToast(`Thank you ${name}! Registration successful.`);

  event.target.reset();

  setTimeout(() => {
    successMsg.classList.remove('show');
  }, 5000);
}

// ─── LIVE PRICE UPDATE TIME ───
function updateTimestamp() {
  const updateTime = document.getElementById('updateTime');

  if (updateTime) {
    const now = new Date();

    updateTime.innerHTML =
      now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) +
      ' ' +
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }) +
      ' <span>(Live)</span>';
  }
}

// ─── INITIALIZE WEBSITE ───
window.addEventListener('DOMContentLoaded', () => {
  navigateTo('home-page');
  updateTimestamp();

  setInterval(updateTimestamp, 60000);
});