/* MindlyBody — script.js */

// ── Nav scroll effect ──────────────────────────────────────
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Mobile nav toggle ──────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── Set date input min to today ────────────────────────────
const dateInput = document.getElementById('date');
if (dateInput) {
  dateInput.min = new Date().toISOString().split('T')[0];
}

// ── Booking form ───────────────────────────────────────────
const form         = document.getElementById('bookingForm');
const successBlock = document.getElementById('bookingSuccess');
const submitBtn    = document.getElementById('submitBtn');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic client-side validation
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      field.classList.remove('error');
      if (!field.value.trim()) {
        field.classList.add('error');
        valid = false;
      }
    });
    if (!valid) {
      form.querySelector('.error')?.focus();
      return;
    }

    // Capture submission data for local admin storage
    const data = {
      submittedAt:   new Date().toISOString(),
      name:          form.name.value.trim(),
      phone:         form.phone.value.trim(),
      email:         form.email.value.trim(),
      service:       form.service.value,
      preferredDate: form.preferred_date?.value || '',
      preferredTime: form.preferred_time?.value || '',
      goal:          form.injury_or_goal.value.trim(),
      referral:      form.referral_source?.value || '',
    };

    // Save locally so admin.html can display it
    try {
      const existing = JSON.parse(localStorage.getItem('mb_bookings') || '[]');
      existing.unshift(data);
      localStorage.setItem('mb_bookings', JSON.stringify(existing));
    } catch (_) { /* ignore storage errors */ }

    // Show loading state
    const btnText    = submitBtn.querySelector('.btn__text');
    const btnLoading = submitBtn.querySelector('.btn__loading');
    submitBtn.disabled = true;
    if (btnText)    btnText.hidden    = true;
    if (btnLoading) btnLoading.hidden = false;

    // Submit to Formspree (or fall back gracefully if ID not set)
    const action = form.action;
    if (action && !action.includes('YOUR_FORMSPREE_ID')) {
      try {
        const res = await fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('Network response was not ok');
      } catch (_) {
        // Fail silently — booking is already saved locally
      }
    }

    // Show success
    form.hidden = true;
    successBlock.hidden = false;
  });

  // Live remove error class on change
  form.addEventListener('input', (e) => {
    if (e.target.classList.contains('error') && e.target.value.trim()) {
      e.target.classList.remove('error');
    }
  });
}

// ── Smooth scroll for anchor links ────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const navH = nav ? nav.offsetHeight : 0;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── Fade-in on scroll (IntersectionObserver) ───────────────
const fadeEls = document.querySelectorAll(
  '.service-card, .testimonial-card, .about__image-wrap, .about__content'
);
if ('IntersectionObserver' in window && fadeEls.length) {
  fadeEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  fadeEls.forEach(el => observer.observe(el));
}
