function navigateTo(pageId) {
  // 1. Find every single page-view element on your site
  const allPages = document.querySelectorAll('.page-view');
  
  // 2. FORCE them to hide completely and strip their active classes
  allPages.forEach(page => {
    page.style.setProperty('display', 'none', 'important'); // Overrides any clashing CSS
    page.classList.remove('active-page');
  });

  // 3. Find the specific page the user wants to see
  const targetPage = document.getElementById(pageId);
  
  if (targetPage) {
    // 4. Force it to display and trigger your native entry animation
    targetPage.style.setProperty('display', 'block', 'important');
    targetPage.classList.add('active-page');
    
    // 5. Instantly snap the browser scrollbar back to the very top
    window.scrollTo({ top: 0, behavior: 'instant' });
  } else {
    console.error(`Page ID "${pageId}" could not be found in the HTML structure.`);
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

// Handles user login and redirects home
function handleLogin(event) {
  event.preventDefault(); // Prevents page from refreshing
  
  const phone = document.getElementById('lphone').value;
  const password = document.getElementById('lpassword').value;

  // 1. Placeholder for your future database verification logic
  
  // 2. Clear inputs
  document.getElementById('lphone').value = '';
  document.getElementById('lpassword').value = '';

  // 3. Notify user and redirect to home view
  showToast("Welcome back! Loading your dashboard...");
  navigateTo('home-page');
}

// Handles new user registration and redirects home
function handleRegistration(event) {
  event.preventDefault(); // Prevents page from refreshing
  
  const fullName = document.getElementById('fname').value;
  
  // 1. Placeholder for your future database insertion logic

  // 2. Show the success message element on form
  const successMessage = document.getElementById('successMsg');
  if (successMessage) {
    successMessage.style.display = 'block';
  }

  // 3. Notify user and redirect to home view after a brief delay
  showToast(`Account created for ${fullName}!`);
  
  setTimeout(() => {
    if (successMessage) successMessage.style.display = 'none';
    navigateTo('home-page');
  }, 1200); // 1.2 second pause so they see the success message
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







function loginFarmer(event) {
  event.preventDefault(); // Stop page reload
  
  const phone = document.getElementById('lphone').value;
  const password = document.getElementById('lpassword').value;
  
  // Frontend notification test
  showToast(`Attempting login for phone: ${phone}`);
  
  // Right here is where you will send 'phone' and 'password' 
  // to your backend server, Firebase, or Supabase.
}
