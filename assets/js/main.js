// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Light / dark theme ----------
const root = document.documentElement;
const themeBtn = document.querySelector('.theme-toggle');

function updateThemeIcon() {
    const isDark = root.dataset.theme === 'dark';
    themeBtn.innerHTML = isDark
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
}

themeBtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    updateThemeIcon();
});
updateThemeIcon();

// ---------- Mobile menu ----------
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('nav-links');

function setMenu(open) {
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navToggle.innerHTML = open
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
}

navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

// ---------- Header border + reading progress (lane marking) ----------
const header = document.querySelector('.site-header');
const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.style.setProperty('--progress', max > 0 ? Math.min(window.scrollY / max, 1) : 0);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Highlight the current section in the menu ----------
const sections = document.querySelectorAll('main section[id]');
const menuLinks = navLinks.querySelectorAll('a[href^="#"]');

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        menuLinks.forEach(a =>
            a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    });
}, { rootMargin: '-45% 0px -50% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ---------- Job durations (LinkedIn style: "1 yr 11 mos") ----------
// <span class="duration" data-start="2025-01" data-end="2025-06"></span>
// No data-end = still in the role (counts until this month).
function monthsBetween(start, end) {
    const [y1, m1] = start.split('-').map(Number);
    const [y2, m2] = end
        ? end.split('-').map(Number)
        : [new Date().getFullYear(), new Date().getMonth() + 1];
    return (y2 - y1) * 12 + (m2 - m1) + 1; // inclusive, like LinkedIn
}

function formatDuration(months) {
    const years = Math.floor(months / 12);
    const rest = months % 12;
    const parts = [];
    if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    if (rest) parts.push(`${rest} mo${rest > 1 ? 's' : ''}`);
    return parts.join(' ') || '1 mo';
}

document.querySelectorAll('.duration[data-start]').forEach(el => {
    el.textContent = formatDuration(monthsBetween(el.dataset.start, el.dataset.end));
});

// "2+ years" counter in the hero
document.querySelectorAll('[data-years-since]').forEach(el => {
    const years = Math.floor(monthsBetween(el.dataset.yearsSince) / 12);
    if (years >= 1) el.textContent = `${years}+`;
});

// ---------- Project filters ----------
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card[data-category]');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        filterBtns.forEach(b => {
            const active = b === btn;
            b.classList.toggle('active', active);
            b.setAttribute('aria-pressed', active);
        });
        projectCards.forEach(card => {
            card.hidden = filter !== 'all' && card.dataset.category !== filter;
        });
    });
});

// Hide filter buttons that have no matching project
filterBtns.forEach(btn => {
    const f = btn.dataset.filter;
    if (f !== 'all' && ![...projectCards].some(c => c.dataset.category === f)) btn.hidden = true;
});

// ---------- Reveal on scroll ----------
const revealTargets = document.querySelectorAll(
    '.section-title, .about-grid, .focus-card, .xp-company, .xp-earlier, .skill-group, .project-card, .edu-card, .contact-text'
);

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

revealTargets.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});
